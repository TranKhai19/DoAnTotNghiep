require('dotenv').config();
const { ethers } = require('ethers');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.FUNDCHAIN_CONTRACT_ADDRESS;
const PRIMARY_RPC_URL = process.env.CHAIN_RPC_URL;
const FALLBACK_RPC_URLS = (process.env.CHAIN_RPC_FALLBACK_URLS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const RPC_MAX_RETRIES = Number.parseInt(process.env.CHAIN_RPC_MAX_RETRIES || '2', 10);
const RPC_RETRY_DELAY_MS = Number.parseInt(process.env.CHAIN_RPC_RETRY_DELAY_MS || '700', 10);

const rpcUrls = Array.from(new Set([PRIMARY_RPC_URL, ...FALLBACK_RPC_URLS].filter(Boolean)));

if (!PRIVATE_KEY || !CONTRACT_ADDRESS || rpcUrls.length === 0) {
  throw new Error(
    'Please set CHAIN_RPC_URL, PRIVATE_KEY, FUNDCHAIN_CONTRACT_ADDRESS (and optional CHAIN_RPC_FALLBACK_URLS) in .env'
  );
}

// Dùng staticNetwork để ngăn ethers.js v6 tự động polling detect network
// khi Hardhat node chưa khởi động (tránh spam log)
const HARDHAT_NETWORK = new ethers.Network('hardhat', 31337);

function createProvider(rpcUrl) {
  const p = new ethers.JsonRpcProvider(rpcUrl, HARDHAT_NETWORK, {
    staticNetwork: HARDHAT_NETWORK,
    polling: false,
    batchMaxCount: 1,
  });
  // Tắt polling interval để không reconnect vô tận
  p.pollingInterval = 0;
  return p;
}

const providers = rpcUrls.map(createProvider);
const wallets = providers.map((currentProvider) => new ethers.Wallet(PRIVATE_KEY, currentProvider));


const fundChainAbi = [
  'function createCampaign(uint256 _targetAmount) external',
  'function recordDonation(uint256 _campaignId, string _bankRef, uint256 _amount, string _donor) external',
  'function disburseFunds(uint256 _campaignId, uint256 _amount, string _beneficiaryId, string _reasonHash) external',
  'function closeCampaign(uint256 _campaignId, string _proofHash) external',
  'function campaigns(uint256) external view returns (uint256 id,uint256 targetAmount,uint256 totalRaised,uint256 totalDisbursed,bool isActive)',
  'function getCampaignDonations(uint256 _campaignId) external view returns (tuple(string bankRef,string donor,uint256 amount,uint256 timestamp)[])',
  'function getCampaignDisbursements(uint256 _campaignId) external view returns (tuple(string beneficiaryId,uint256 amount,uint256 timestamp,string reasonHash)[])',
  'event CampaignCreated(uint256 indexed campaignId,uint256 targetAmount)',
  'event DonationRecorded(uint256 indexed campaignId,string indexed bankRef,uint256 amount)',
  'event FundsDisbursed(uint256 indexed campaignId,uint256 amount,string beneficiaryId)',
  'event CampaignClosed(uint256 indexed campaignId)'
];

const contracts = wallets.map((currentWallet) => new ethers.Contract(CONTRACT_ADDRESS, fundChainAbi, currentWallet));

let lastHealthyProviderIndex = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableRpcError(error) {
  if (!error) return false;

  const code = (error.code || '').toString().toUpperCase();
  const message = `${error.shortMessage || ''} ${error.message || ''}`.toLowerCase();

  if (code === 'CALL_EXCEPTION' || code === 'INSUFFICIENT_FUNDS' || code === 'NONCE_EXPIRED') {
    return false;
  }

  const retryableCodes = new Set(['NETWORK_ERROR', 'SERVER_ERROR', 'TIMEOUT', 'UNKNOWN_ERROR']);
  if (retryableCodes.has(code)) return true;

  const retryablePatterns = [
    'timeout',
    'timed out',
    'econn',
    'socket',
    'network',
    '429',
    'rate limit',
    'too many requests',
    'gateway timeout',
    'temporarily unavailable',
    'failed to fetch',
    'missing response',
    '503'
  ];

  return retryablePatterns.some((pattern) => message.includes(pattern));
}

function getProviderBundleByAttempt(attempt) {
  const providerIndex = (lastHealthyProviderIndex + attempt) % providers.length;
  return {
    provider: providers[providerIndex],
    wallet: wallets[providerIndex],
    contract: contracts[providerIndex],
    rpcUrl: rpcUrls[providerIndex],
    providerIndex
  };
}

async function executeWithRpcRetry(task, options = {}) {
  const retries = Number.isInteger(options.retries)
    ? Math.max(options.retries, 0)
    : Math.max(RPC_MAX_RETRIES, 0);
  const delayMs = Number.isInteger(options.delayMs)
    ? Math.max(options.delayMs, 0)
    : Math.max(RPC_RETRY_DELAY_MS, 0);

  let attempt = 0;

  while (attempt <= retries) {
    const context = getProviderBundleByAttempt(attempt);
    try {
      const result = await task({ ...context, attempt });
      lastHealthyProviderIndex = context.providerIndex;
      return result;
    } catch (error) {
      const shouldRetry = attempt < retries && isRetryableRpcError(error);
      if (!shouldRetry) {
        error.rpcContext = {
          rpcUrl: context.rpcUrl,
          attempt: attempt + 1,
          totalAttempts: retries + 1
        };
        throw error;
      }

      const waitMs = delayMs * (2 ** attempt);
      console.warn(
        `[RPC Retry] attempt ${attempt + 1}/${retries + 1} failed on ${context.rpcUrl}. Retrying in ${waitMs}ms...`
      );
      if (waitMs > 0) await sleep(waitMs);
      attempt += 1;
    }
  }

  throw new Error('RPC retry exhausted');
}

const provider = providers[0];
const wallet = wallets[0];
const fundChainContract = contracts[0];

module.exports = {
  provider,
  wallet,
  fundChainContract,
  providers,
  wallets,
  contracts,
  rpcUrls,
  executeWithRpcRetry,
  isRetryableRpcError,
  getProviderBundleByAttempt,
  retryConfig: {
    maxRetries: Math.max(RPC_MAX_RETRIES, 0),
    retryDelayMs: Math.max(RPC_RETRY_DELAY_MS, 0)
  }
};
