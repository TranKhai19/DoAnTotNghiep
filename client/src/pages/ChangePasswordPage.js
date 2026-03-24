import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate successful password change
    alert("Đổi mật khẩu thành công!");
    navigate('/login');
  };

  return (
    <div className="register-page">
      <div className="r-container">
        <div className="r-card">
          <div className="r-header text-center mb-32">
            <h2>Tạo mật khẩu mới</h2>
            <p className="text-muted mt-8">Vui lòng nhập mật khẩu mới của bạn</p>
          </div>
          
          <form className="r-form" onSubmit={handleSubmit}>
            <div className="form-group mb-24">
               <label>Mật khẩu mới</label>
               <input type="password" placeholder="Nhập mật khẩu mới" required />
            </div>

            <div className="form-group mb-32">
               <label>Xác nhận mật khẩu mới</label>
               <input type="password" placeholder="Nhập lại mật khẩu mới" required />
            </div>

            <button type="submit" className="btn btn-primary w-100 pd-btn-h mb-24" style={{fontSize: 16}}>
               Đổi mật khẩu
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

export default ChangePasswordPage;
