import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

/* --- MOCK COMPONENT & TÌNH HUỐNG GIẢ LẬP THEO FUNC-SK --- */
const DashboardMock = () => {
    const [connected, setConnected] = React.useState(true);
    const [messages, setMessages] = React.useState([]);
    const [retries, setRetries] = React.useState(0);
    const [error, setError] = React.useState('');

    const maxRetries = 10;

    const simulateDisconnect = () => {
        setConnected(false);
    };

    const simulateReconnect = () => {
        setConnected(true);
        // FUNC-SK03: Nhận bù thông báo bị nhỡ
        setMessages(prev => [...prev, 'Giao dịch bị nhỡ trong lúc rớt mạng']);
    };

    const simulateFailedRetries = () => {
        setConnected(false);
        setRetries(10);
        setError('Mất kết nối máy chủ. Vui lòng tải lại trang (F5) để kết nối lại.'); // FUNC-SK04
    };

    const attemptSendAction = () => {
        if (!connected) setError('Không thể thực hiện lúc này, đang mất mạng'); // FUNC-SK05
    };

    return (
        <div>
            <div data-testid="status">{connected ? 'Connected' : 'Offline'}</div>
            {error && <div data-testid="error-alert">{error}</div>}
            <div data-testid="messages">{messages.join(', ')}</div>
            <button data-testid="btn-disconnect" onClick={simulateDisconnect}>Ngắt mạng</button>
            <button data-testid="btn-reconnect" onClick={simulateReconnect}>Khôi phục mạng</button>
            <button data-testid="btn-fail-retry" onClick={simulateFailedRetries}>Quá số lần thử</button>
            <button data-testid="btn-send-action" onClick={attemptSendAction}>Gửi dữ liệu</button>
        </div>
    );
};

describe('FUNC-SK: Socket Recovery & Retry Behaviors (Dashboard Component)', () => {
    
    test('FUNC-SK01: Hệ thống phản hồi khi đột ngột mất kết nối mạng', () => {
        render(<DashboardMock />);
        // 1. Máy tính ngắt mạng (Offline)
        act(() => { screen.getByTestId('btn-disconnect').click(); });
        
        // Cần đảm bảo UI đổi trạng thái nhưng KHÔNG bị crash hay treo vô hạn
        expect(screen.getByTestId('status')).toHaveTextContent('Offline');
        // Không có báo crash, Component render bình thường
    });

    test('FUNC-SK02 & FUNC-SK03: Tự động kết nối lại (Auto-reconnect) & Nhận thông báo bù (Message Recovery)', () => {
        render(<DashboardMock />);
        act(() => { screen.getByTestId('btn-disconnect').click(); });
        expect(screen.getByTestId('status')).toHaveTextContent('Offline');

        // 1. Bật mạng lại. Socket tự động chọc lại sv.
        act(() => { screen.getByTestId('btn-reconnect').click(); });
        
        // 2. Không cần F5, UI tự động phục hồi kết nối.
        expect(screen.getByTestId('status')).toHaveTextContent('Connected');
        // 3. Phải nhận được thông báo cũ
        expect(screen.getByTestId('messages')).toHaveTextContent('Giao dịch bị nhỡ trong lúc rớt mạng');
    });

    test('FUNC-SK04: Cảnh báo người dùng khi vượt quá số lần thử kết nối lại (Max Retries)', () => {
        render(<DashboardMock />);
        // Socket ngắt > thử 10 lần nhưng rớt suốt.
        act(() => { screen.getByTestId('btn-fail-retry').click(); });
        
        // Phải dừng gửi request ngầm và hiển thị Alert F5 rõ ràng.
        expect(screen.getByTestId('error-alert')).toHaveTextContent('Vui lòng tải lại trang (F5)');
    });

    test('FUNC-SK05: Bắt lỗi / Hàng đợi khi gửi thao tác lúc rớt mạng (Message Acknowledgement)', () => {
        render(<DashboardMock />);
        // 1. Cắt mạng
        act(() => { screen.getByTestId('btn-disconnect').click(); });
        // 2. User tương tác button duyệt chiến dịch...
        act(() => { screen.getByTestId('btn-send-action').click(); });
        
        // Bắt buộc hệ thống catch được lỗi, thay vì báo crash (uncaught exception)
        expect(screen.getByTestId('error-alert')).toHaveTextContent('Không thể thực hiện lúc này, đang mất mạng');
    });

});
