import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import MediaUploader from './MediaUploader';
import PDFViewer from './PDFViewer';
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

// Zod Schema for validation
const beneficiarySchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên quá dài'),
  identifier: z.string().min(9, 'Mã định danh/CCCD phải từ 9 đến 12 ký tự').max(12, 'Mã định danh/CCCD tối đa 12 ký tự').regex(/^[a-zA-Z0-9]+$/, 'Mã định danh chỉ gồm chữ và số'),
  phone: z.string().regex(/^(0|\+84)[0-9]{8,10}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  address: z.string().min(5, 'Địa chỉ quá ngắn, cần ghi tiết hơn'),
});

const BeneficiaryForm = ({ campaignId, onAddSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    full_name: '',
    identifier: '',
    phone: '',
    address: '',
    amount: '',
  });
  const [documentUrl, setDocumentUrl] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Dọn lỗi khi người dùng bắt đầu type lại
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleDocumentUpload = (url) => {
    setDocumentUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate logic với Zod
      beneficiarySchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = {};
        err.errors.forEach(error => {
            newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
        return;
      }
    }

    if (!documentUrl) {
      alert('Vui lòng tải lên tài liệu hồ sơ thụ hưởng.');
      return;
    }

    setLoading(true);

    const payload = {
      full_name: formData.full_name,
      identifier: formData.identifier,
      phone: formData.phone,
      address: formData.address,
      amount: Number(formData.amount) || 0,
      campaign_id: campaignId,
    };

    const { data: recipient, error: benError } = await supabase
      .from('campaign_recipients')
      .insert([payload])
      .select()
      .single();
    
    if (benError) {
      alert('Lỗi khi thêm người thụ hưởng: ' + benError.message);
      setLoading(false);
      return;
    }
    
    setLoading(false);
    alert('Đã thêm hồ sơ người thụ hưởng thành công!');
    setFormData({ full_name: '', identifier: '', phone: '', address: '', amount: '' });
    setDocumentUrl('');
    
    if (onAddSuccess) {
        onAddSuccess(recipient);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      // Hàm helper để parse 1 dòng CSV (handle quoted commas)
      const parseCSVLine = (line) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim().replace(/^"|"$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim().replace(/^"|"$/g, ''));
        return result;
      };

      const rows = lines.map(parseCSVLine);
      
      // Bỏ qua header nếu có
      const dataRows = rows[0][0].toLowerCase().includes('name') || rows[0][0].toLowerCase().includes('họ') ? rows.slice(1) : rows;
      
      const recipients = dataRows
        .filter(row => row.length >= 3 && row[0])
        .map(row => ({
          full_name: row[0],
          identifier: row[1] || '',
          phone: row[2] || '',
          address: row[3] || '',
          amount: Number(row[4]) || 0,
          campaign_id: campaignId
        }));

      if (recipients.length === 0) {
        alert('Không tìm thấy dữ liệu hợp lệ trong file CSV. Định dạng yêu cầu: Họ tên, CCCD, SĐT, Địa chỉ');
        return;
      }

      setLoading(true);
      
      // Sử dụng API backend để bulk insert (đã viết ở Controller)
      try {
        const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/recipients/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify(recipients)
        });
        
        const result = await res.json();
        
        if (result.success) {
          alert(result.message || `Đã tải lên thành công ${recipients.length} người thụ hưởng!`);
          if (onAddSuccess) {
            onAddSuccess();
          }
        } else {
          alert('Lỗi khi upload hàng loạt: ' + result.error);
        }
      } catch (err) {
        console.error('Error bulk uploading:', err);
        alert('Lỗi kết nối khi upload hàng loạt');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ backgroundColor: '#faf9ff', padding: 20, borderRadius: 8, border: '1px solid #eaeaea', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ fontSize: 15, color: 'var(--primary)', margin: 0 }}>+ Quản lý Hồ sơ Người Thụ Hưởng</h4>
        <div style={{ display: 'flex', gap: 10 }}>
          <label className="btn btn-outline sm" style={{ cursor: 'pointer', margin: 0 }}>
            📁 Tải lên CSV hàng loạt
            <input type="file" accept=".csv" onChange={handleBulkUpload} style={{ display: 'none' }} disabled={loading} />
          </label>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>
        Nhập thủ công bên dưới hoặc sử dụng file CSV (định dạng: Họ tên, CCCD, Số điện thoại, Địa chỉ)
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
        {/* ... existing form fields ... */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
                <label className="admin-label mb-8">Họ tên / Đơn vị <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="full_name" 
                  value={formData.full_name} 
                  onChange={handleChange} 
                  placeholder="Ví dụ: Nguyễn Văn A..." 
                  className={`admin-input ${errors.full_name ? 'is-invalid' : ''}`} 
                  style={{ borderColor: errors.full_name ? 'red' : '' }}
                />
                {errors.full_name && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.full_name}</div>}
            </div>
            <div className="form-group">
                <label className="admin-label mb-8">Mã định danh (CCCD/CMND) <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="identifier" 
                  value={formData.identifier} 
                  onChange={handleChange} 
                  placeholder="Nhập số CMND / CCCD..." 
                  className="admin-input" 
                  style={{ borderColor: errors.identifier ? 'red' : '' }}
                />
                {errors.identifier && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.identifier}</div>}
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
                <label className="admin-label mb-8">Số điện thoại liên hệ <span className="text-danger">*</span></label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="0912345678" 
                  className="admin-input" 
                  style={{ borderColor: errors.phone ? 'red' : '' }}
                />
                {errors.phone && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.phone}</div>}
            </div>
            <div className="form-group">
                <label className="admin-label mb-8">Địa chỉ thường trú <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="Địa chỉ cụ thể..." 
                  className="admin-input" 
                  style={{ borderColor: errors.address ? 'red' : '' }}
                />
                {errors.address && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{errors.address}</div>}
            </div>
        </div>

        <div className="form-group">
            <label className="admin-label mb-8">Số tiền giải ngân dự kiến (VNĐ) <span className="text-danger">*</span></label>
            <input 
              type="number" 
              name="amount" 
              value={formData.amount} 
              onChange={handleChange} 
              placeholder="Ví dụ: 10000000" 
              className="admin-input" 
            />
        </div>

        <div className="form-group">
          <label className="admin-label mb-8">Hồ sơ xác thực (Hình ảnh hoặc PDF) <span className="text-danger">*</span></label>
          <MediaUploader 
            bucket="avatars" 
            folder="beneficiary_docs" 
            label="" 
            multiple={false} 
            onUploadComplete={handleDocumentUpload} 
          />
        </div>

        {documentUrl && (
          <div style={{ marginTop: 8 }}>
            <h5 className="mb-8" style={{ fontSize: 13, color: '#666' }}>Bản xem trước tài liệu:</h5>
            <PDFViewer url={documentUrl} height="350px" />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100" style={{ marginTop: '8px' }} disabled={loading}>
          {loading ? 'Đang xử lý dữ liệu...' : 'Lưu Hồ sơ Người thụ hưởng'}
        </button>
      </form>
    </div>
  );
};

export default BeneficiaryForm;
