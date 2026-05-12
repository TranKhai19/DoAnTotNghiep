import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import OnchainHistoryTable from '../components/OnchainHistoryTable';
import VietQRModal from '../components/VietQRModal';
import './ProjectDetail.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const ProjectDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('story');
  const [showQR, setShowQR] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  const thumbs = [
    "/assets/Visily-Export-to-Image-Image 105-2026-03-17.png",
    "/assets/Visily-Export-to-Image-Image 106-2026-03-17.png",
    "/assets/Visily-Export-to-Image-Image 107-2026-03-17.png",
    "/assets/Visily-Export-to-Image-Image 108-2026-03-17.png",
    "/assets/Visily-Export-to-Image-Image 109-2026-03-17.png"
  ];

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/campaigns/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.data && setCampaign(d.data))
      .catch(() => {});
 
    // Fetch reports
    setLoadingReports(true);
    console.log(`🔍 [DEBUG] Fetching reports for campaign_id: ${id}`);
    fetch(`${API_BASE}/api/reports?campaign_id=${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.success) {
          console.log(`✅ [DEBUG] Reports fetched:`, d.data);
          setReports(d.data || []);
        } else {
          console.warn(`⚠️ [DEBUG] Reports fetch failed:`, d?.error);
        }
      })
      .catch(err => console.error(`❌ [DEBUG] Reports fetch error:`, err))
      .finally(() => setLoadingReports(false));
  }, [id]);

  // Lắng nghe event donation:confirmed để cập nhật tiến độ real-time
  useEffect(() => {
    const handler = (e) => {
      const { campaignId, newRaisedAmount } = e.detail;
      if (campaignId === id && newRaisedAmount !== undefined) {
        setCampaign(prev => prev
          ? { ...prev, raised_amount: newRaisedAmount }
          : prev
        );
      }
    };
    window.addEventListener('donation:confirmed', handler);
    return () => window.removeEventListener('donation:confirmed', handler);
  }, [id]);


  // Campaign dữ liệu để hiển thị (nếu chưa load thì dùng placeholder)
  const displayCampaign = campaign || {
    id,
    title: 'Trao quyền cho bé gái: Để tự lập',
    qr_code: `QG${String(id || '000').slice(-6).toUpperCase()}`,
    raised_amount: 82567000,
    goal_amount: 100000000
  };

  const pct = displayCampaign.goal_amount > 0
    ? Math.min(100, Math.round((displayCampaign.raised_amount / displayCampaign.goal_amount) * 100))
    : 82;

  const formatCurrency = (v) => Number(v || 0).toLocaleString('vi-VN') + '₫';

  const tabs = [
    { key: 'story',       label: '📖 Câu chuyện' },
    { key: 'transparency', label: '🔗 Minh bạch on-chain' },
    { key: 'reports',     label: '📋 Báo cáo nghiệm thu' },
    { key: 'comments',    label: '💬 Động viên' }
  ];

  return (
    <div className="project-detail container section-spacing">
      <div className="breadcrumb mb-32"><Link to="/projects">← Quay lại danh sách</Link></div>

      <div className="pd-grid">
        <div className="pd-main">
          <img src="/assets/Visily-Export-to-Image-Image 99-2026-03-17.png" alt="Campaign" className="pd-hero-img" />

          <div className="pd-thumbnails mt-16">
            <button className="thumb-nav left">{"<"}</button>
            {thumbs.map((img, i) => (
              <img key={i} src={img} alt={"Thumb " + i} className={`thumb-img ${i===0?'active':''}`} />
            ))}
            <button className="thumb-nav right">{">"}</button>
          </div>

          {/* ── TAB NAVIGATION ── */}
          <div className="pd-tabs mt-40">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`pd-tab-btn ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB CONTENT ── */}
          {activeTab === 'story' && (
            <div className="pd-info mt-32 fade-in">
              <div className="d-flex align-items-center gap-12 mb-16">
                <h2 style={{fontSize: 28, margin: 0}}>{displayCampaign.title}</h2>
                {displayCampaign.onchain_campaign_id && (
                  <span className="badge badge-blockchain" title="Mã số chiến dịch trên Blockchain">
                    ⛓️ ID #{displayCampaign.onchain_campaign_id}
                  </span>
                )}
              </div>
              <p style={{lineHeight: 1.8, color: 'var(--text-muted)'}}>
                {displayCampaign.description ||
                  'Pariatur commodo non dolor est aliqua irure eiusmod nisi qui officia proident Lorem sit qui sint ullamco Lorem tempor. Ullamco nisi enim ipsum nulla reprehenderit incididunt ad voluptate voluptate. Quis sit enim duis exercitation culpa ex adipisicing occaecat laboris dolore ex minim.'}
              </p>
              <div className="pd-actions d-flex gap-24 mt-40">
                <button className="btn btn-outline lg flex-1 pd-btn-h">Chia sẻ</button>
                <button className="btn btn-primary lg flex-1 pd-btn-h" onClick={() => setShowQR(true)}>
                  💳 Quyên góp ngay!
                </button>
              </div>

               {/* Acceptance Reports Quick Access */}
               {reports.length > 0 && (
                 <div className="reports-highlight mt-40">
                   <div className="highlight-content">
                     <span className="highlight-icon">📋</span>
                     <div className="highlight-text">
                       <h4>Dự án đã có {reports.length} báo cáo nghiệm thu</h4>
                       <p>Xem chi tiết các giai đoạn thực hiện và chứng từ thực địa.</p>
                     </div>
                     <button className="btn btn-success sm" onClick={() => setActiveTab('reports')}>
                       Xem báo cáo
                     </button>
                   </div>
                 </div>
               )}
 
               {/* Proof Documents (IPFS) */}
               {displayCampaign.proof_documents && displayCampaign.proof_documents.length > 0 && (
                 <div className="ipfs-docs mt-40">
                   <h3 style={{fontSize: 18, marginBottom: 16}}>📄 Tài liệu chứng minh (IPFS)</h3>
                   <div className="ipfs-doc-list">
                     {displayCampaign.proof_documents.map((doc, i) => (
                       <a key={i} href={doc.gatewayUrl} target="_blank" rel="noreferrer" className="ipfs-doc-item">
                         <span>🔗</span>
                         <span>{doc.name || `Tài liệu ${i + 1}`}</span>
                       </a>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          )}

           {activeTab === 'transparency' && (
            <div className="pd-transparency mt-32 fade-in">
              <div className="transparency-header">
                <h3>🔗 Lịch sử giao dịch trên Blockchain</h3>
                <p>Mọi khoản quyên góp và giải ngân đều được ghi vĩnh viễn, không thể sửa đổi.</p>
                <div className="d-flex gap-12 mt-16">
                  <a href="/explorer" className="btn btn-outline sm">
                    🔍 Mở Block Explorer
                  </a>
                  {campaign?.status === 'closed' && (
                    <span className="badge approved">🔒 Chiến dịch đã đóng & Nghiệm thu</span>
                  )}
                </div>
              </div>
              <OnchainHistoryTable campaignId={id} />
            </div>
          )}
 
          {activeTab === 'reports' && (
            <div className="pd-reports mt-32 fade-in">
              <div className="section-header-row mb-24">
                <div>
                  <h3 style={{fontSize: 24, margin: 0}}>📋 Báo cáo Nghiệm thu</h3>
                  <p className="text-muted mt-8">Theo dõi các giai đoạn thực hiện và chứng từ nghiệm thu của dự án.</p>
                </div>
              </div>
 
              {loadingReports ? (
                <div className="text-center py-40">⏳ Đang tải dữ liệu nghiệm thu...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-40 bg-light rounded-20">
                  <div style={{fontSize: 40, marginBottom: 16}}>📋</div>
                  <h4>Chưa có báo cáo nghiệm thu</h4>
                  <p className="text-muted">Dự án đang trong quá trình triển khai thực địa.</p>
                </div>
              ) : (
                <div className="public-report-list">
                  {reports.map((rep, idx) => (
                    <div key={rep.id} className="public-report-card">
                      <div className="rep-header">
                        <div className="rep-title-row">
                          <span className="rep-stage-num">Giai đoạn {reports.length - idx}</span>
                          <span className="rep-date">📅 {new Date(rep.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {rep.tx_hash && (
                          <span className="onchain-badge" title="Giai đoạn này đã được băm và ghi lên Blockchain">
                            ⛓️ Blockchain Confirmed
                          </span>
                        )}
                      </div>
                      <div className="rep-body mt-16">
                        <p className="rep-desc">{rep.description}</p>
                        
                        {rep.invoice_documents && rep.invoice_documents.length > 0 && (
                          <div className="rep-assets mt-20">
                            <h5 className="mb-12" style={{fontSize: 14}}>Hóa đơn & Chứng từ:</h5>
                            <div className="rep-asset-grid">
                              {rep.invoice_documents.map((doc, dIdx) => (
                                <a key={dIdx} href={doc.gatewayUrl} target="_blank" rel="noreferrer" className="rep-asset-item">
                                  <div className="asset-preview">🧾</div>
                                  <span className="asset-name">Hóa đơn {dIdx + 1}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {rep.tx_hash && (
                          <div className="rep-proof mt-24">
                            <div className="proof-label">Bằng chứng On-chain (TxHash):</div>
                            <a href={`/explorer?hash=${rep.tx_hash}`} target="_blank" className="proof-hash">
                              {rep.tx_hash}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="pd-comments mt-32 fade-in">
              <h3 className="mb-8" style={{fontSize: 24}}>Lời động viên (27)</h3>
              <p className="text-muted mb-32" style={{fontSize: 14}}>Hãy quyên góp để chia sẻ những lời động viên.</p>
              <div className="comment-list d-flex flex-column gap-16">
                {[
                  {name: 'Nguyễn Thanh Thư', amt: '2.540.000₫', time: '4 ngày', msg: 'Cố lên các em nhé, mọi điều tốt đẹp sẽ đến 😍😍😍'},
                  {name: 'Hà My', amt: '1.270.000₫', time: '7 ngày', msg: 'Chúc dự án thành công tốt đẹp, mong lan tỏa được nhiều yêu thương đến mọi người.'},
                  {name: 'Phạm Hải Yến', amt: '500.000₫', time: '9 ngày', msg: 'Một chút tấm lòng gửi đến các em.'},
                ].map((c, i) => (
                  <div key={i} className="comment-item">
                    <div className="comment-avatar">
                      <img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar" />
                    </div>
                    <div className="comment-body">
                      <div className="c-header d-flex align-center gap-16 mb-8">
                        <strong style={{fontSize: 14}}>{c.name}</strong>
                        <div className="c-meta text-muted" style={{fontSize: 12}}>
                          <span className="c-amount fw-600 mr-8">{c.amt}</span>
                          <span className="c-time">{c.time}</span>
                        </div>
                      </div>
                      <p className="text-muted m-0" style={{fontSize: 13, lineHeight: 1.5}}>{c.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline mt-32 px-32">Xem thêm</button>
            </div>
          )}
        </div>

        <div className="pd-sidebar">
          <div className="donate-card sticky">
            <div className="tags mb-24">
              <span className="tag active" style={{fontSize: 11, padding: '4px 12px'}}>Giáo dục</span>
              <span className="tag" style={{fontSize: 11, padding: '4px 12px'}}>Việt Nam</span>
            </div>
            <h3 className="mb-24" style={{fontSize: 22, fontWeight: 500}}>{displayCampaign.title}</h3>
            <div className="d-stats d-flex align-baseline gap-8 mt-24">
              <h2 style={{fontSize: 36, margin: 0}}>{formatCurrency(displayCampaign.raised_amount)}</h2>
              <span className="text-muted" style={{fontSize: 12, fontWeight: 500}}>
                đã nhận trên mục tiêu {formatCurrency(displayCampaign.goal_amount)}
              </span>
            </div>
            <div className="p-card-progress mt-16 mb-8">
              <div className="p-progress" style={{ width: `${pct}%`, backgroundColor: '#00e5c9' }} />
            </div>
            <p className="text-muted mt-8 mb-32" style={{fontSize: 13}}>{pct}% mục tiêu</p>

            <div className="pd-actions d-flex gap-16 mb-32">
              <button className="btn btn-outline flex-1 pd-btn-h">Chia sẻ</button>
              <button className="btn btn-primary flex-1 pd-btn-h" onClick={() => setShowQR(true)}>
                💳 Quyên góp
              </button>
            </div>

            {/* Mã QR Code */}
            <div className="qr-preview-box" onClick={() => setShowQR(true)}>
              <div className="qr-preview-icon">📱</div>
              <div>
                <div className="qr-preview-title">Quét mã để quyên góp</div>
                <div className="qr-preview-sub">Mã: {displayCampaign.qr_code}</div>
              </div>
            </div>

            <div className="recent-donations d-flex flex-column gap-24 mt-24">
              {[
                {name: 'Quốc Tuấn', amt: '508.000₫', time: '4 ngày'},
                {name: 'Minh Trang', amt: '254.000₫', time: '4 ngày'},
                {name: 'Đức Nguyễn', amt: '1.270.000₫', time: '4 ngày'},
                {name: 'Lan Hương', amt: '2.540.000₫', time: '4 ngày'}
              ].map((d, i) => (
                <div key={i} className="r-donation-item d-flex align-center gap-16">
                  <div className="r-avatar"><img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar"/></div>
                  <div className="r-info flex-1">
                    <strong style={{fontSize: 13}}>{d.name}</strong><br/>
                    <span style={{fontSize: 13, fontWeight: 600}}>{d.amt}</span>
                  </div>
                  <span className="r-time text-muted" style={{fontSize: 12}}>{d.time}</span>
                </div>
              ))}
            </div>

            <div className="d-card-footer d-flex gap-16 mt-32">
              <button className="btn btn-outline flex-1">Xem tất cả</button>
              <button
                className="btn btn-outline flex-1 d-flex align-center gap-8 justify-center"
                onClick={() => setActiveTab('transparency')}
              >
                🔗 Xem on-chain
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="related-projects mt-80 pt-40" style={{borderTop: '2px solid var(--primary)'}}>
        <div className="section-header-row mb-32 mt-40">
          <h2 className="section-title text-left m-0" style={{fontSize: 28}}>Dự án liên quan</h2>
          <a href="#more" className="view-more">Xem thêm</a>
        </div>
        <div className="p-grid-3">
          <ProjectCard id={2} image="/assets/Visily-Export-to-Image-Image 138-2026-03-14.png" category="Giáo dục" location="Sierra Leone" title="Giáo dục những nhà lãnh đạo tương lai của Sierra Leone" desc="Id quis ex tempor veniam laborum minim ea officia duis cillum elit." raised="52,210" target="115,000" percent={45} />
          <ProjectCard id={3} image="/assets/Visily-Export-to-Image-Image 140-2026-03-14.png" category="Giáo dục" location="Thailand" title="Ngăn chặn nạn buôn bán trẻ em thông qua giáo dục" desc="Culpa irure pariatur id enim in eiusmod irure aute aliquip." raised="15,445" target="500,000" percent={3} />
          <ProjectCard id={4} image="/assets/Visily-Export-to-Image-Image 141-2026-03-14.png" category="Giáo dục" location="Peru" title="Bảo vệ 300 bé gái khỏi lao động giúp việc nhà ở Peru" desc="Cillum voluptate est ea cupidatat dolore voluptate." raised="52,567" target="145,000" percent={36} />
        </div>
      </div>

      {/* VietQR Modal */}
      <VietQRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        campaign={displayCampaign}
      />
    </div>
  );
};

export default ProjectDetail;
