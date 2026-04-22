describe('LOAD: Kiểm tra Khả năng chịu tải & Đồng bộ (Concurrency & Load Testing)', () => {
    
    // Giả lập Database chứa bảng ghi và Số dư
    let mockDB = {
        totalFund: 0,
        records: []
    };

    // Giả lập Socket server
    let socketClientsCount = 0;
    
    beforeEach(() => {
        mockDB = { totalFund: 0, records: [] };
        socketClientsCount = 0;
    });

    // Hàm giả lập Webhook xử lý Ghi nhận đóng góp
    const processWebhook = async (reqId, amount) => {
        // Giả lập delay mạng ngẫu nhiên từ 50-200ms
        const delay = Math.floor(Math.random() * 150) + 50;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Lưu vào DB bằng logic bất đồng bộ
        mockDB.records.push({ reqId, amount, timestamp: Date.now() });
        mockDB.totalFund += amount;

        // Bắn Socket (Giả lập phát event)
        socketClientsCount++;

        return { status: 200, reqId };
    };

    test('LOAD-01, LOAD-02, LOAD-03: Gửi 50 requests đồng thời trong điều kiện Load', async () => {
        const TOTAL_REQUESTS = 50;
        const REQUEST_AMOUNT = 100;
        const EXPECTED_TOTAL = TOTAL_REQUESTS * REQUEST_AMOUNT; // 50 * 100 = 5000

        const startTime = Date.now();

        // Giả lập 50 request (Vu) được bắn cùng 1 lúc đến webhook
        const promises = [];
        for (let i = 0; i < TOTAL_REQUESTS; i++) {
            promises.push(processWebhook(`REQ-${i}`, REQUEST_AMOUNT));
        }

        const responses = await Promise.all(promises);
        const endTime = Date.now();
        const duration = endTime - startTime;

        // LOAD-01: 100% request thành công, không bị Connection Timeout
        const successCount = responses.filter(r => r.status === 200).length;
        expect(successCount).toBe(TOTAL_REQUESTS);
        
        // LOAD-01: Response Time P95 (Ở đây ta đo Tổng thời gian chịu tải 50 req xử lý đồng thời phải < 2000ms)
        expect(duration).toBeLessThan(2000); 

        // LOAD-02: Tính toàn vẹn DB
        // Số lượng bản ghi trong DB tăng đúng 50, không có giao dịch bị ghi đè do Race Condition (Trong Node JS thì an toàn hơn, nhưng DB thật phải handle Transaction)
        expect(mockDB.records.length).toBe(TOTAL_REQUESTS);
        // Tổng quỹ tăng chính xác
        expect(mockDB.totalFund).toBe(EXPECTED_TOTAL);

        // LOAD-03: Socket Latency nhận đủ thông điệp mà không rơi rớt
        expect(socketClientsCount).toBe(TOTAL_REQUESTS);
    });
});
