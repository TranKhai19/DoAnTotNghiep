/**
 * BlockExplorerPage.js
 * Mini Block Explorer - Tra cứu transaction hash từ blockchain nội bộ
 * Route: /explorer
 */
import React, { useState, useEffect } from 'react';
import './BlockExplorerPage.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const RPC_URL  = process.env.REACT_APP_CHAIN_RPC_URL || 'http://localhost:8545';

const BlockExplorerPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentTxs, setRecentTxs] = useState([]);

  // Lấy các giao dịch gần đây từ DB
  useEffect(() => {
    fetch(`${API_BASE}/api/campaigns/onchain/recent-txs`)
      .then(r => r.json())
      .then(d => d.success && setRecentTxs(d.data || []))
      .catch(() => {});
  }, []);

  const handleSearch = async (txHash) => {
    const hash = (txHash || searchInput).trim();
    if (!hash) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Gọi trực tiếp JSON-RPC để lấy thông tin transaction
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [hash],
          id: 1
        })
      });
      const data = await response.json();

      if (!data.result) {
        throw new Error('Không tìm thấy giao dịch. Vui lòng kiểm tra lại mã hash.');
      }

      const tx = data.result;

      // Lấy thêm receipt để biết status
      const receiptRes = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [hash],
          id: 2
        })
      });
      const receiptData = await receiptRes.json();
      const receipt = receiptData.result;

      // Lấy thêm thông tin block
      let block = null;
      if (tx.blockNumber) {
        const blockRes = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: [tx.blockNumber, false],
            id: 3
          })
        });
        const blockData = await blockRes.json();
        block = blockData.result;
      }

      setResult({ tx, receipt, block });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hexToDecimal = (hex) => hex ? parseInt(hex, 16) : 0;
  const weiToEth = (wei) => wei ? (parseInt(wei, 16) / 1e18).toFixed(8) : '0';
  const formatTimestamp = (hex) => {
    if (!hex) return 'N/A';
    return new Date(parseInt(hex, 16) * 1000).toLocaleString('vi-VN');
  };
  const truncate = (str, start = 10, end = 6) =>
    str ? `${str.slice(0, start)}...${str.slice(-end)}` : 'N/A';

  return (
    <div className="explorer-page">
      {/* Header */}
      <div className="explorer-hero">
        <div className="hero-content">
          <div className="hero-icon">🔍</div>
          <h1>FundChain Block Explorer</h1>
          <p>Tra cứu và xác minh mọi giao dịch trên mạng blockchain của FundChain</p>
          
          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Nhập mã Transaction Hash (0x...) để tra cứu..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={() => handleSearch()} disabled={loading}>
              {loading ? <span className="spinner" /> : '🔍 Tra cứu'}
            </button>
          </div>
        </div>
      </div>

      <div className="explorer-body">
        {/* Error */}
        {error && (
          <div className="explorer-error">
            <span>❌</span> {error}
          </div>
        )}

        {/* Transaction Result */}
        {result && (
          <div className="tx-result">
            <div className="tx-result-header">
              <h2>Chi tiết Giao dịch</h2>
              <span className={`tx-status ${result.receipt?.status === '0x1' ? 'success' : 'failed'}`}>
                {result.receipt?.status === '0x1' ? '✅ Thành công' : '❌ Thất bại'}
              </span>
            </div>

            <div className="tx-detail-grid">
              <div className="detail-card">
                <div className="detail-label">Transaction Hash</div>
                <div className="detail-value mono">
                  {result.tx.hash}
                  <button className="copy-mini" onClick={() => navigator.clipboard.writeText(result.tx.hash)}>⎘</button>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-label">Block Number</div>
                <div className="detail-value">{hexToDecimal(result.tx.blockNumber)}</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">Thời gian</div>
                <div className="detail-value">{formatTimestamp(result.block?.timestamp)}</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">Từ địa chỉ</div>
                <div className="detail-value mono">{result.tx.from}</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">Tới địa chỉ (Smart Contract)</div>
                <div className="detail-value mono">{result.tx.to || 'Contract Creation'}</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">Gas đã dùng</div>
                <div className="detail-value">{hexToDecimal(result.receipt?.gasUsed).toLocaleString()} units</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">Input Data (Tham số hàm)</div>
                <div className="detail-value mono small">{result.tx.input || '0x'}</div>
              </div>

              {result.receipt?.logs?.length > 0 && (
                <div className="detail-card full-width">
                  <div className="detail-label">Events được phát ra ({result.receipt.logs.length})</div>
                  <div className="events-list">
                    {result.receipt.logs.map((log, i) => (
                      <div key={i} className="event-item">
                        <span className="event-number">#{i + 1}</span>
                        <span className="event-data mono">{truncate(log.topics[0], 18, 6)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {recentTxs.length > 0 && !result && (
          <div className="recent-section">
            <h2>Giao dịch gần đây</h2>
            <div className="recent-list">
              {recentTxs.map((tx, i) => (
                <div key={i} className="recent-item" onClick={() => { setSearchInput(tx.tx_hash); handleSearch(tx.tx_hash); }}>
                  <div className="recent-icon">{tx.type === 'donation' ? '💰' : tx.type === 'disbursement' ? '📤' : '🎯'}</div>
                  <div className="recent-info">
                    <div className="recent-hash">{truncate(tx.tx_hash)}</div>
                    <div className="recent-desc">{tx.description}</div>
                  </div>
                  <div className="recent-amount">
                    {tx.amount?.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && recentTxs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>Nhập mã Transaction Hash để bắt đầu tra cứu</h3>
            <p>Mọi khoản quyên góp và giải ngân đều được ghi vĩnh viễn trên Blockchain và có thể xác minh tại đây.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockExplorerPage;
