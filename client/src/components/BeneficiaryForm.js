import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import MediaUploader from './MediaUploader';
import PDFViewer from './PDFViewer';
import { z } from 'zod';

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
      name: formData.full_name, 
      document_url: documentUrl,
    };

    const { data: beneficiary, error: benError } = await supabase
      .from('beneficiaries')
      .insert([payload])
      .select()
      .single();
    
    if (benError) {
      alert('Lỗi khi thêm người thụ hưởng: ' + benError.message);
      setLoading(false);
      return;
    }
    
    if (campaignId) {
        const { error: campError } = await supabase
            .from('campaigns')
            .update({ beneficiary_id: beneficiary.id })
            .eq('id', campaignId);
            
        if (campError) {
             console.error("Link to campaign failed:", campError);
        }
    }

    setLoading(false);
    alert('Đã thêm hồ sơ người thụ hưởng thành công!');
    setFormData({ full_name: '', identifier: '', phone: '', address: '' });
    setDocumentUrl('');
    
    if (onAddSuccess) {
        onAddSuccess(beneficiary);
    }
  };

  return (
    <div style={{ backgroundColor: '#faf9ff', padding: 20, borderRadius: 8, border: '1px solid #eaeaea', marginBottom: 24 }}>
      <h4 className="mb-16" style={{ fontSize: 15, color: 'var(--primary)' }}>+ Thêm Hồ sơ Người Thụ Hưởng Mới</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
        
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
