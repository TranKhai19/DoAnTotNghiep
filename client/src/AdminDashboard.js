import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './AdminDashboard.css';
import StaffCampaignPosts from './pages/admin/StaffCampaignPosts';
import BeneficiaryForm from './components/BeneficiaryForm';
import { z } from 'zod';

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
        <div className="logo-icon bg-primary text-white rounded" style={{padding: 4, display:'inline-block', marginRight: 8, backgroundColor: 'var(--primary)'}}>HT</div>
        <h2>Khu vực {role === 'admin' ? 'Tổ chức' : 'Nhân viên'}</h2>
      </div>
      <nav className="admin-nav">
        <Link to="/admin" className={`admin-nav-item ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}>
          <span className="icon">📊</span> Tổng quan
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
            <Link to="/admin/reports" className={`admin-nav-item ${isActive('/admin/reports')}`}>
              <span className="icon">📉</span> Báo cáo
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
  const [campaigns, setCampaigns] = useState([
    { id: '1', title: 'Giáo dục cho 500 trẻ mồ côi tại trung tâm...', raised: 2460, target: 5750, status: 'Đang chạy' },
    { id: '2', title: 'Xây dựng 2 lớp học tình thương...', raised: 1450, target: 4200, status: 'Hoàn thành' },
  ]);

  useEffect(() => {
    const handleBlockchainUpdate = (e) => {
      const { type, data } = e.detail;
      
      if (type === 'recordDonation') {
        const donationAmount = parseFloat(data.amount) || 0;
        setCampaigns(prev => prev.map(c => {
          if (c.id.toString() === data.campaignId?.toString()) {
            return { ...c, raised: c.raised + donationAmount };
          }
          return c;
        }));
      } else if (type === 'createCampaign') {
        setCampaigns(prev => [
          {
            id: Date.now().toString(), // temporary ID
            title: 'Chiến dịch mới (Ghi nhận từ Onchain)',
            raised: 0,
            target: parseFloat(data.targetAmount) || 0,
            status: 'Đang chạy',
          },
          ...prev
        ]);
      } else if (type === 'closeCampaign') {
        setCampaigns(prev => prev.map(c => {
          if (c.id.toString() === data.campaignId?.toString()) {
            return { ...c, status: 'Hoàn thành' };
          }
          return c;
        }));
      }
    };

    window.addEventListener('blockchain:update', handleBlockchainUpdate);
    return () => window.removeEventListener('blockchain:update', handleBlockchainUpdate);
  }, []);

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
                {campaigns.map(c => (
                <tr key={c.id}>
                    <td>
                       <div className="fw-600 color-dark">{c.title}</div>
                    </td>
                    <td>
                       <div className="fw-600 text-primary">${c.raised}</div>
                       <div className="admin-progress-sm mt-4">
                          <div className="admin-progress-bar" style={{width: `${Math.min(100, (c.raised/c.target)*100)}%`}}></div>
                       </div>
                    </td>
                    <td>${c.target}</td>
                    <td>
                       <span className={`badge ${c.status === 'Hoàn thành' ? 'badge-completed' : 'badge-success'}`}>
                          {c.status}
                       </span>
                    </td>
                    <td>
                       <button onClick={() => navigate(`/admin/campaign/${c.id}`)} className="btn btn-outline" style={{padding: '4px 12px', fontSize: 13}}>Hồ sơ & Thụ hưởng</button>
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

const CampaignDetails = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dữ liệu mẫu (Tương lai bạn có thể query từ bảng campaigns)
    setCampaign({ id, title: `Chiến dịch demo #${id}`, target: 5000, raised: 100 });
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
           <div className="mb-16"><strong className="text-muted">Mục tiêu quyên góp:</strong> <div className="mt-4">${campaign?.target}</div></div>
           <div className="mb-16"><strong className="text-muted">Đã quyên góp:</strong> <div className="mt-4 text-success fw-600">${campaign?.raised}</div></div>
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

    const newCampaign = {
      ...rawData,
      raised_amount: 0,
      qr_code: rawData.qr_code || null,
      beneficiary_id: formData.get('beneficiary_id') || null,
      status: 'active',
      created_by: user?.id
    };

    const { error } = await supabase.from('campaigns').insert([newCampaign]);

    setLoading(false);
    if (error) {
      alert("Lỗi khi tạo chiến dịch: " + error.message);
    } else {
      alert("Tạo chiến dịch thành công!");
      navigate('/admin');
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
            <div style={{ padding: 24, borderBottom: '1px solid #eaeaea' }}>
               <h3 style={{ fontSize: 16, marginBottom: 24, color: 'var(--primary)' }}>Thông tin cơ bản</h3>
               <div className="form-group mb-24">
                  <label className="admin-label">Tiêu đề chiến dịch (Title) <span className="text-danger">*</span></label>
                  <input type="text" name="title" className="admin-input" placeholder="Ví dụ: Cứu trợ đồng bào lũ lụt miền Bắc" style={{ borderColor: errors.title ? 'red' : '' }} />
                  {errors.title && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.title}</div>}
               </div>
               <div className="form-group mb-24">
                  <label className="admin-label">Mô tả giới thiệu (Description) <span className="text-danger">*</span></label>
                  <textarea name="description" className="admin-input" rows="5" placeholder="Chia sẻ chi tiết, mạch lạc về hoàn cảnh và mục đích của chiến dịch..." style={{ borderColor: errors.description ? 'red' : '' }}></textarea>
                  {errors.description && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.description}</div>}
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

// StaffCampaignPosts is now imported from ./pages/admin/StaffCampaignPosts

const StaffReports = () => (
  <div className="admin-page fade-in">
     <h2 className="mb-8">Xuất báo cáo</h2>
     <p className="text-muted">Tính năng dành riêng cho Staff đang được phát triển...</p>
  </div>
);

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
            <svg className="admin-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" className="admin-search-input" placeholder="Tìm kiếm chiến dịch, tổ chức..." />
          </div>
          <div className="admin-profile">
            <span className="fw-500 uppercase">{role}</span>
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
            {role === 'staff' && (
              <>
                <Route path="/campaign-posts" element={<StaffCampaignPosts user={user} />} />
                <Route path="/reports" element={<StaffReports />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
