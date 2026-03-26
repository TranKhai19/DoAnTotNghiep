import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="register-page">
      <div className="r-container">
        <div className="r-card">
          <div className="r-header text-center mb-32">
            <h2>Tạo tài khoản mới</h2>
            <p className="text-muted mt-8">Đăng ký để tham gia và quản lý chiến dịch của bạn</p>
          </div>
          
          <form className="r-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group mb-24">
               <label>Họ Tên</label>
               <input type="text" placeholder="Nhập họ và tên của bạn" required />
            </div>
            
            <div className="form-group mb-24">
               <label>Email</label>
               <input type="email" placeholder="Nhập địa chỉ email" required />
            </div>

            <div className="form-group mb-32">
               <label>Số điện thoại</label>
               <input type="tel" placeholder="Nhập số điện thoại" required />
            </div>

            <div className="form-group mb-24">
               <label>Mật khẩu</label>
               <input type="password" placeholder="Nhập mật khẩu" required />
            </div>

            <div className="form-group mb-24">
               <label>Xác nhận mật khẩu</label>
               <input type="password" placeholder="Nhập lại mật khẩu" required />
            </div>

            <button type="submit" className="btn btn-primary w-100 pd-btn-h mb-24" style={{fontSize: 16}}>
               Đăng ký
            </button>
          </form>

          <div className="r-divider mb-24">
            <span>Hoặc đăng ký bằng</span>
          </div>

          <div className="d-flex flex-column gap-16">
            <button className="btn btn-outline w-100 pd-btn-h d-flex align-center justify-center gap-16 r-social-btn">
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width="20" />
               Tiếp tục với Google
            </button>
            <button className="btn btn-outline w-100 pd-btn-h d-flex align-center justify-center gap-16 r-social-btn">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png" alt="Facebook" width="20" />
               Tiếp tục với Facebook
            </button>
            <button className="btn btn-outline w-100 pd-btn-h d-flex align-center justify-center gap-16 r-social-btn">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Zalo_Icon.svg/2048px-Zalo_Icon.svg.png" alt="Zalo" width="20" />
               Tiếp tục với Zalo
            </button>
          </div>
          
          <p className="text-center mt-32" style={{fontSize: 14}}>
             Đã có tài khoản? <Link to="/login" className="text-primary fw-600" style={{textDecoration: 'none'}}>Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
