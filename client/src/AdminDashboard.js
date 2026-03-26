import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './AdminDashboard.css';

const AdminSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path)) ? 'active' : '';

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <div className="logo-icon bg-primary text-white rounded" style={{padding: 4, display:'inline-block', marginRight: 8, backgroundColor: 'var(--primary)'}}>HT</div>
        <h2>Khu vực Tổ chức</h2>
      </div>
      <nav className="admin-nav">
        <Link to="/admin" className={`admin-nav-item ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}>
          <span className="icon">📊</span> Chiến dịch của bạn
        </Link>
        <Link to="/admin/organizations" className={`admin-nav-item ${isActive('/admin/organizations')}`}>
          <span className="icon">🏢</span> Hồ sơ tổ chức
        </Link>
        <Link to="/admin/campaign-actions" className={`admin-nav-item ${isActive('/admin/campaign-actions')}`}>
          <span className="icon">⚡</span> Quản lý chiến dịch
        </Link>
        <Link to="/admin/finances" className={`admin-nav-item ${isActive('/admin/finances')}`}>
          <span className="icon">💵</span> Nhận tài trợ
        </Link>
      </nav>
      <div className="admin-logout">
        <Link to="/" className="admin-nav-item">
          <span className="icon">🔙</span> Thoát về web chính
        </Link>
      </div>
    </aside>
  );
};

const AdminCampaigns = () => {
  const [campaigns] = useState([
    { id: 1, title: 'Giáo dục cho 500 trẻ mồ côi tại trung tâm...', raised: 2460, target: 5750, status: 'Đang chạy' },
    { id: 2, title: 'Xây dựng 2 lớp học tình thương...', raised: 1450, target: 4200, status: 'Đang chạy' },
    { id: 3, title: 'Hỗ trợ phẫu thuật tim cho 5 em nhỏ...', raised: 5000, target: 5000, status: 'Hoàn thành' },
  ]);

  return (
    <div className="admin-page fade-in">
      <div className="admin-header-row mb-32">
        <div>
           <h2 className="mb-8">Chiến dịch của bạn</h2>
           <p className="text-muted m-0">Danh sách các chiến dịch do đơn vị của bạn tổ chức</p>
        </div>
        <button className="btn btn-primary d-flex align-center gap-8">
           <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
           Tạo chiến dịch mới
        </button>
      </div>
      
      <div className="admin-card">
        <div className="admin-card-header d-flex justify-between align-center mb-24">
           <div className="d-flex gap-16">
              <select className="admin-select">
                 <option>Tất cả trạng thái</option>
                 <option>Đang chạy</option>
                 <option>Hoàn thành</option>
              </select>
           </div>
        </div>
        <div className="table-responsive">
            <table className="admin-table">
            <thead>
                <tr>
                <th>Chiến dịch</th>
                <th>Tiến độ</th>
                <th>Mục tiêu</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {campaigns.map(c => (
                <tr key={c.id}>
                    <td>
                       <div className="fw-600 color-dark">{c.title}</div>
                       <div className="text-muted mt-4" style={{fontSize: 12}}>ID: #{c.id}</div>
                    </td>
                    <td>
                       <div className="fw-600 text-primary">${c.raised}</div>
                       <div className="admin-progress-sm mt-4">
                          <div className="admin-progress-bar" style={{width: `${Math.min(100, (c.raised/c.target)*100)}%`}}></div>
                       </div>
                    </td>
                    <td>${c.target}</td>
                    <td>
                       <span className={`badge ${c.status === 'Hoàn thành' ? 'badge-completed' : c.status === 'Tạm dừng' ? 'badge-paused' : 'badge-success'}`}>
                          {c.status}
                       </span>
                    </td>
                    <td>
                    <div className="action-buttons">
                        <button className="icon-btn tooltip" data-tip="Chỉnh sửa">
                           <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button className="icon-btn update tooltip" data-tip="Cập nhật tiền">
                           <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                        <button className="icon-btn delete tooltip" data-tip="Xóa">
                           <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const OrgProfile = () => (
  <div className="admin-page fade-in">
    <div className="admin-header-row mb-32">
        <div>
           <h2 className="mb-8">Hồ sơ tổ chức</h2>
           <p className="text-muted m-0">Cập nhật và quản lý thông tin của đơn vị thiện nguyện</p>
        </div>
      <button className="btn btn-primary d-flex align-center gap-8">
           Lưu thay đổi
      </button>
    </div>
    
    <div className="admin-card" style={{maxWidth: 700}}>
       <div className="admin-card-header">
          <div className="d-flex align-center gap-24">
             <div className="org-avatar-lg">
                <img src="/assets/Visily-Export-to-Image-Image 111-2026-03-14.png" onError={(e) => {e.target.src="https://via.placeholder.com/100"; e.target.onerror=null;}} alt="Avatar"/>
             </div>
             <div>
                <button className="btn btn-outline mb-8">Thay đổi logo</button>
                <p className="text-muted m-0" style={{fontSize: 13}}>Định dạng JPG, PNG. Tối đa 2MB.</p>
             </div>
          </div>
       </div>
       <div style={{padding: 24}}>
         <form onSubmit={e => e.preventDefault()}>
            <div className="form-group mb-24">
               <label className="admin-label">Tên tổ chức</label>
               <input type="text" className="admin-input" defaultValue="Quỹ Bảo trợ Trẻ em Việt Nam" />
            </div>
            <div className="form-group mb-24">
               <label className="admin-label">Email liên hệ</label>
               <input type="email" className="admin-input" defaultValue="lienhe@nfvc.org.vn" />
            </div>
            <div className="form-group mb-24">
               <label className="admin-label">Số điện thoại / Hotline</label>
               <input type="text" className="admin-input" defaultValue="(024) 3 8439959" />
            </div>
            <div className="form-group mb-24">
               <label className="admin-label">Lời giới thiệu tổ chức</label>
               <textarea className="admin-input" rows="5" defaultValue="Quỹ Bảo trợ trẻ em Việt Nam là tổ chức phi chính phủ, có chức năng vận động sự đóng góp tự nguyện của cơ quan, tổ chức, cá nhân..."></textarea>
            </div>
         </form>
       </div>
    </div>
  </div>
);

const AdminCampaignActions = () => (
  <div className="admin-page fade-in">
    <div className="admin-header-row mb-32">
        <div>
           <h2 className="mb-8">Tác vụ chiến dịch nhanh</h2>
           <p className="text-muted m-0">Các công cụ quản lý cơ bản cho một chiến dịch</p>
        </div>
    </div>
    <div className="admin-actions-grid">
      <div className="action-card">
        <div className="ac-icon primary-light mb-16">➕</div>
        <h3>Thêm thông tin chiến dịch</h3>
        <p>Tạo một chiến dịch từ thiện mới với các thông tin chi tiết, hình ảnh và mục tiêu tài trợ.</p>
        <button className="btn btn-primary mt-24">Thực hiện</button>
      </div>
      <div className="action-card">
        <div className="ac-icon warning-light mb-16">✏️</div>
        <h3>Sửa thông tin chiến dịch</h3>
        <p>Cập nhật mô tả, hình ảnh, tiến trình và mục tiêu của chiến dịch đã có.</p>
        <button className="btn btn-outline mt-24">Thực hiện</button>
      </div>
      <div className="action-card">
        <div className="ac-icon success-light mb-16">💵</div>
        <h3>Cập nhật tiền tài trợ</h3>
        <p>Thêm trực tiếp số tiền đã nhận được từ các nguồn off-line cho các chiến dịch.</p>
        <Link to="/admin/finances" className="btn btn-outline mt-24" style={{textDecoration: 'none'}}>Thực hiện</Link>
      </div>
      <div className="action-card border-danger">
        <div className="ac-icon danger-light mb-16">🗑️</div>
        <h3 className="text-danger">Xóa chiến dịch</h3>
        <p>Xóa bỏ hoàn toàn chiến dịch không còn hoạt động hoặc tạo sai thông tin.</p>
        <button className="btn btn-outline text-danger border-danger mt-24">Xóa ngay</button>
      </div>
    </div>
  </div>
);

const AdminFinances = () => (
   <div className="admin-page fade-in">
      <div className="admin-header-row mb-32">
         <div>
            <h2 className="mb-8">Cập nhật tài trợ</h2>
            <p className="text-muted m-0">Thêm khoản tiền quyên góp hoặc điều chỉnh số dư</p>
         </div>
      </div>
      <div className="admin-card" style={{maxWidth: 600}}>
         <form onSubmit={e => e.preventDefault()}>
            <div className="form-group mb-24">
               <label className="admin-label">Chọn chiến dịch</label>
               <select className="admin-input">
                  <option>Giáo dục cho 500 trẻ mồ côi...</option>
                  <option>Cứu trợ động đất miền Trung</option>
               </select>
            </div>
            <div className="form-group mb-24">
               <label className="admin-label">Số tiền ($)</label>
               <input type="number" className="admin-input" placeholder="Ví dụ: 5000" />
            </div>
            <div className="form-group mb-24">
               <label className="admin-label">Nguồn tiền / Ghi chú</label>
               <textarea className="admin-input" rows="3" placeholder="Ví dụ: Chuyển khoản qua ngân hàng ACB..."></textarea>
            </div>
            <button className="btn btn-success lg w-100">Cập nhật số tiền</button>
         </form>
      </div>
   </div>
);

const AdminDashboard = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-search-wrap">
            <svg className="admin-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" className="admin-search-input" placeholder="Tìm kiếm chiến dịch, tổ chức..." />
          </div>
          <div className="admin-profile">
            <div className="notification-icon mx-16 mr-24">
               <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
               <span className="dot"></span>
            </div>
            <span className="fw-500">Quỹ Bảo trợ Trẻ em</span>
            <div className="avatar">QB</div>
          </div>
        </header>
        <div className="admin-content-area">
          <Routes>
            <Route path="/" element={<AdminCampaigns />} />
            <Route path="/organizations" element={<OrgProfile />} />
            <Route path="/campaign-actions" element={<AdminCampaignActions />} />
            <Route path="/finances" element={<AdminFinances />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
