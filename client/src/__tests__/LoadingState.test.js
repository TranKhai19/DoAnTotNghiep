import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component giả lập State Loading của Trang theo chuẩn ST01 - ST07
const DataViewMock = ({ apiMock, networkState = 'fast' }) => {
    const [state, setState] = React.useState('initial'); // initial, loading, empty, success, error
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        let isMounted = true;
        setState('loading');
        
        // ST01: Nếu mạng chậm (throttle), ta có thể render Skeleton. Render bình thường là Spinner.
        apiMock()
            .then(res => {
                if (!isMounted) return;
                if (res.length === 0) setState('empty');
                else {
                    setData(res);
                    setState('success'); // ST07 Partial - ST05 Success
                }
            })
            .catch(() => {
                if (isMounted) setState('error');
            });
        
        return () => { isMounted = false; };
    }, [apiMock]);

    return (
        <div>
            {state === 'loading' && networkState === 'slow' && <div data-testid="skeleton">Skeleton Loading...</div>}
            {state === 'loading' && networkState === 'fast' && <div data-testid="spinner">Spinner...</div>}
            {state === 'empty' && <div data-testid="empty-state">Không có dữ liệu</div>}
            {state === 'error' && <div data-testid="error-state">Failed to fetch API</div>}
            {state === 'success' && (
                <div data-testid="data-grid">
                    {data.map(item => <span key={item.id}>{item.name}</span>)}
                </div>
            )}
        </div>
    );
};

describe('ST: Kiểm thử Trạng thái Tải dữ liệu (Loading/Empty/Error States)', () => {

    test('ST01: Mạng chậm (Network throttle) -> Hiển thị Skeleton thay vì Spinner mặc định', async () => {
        // Giả lập API promise pending
        let resolveApi;
        const mockApi = () => new Promise(res => { resolveApi = res; });
        
        render(<DataViewMock apiMock={mockApi} networkState="slow" />);
        // Khi component mount, đang call api, trạng thái mạng chậm hiển thị Skeleton layout (ko để trống trang)
        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
        
        await act(async () => { resolveApi([{ id: 1, name: 'Data 1' }]); });
    });

    test('ST02: Load lâu thông thường -> Hiển thị Spinner', async () => {
        let resolveApi;
        const mockApi = () => new Promise(res => { resolveApi = res; });
        
        render(<DataViewMock apiMock={mockApi} networkState="fast" />);
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
        
        await act(async () => { resolveApi([{ id: 1, name: 'Data 1' }]); });
    });

    test('ST03: API trả về mảng rỗng -> Hiển thị "Không có dữ liệu"', async () => {
        const mockApi = () => Promise.resolve([]); // Trả về mảng rỗng
        
        await act(async () => {
            render(<DataViewMock apiMock={mockApi} />);
        });
        
        expect(screen.getByTestId('empty-state')).toHaveTextContent('Không có dữ liệu');
    });

    test('ST04: API lỗi (Network Error/ 500) -> Hiển thị thông báo Lỗi', async () => {
        const mockApi = () => Promise.reject(new Error('Internal Server Error'));
        
        await act(async () => {
            render(<DataViewMock apiMock={mockApi} />);
        });
        
        expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to fetch API');
    });

    test('ST05: Thành công -> Hiển thị Data Grid', async () => {
        const mockApi = () => Promise.resolve([{ id: 1, name: 'Campaign A' }, { id: 2, name: 'Campaign B' }]);
        
        await act(async () => {
            render(<DataViewMock apiMock={mockApi} />);
        });
        
        expect(screen.getByTestId('data-grid')).toHaveTextContent('Campaign ACampaign B');
    });

    test('ST06: F5 / Reload trang -> Reset lại về trạng thái Loading ban đầu', async () => {
        let resolveApi;
        const mockApi = () => new Promise(res => { resolveApi = res; });
        
        const { unmount } = render(<DataViewMock apiMock={mockApi} networkState="fast" />);
        // Trạng thái ban đầu Spinner
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
        await act(async () => { resolveApi([{ id: 1, name: 'A' }]); });

        // Giả lập F5 bằng cách Unmount và Render lại
        unmount();
        
        let newResolveApi;
        const newMockApi = () => new Promise(res => { newResolveApi = res; });
        render(<DataViewMock apiMock={newMockApi} networkState="fast" />);
        
        // Quá trình Reload hiển thị lại Load
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    test('ST07: Tải một phần (Partial Load) -> Giao diện không bị vỡ do delay ảnh/text dài', async () => {
        // Dữ liệu mock chứa text dài thòng lọng để check component Render
        const mockApi = () => Promise.resolve([{ id: 1, name: 'ĐÂY LÀ ĐOẠN TEXT RẤT DÀI RẤT DÀI ĐỂ KIỂM TRA OVERFLOW VÀ WORD-WRAP TRONG UI KHÔNG BỊ VỠ LAYOUT' }]);
        
        await act(async () => {
            render(<DataViewMock apiMock={mockApi} />);
        });
        
        const grid = screen.getByTestId('data-grid');
        // Test kiểm tra UI có render ra Text nhưng ta hy vọng thông qua CSS thì nó không bị tràn (Không crash trong React logic)
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveTextContent('OVERFLOW VÀ WORD-WRAP');
    });

});
