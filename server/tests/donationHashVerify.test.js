describe('FUNC-RD: Ghi nhận đóng góp qua Transaction Hash', () => {
    
    // Giả lập 1 Controller xử lý API POST /api/donations/verify-hash
    // Đây là luồng Backend xử lý khi user nhập Hash và ấn "Ghi nhận"
    
    const mockDb = { hasHash: jest.fn(), save: jest.fn() };
    const mockWeb3 = { getTransactionReceipt: jest.fn() };

    const processHashSubmit = async (hash) => {
        // 1. Kiểm tra định dạng Regex Hash (bắt đầu bằng 0x, đúng 66 ký tự Hex)
        const hashRegex = /^0x([A-Fa-f0-9]{64})$/;
        if (!hashRegex.test(hash)) return { status: 400, error: 'Mã giao dịch (Hash) không hợp lệ. Vui lòng kiểm tra lại.' };

        // 2. Chống trùng lặp (Duplicate)
        if (await mockDb.hasHash(hash)) return { status: 409, error: 'Mã giao dịch này đã được ghi nhận vào hệ thống trước đó.' };

        // 3. Truy vấn On-chain
        const receipt = await mockWeb3.getTransactionReceipt(hash);
        if (!receipt) return { status: 404, error: 'Không tìm thấy giao dịch này trên Blockchain.' };
        
        // 4. Trace Reverted
        // Trong Ethers/Web3, status = 1 là success, status = 0 là Reverted
        if (receipt.status === 0 || receipt.status === 0n || receipt.status === "0x0") {
             return { status: 422, error: 'Giao dịch này đã thất bại (Revert) trên Blockchain. Không thể ghi nhận.' };
        }

        // 5. Ghi nhận DB
        await mockDb.save(hash);
        return { status: 200, message: 'Ghi nhận đóng góp thành công!' };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('FUNC-RD01: Ghi nhận thất bại do Hash sai định dạng (Format Error)', async () => {
        const invalidHashes = ['abc123_', '0x123', '0X4D56...789H', ''];
        for (const hash of invalidHashes) {
            const res = await processHashSubmit(hash);
            expect(res.status).toBe(400);
            expect(res.error).toContain('Mã giao dịch (Hash) không hợp lệ');
        }
    });

    test('FUNC-RD02: Ghi nhận thất bại do Giao dịch bị Revert trên chuỗi', async () => {
        const hash = '0x10bb8f3ec4731dc4811a43ffb4cfbeba9fc75e533bc71bc8f8cbe6f8ecfeaaaa';
        mockDb.hasHash.mockResolvedValue(false);
        // Trả về Receipt hợp lệ nhưng bị Revert
        mockWeb3.getTransactionReceipt.mockResolvedValue({ status: 0 });

        const res = await processHashSubmit(hash);
        expect(res.status).toBe(422);
        expect(res.error).toContain('thất bại (Revert)');
        expect(mockDb.save).not.toHaveBeenCalled();
    });

    test('FUNC-RD03: Ghi nhận thất bại do Hash bị trùng lặp (Duplicate)', async () => {
        const hash = '0x10bb8f3ec4731dc4811a43ffb4cfbeba9fc75e533bc71bc8f8cbe6f8ecfeaaaa';
        mockDb.hasHash.mockResolvedValue(true);

        const res = await processHashSubmit(hash);
        expect(res.status).toBe(409);
        expect(res.error).toContain('đã được ghi nhận vào hệ thống');
        expect(mockWeb3.getTransactionReceipt).not.toHaveBeenCalled();
    });

    test('FUNC-RD04: Ghi nhận thất bại do Giao dịch không tồn tại trên chuỗi', async () => {
        const hash = '0x10bb8f3ec4731dc4811a43ffb4cfbeba9fc75e533bc71bc8f8cbe6f8ecfeaaaa';
        mockDb.hasHash.mockResolvedValue(false);
        // Hash ảo, RPC không tìm ra
        mockWeb3.getTransactionReceipt.mockResolvedValue(null);

        const res = await processHashSubmit(hash);
        expect(res.status).toBe(404);
        expect(res.error).toContain('Không tìm thấy giao dịch này trên Blockchain');
    });

    test('FUNC-RD05: Ghi nhận thành công', async () => {
        const hash = '0x10bb8f3ec4731dc4811a43ffb4cfbeba9fc75e533bc71bc8f8cbe6f8ecfeaaaa';
        mockDb.hasHash.mockResolvedValue(false);
        // Hash thật, status = 1
        mockWeb3.getTransactionReceipt.mockResolvedValue({ status: 1 });

        const res = await processHashSubmit(hash);
        expect(res.status).toBe(200);
        expect(res.message).toBe('Ghi nhận đóng góp thành công!');
        expect(mockDb.save).toHaveBeenCalledWith(hash);
    });
});
