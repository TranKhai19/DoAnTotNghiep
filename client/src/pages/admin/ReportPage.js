/**
 * ReportPage.js
 * Luồng 4: Staff nộp báo cáo thực địa + hóa đơn, Admin nghiệm thu và đóng chiến dịch on-chain.
 * Route: /admin/reports
 */
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import './DisbursementPage.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const ReportPage = ({ user, role }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ campaign_id: '', description: '' });
  const [formFiles, setFormFiles] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

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

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports`, { headers: { ...getAuthHeader() } });
      const data = await res.json();
      if (data.success) setReports(data.data || []);
    } catch (err) {
      showToast('Không thể tải báo cáo: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleApproveReport = async (reportId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports/${reportId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã duyệt báo cáo!');
        fetchReports();
      } else {
        showToast('Lỗi: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReport = async (reportId) => {
    if (!window.confirm('Từ chối báo cáo này?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports/${reportId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã từ chối báo cáo', 'info');
        fetchReports();
      } else {
        showToast('Lỗi: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCampaign = async (report) => {
    if (!window.confirm(`Nghiệm thu và đóng chiến dịch "${report.campaign?.title}"?\n\nBằng chứng sẽ được băm và ghi vĩnh viễn lên Blockchain!`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports/${report.id}/close-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🔒 Chiến dịch đã đóng! TxHash: ${data.blockchain?.tx_hash?.slice(0, 16)}...`);
        fetchReports();
      } else {
        showToast('Lỗi: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append('campaign_id', formData.campaign_id);
      fd.append('description', formData.description);
      formFiles.forEach(f => fd.append('invoice_files', f));

      const res = await fetch(`${API_BASE}/api/reports`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã nộp báo cáo thực địa!');
        setShowForm(false);
        setFormData({ campaign_id: '', description: '' });
        setFormFiles([]);
        fetchReports();
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
 
  // Grouping logic
  const grouped = reports.reduce((acc, rep) => {
    const cid = rep.campaign_id;
    if (!acc[cid]) {
      acc[cid] = {
        campaign: rep.campaign,
        reports: [],
        isClosed: !!rep.tx_hash,
        tx_hash: rep.tx_hash,
        pendingCount: 0,
        approvedCount: 0
      };
    }
    acc[cid].reports.push(rep);
    if (rep.status === 'pending') acc[cid].pendingCount++;
    if (rep.status === 'approved') acc[cid].approvedCount++;
    if (rep.tx_hash) {
      acc[cid].isClosed = true;
      acc[cid].tx_hash = rep.tx_hash;
    }
    return acc;
  }, {});
 
  const campaignGroups = Object.values(grouped);
  const activeFolder = selectedCampaignId ? grouped[selectedCampaignId] : null;

  console.log('🖼️ [ReportPage] Rendering with reports count:', reports.length, 'Selected:', selectedCampaignId);

  return (
    <div className="admin-page disbursement-page fade-in">
      {toast && (
        <div className={`dis-toast ${toast.type}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <div className="admin-header-row mb-32">
        <div>
          <h2 className="mb-8">📋 Báo cáo Nghiệm thu</h2>
          <p className="text-muted m-0">
            Staff nộp hóa đơn thực địa. Admin nghiệm thu và đóng chiến dịch on-chain.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nộp báo cáo thực địa
        </button>
      </div>

       {!selectedCampaignId ? (
        /* Folder View */
        <div className="rep-folders-grid">
          {loading ? (
            <div className="dis-loading">⏳ Đang tải thư mục báo cáo...</div>
          ) : campaignGroups.length === 0 ? (
            <div className="dis-empty">
              <div className="dis-empty-icon">📁</div>
              <h3>Thư mục trống</h3>
              <p>Chưa có chiến dịch nào được báo cáo nghiệm thu.</p>
            </div>
          ) : (
            campaignGroups.map(group => (
              <div key={group.campaign?.id || Math.random()} className="rep-folder-card" onClick={() => setSelectedCampaignId(group.campaign?.id)}>
                <div className="folder-tab"></div>
                <div className="folder-content">
                  <div className="folder-icon">📂</div>
                  <div className="folder-info">
                    <h4 className="folder-title">{group.campaign?.title}</h4>
                    <div className="folder-meta">
                      <span>{group.reports.length} báo cáo</span>
                      {group.pendingCount > 0 && (
                        <span className="badge-pending">⏳ {group.pendingCount} chờ duyệt</span>
                      )}
                      {group.isClosed ? (
                        <span className="badge-closed">🔒 Đã đóng</span>
                      ) : (
                        <span className="badge-active">🟢 Đang hoạt động</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Inside Folder View */
        <div className="rep-folder-detail">
          <div className="rep-detail-header mb-24">
            <button className="btn-back" onClick={() => setSelectedCampaignId(null)}>
              ← Quay lại thư mục
            </button>
            <div className="rep-campaign-summary">
              <h3>{activeFolder?.campaign?.title || 'Đang tải...'}</h3>
              <p>ID Chiến dịch: {activeFolder?.campaign?.id || selectedCampaignId}</p>
            </div>
            
            {isAdmin && !activeFolder.isClosed && (
              <div className="admin-finalize-zone">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    const latestApproved = activeFolder?.reports?.find(r => r.status === 'approved');
                    if (latestApproved) handleCloseCampaign(latestApproved);
                    else showToast('Cần ít nhất 1 báo cáo đã được DUYỆT để đóng chiến dịch!', 'error');
                  }}
                  disabled={actionLoading || !activeFolder || activeFolder.approvedCount === 0}
                >
                  {actionLoading ? '⏳ Đang ghi Blockchain...' : '🔒 Nghiệm thu Toàn bộ & Đóng Blockchain'}
                </button>
                <p className="hint text-danger mt-8">Lưu ý: Chỉ có thể đóng khi đã có ít nhất 1 báo cáo được duyệt.</p>
              </div>
            )}
            
            {activeFolder?.isClosed && (
              <div className="admin-finalize-zone">
                <div className="badge-success-outline">
                  🔒 Chiến dịch đã được đóng vĩnh viễn trên Blockchain
                </div>
                <a href={`/explorer?hash=${activeFolder.tx_hash}`} target="_blank" className="dis-tx-link mt-8">
                  Check Tx: {activeFolder.tx_hash?.slice(0, 32)}...
                </a>
              </div>
            )}
          </div>
 
          <div className="dis-list">
            {activeFolder?.reports?.map((rep, idx) => (
              <div key={rep.id} className="dis-card">
                <div className="dis-card-header">
                  <div className="dis-card-title">
                    <span className="dis-icon">📄</span>
                    <div>
                      <div className="dis-campaign">Báo cáo Giai đoạn {activeFolder.reports.length - idx}</div>
                      <div className="dis-value" style={{fontSize: 12, marginTop: 4}}>
                         👤 {rep.reporter?.full_name || 'Staff'} • 📅 {new Date(rep.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className={`rep-status-badge ${rep.status}`}>
                      {rep.status === 'pending' ? '⏳ Chờ duyệt' : rep.status === 'approved' ? '✅ Đã duyệt' : '❌ Từ chối'}
                    </div>
                  </div>
                </div>
 
                <div className="dis-card-body">
                  <div className="dis-field">
                    <span className="dis-label">Nội dung báo cáo</span>
                    <span className="dis-value">{rep.description}</span>
                  </div>
                  {rep.invoice_documents && rep.invoice_documents.length > 0 && (
                    <div className="dis-field">
                      <span className="dis-label">Chứng từ & Hóa đơn ({rep.invoice_documents.length})</span>
                      <div className="dis-docs">
                        {rep.invoice_documents.map((d, i) => (
                          <a key={i} href={d.gatewayUrl} target="_blank" rel="noreferrer" className="dis-doc-link">
                            🧾 Hóa đơn {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isAdmin && rep.status === 'pending' && (
                    <div className="rep-actions mt-20 pt-16" style={{borderTop: '1px solid #eee', display: 'flex', gap: 12}}>
                      <button className="btn btn-success sm flex-1" onClick={() => handleApproveReport(rep.id)} disabled={actionLoading}>
                        Duyệt báo cáo
                      </button>
                      <button className="btn btn-outline sm flex-1" onClick={() => handleRejectReport(rep.id)} disabled={actionLoading} style={{color: '#dc2626'}}>
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showForm && (
        <div className="dis-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="dis-modal" onClick={e => e.stopPropagation()}>
            <h3 className="mb-24">📋 Nộp báo cáo thực địa</h3>
            <form onSubmit={handleCreateReport}>
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
                <label>Mô tả báo cáo thực địa</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Mô tả chi tiết tình hình thực địa, các hoạt động đã thực hiện..."
                  value={formData.description}
                  onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                  required
                />
              </div>
              <div className="form-group mb-24">
                <label>🧾 Ảnh hóa đơn & tài liệu thực địa (sẽ lưu IPFS)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={e => setFormFiles(Array.from(e.target.files))}
                  className="form-input"
                />
                {formFiles.length > 0 && (
                  <div className="file-list mt-8">
                    {formFiles.map((f, i) => <span key={i} className="file-chip">🧾 {f.name}</span>)}
                  </div>
                )}
              </div>
              <div className="dis-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? '⏳ Đang upload...' : '📤 Nộp báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
