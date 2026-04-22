describe('Quy trình Đối soát (Reconciliation) Backend', () => {

    // Giả lập Service Đối Soát (chạy logic so khớp On-chain và DB)
    const reconciliationService = async (onchainData, dbData) => {
        let alerts = [];
        let canSync = false;
        let isSuspicious = false;

        const delta = Number(onchainData.balance) - Number(dbData.balance);

        if (delta === 0) {
            // Khớp hoàn toàn
            // Tuy nhiên kiểm tra kỹ nếu có direct transfer mờ ám
            if (onchainData.hasDirectTransfer && !dbData.hasDirectTransferAlert) {
                 alerts.push('Có khoản tiền gửi trực tiếp vào Smart Contract mà không dùng hàm donate()');
            }
        } 
        else if (delta > 0) {
            // On-chain > DB: DB bị chậm (Listener chết, nghẽn mạng)
            alerts.push('Lệch dữ liệu. Dữ liệu trên chuỗi nhiều hơn trong DB.');
            canSync = true; // Cho fetch lại past logs
        }
        else {
            // DB > On-chain: Lỗi nghiêm trọng, có kẻ gian Insert thẳng vào DB
            alerts.push('Phát hiện bất thường dữ liệu. DB cao hơn thực tế On-chain.');
            isSuspicious = true; // Block Campaign lại
        }

        return {
            onchainBalance: Number(onchainData.balance),
            dbBalance: Number(dbData.balance),
            delta: Math.abs(delta),
            alerts,
            status: delta === 0 && alerts.length === 0 ? 'Khớp hoàn toàn' : 'Sai lệch',
            suggestions: { canSync, isSuspicious }
        };
    };

    test('Case 1: Đối soát khớp hoàn toàn (Khớp lệnh 100%)', async () => {
        const onchain = { balance: 5000000, hasDirectTransfer: false };
        const db = { balance: 5000000, hasDirectTransferAlert: false };
        
        const result = await reconciliationService(onchain, db);
        expect(result.delta).toBe(0);
        expect(result.status).toBe('Khớp hoàn toàn');
    });

    test('Case 2: Báo cáo sai lệch: On-chain lớn hơn DB (Thiếu dữ liệu DB)', async () => {
        const onchain = { balance: 5000000 };
        const db = { balance: 3000000 }; // Bị hụt 2 triệu do lỗi listener backend
        
        const result = await reconciliationService(onchain, db);
        expect(result.delta).toBe(2000000);
        expect(result.suggestions.canSync).toBe(true);
        expect(result.alerts[0]).toContain('Lệch dữ liệu');
    });

    test('Case 3: Báo cáo sai lệch: DB lớn hơn On-chain (Bị CHack Database)', async () => {
        const onchain = { balance: 5000000 };
        const db = { balance: 9000000 }; // Ai đó insert số ảo vào DB
        
        const result = await reconciliationService(onchain, db);
        expect(result.delta).toBe(4000000);
        expect(result.suggestions.isSuspicious).toBe(true); // Cảnh báo Đáng Ngờ
        expect(result.alerts[0]).toContain('bất thường dữ liệu');
    });

    test('Case 4: Quét lại quá khứ (Sync Past Logs) xử lý Khắc phục', async () => {
        // Sau khi chạy đồng bộ, giả lập DB đã được lấp đầy
        const onchainAfterSync = { balance: 8000000 };
        const dbAfterSync = { balance: 8000000 };
        
        const result = await reconciliationService(onchainAfterSync, dbAfterSync);
        expect(result.delta).toBe(0);
        expect(result.status).toBe('Khớp hoàn toàn');
    });

    test('Case 5: Đối soát giao dịch "Bắn" tiền trực tiếp (Direct Transfer không qua hàm Donate)', async () => {
        // Balance hai bên bằng nhau vì ta ép đồng bộ quỹ tổng, 
        // nhưng Blockchain dò ra một cục tiền không sinh event
        const onchain = { balance: 5000000, hasDirectTransfer: true };
        const db = { balance: 5000000, hasDirectTransferAlert: false };
        
        const result = await reconciliationService(onchain, db);
        expect(result.alerts[0]).toContain('gửi trực tiếp vào Smart Contract');
    });
});
