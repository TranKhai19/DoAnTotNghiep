import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './StaffCampaignPosts.css';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

// ── Enum values đồng bộ với DB migration 005 ─────────────────────────────────
const CAMPAIGN_STATUS = {
  DRAFT:            'draft',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE:           'active',
  COMPLETED:        'completed',
  REJECTED:         'rejected',
  CLOSED:           'closed',
};

const STATUS_MAP = {
  draft:            { cls: 'draft',    label: 'Nháp',        emoji: '📝' },
  pending_approval: { cls: 'pending',  label: 'Chờ duyệt',   emoji: '⏳' },
  active:           { cls: 'running',  label: 'Đang chạy',   emoji: '🟢' },
  completed:        { cls: 'done',     label: 'Hoàn thành',  emoji: '✅' },
  rejected:         { cls: 'rejected', label: 'Từ chối',     emoji: '❌' },
  closed:           { cls: 'done',     label: 'Đã đóng',     emoji: '🔒' },
};

const TABS = [
  { key: 'all',              label: 'Tất cả' },
  { key: 'draft',            label: 'Nháp' },
  { key: 'pending_approval', label: 'Chờ duyệt' },
  { key: 'active',           label: 'Đang chạy' },
  { key: 'completed',        label: 'Hoàn thành' },
  { key: 'rejected',         label: 'Từ chối' },
];

const PAGE_SIZE = 8;


// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const meta = STATUS_MAP[status] || { cls: 'draft', label: status };
  return (
    <span className={`scp-badge ${meta.cls}`}>
      <span className="scp-badge-dot" />
      {meta.label}
    </span>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Loading Row
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="scp-skeleton-row">
    {[60, 40, 30, 20, 20].map((w, i) => (
      <td key={i}>
        <div className="scp-skeleton-block" style={{ width: `${w}%` }} />
      </td>
    ))}
  </tr>
);


// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────
const DeleteModal = ({ campaign, onConfirm, onCancel, loading }) => (
  <div className="scp-modal-overlay" onClick={onCancel}>
    <div className="scp-modal" onClick={(e) => e.stopPropagation()}>
      <div className="scp-modal-icon">🗑️</div>
      <h3>Xóa chiến dịch này?</h3>
      <p>
        Bạn sắp xóa chiến dịch "<strong>{campaign?.title}</strong>".
        Thao tác này <strong>không thể hoàn tác</strong>. Toàn bộ dữ liệu liên quan sẽ bị mất.
      </p>
      <div className="scp-modal-actions">
        <button className="btn-cancel" onClick={onCancel} disabled={loading}>
          Hủy bỏ
        </button>
        <button className="btn-delete" onClick={onConfirm} disabled={loading}>
          {loading ? 'Đang xóa...' : '🗑️ Xác nhận xóa'}
        </button>
      </div>
    </div>
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// Submit Confirm Modal (Gửi duyệt)
// ─────────────────────────────────────────────────────────────────────────────
const SubmitModal = ({ campaign, onConfirm, onCancel, loading }) => (
  <div className="scp-modal-overlay" onClick={onCancel}>
    <div className="scp-modal" onClick={(e) => e.stopPropagation()}>
      <div className="scp-modal-icon" style={{ background: '#fef3c7' }}>📤</div>
      <h3>Gửi chiến dịch để duyệt?</h3>
      <p>
        Chiến dịch "<strong>{campaign?.title}</strong>" sẽ được gửi đến Admin để xem xét.
        Bạn <strong>sẽ không thể chỉnh sửa</strong> cho đến khi được phê duyệt hoặc từ chối.
      </p>
      <div className="scp-modal-actions">
        <button className="btn-cancel" onClick={onCancel} disabled={loading}>
          Chưa, để sau
        </button>
        <button
          className="btn-delete"
          style={{ background: '#f59e0b' }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : '📤 Gửi duyệt ngay'}
        </button>
      </div>
    </div>
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// Main Component – StaffCampaignPosts
// ─────────────────────────────────────────────────────────────────────────────
const StaffCampaignPosts = ({ user }) => {
  const navigate = useNavigate();

  // ── State ──
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type }

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | title
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitTarget, setSubmitTarget] = useState(null);

  // ── Fetch campaigns ──────────────────────────────────────────────────────────
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      // Nếu staff chỉ xem campaign do mình tạo
      if (user?.id) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      showToast('Không thể tải danh sách chiến dịch: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total   = campaigns.length;
    const drafts  = campaigns.filter(c => c.status === CAMPAIGN_STATUS.DRAFT).length;
    const pending = campaigns.filter(c => c.status === CAMPAIGN_STATUS.PENDING_APPROVAL).length;
    const running = campaigns.filter(c => c.status === CAMPAIGN_STATUS.ACTIVE).length;
    return { total, drafts, pending, running };
  }, [campaigns]);

  // ── Tab counts ───────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const counts = { all: campaigns.length };
    TABS.slice(1).forEach(tab => {
      counts[tab.key] = campaigns.filter(c => c.status === tab.key).length;
    });
    return counts;
  }, [campaigns]);

  // ── Filtered & Sorted & Paginated ────────────────────────────────────────────
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter(c => c.status === activeTab);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'title')  return (a.title || '').localeCompare(b.title || '', 'vi');
      return 0;
    });

    return result;
  }, [campaigns, activeTab, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const paginated = filteredCampaigns.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 when filter/search changes
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery, sortBy]);

  // ── Delete action ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', deleteTarget.id);

    setActionLoading(false);
    setDeleteTarget(null);

    if (error) {
      showToast('Xóa thất bại: ' + error.message, 'error');
    } else {
      showToast('Đã xóa chiến dịch thành công!');
      fetchCampaigns();
    }
  };

  // ── Submit (Gửi duyệt) action ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!submitTarget) return;
    setActionLoading(true);
    const { error } = await supabase
      .from('campaigns')
      .update({ status: CAMPAIGN_STATUS.PENDING_APPROVAL })
      .eq('id', submitTarget.id);

    setActionLoading(false);
    setSubmitTarget(null);

    if (error) {
      showToast('Gửi duyệt thất bại: ' + error.message, 'error');
    } else {
      showToast('Đã gửi chiến dịch để duyệt!');
      fetchCampaigns();
    }
  };

  // ── Duplicate draft ──────────────────────────────────────────────────────────
  const handleDuplicate = async (campaign) => {
    const { id, created_at, ...rest } = campaign; // eslint-disable-line no-unused-vars
    const duplicated = {
      ...rest,
      title: `[Bản sao] ${campaign.title}`,
      status: CAMPAIGN_STATUS.DRAFT,
      approval_status: 'pending',
      raised_amount: 0,
      onchain_campaign_id: null,
      blockchain_tx_hash: null,
      blockchain_minted_at: null,
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      created_by: user?.id || campaign.created_by,
    };
    const { error } = await supabase.from('campaigns').insert([duplicated]);
    if (error) {
      showToast('Nhân bản thất bại: ' + error.message, 'error');
    } else {
      showToast('Đã nhân bản chiến dịch thành bản nháp!');
      fetchCampaigns();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="admin-page fade-in">

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 99999,
            padding: '14px 20px',
            borderRadius: 10,
            background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
            color:      toast.type === 'error' ? '#991b1b' : '#166534',
            border:     `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
            fontWeight: 600,
            fontSize: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            animation: 'slideInItem 0.25s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 380,
          }}
        >
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="admin-header-row mb-32">
        <div>
          <h2 className="mb-8">Quản lý bài viết chiến dịch</h2>
          <p className="text-muted m-0">Soạn thảo, chỉnh sửa và gửi chiến dịch gây quỹ đến Admin để phê duyệt.</p>
        </div>
        <button
          className="btn btn-primary"
          id="btn-create-new-campaign"
          onClick={() => navigate('/admin/create-campaign')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tạo chiến dịch mới
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="scp-stats-row">
        <div className="scp-stat-card">
          <div className="scp-stat-icon blue">📋</div>
          <div>
            <div className="scp-stat-label">Tổng chiến dịch</div>
            <div className="scp-stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="scp-stat-card">
          <div className="scp-stat-icon yellow">📝</div>
          <div>
            <div className="scp-stat-label">Đang soạn nháp</div>
            <div className="scp-stat-value">{stats.drafts}</div>
          </div>
        </div>
        <div className="scp-stat-card">
          <div className="scp-stat-icon red">⏳</div>
          <div>
            <div className="scp-stat-label">Chờ duyệt</div>
            <div className="scp-stat-value">{stats.pending}</div>
          </div>
        </div>
        <div className="scp-stat-card">
          <div className="scp-stat-icon green">🟢</div>
          <div>
            <div className="scp-stat-label">Đang chạy</div>
            <div className="scp-stat-value">{stats.running}</div>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search + Sort ── */}
      <div className="scp-toolbar">
        <div className="scp-search-wrap">
          <svg className="scp-search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            id="scp-search-input"
            className="scp-search-input"
            placeholder="Tìm theo tên chiến dịch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          id="scp-sort-select"
          className="scp-filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Mới nhất trước</option>
          <option value="oldest">Cũ nhất trước</option>
          <option value="title">Tên A → Z</option>
        </select>
      </div>

      {/* ── Tab Filter ── */}
      <div className="scp-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.key}
            role="tab"
            id={`tab-${tab.key}`}
            className={`scp-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="scp-tab-badge">{tabCounts[tab.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="scp-table-wrap">
        <table className="scp-table" role="grid">
          <thead>
            <tr>
              <th>CHIẾN DỊCH</th>
              <th>TIẾN ĐỘ</th>
              <th>THỜI GIAN</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="scp-empty">
                    <div className="scp-empty-icon">
                      {searchQuery ? '🔍' : '📭'}
                    </div>
                    <h3>
                      {searchQuery
                        ? `Không tìm thấy kết quả cho "${searchQuery}"`
                        : 'Chưa có chiến dịch nào'}
                    </h3>
                    <p>
                      {searchQuery
                        ? 'Thử tìm kiếm với từ khóa khác.'
                        : 'Nhấn "Tạo chiến dịch mới" để bắt đầu.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map(campaign => {
                const pct = campaign.goal_amount > 0
                  ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))
                  : 0;
                const canEdit   = [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.REJECTED].includes(campaign.status);
                const canSubmit = campaign.status === CAMPAIGN_STATUS.DRAFT;
                const canDelete = [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.REJECTED].includes(campaign.status);

                return (
                  <tr key={campaign.id}>
                    {/* Campaign title + thumb */}
                    <td>
                      <div className="scp-title-cell">
                        {campaign.cover_image ? (
                          <img
                            className="scp-cover-thumb"
                            src={campaign.cover_image}
                            alt={campaign.title}
                          />
                        ) : (
                          <div className="scp-cover-placeholder">📢</div>
                        )}
                        <div>
                          <div className="scp-title-text">{campaign.title}</div>
                        </div>
                      </div>
                    </td>

                    {/* Goal progress */}
                    <td>
                      <div className="scp-goal-wrap">
                        <div className="scp-goal-numbers">
                          <span className="scp-goal-raised">
                            {formatCurrency(campaign.raised_amount)}
                          </span>
                          <span className="scp-goal-target">
                            {formatCurrency(campaign.goal_amount)}
                          </span>
                        </div>
                        <div className="scp-goal-track">
                          <div className="scp-goal-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 3 }}>
                          {pct}% mục tiêu
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td>
                      <div style={{ fontSize: 13 }}>
                        <div style={{ marginBottom: 4 }}>
                          <span style={{ color: '#a0aec0' }}>Từ: </span>
                          {formatDate(campaign.start_date)}
                        </div>
                        <div>
                          <span style={{ color: '#a0aec0' }}>Đến: </span>
                          {formatDate(campaign.end_date)}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={campaign.status} />
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="scp-action-group">
                        {/* View (any status) */}
                        <button
                          className="scp-icon-btn"
                          title="Xem chi tiết"
                          id={`btn-view-${campaign.id}`}
                          onClick={() => navigate(`/admin/campaign/${campaign.id}`)}
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>

                        {/* Edit (Nháp / Từ chối) */}
                        {canEdit && (
                          <button
                            className="scp-icon-btn"
                            title="Chỉnh sửa"
                            id={`btn-edit-${campaign.id}`}
                            onClick={() => navigate(`/admin/campaign/edit/${campaign.id}`)}
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        )}

                        {/* Submit for review (Nháp only) */}
                        {canSubmit && (
                          <button
                            className="scp-icon-btn success"
                            title="Gửi duyệt"
                            id={`btn-submit-${campaign.id}`}
                            onClick={() => setSubmitTarget(campaign)}
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                          </button>
                        )}

                        {/* Duplicate */}
                        <button
                          className="scp-icon-btn"
                          title="Nhân bản (tạo bản nháp)"
                          id={`btn-duplicate-${campaign.id}`}
                          onClick={() => handleDuplicate(campaign)}
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        </button>

                        {/* Delete (Nháp / Từ chối) */}
                        {canDelete && (
                          <button
                            className="scp-icon-btn danger"
                            title="Xóa chiến dịch"
                            id={`btn-delete-${campaign.id}`}
                            onClick={() => setDeleteTarget(campaign)}
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {!loading && filteredCampaigns.length > PAGE_SIZE && (
          <div className="scp-pagination">
            <span>
              Hiển thị {Math.min(filteredCampaigns.length, (currentPage - 1) * PAGE_SIZE + 1)}–
              {Math.min(filteredCampaigns.length, currentPage * PAGE_SIZE)} trong {filteredCampaigns.length} chiến dịch
            </span>
            <div className="scp-page-btns">
              <button
                className="scp-page-btn"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                aria-label="Trang trước"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '...' ? (
                    <span key={`dots-${i}`} style={{ padding: '0 6px', color: '#a0aec0' }}>…</span>
                  ) : (
                    <button
                      key={item}
                      className={`scp-page-btn ${currentPage === item ? 'active' : ''}`}
                      onClick={() => setCurrentPage(item)}
                    >
                      {item}
                    </button>
                  )
                )
              }

              <button
                className="scp-page-btn"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                aria-label="Trang sau"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {deleteTarget && (
        <DeleteModal
          campaign={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}

      {submitTarget && (
        <SubmitModal
          campaign={submitTarget}
          onConfirm={handleSubmit}
          onCancel={() => setSubmitTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default StaffCampaignPosts;
