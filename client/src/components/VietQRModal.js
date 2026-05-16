import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import './VietQRModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const VietQRModal = ({ isOpen, onClose, campaign, amount: initialAmount }) => {
  const [amount, setAmount] = useState(initialAmount || '50000');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleDonationConfirmed = (event) => {
      const { campaignId } = event.detail;
      if (campaignId === campaign.id) {
        console.log('🚀 [MODAL] Nhận thấy quyên góp thành công, đang tự động đóng modal...');
        setTimeout(() => {
          onClose();
        }, 2000); // Đợi 2 giây để người dùng thấy trạng thái (nếu cần) hoặc đóng ngay
      }
    };

    window.addEventListener('donation:confirmed', handleDonationConfirmed);
    
    if (!isOpen) {
      setPaymentData(null);
    }

    return () => {
      window.removeEventListener('donation:confirmed', handleDonationConfirmed);
    };
  }, [isOpen, campaign.id, onClose]);

  const handleCreatePayment = async () => {
    if (campaign.raised_amount >= campaign.goal_amount) {
      toast.error('Chiến dịch đã đạt đủ số tiền, hiện tại không nhận thêm quyên góp.');
      return;
    }
    if (!amount || parseInt(amount) < 1000) {
      toast.error('Số tiền tối thiểu là 1,000đ');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/payments/create-link`, {
        campaignId: campaign.id,
        amount: parseInt(amount),
        senderName: 'Mạnh Thường Quân'
      });

      if (response.data.success) {
        setPaymentData(response.data.data);
      } else {
        toast.error('Không thể tạo mã thanh toán.');
      }
    } catch (err) {
      console.error('Error creating payment link:', err);
      const msg = err.response?.data?.error || 'Lỗi kết nối đến máy chủ.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !campaign) return null;

  const suggestedAmounts = [20000, 50000, 100000, 200000, 500000];

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={e => e.stopPropagation()}>
        <button className="qr-modal-close" onClick={onClose}>✕</button>
        
        <div className="qr-modal-header">
          <h2>💳 Quyên góp ủng hộ</h2>
          <p className="campaign-name">{campaign.title}</p>
        </div>

        <div className="qr-modal-body">
          {!paymentData ? (
            <div className="payment-setup">
              <div className="amount-section">
                <label>Số tiền quyên góp (VNĐ)</label>
                <input
                  type="number"
                  className="amount-input"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  min="1000"
                />
                <div className="suggested-amounts">
                  {suggestedAmounts.map(a => (
                    <button
                      key={a}
                      className={`amount-chip ${parseInt(amount) === a ? 'active' : ''}`}
                      onClick={() => setAmount(a)}
                    >
                      {a.toLocaleString()} đ
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="create-payment-btn" 
                onClick={handleCreatePayment}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '20px'
                }}
              >
                {loading ? '⏳ Đang tạo mã...' : '🚀 Tạo mã QR Thanh toán'}
              </button>
            </div>
          ) : (
            <div className="payment-display">
              <div className="qr-image-wrapper">
                <img
                  src={`https://img.vietqr.io/image/${paymentData.bin}-${paymentData.accountNumber}-compact2.jpg?amount=${paymentData.amount}&addInfo=${encodeURIComponent(paymentData.description)}&accountName=${encodeURIComponent(paymentData.accountName)}`}
                  alt="PayOS QR Code"
                  className="qr-image"
                  style={{ width: '100%', borderRadius: '12px' }}
                />
                <div className="qr-badge">VietQR</div>
              </div>

              <div className="transfer-info">
                <div className="info-row">
                  <span className="info-label">Ngân hàng:</span>
                  <span className="info-value">OCB (PayOS)</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Số tài khoản:</span>
                  <span className="info-value">{paymentData.accountNumber}</span>
                </div>
                <div className="info-row highlight">
                  <span className="info-label">Số tiền:</span>
                  <span className="info-value">{paymentData.amount.toLocaleString()} đ</span>
                </div>
                <div className="info-row highlight">
                  <span className="info-label">Nội dung:</span>
                  <span className="info-value">{paymentData.description}</span>
                </div>
              </div>

              <div className="qr-notice" style={{ marginTop: '15px' }}>
                ✅ <strong>Mã QR này chỉ dùng một lần.</strong> Hệ thống sẽ tự động xác nhận ngay sau khi bạn thanh toán thành công qua ứng dụng ngân hàng.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <a 
                  href={paymentData.checkoutUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="checkout-link"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  Mở cổng thanh toán
                </a>
                <button 
                  onClick={() => setPaymentData(null)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Quay lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VietQRModal;

