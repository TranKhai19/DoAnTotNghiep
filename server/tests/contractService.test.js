const {
  createCampaign,
  getCampaign,
  recordDonation,
  disburseFunds,
  closeCampaign,
  estimateAdminActionGas,
} = require('../services/contractService');

// ─── Mock config/chain ────────────────────────────────────────────────────────
jest.mock('../config/chain', () => ({
  executeWithRpcRetry: async (callback) =>
    callback({
      provider: global.mockProvider,
      contract:  global.mockContract,
      rpcUrl:    'http://localhost:8545',
    }),
}));

// ─── Mock socketService ───────────────────────────────────────────────────────
jest.mock('../services/socketService', () => ({
  getIo: () => ({ emit: jest.fn() }),
}));

// ─── Shared mock builders ─────────────────────────────────────────────────────
const buildMockReceipt = (hash = '0xabc123') => ({
  wait: jest.fn().mockResolvedValue({ hash, status: 1 }),
});

const buildMockProvider = (gasPriceGwei = 1n) => ({
  getFeeData: jest.fn().mockResolvedValue({
    gasPrice:             gasPriceGwei * 1_000_000_000n,
    maxFeePerGas:         gasPriceGwei * 1_000_000_000n,
    maxPriorityFeePerGas: gasPriceGwei * 1_000_000_000n,
  }),
});

const buildMockContract = (estimatedGas = 2_000_000n) => ({
  createCampaign: Object.assign(
    jest.fn().mockResolvedValue(buildMockReceipt()),
    { estimateGas: jest.fn().mockResolvedValue(estimatedGas) }
  ),
  recordDonation: Object.assign(
    jest.fn().mockResolvedValue(buildMockReceipt()),
    { estimateGas: jest.fn().mockResolvedValue(estimatedGas) }
  ),
  disburseFunds: Object.assign(
    jest.fn().mockResolvedValue(buildMockReceipt()),
    { estimateGas: jest.fn().mockResolvedValue(estimatedGas) }
  ),
  closeCampaign: Object.assign(
    jest.fn().mockResolvedValue(buildMockReceipt()),
    { estimateGas: jest.fn().mockResolvedValue(estimatedGas) }
  ),
  campaigns: jest.fn().mockResolvedValue({
    id: 1n,
    targetAmount: 500_000n,
    totalRaised:  100_000n,
    totalDisbursed: 0n,
    isActive: true,
  }),
});

// ═════════════════════════════════════════════════════════════════════════════
// Setup / Teardown
// ═════════════════════════════════════════════════════════════════════════════
beforeEach(() => {
  global.mockProvider = buildMockProvider(1n);   // 1 gwei mặc định
  global.mockContract = buildMockContract(2_000_000n);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ═════════════════════════════════════════════════════════════════════════════
// NHÓM 1 – toPositiveBigInt: Input Validation (FUNC-MINT-V)
// ═════════════════════════════════════════════════════════════════════════════
describe('FUNC-MINT-V: Kiểm thử Input Validation (toPositiveBigInt)', () => {

  test('FUNC-MINT-V01: targetAmount âm → throw', async () => {
    await expect(createCampaign(-1)).rejects.toThrow(/greater than 0/i);
  });

  test('FUNC-MINT-V02: targetAmount = 0 → throw', async () => {
    await expect(createCampaign(0)).rejects.toThrow(/greater than 0/i);
  });

  test('FUNC-MINT-V03: targetAmount là số thực (float) → throw', async () => {
    await expect(createCampaign(500.5)).rejects.toThrow(/integer/i);
  });

  test('FUNC-MINT-V04: targetAmount là chuỗi số hợp lệ "500000" → pass', async () => {
    await expect(createCampaign('500000')).resolves.toHaveProperty('transactionHash');
  });

  test('FUNC-MINT-V05: targetAmount là chuỗi text → throw', async () => {
    await expect(createCampaign('abc')).rejects.toThrow(/integer string/i);
  });

  test('FUNC-MINT-V06: targetAmount là BigInt hợp lệ → pass', async () => {
    await expect(createCampaign(1_000_000n)).resolves.toHaveProperty('transactionHash');
  });

  test('FUNC-MINT-V07: targetAmount là undefined → throw', async () => {
    await expect(createCampaign(undefined)).rejects.toThrow();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// NHÓM 2 – FUNC-MINT-E: Network & Chain Error Handling (ĐÃ CÓ + bổ sung)
// ═════════════════════════════════════════════════════════════════════════════
describe('FUNC-MINT-E: Kiểm thử Xử lý Lỗi mạng & Blockchain (contractService)', () => {

  test('FUNC-MINT-E01: Lỗi mất kết nối (Connection Refused)', async () => {
    const err = Object.assign(new Error('could not connect to node'), { code: 'NETWORK_ERROR' });
    global.mockContract.createCampaign.estimateGas.mockRejectedValue(err);
    await expect(createCampaign(500_000)).rejects.toThrow(/could not connect to node/i);
  });

  test('FUNC-MINT-E02: Lỗi Timeout chờ xác nhận Receipt', async () => {
    const err = Object.assign(new Error('timeout exceeded'), { code: 'TIMEOUT' });
    const badTx = { wait: jest.fn().mockRejectedValue(err) };
    global.mockContract.createCampaign.mockResolvedValue(badTx);
    await expect(createCampaign(500_000)).rejects.toThrow(/timeout exceeded/i);
  });

  test('FUNC-MINT-E03: Lỗi hết phí Gas (Out of Gas)', async () => {
    const err = Object.assign(new Error('out of gas'), { code: 'UNPREDICTABLE_GAS_LIMIT' });
    global.mockContract.createCampaign.estimateGas.mockRejectedValue(err);
    await expect(createCampaign(500_000)).rejects.toThrow(/out of gas/i);
  });

  test('FUNC-MINT-E04: Số dư không đủ (Insufficient Funds)', async () => {
    const err = Object.assign(new Error('insufficient funds for gas * price'), { code: 'INSUFFICIENT_FUNDS' });
    global.mockContract.createCampaign.estimateGas.mockRejectedValue(err);
    await expect(createCampaign(500_000)).rejects.toThrow(/insufficient funds/i);
  });

  test('FUNC-MINT-E05: recordDonation với bankRef rỗng → throw', async () => {
    await expect(recordDonation(1, '', 100_000, 'donor@test.com')).rejects.toThrow(/non-empty string/i);
  });

  test('FUNC-MINT-E06: recordDonation với donor rỗng → throw', async () => {
    await expect(recordDonation(1, 'BANK_REF_001', 100_000, '')).rejects.toThrow(/non-empty string/i);
  });

  test('FUNC-MINT-E07: disburseFunds với beneficiaryId rỗng → throw', async () => {
    await expect(disburseFunds(1, 50_000, '')).rejects.toThrow(/non-empty string/i);
  });

  test('FUNC-MINT-E08: closeCampaign với campaignId = 0 → throw', async () => {
    await expect(closeCampaign(0)).rejects.toThrow(/greater than 0/i);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// NHÓM 3 – FUNC-MINT-S: Happy Path (Giao dịch thành công)
// ═════════════════════════════════════════════════════════════════════════════
describe('FUNC-MINT-S: Kiểm thử Giao dịch thành công (Happy Path)', () => {

  test('FUNC-MINT-S01: createCampaign thành công → trả về transactionHash', async () => {
    const result = await createCampaign(500_000);
    expect(result).toHaveProperty('transactionHash');
    expect(result).toHaveProperty('receipt');
    expect(result).toHaveProperty('gasEstimate');
  });

  test('FUNC-MINT-S02: createCampaign gọi đúng method với BigInt targetAmount', async () => {
    await createCampaign(500_000);
    expect(global.mockContract.createCampaign).toHaveBeenCalledWith(
      500_000n,
      expect.objectContaining({ gasLimit: expect.any(BigInt) })
    );
  });

  test('FUNC-MINT-S03: recordDonation thành công', async () => {
    const result = await recordDonation(1, 'BANK_REF_001', 100_000, 'nguyen@test.com');
    expect(result).toHaveProperty('transactionHash');
    expect(global.mockContract.recordDonation).toHaveBeenCalledWith(
      1n, 'BANK_REF_001', 100_000n, 'nguyen@test.com',
      expect.objectContaining({ gasLimit: expect.any(BigInt) })
    );
  });

  test('FUNC-MINT-S04: disburseFunds thành công', async () => {
    const result = await disburseFunds(1, 50_000, 'BEN-UUID-001');
    expect(result).toHaveProperty('transactionHash');
    expect(global.mockContract.disburseFunds).toHaveBeenCalledWith(
      1n, 50_000n, 'BEN-UUID-001',
      expect.objectContaining({ gasLimit: expect.any(BigInt) })
    );
  });

  test('FUNC-MINT-S05: closeCampaign thành công', async () => {
    const result = await closeCampaign(1);
    expect(result).toHaveProperty('transactionHash');
    expect(global.mockContract.closeCampaign).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({ gasLimit: expect.any(BigInt) })
    );
  });

  test('FUNC-MINT-S06: getCampaign trả về object chuẩn hóa', async () => {
    const result = await getCampaign(1);
    expect(result).toMatchObject({
      id:             '1',
      targetAmount:   '500000',
      totalRaised:    '100000',
      totalDisbursed: '0',
      isActive:       true,
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// NHÓM 4 – FUNC-GAS: Gas Estimation (ĐÃ CÓ + mở rộng)
// ═════════════════════════════════════════════════════════════════════════════
describe('FUNC-GAS: Kiểm thử Ước tính và Cảnh báo Gas', () => {

  test('FUNC-GAS-01: Gas bình thường (1 gwei) → không có cảnh báo', async () => {
    const estimate = await estimateAdminActionGas('createCampaign', { targetAmount: 500_000 });
    expect(estimate.warning).toBe(false);
    expect(estimate.warningMessage).toBeNull();
    expect(estimate).toHaveProperty('gasLimit');
    expect(estimate).toHaveProperty('estimatedFeeEth');
  });

  test('FUNC-GAS-02: Gas rất cao (500 gwei, 20M gas) → cảnh báo vượt ngưỡng', async () => {
    global.mockProvider = buildMockProvider(500n); // 500 gwei
    global.mockContract.createCampaign.estimateGas.mockResolvedValue(20_000_000n);

    const estimate = await estimateAdminActionGas('createCampaign', { targetAmount: 500_000 });
    expect(estimate.warning).toBe(true);
    expect(estimate.warningMessage).toContain('Estimated gas fee');
  });

  test('FUNC-GAS-03: gasLimitWithBuffer > gasLimit 估算 (buffer 15%)', async () => {
    const estimate = await estimateAdminActionGas('createCampaign', { targetAmount: 500_000 });
    const raw    = BigInt(estimate.gasLimit);
    const buffed = BigInt(estimate.gasLimitWithBuffer);
    expect(buffed).toBeGreaterThan(raw);
  });

  test('FUNC-GAS-04: estimateAdminActionGas với action không hỗ trợ → throw', async () => {
    await expect(
      estimateAdminActionGas('unknownAction', {})
    ).rejects.toThrow(/Unsupported action/i);
  });

  test('FUNC-GAS-05: estimateAdminActionGas disburseFunds → trả về gasEstimate', async () => {
    global.mockContract.disburseFunds = Object.assign(
      jest.fn().mockResolvedValue(buildMockReceipt()),
      { estimateGas: jest.fn().mockResolvedValue(3_000_000n) }
    );
    const estimate = await estimateAdminActionGas('disburseFunds', {
      campaignId: 1, amount: 50_000, beneficiaryId: 'BEN-001',
    });
    expect(estimate).toHaveProperty('gasLimit');
    expect(estimate.methodName).toBe('disburseFunds');
  });

  test('FUNC-GAS-06: estimateAdminActionGas closeCampaign → trả về gasEstimate', async () => {
    global.mockContract.closeCampaign = Object.assign(
      jest.fn().mockResolvedValue(buildMockReceipt()),
      { estimateGas: jest.fn().mockResolvedValue(1_500_000n) }
    );
    const estimate = await estimateAdminActionGas('closeCampaign', { campaignId: 2 });
    expect(estimate).toHaveProperty('gasLimit');
    expect(estimate.methodName).toBe('closeCampaign');
  });
});
