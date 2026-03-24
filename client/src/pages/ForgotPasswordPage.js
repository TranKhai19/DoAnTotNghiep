import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending OTP or email
    navigate('/change-password');
  };

  return (
    <div className="register-page">
      <div className="r-container">
        <div className="r-card">
          <div className="r-header text-center mb-32">
            <h2>Quên mật khẩu</h2>
            <p className="text-muted mt-8">Nhập email hoặc số điện thoại để đặt lại mật khẩu</p>
          </div>
          
          <form className="r-form" onSubmit={handleSubmit}>
            <div className="form-group mb-24">
               <label>Email hoặc Số điện thoại</label>
               <input type="text" placeholder="Nhập email hoặc số điện thoại của bạn" required />
            </div>

            <button type="submit" className="btn btn-primary w-100 pd-btn-h mb-24" style={{fontSize: 16}}>
               Xác thực
            </button>
          </form>
          
          <p className="text-center mt-32" style={{fontSize: 14}}>
             Quay lại <Link to="/login" className="text-primary fw-600" style={{textDecoration: 'none'}}>Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
