/**
 * DisbursementPage.js
 * Luồng 3: Admin quản lý yêu cầu giải ngân
 * Route: /admin/disbursements
 */
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const statusMap = {
  pending:  { label: 'Chờ duyệt',  cls: 'pending',  emoji: '⏳' },
  approved: { label: 'Đã duyệt',   cls: 'approved', emoji: '✅' },
  rejected: { label: 'Từ chối',    cls: 'rejected', emoji: '❌' },
};

const DisbursementPage = ({ user, role }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReq, setSelectedReq] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ── New Request Form ──
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ campaign_id: '', amount: '', reason: '' });
  const [formFiles, setFormFiles] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getAuthHeader = () => {
    // Thử lấy token từ nhiều nguồn khác nhau của Supabase
    let token = localStorage.getItem('access_token');
    
    if (!token) {
      // Supabase v2 thường lưu trong key có format sb-<ref>-auth-token
      const projectRef = 'mfyncysdujxdeeypppbk';
      const sbKey = `sb-${projectRef}-auth-token`;
      const sbData = localStorage.getItem(sbKey);
      if (sbData) {
        try {
          const parsed = JSON.parse(sbData);
          token = parsed.access_token;
        } catch (e) {}
      }
    }

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/disbursements?status=${activeTab === 'all' ? '' : activeTab}`, {
        headers: { ...getAuthHeader() }
      });
      const data = await res.json();
      if (data.success) setRequests(data.data || []);
    } catch (err) {
      showToast('Không thể tải danh sách: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (req) => {
    if (!window.confirm(`Duyệt giải ngân ${Number(req.amount).toLocaleString('vi-VN')}₫ cho chiến dịch này?\n\nHành động này sẽ gọi Smart Contract!`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/disbursements/${req.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Đã duyệt! TxHash: ${data.blockchain?.tx_hash?.slice(0, 16)}...`);
        fetchRequests();
      } else {
        showToast('Lỗi: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/disbursements/${rejectModal.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã từ chối yêu cầu giải ngân');
        setRejectModal(null);
        setRejectReason('');
        fetchRequests();
      } else {
        showToast('Lỗi: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append('campaign_id', formData.campaign_id);
      fd.append('amount', formData.amount);
      fd.append('reason', formData.reason);
      formFiles.forEach(f => fd.append('proof_files', f));

      const res = await fetch(`${API_BASE}/api/disbursements`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã tạo yêu cầu giải ngân!');
        setShowForm(false);
        setFormData({ campaign_id: '', amount: '', reason: '' });
        setFormFiles([]);
        fetchRequests();
      } else {
        showToast('Lỗi: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isAdmin = role === 'admin' || user?.role === 'admin' || user?.user_metadata?.role === 'admin';

  return (
    <div className="admin-page disbursement-page fade-in">
      {/* Toast */}
      {toast && (
        <div className={`dis-toast ${toast.type}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="admin-header-row mb-32">
        <div>
          <h2 className="mb-8">💸 Quản lý Giải ngân</h2>
          <p className="text-muted m-0">Đề xuất và duyệt giải ngân — mọi giao dịch được ghi lên Blockchain.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Tạo yêu cầu giải ngân
        </button>
      </div>

      {/* Tabs */}
      <div className="dis-tabs mb-24">
        {['all', 'pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            className={`dis-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? 'Tất cả' : statusMap[tab]?.label}
            <span className="dis-tab-count">
              {requests.filter(r => tab === 'all' || r.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Request List */}
      <div className="dis-list">
        {loading ? (
          <div className="dis-loading">⏳ Đang tải...</div>
        ) : requests.length === 0 ? (
          <div className="dis-empty">
            <div className="dis-empty-icon">📭</div>
            <h3>Chưa có yêu cầu giải ngân nào</h3>
            <p>Nhấn "+ Tạo yêu cầu" để đề xuất giải ngân cho chiến dịch.</p>
          </div>
        ) : (
          requests
            .filter(r => activeTab === 'all' || r.status === activeTab)
            .map(req => {
              const s = statusMap[req.status] || { label: req.status, cls: 'pending', emoji: '❓' };
              return (
                <div key={req.id} className="dis-card">
                  <div className="dis-card-header">
                    <div className="dis-card-title">
                      <span className="dis-icon">💸</span>
                      <div>
                        <div className="dis-campaign">{req.campaign?.title || `Chiến dịch #${req.campaign_id?.slice(-8)}`}</div>
                        <div className="dis-amount">{Number(req.amount).toLocaleString('vi-VN')}₫</div>
                      </div>
                    </div>
                    <span className={`dis-badge ${s.cls}`}>{s.emoji} {s.label}</span>
                  </div>

                    <div className="dis-card-body">
                    <div className="dis-field">
                      <span className="dis-label">Lý do giải ngân</span>
                      <span className="dis-value">{req.reason}</span>
                    </div>
                    {req.tx_hash && (
                      <div className="dis-field">
                        <span className="dis-label">Blockchain Transaction</span>
                        <a href={`/explorer?hash=${req.tx_hash}`} className="dis-tx-link" target="_blank" rel="noreferrer">
                          {req.tx_hash.slice(0, 24)}...
                        </a>
                      </div>
                    )}
                    {req.proof_documents && req.proof_documents.length > 0 && (
                      <div className="dis-field">
                        <span className="dis-label">Tài liệu ({req.proof_documents.length}):</span>
                        <div className="dis-docs">
                          {req.proof_documents.map((d, i) => (
                            <a key={i} href={d.gatewayUrl} target="_blank" rel="noreferrer" className="dis-doc-link">
                              📎 Tài liệu {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="dis-field">
                      <span className="dis-label">Thông tin yêu cầu</span>
                      <div className="dis-value" style={{fontSize: 12, display: 'flex', gap: 12}}>
                        <span>👤 {req.requester?.full_name || 'Staff'}</span>
                        <span>📅 {new Date(req.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions - chỉ Admin mới duyệt */}
                  {isAdmin && req.status === 'pending' && (
                    <div className="dis-card-actions">
                      <button
                        className="btn btn-danger sm"
                        onClick={() => setRejectModal(req)}
                        disabled={actionLoading}
                      >
                        ❌ Từ chối
                      </button>
                      <button
                        className="btn btn-success sm"
                        onClick={() => handleApprove(req)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? '⏳ Đang xử lý...' : '✅ Duyệt & Ghi Blockchain'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* Create Request Modal */}
      {showForm && (
        <div className="dis-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="dis-modal" onClick={e => e.stopPropagation()}>
            <h3 className="mb-24">📝 Tạo yêu cầu giải ngân</h3>
            <form onSubmit={handleCreateRequest}>
              <div className="form-group mb-16">
                <label>Campaign ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="UUID của chiến dịch"
                  value={formData.campaign_id}
                  onChange={e => setFormData(p => ({...p, campaign_id: e.target.value}))}
                  required
                />
              </div>
              <div className="form-group mb-16">
                <label>Số tiền giải ngân (VNĐ)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={formData.amount}
                  onChange={e => setFormData(p => ({...p, amount: e.target.value}))}
                  required min="1"
                />
              </div>
              <div className="form-group mb-16">
                <label>Lý do / Mục đích giải ngân</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Mô tả chi tiết lý do giải ngân..."
                  value={formData.reason}
                  onChange={e => setFormData(p => ({...p, reason: e.target.value}))}
                  required
                />
              </div>
              <div className="form-group mb-24">
                <label>📎 Tài liệu chứng minh (sẽ lưu IPFS)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={e => setFormFiles(Array.from(e.target.files))}
                  className="form-input"
                />
                {formFiles.length > 0 && (
                  <div className="file-list mt-8">
                    {formFiles.map((f, i) => <span key={i} className="file-chip">📄 {f.name}</span>)}
                  </div>
                )}
              </div>
              <div className="dis-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? '⏳ Đang gửi...' : '📤 Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="dis-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="dis-modal" onClick={e => e.stopPropagation()}>
            <h3 className="mb-16">❌ Từ chối yêu cầu giải ngân</h3>
            <p className="text-muted mb-16">Yêu cầu giải ngân <strong>{Number(rejectModal.amount).toLocaleString('vi-VN')}₫</strong></p>
            <div className="form-group mb-24">
              <label>Lý do từ chối</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
            </div>
            <div className="dis-modal-actions">
              <button className="btn btn-outline" onClick={() => setRejectModal(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? '⏳...' : '❌ Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisbursementPage;
