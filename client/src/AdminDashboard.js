import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './AdminDashboard.css';
import StaffCampaignPosts from './pages/admin/StaffCampaignPosts';
import DisbursementPage from './pages/admin/DisbursementPage';
import ReportPage from './pages/admin/ReportPage';
import BeneficiaryForm from './components/BeneficiaryForm';
import { z } from 'zod';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const getAuthHeader = () => {
  let token = localStorage.getItem('access_token');
  if (!token) {
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


// Zod Schema for Create Campaign
export const campaignSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề quá dài'),
  description: z.string().min(20, 'Mô tả cần ít nhất 20 ký tự để chi tiết hơn'),
  goal_amount: z.number().min(100, 'Mục tiêu tối thiểu là $100'),
  qr_code: z.string().url('Link URL không hợp lệ').optional().or(z.literal('')),
  category_id: z.number().int({ message: 'Vui lòng chọn danh mục' }).min(1, 'Vui lòng chọn danh mục'),
  start_date: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  end_date: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["end_date"]
});


const AdminSidebar = ({ role }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path)) ? 'active' : '';

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <div className="logo-icon">HT</div>
        <h2>{role === 'admin' ? 'Admin Portal' : 'Staff Dashboard'}</h2>
      </div>
      <nav className="admin-nav">
        <Link to="/admin" className={`admin-nav-item ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}>
          <span className="icon">📊</span> Tổng quan
        </Link>
        {/* Admin chung */}
        <Link to="/admin/disbursements" className={`admin-nav-item ${isActive('/admin/disbursements')}`}>
          <span className="icon">💸</span> Giải ngân
        </Link>
        <Link to="/admin/reports" className={`admin-nav-item ${isActive('/admin/reports')}`}>
          <span className="icon">📋</span> Báo cáo nghiệm thu
        </Link>
        <Link to="/explorer" target="_blank" className="admin-nav-item">
          <span className="icon">🔍</span> Block Explorer
        </Link>
        {role === 'admin' && (
          <>
            <Link to="/admin/organizations" className={`admin-nav-item ${isActive('/admin/organizations')}`}>
              <span className="icon">🏢</span> Hồ sơ tổ chức
            </Link>
            <Link to="/admin/create-campaign" className={`admin-nav-item ${isActive('/admin/create-campaign')}`}>
              <span className="icon">⚡</span> Tạo chiến dịch
            </Link>
            <Link to="/admin/personnel" className={`admin-nav-item ${isActive('/admin/personnel')}`}>
              <span className="icon">👥</span> Quản lý nhân sự
            </Link>
          </>
        )}
        {role === 'staff' && (
          <>
            <Link to="/admin/campaign-posts" className={`admin-nav-item ${isActive('/admin/campaign-posts')}`}>
              <span className="icon">📝</span> Chiến dịch của tôi
            </Link>
          </>
        )}
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
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title, raised_amount, goal_amount, status, onchain_campaign_id')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching admin campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const handleBlockchainUpdate = (e) => {
      const { type, data } = e.detail;
      
      if (type === 'recordDonation') {
        const donationAmount = parseFloat(data.amount) || 0;
        setCampaigns(prev => prev.map(c => {
          if (c.id.toString() === data.campaignId?.toString() || (c.onchain_campaign_id && c.onchain_campaign_id.toString() === data.campaignId?.toString())) {
            return { ...c, raised_amount: (c.raised_amount || 0) + donationAmount };
          }
          return c;
        }));
      } else if (type === 'createCampaign' || type === 'closeCampaign') {
        fetchCampaigns(); // Refresh list on major state changes
      }
    };

    window.addEventListener('blockchain:update', handleBlockchainUpdate);
    return () => window.removeEventListener('blockchain:update', handleBlockchainUpdate);
  }, []);

  if (loading) return <div className="admin-page fade-in">Đang tải danh sách chiến dịch...</div>;

  return (
    <div className="admin-page fade-in">
      <div className="admin-header-row mb-32">
        <div>
           <h2 className="mb-8">Chiến dịch chính (Tổng quan)</h2>
           <p className="text-muted m-0">Danh sách các hoạt động nổi bật, chọn chiến dịch để xem chi tiết.</p>
        </div>
      </div>
      
      <div className="admin-card">
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
                {campaigns.length > 0 ? campaigns.map(c => (
                <tr key={c.id}>
                    <td>
                       <div className="fw-600 color-dark">{c.title}</div>
                       <div className="text-muted" style={{fontSize: 11}}>#{c.id.slice(0, 8)}</div>
                    </td>
                    <td>
                       <div className="fw-600 text-success">{parseInt(c.raised_amount || 0).toLocaleString()}đ</div>
                       <div className="admin-progress-sm mt-4">
                          <div className="admin-progress-bar" style={{width: `${Math.min(100, ((c.raised_amount || 0)/(c.goal_amount || 1))*100)}%`}}></div>
                       </div>
                    </td>
                    <td className="fw-500">{parseInt(c.goal_amount || 0).toLocaleString()}đ</td>
                    <td>
                       <span className={`badge ${c.status === 'Hoàn thành' || c.status === 'completed' ? 'badge-completed' : 'badge-success'}`}>
                          {c.status}
                       </span>
                    </td>
                    <td>
                       <button onClick={() => navigate(`/admin/campaign/${c.id}`)} className="btn btn-outline" style={{padding: '6px 16px', fontSize: 13}}>Chi tiết</button>
                    </td>
                </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-40 text-muted">Chưa có chiến dịch nào được tạo.</td>
                  </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const CampaignDetails = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/campaigns/${id}`, {
          headers: { ...getAuthHeader() }
        });
        const data = await res.json();
        if (data.success) {
          setCampaign(data.data);
        }
      } catch (err) {
        console.error('Error fetching campaign details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleAddBeneficiarySuccess = () => {
    // Tải lại danh sách người thụ hưởng hoặc cập nhật UI
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-header-row mb-32">
        <div>
           <Link to="/admin" className="text-muted d-block mb-8" style={{textDecoration: 'none'}}>← Trở về Chiến dịch chính</Link>
           <h2 className="mb-0">Hồ sơ chiến dịch #{id}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Detail section */}
        <div className="admin-card" style={{padding: 24, alignSelf: 'start'}}>
           <h3 className="mb-16" style={{color: 'var(--primary)'}}>Chi tiết chiến dịch</h3>
           <div className="mb-16"><strong className="text-muted">Tên chiến dịch:</strong> <div className="fw-600 mt-4">{campaign?.title}</div></div>
           <div className="mb-16"><strong className="text-muted">Mục tiêu quyên góp:</strong> <div className="mt-4">${(campaign?.goal_amount || 0).toLocaleString()}</div></div>
           <div className="mb-16"><strong className="text-muted">Đã quyên góp:</strong> <div className="mt-4 text-success fw-600">${(campaign?.raised_amount || 0).toLocaleString()}</div></div>
           <button className="btn btn-outline w-100 mt-8">Chỉnh sửa thông tin chiến dịch</button>
        </div>

        {/* Beneficiary segment */}
        <div className="admin-card" style={{padding: 24}}>
           <h3 className="mb-8" style={{color: 'var(--primary)'}}>Danh sách người thụ hưởng</h3>
           <p className="text-muted mb-24" style={{fontSize: 14}}>Quản lý các cá nhân, tổ chức hoặc địa phương nhận giải ngân từ chiến dịch này.</p>
           
           <BeneficiaryForm campaignId={id} onAddSuccess={handleAddBeneficiarySuccess} />
           
           <div className="text-center text-muted py-32" style={{border: '1px dashed #ccc', borderRadius: 8}}>
              Chưa có danh sách người thụ hưởng nào được liên kết.
           </div>
        </div>
      </div>
    </div>
  )
}

const OrgProfile = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '', website: '', avatar_url: '' });

  useEffect(() => {
    async function fetchOrgInfo() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setFormData({ 
          full_name: data.full_name || '', 
          phone: data.phone || '',
          email: data.email || user.email || '', 
          website: data.website || '',
          avatar_url: data.avatar_url || ''
        });
      }
      setFetching(false);
    }
    fetchOrgInfo();
  }, [user]);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `org_${user.id}_${Date.now()}.${fileExt}`;
    
    // Tải lên bucket có tên là 'avatars' trên Supabase
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
    if (uploadError) {
      alert('Lỗi tải ảnh lên: ' + uploadError.message + '\nKiểm tra lại xem bạn đã tạo bucket "avatars" public trên Supabase chưa nhé!');
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    setFormData({...formData, avatar_url: data.publicUrl});
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      full_name: formData.full_name,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      avatar_url: formData.avatar_url
    }).eq('id', user.id);
    setLoading(false);
    if (!error) alert('Cập nhật Hồ sơ tổ chức thành công!');
    else alert('Lỗi: ' + error.message + '\n(Hãy đảm bảo bạn đã tạo thêm cột email, website, avatar_url trong bảng profiles)');
  };

  if (fetching) return <div className="admin-page fade-in" style={{padding: 24}}>Đang tải dữ liệu hồ sơ...</div>;

  return (
    <div className="admin-page fade-in">
      <div className="admin-header-row mb-32">
          <div>
             <h2 className="mb-8">Hồ sơ tổ chức</h2>
             <p className="text-muted m-0">Định danh và thông tin liên lạc của tổ chức trên hệ thống</p>
          </div>
      </div>
      <div className="admin-card" style={{maxWidth: 600}}>
         <div style={{padding: 24}}>
           <form onSubmit={handleSave}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                 <div style={{width: 100, height: 100, borderRadius: '50%', backgroundColor: '#f0f0f0', overflow: 'hidden', border: '1px solid #ddd'}}>
                    {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 12, color: '#999'}}>Chưa có ảnh</div>
                    )}
                 </div>
                 <div>
                    <label className="btn btn-outline mb-8" style={{cursor: 'pointer', display: 'inline-block'}}>
                       {uploading ? 'Đang tải...' : 'Tải ảnh lên (Upload)'}
                       <input type="file" accept="image/*" onChange={handleUpload} style={{display: 'none'}} disabled={uploading} />
                    </label>
                    <p className="text-muted m-0" style={{fontSize: 13}}>Định dạng JPG, PNG. Dưới 2MB.</p>
                 </div>
              </div>

              <div className="form-group mb-24">
                 <label className="admin-label">Tên tổ chức <span className="text-danger">*</span></label>
                 <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="admin-input" required />
              </div>
              <div className="form-group mb-24">
                 <label className="admin-label">Email liên hệ <span className="text-danger">*</span></label>
                 <input type="email" name="email" value={formData.email} onChange={handleChange} className="admin-input" required />
              </div>
              <div className="form-group mb-24">
                 <label className="admin-label">Số điện thoại <span className="text-danger">*</span></label>
                 <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="admin-input" required />
              </div>
              <div className="form-group mb-32">
                 <label className="admin-label">Địa chỉ Website <span className="text-muted fw-400">- Tùy chọn</span></label>
                 <input type="url" name="website" value={formData.website} onChange={handleChange} className="admin-input" placeholder="https://..." />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading || uploading}>
                 {loading ? 'Đang lưu...' : 'Lưu Hồ sơ Tổ chức'}
              </button>
           </form>
         </div>
      </div>
    </div>
  );
};

const CreateCampaign = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.target);
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      goal_amount: parseFloat(formData.get('goal_amount')) || 0,
      qr_code: formData.get('qr_code') || '',
      category_id: parseInt(formData.get('category_id')) || 0,
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
    };

    try {
      campaignSchema.parse(rawData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = {};
        err.issues.forEach(errItem => {
          newErrors[errItem.path[0]] = errItem.message;
        });
        setErrors(newErrors);
        return;
      }
    }

    setLoading(true);

    const campaignToCreate = {
      ...rawData,
      raised_amount: 0,
      qr_code: rawData.qr_code || null,
      beneficiary_id: formData.get('beneficiary_id') || null,
      status: 'active',
      created_by: user?.id
    };

    try {
      const res = await fetch(`${API_BASE}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(campaignToCreate)
      });
      
      const result = await res.json();
      
      setLoading(false);
      if (result.success) {
        alert("Tạo chiến dịch thành công!");
        navigate('/admin');
      } else {
        alert("Lỗi khi tạo chiến dịch: " + result.error);
      }
    } catch (err) {
      setLoading(false);
      console.error('Error creating campaign:', err);
      alert("Lỗi kết nối Server khi tạo chiến dịch");
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-header-row mb-32">
          <div>
             <h2 className="mb-8">Tạo chiến dịch mới</h2>
             <p className="text-muted m-0">Thiết lập hồ sơ chiến dịch gây quỹ gồm thông tin tổng quan, thời gian và mục tiêu.</p>
          </div>
      </div>
      <div className="admin-card" style={{ maxWidth: 850 }}>
         <form onSubmit={handleCreate} noValidate>
            <div className="admin-card-section">
               <h3 className="section-title">Thông tin cơ bản</h3>
               <div className="form-group mb-24">
                  <label className="admin-label">Tiêu đề chiến dịch <span className="text-danger">*</span></label>
                  <input type="text" name="title" className={`admin-input ${errors.title ? 'is-invalid' : ''}`} placeholder="Ví dụ: Cứu trợ đồng bào lũ lụt miền Bắc" />
                  {errors.title && <div className="error-text">{errors.title}</div>}
               </div>
               <div className="form-group mb-24">
                  <label className="admin-label">Mô tả giới thiệu <span className="text-danger">*</span></label>
                  <textarea name="description" className={`admin-input ${errors.description ? 'is-invalid' : ''}`} rows="5" placeholder="Chia sẻ chi tiết, mạch lạc về hoàn cảnh và mục đích của chiến dịch..."></textarea>
                  {errors.description && <div className="error-text">{errors.description}</div>}
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                 <div className="form-group">
                    <label className="admin-label">Mục tiêu tài trợ (Goal Amount) <span className="text-danger">*</span></label>
                    <div style={{position: 'relative'}}>
                       <input type="number" name="goal_amount" className="admin-input" style={{paddingLeft: 40, borderColor: errors.goal_amount ? 'red' : ''}} placeholder="5000000" min="1" />
                       <span style={{position: 'absolute', left: 14, top: 12, fontWeight: 600, color: '#666'}}>$</span>
                    </div>
                    {errors.goal_amount && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.goal_amount}</div>}
                 </div>
                 <div className="form-group">
                    <label className="admin-label">Danh mục (Category_ID) <span className="text-danger">*</span></label>
                    <select name="category_id" className="admin-select" style={{ borderColor: errors.category_id ? 'red' : '' }}>
                       <option value="">-- Chọn lĩnh vực --</option>
                       <option value="1">Trẻ em (1)</option>
                       <option value="2">Y tế (2)</option>
                       <option value="3">Thiên tai (3)</option>
                    </select>
                    {errors.category_id && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.category_id}</div>}
                 </div>
               </div>
            </div>

            <div style={{ padding: 24, borderBottom: '1px solid #eaeaea' }}>
               <h3 style={{ fontSize: 16, marginBottom: 24, color: 'var(--primary)' }}>Kết nối & Thời gian</h3>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                 <div className="form-group">
                    <label className="admin-label">Mã QR Code nhận tiền (Link/URL)</label>
                    <input type="url" name="qr_code" className="admin-input" placeholder="https://domain.com/qrcode.png" style={{ borderColor: errors.qr_code ? 'red' : '' }} />
                    {errors.qr_code && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.qr_code}</div>}
                 </div>
                 <div className="form-group">
                    <label className="admin-label">ID Người thụ hưởng (Beneficiary ID)</label>
                    <input type="text" name="beneficiary_id" className="admin-input" placeholder="Mặc định: ID Tổ chức của bạn" />
                 </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '8px' }}>
                 <div className="form-group">
                    <label className="admin-label">Ngày bắt đầu (Start Date) <span className="text-danger">*</span></label>
                    <input type="date" name="start_date" className="admin-input" style={{ borderColor: errors.start_date ? 'red' : '' }} />
                    {errors.start_date && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.start_date}</div>}
                 </div>
                 <div className="form-group">
                    <label className="admin-label">Ngày kết thúc (End Date) <span className="text-danger">*</span></label>
                    <input type="date" name="end_date" className="admin-input" style={{ borderColor: errors.end_date ? 'red' : '' }} />
                    {errors.end_date && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.end_date}</div>}
                 </div>
               </div>
            </div>

            <div style={{ padding: '24px', backgroundColor: '#faf9ff', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }} className="d-flex justify-end gap-16">
               <button type="button" className="btn btn-outline px-32" onClick={() => navigate('/admin')}>Hủy</button>
               <button type="submit" className="btn btn-primary px-32" disabled={loading}>
                 {loading ? 'Hệ thống đang xử lý...' : 'Đăng tải chiến dịch'}
               </button>
            </div>
         </form>
      </div>
    </div>
  )
};

const PersonnelManagement = () => {
  const [loading, setLoading] = useState(false);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');
    const phone = formData.get('phone');

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("Lỗi tạo tài khoản: " + error.message);
    } else {
      if (data.user) {
         await supabase.from('profiles').insert([{
           id: data.user.id,
           full_name: fullName,
           phone: phone,
           role: 'staff'
         }]);
         alert('Thêm nhân viên thành công! Note: Phiên Admin của bạn đã bị ghi đè, vui lòng Đăng nhập lại với tư cách Admin.');
         window.location.href = '/login';
      }
    }
    setLoading(false);
  };

  return (
    <div className="admin-page fade-in">
      <div className="admin-header-row mb-32">
          <div>
             <h2 className="mb-8">Quản lý nhân sự</h2>
             <p className="text-muted m-0">Tạo tài khoản dành cho nhân viên (Staff) để quản lý phụ.</p>
          </div>
      </div>
      <div className="admin-card" style={{maxWidth: 600, padding: 24}}>
         <form onSubmit={handleAddStaff}>
            <div className="form-group mb-24">
               <label className="admin-label">Họ tên nhân viên</label>
               <input type="text" name="fullName" className="admin-input" required />
            </div>
            <div className="form-group mb-24">
               <label className="admin-label">Email</label>
               <input type="email" name="email" className="admin-input" required />
            </div>
            <div className="form-group mb-24">
               <label className="admin-label">Số điện thoại</label>
               <input type="text" name="phone" className="admin-input" required />
            </div>
            <div className="form-group mb-32">
               <label className="admin-label">Mật khẩu cấp tạm</label>
               <input type="password" name="password" className="admin-input" required />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>
               {loading ? 'Đang thêm...' : 'Thêm nhân viên'}
            </button>
         </form>
      </div>
    </div>
  )
};

// StaffCampaignPosts, DisbursementPage, ReportPage are now imported from ./pages/admin/


const AdminDashboard = () => {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data) setRole(data.role);
      } else {
        window.location.href = '/login';
      }
    }
    checkUser();
  }, []);

  if (!role) return <div style={{padding: 40}}>Đang xác thực thông tin...</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar role={role} />
      <div className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-search-wrap">
            <svg className="admin-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" className="admin-search-input" placeholder="Search campaigns, reports, or tx hash..." />
          </div>
          <div className="admin-profile">
            <div className="role-badge">{role}</div>
            <div className="avatar">{user?.email?.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <div className="admin-content-area">
          <Routes>
            <Route path="/" element={<AdminCampaigns />} />
            <Route path="/campaign/:id" element={<CampaignDetails />} />
            
            {/* Admin Routes */}
            {role === 'admin' && (
              <>
                <Route path="/organizations" element={<OrgProfile user={user} />} />
                <Route path="/create-campaign" element={<CreateCampaign user={user} />} />
                <Route path="/personnel" element={<PersonnelManagement />} />
              </>
            )}

            {/* Staff Routes */}
             {/* Shared Routes */}
             <Route path="/disbursements" element={<DisbursementPage user={user} role={role} />} />
             <Route path="/reports" element={<ReportPage user={user} role={role} />} />

             {/* Staff Specific */}
             {role === 'staff' && (
               <Route path="/campaign-posts" element={<StaffCampaignPosts user={user} />} />
             )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
