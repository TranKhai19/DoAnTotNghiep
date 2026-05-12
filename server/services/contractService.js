const { ethers } = require('ethers');
const { executeWithRpcRetry } = require('../config/chain');

let socketService = null;
try {
  socketService = require('./socketService');
} catch (error) {
  // Socket service is optional in tests/offline runs.
}

const GAS_ALERT_THRESHOLD_ETH_RAW = process.env.GAS_ALERT_THRESHOLD_ETH || '0.01';
const GAS_LIMIT_BUFFER_PERCENT = Number.parseFloat(process.env.GAS_LIMIT_BUFFER_PERCENT || '15');

let gasAlertThresholdWei;
try {
  gasAlertThresholdWei = ethers.parseEther(GAS_ALERT_THRESHOLD_ETH_RAW);
} catch (error) {
  gasAlertThresholdWei = ethers.parseEther('0.01');
}

function normalizeTxHash(receipt, txResponse) {
  return receipt?.hash || receipt?.transactionHash || txResponse?.hash || null;
}

function ensureNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

function toPositiveBigInt(value, fieldName) {
  if (typeof value === 'bigint') {
    if (value <= 0n) throw new Error(`${fieldName} must be greater than 0`);
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      throw new Error(`${fieldName} must be an integer`);
    }
    return toPositiveBigInt(BigInt(value), fieldName);
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!/^\d+$/.test(normalized)) {
      throw new Error(`${fieldName} must be an integer string`);
    }
    return toPositiveBigInt(BigInt(normalized), fieldName);
  }

  throw new Error(`${fieldName} has unsupported type`);
}

function withGasLimitBuffer(gasLimit) {
  if (!Number.isFinite(GAS_LIMIT_BUFFER_PERCENT) || GAS_LIMIT_BUFFER_PERCENT < 0) return gasLimit;
  const basisPoints = BigInt(Math.round(GAS_LIMIT_BUFFER_PERCENT * 100));
  return gasLimit + ((gasLimit * basisPoints) / 10000n);
}

function emitSocket(eventName, payload) {
  if (!socketService || !eventName) return;
  try {
    socketService.getIo().emit(eventName, payload);
  } catch (error) {
    console.error('Socket emit failed', error);
  }
}

function normalizeCampaign(rawCampaign) {
  return {
    id: (rawCampaign.id ?? rawCampaign[0]).toString(),
    targetAmount: (rawCampaign.targetAmount ?? rawCampaign[1]).toString(),
    totalRaised: (rawCampaign.totalRaised ?? rawCampaign[2]).toString(),
    totalDisbursed: (rawCampaign.totalDisbursed ?? rawCampaign[3]).toString(),
    isActive: Boolean(rawCampaign.isActive ?? rawCampaign[4])
  };
}

async function estimateTransactionGas(methodName, args, options = {}) {
  const adminAction = options.adminAction === true;

  return executeWithRpcRetry(async ({ contract, provider, rpcUrl }) => {
    const contractMethod = contract[methodName];
    if (typeof contractMethod !== 'function') {
      throw new Error(`Contract method "${methodName}" does not exist`);
    }

    const gasLimit = await contractMethod.estimateGas(...args);
    const feeData = await provider.getFeeData();

    const gasPriceWei = feeData.gasPrice ?? 0n;
    const maxFeePerGasWei = feeData.maxFeePerGas ?? gasPriceWei;
    const maxPriorityFeePerGasWei = feeData.maxPriorityFeePerGas ?? 0n;
    const estimatedFeeWei = gasLimit * maxFeePerGasWei;
    const warning = adminAction && estimatedFeeWei >= gasAlertThresholdWei;

    return {
      methodName,
      rpcUrl,
      gasLimit: gasLimit.toString(),
      gasLimitWithBuffer: withGasLimitBuffer(gasLimit).toString(),
      gasPriceWei: gasPriceWei.toString(),
      maxFeePerGasWei: maxFeePerGasWei.toString(),
      maxPriorityFeePerGasWei: maxPriorityFeePerGasWei.toString(),
      estimatedFeeWei: estimatedFeeWei.toString(),
      estimatedFeeEth: ethers.formatEther(estimatedFeeWei),
      thresholdEth: GAS_ALERT_THRESHOLD_ETH_RAW,
      warning,
      warningMessage: warning
        ? `Estimated gas fee ${ethers.formatEther(estimatedFeeWei)} ETH is above threshold ${GAS_ALERT_THRESHOLD_ETH_RAW} ETH`
        : null
    };
  });
}

async function sendTransaction(methodName, args, options = {}) {
  const gasEstimate = await estimateTransactionGas(methodName, args, options);
  if (gasEstimate.warning) {
    console.warn(`[Gas Alert] ${gasEstimate.warningMessage}`);
  }

  return executeWithRpcRetry(async ({ contract }) => {
    const txResponse = await contract[methodName](...args, {
      gasLimit: BigInt(gasEstimate.gasLimitWithBuffer)
    });

    const receipt = await txResponse.wait();
    const transactionHash = normalizeTxHash(receipt, txResponse);

    emitSocket(options.socketEventName, {
      transactionHash,
      ...(options.socketPayload || {})
    });

    return {
      receipt,
      transactionHash,
      gasEstimate
    };
  });
}

async function createCampaign(targetAmount) {
  const parsedTargetAmount = toPositiveBigInt(targetAmount, 'targetAmount');

  const result = await sendTransaction('createCampaign', [parsedTargetAmount], {
    adminAction: true,
    socketEventName: 'onchain:createCampaign',
    socketPayload: {
      targetAmount: parsedTargetAmount.toString()
    }
  });

  // Tìm sự kiện CampaignCreated trong logs
  if (result.receipt && result.receipt.logs) {
    // Ethers v6 dùng logs, v5 dùng events. Giả sử v6 dựa trên codebase.
    // Lấy ID từ event (argument đầu tiên)
    try {
      // Logic parse event tùy phiên bản ethers và setup interface
      // Ở đây ta có thể parse từ receipt nếu contract interface được expose
      const { data, topics } = result.receipt.logs[0]; 
      // campaignId là indexed parameter đầu tiên (topic 1)
      const campaignId = ethers.toQuantity(topics[1]);
      return { ...result, campaignId: BigInt(campaignId).toString() };
    } catch (e) {
      console.warn('⚠️ Could not parse campaignId from logs:', e.message);
    }
  }

  return result;
}

async function getCampaign(campaignId) {
  const parsedCampaignId = toPositiveBigInt(campaignId, 'campaignId');

  return executeWithRpcRetry(async ({ contract }) => {
    const campaign = await contract.campaigns(parsedCampaignId);
    return normalizeCampaign(campaign);
  });
}

async function recordDonation(campaignId, bankRef, amount, donor) {
  const parsedCampaignId = toPositiveBigInt(campaignId, 'campaignId');
  const parsedAmount = toPositiveBigInt(amount, 'amount');
  const parsedBankRef = ensureNonEmptyString(bankRef, 'bankRef');
  const parsedDonor = ensureNonEmptyString(donor, 'donor');

  return sendTransaction('recordDonation', [parsedCampaignId, parsedBankRef, parsedAmount, parsedDonor], {
    socketEventName: 'onchain:recordDonation',
    socketPayload: {
      campaignId: parsedCampaignId.toString(),
      bankRef: parsedBankRef,
      amount: parsedAmount.toString(),
      donor: parsedDonor
    }
  });
}

async function disburseFunds(campaignId, amount, beneficiaryId, reasonHash = '') {
  const parsedCampaignId = toPositiveBigInt(campaignId, 'campaignId');
  const parsedAmount = toPositiveBigInt(amount, 'amount');
  const parsedBeneficiaryId = ensureNonEmptyString(beneficiaryId, 'beneficiaryId');
  const parsedReasonHash = typeof reasonHash === 'string' ? reasonHash : '';

  return sendTransaction('disburseFunds', [parsedCampaignId, parsedAmount, parsedBeneficiaryId, parsedReasonHash], {
    adminAction: true,
    socketEventName: 'onchain:disburseFunds',
    socketPayload: {
      campaignId: parsedCampaignId.toString(),
      amount: parsedAmount.toString(),
      beneficiaryId: parsedBeneficiaryId,
      reasonHash: parsedReasonHash
    }
  });
}

async function closeCampaign(campaignId, proofHash = '') {
  const parsedCampaignId = toPositiveBigInt(campaignId, 'campaignId');
  const parsedProofHash = typeof proofHash === 'string' ? proofHash : '';

  return sendTransaction('closeCampaign', [parsedCampaignId, parsedProofHash], {
    adminAction: true,
    socketEventName: 'onchain:closeCampaign',
    socketPayload: {
      campaignId: parsedCampaignId.toString(),
      proofHash: parsedProofHash
    }
  });
}

async function estimateAdminActionGas(action, params = {}) {
  const normalizedAction = ensureNonEmptyString(action, 'action').toLowerCase();

  if (normalizedAction === 'createcampaign') {
    return estimateTransactionGas('createCampaign', [toPositiveBigInt(params.targetAmount, 'targetAmount')], {
      adminAction: true
    });
  }

  if (normalizedAction === 'disbursefunds') {
    return estimateTransactionGas(
      'disburseFunds',
      [
        toPositiveBigInt(params.campaignId, 'campaignId'),
        toPositiveBigInt(params.amount, 'amount'),
        ensureNonEmptyString(params.beneficiaryId, 'beneficiaryId')
      ],
      { adminAction: true }
    );
  }

  if (normalizedAction === 'closecampaign') {
    return estimateTransactionGas('closeCampaign', [toPositiveBigInt(params.campaignId, 'campaignId')], {
      adminAction: true
    });
  }

  throw new Error('Unsupported action for gas estimation. Use createCampaign, disburseFunds, or closeCampaign');
}

async function getHistory(campaignId) {
  const parsedCampaignId = toPositiveBigInt(campaignId, 'campaignId');

  return executeWithRpcRetry(async ({ contract }) => {
    // Gọi trực tiếp View Functions của Smart Contract
    const [donations, disbursements] = await Promise.all([
      contract.getCampaignDonations(parsedCampaignId),
      contract.getCampaignDisbursements(parsedCampaignId)
    ]);

    // Format dữ liệu
    const history = [];
    
    donations.forEach(d => {
      history.push({
        id: `don_${d.bankRef}`,
        txHash: d.bankRef, // Giả sử bankRef được dùng map với txHash (hoặc id tham chiếu)
        timestamp: new Date(Number(d.timestamp) * 1000).toISOString(),
        type: 'Quyên góp',
        from: d.donor || 'Anonymous',
        to: 'Contract',
        amount: Number(d.amount),
        status: 'Success'
      });
    });

    disbursements.forEach((d, index) => {
      history.push({
        id: `dis_${index}_${d.timestamp}`,
        txHash: `disbursed_${index}`, // Dummy for frontend
        timestamp: new Date(Number(d.timestamp) * 1000).toISOString(),
        type: 'Giải ngân',
        from: 'Contract',
        to: d.beneficiaryId || 'Beneficiary',
        amount: Number(d.amount),
        status: 'Success'
      });
    });

    // Sort theo thời gian mới nhất (descending)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return history;
  });
}

module.exports = {
  createCampaign,
  getCampaign,
  recordDonation,
  disburseFunds,
  closeCampaign,
  estimateAdminActionGas,
  getHistory
};
