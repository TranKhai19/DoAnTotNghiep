import React, { useState, useEffect, useMemo } from 'react';

const OnchainHistoryTable = ({ campaignId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!campaignId) return;

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:3000';
                const res = await fetch(`${apiBase}/api/campaigns/${campaignId}/history`);
                const json = await res.json();
                if (json.success) {
                    setHistory(json.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải lịch sử On-chain:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [campaignId]);

    const filteredData = useMemo(() => {
        return history.filter(item => {
            const matchesSearch = item.txHash.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.to.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesFilter = filterType === 'All' || item.type === filterType;

            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filterType, history]);

    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleString('vi-VN');
    };

    return (
        <div className="onchain-history-container mt-60" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="d-flex align-center justify-between mb-24" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h3 className="m-0" style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 15v4a2 2 0 002 2h14v-4"/><path d="M3 15V9a2 2 0 012-2h14v8H5a2 2 0 01-2-2z"/></svg>
                        Lịch sử Sao kê On-chain
                    </h3>
                    <p className="text-muted mt-8 mb-0" style={{ fontSize: 14 }}>Mọi giao dịch thu chi đều được ghi nhận vĩnh viễn và minh bạch trên blockchain.</p>
                </div>
                
                <div className="d-flex gap-16" style={{ flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        placeholder="Tìm TxHash, ví..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', minWidth: 200, fontSize: 14 }}
                    />
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', minWidth: 150, fontSize: 14 }}
                    >
                        <option value="All">Tất cả giao dịch</option>
                        <option value="Quyên góp">Quyên góp</option>
                        <option value="Giải ngân">Giải ngân</option>
                        <option value="Tạo chiến dịch">Tạo chiến dịch</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eaeaea' }}>
                            <th style={{ padding: '16px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Thời gian</th>
                            <th style={{ padding: '16px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>TxHash</th>
                            <th style={{ padding: '16px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Loại giao dịch</th>
                            <th style={{ padding: '16px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Từ ví</th>
                            <th style={{ padding: '16px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Số tiền (₫)</th>
                            <th style={{ padding: '16px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                                    <div className="d-flex align-center justify-center gap-8">
                                        <div className="spinner" style={{ width: 24, height: 24, border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        <span>Đang truy xuất dữ liệu từ FundChain...</span>
                                    </div>
                                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? filteredData.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#faf9ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '16px 12px', fontSize: 14 }}>{formatDate(item.timestamp)}</td>
                                <td style={{ padding: '16px 12px', fontSize: 14, fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
                                    <a href={`https://etherscan.io/tx/${item.txHash}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {item.txHash}
                                    </a>
                                </td>
                                <td style={{ padding: '16px 12px', fontSize: 14 }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        fontSize: 12, 
                                        fontWeight: 600,
                                        backgroundColor: item.type === 'Quyên góp' ? '#e6f4ea' : item.type === 'Giải ngân' ? '#fce8e6' : '#fef7e0',
                                        color: item.type === 'Quyên góp' ? '#137333' : item.type === 'Giải ngân' ? '#c5221f' : '#b06000'
                                    }}>
                                        {item.type}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 12px', fontSize: 14, fontFamily: 'monospace' }}>{item.from}</td>
                                <td style={{ padding: '16px 12px', fontSize: 15, fontWeight: 600 }}>
                                    {item.amount > 0 ? `${item.amount.toLocaleString()}₫` : '-'}
                                </td>
                                <td style={{ padding: '16px 12px', fontSize: 14 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: item.status === 'Success' ? '#137333' : item.status === 'Failed' ? '#c5221f' : '#f29900' }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                                    Không tìm thấy dữ liệu giao dịch phù hợp với bộ lọc.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="d-flex justify-center mt-24">
                <button className="btn btn-outline" style={{ fontSize: 14, padding: '8px 24px' }}>Tải thêm lịch sử</button>
            </div>
        </div>
    );
};

export default OnchainHistoryTable;
