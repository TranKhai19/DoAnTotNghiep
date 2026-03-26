import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user role
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error("Error fetching user role:", userError);
          navigate('/');
        } else {
          if (userData.role === 'admin' || userData.role === 'staff') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="r-container">
        <div className="r-card">
          <div className="r-header text-center mb-32">
            <h2>Đăng nhập</h2>
            <p className="text-muted mt-8">Đăng nhập để tham gia và quản lý chiến dịch của bạn</p>
          </div>
          
          <form className="r-form" onSubmit={handleLogin}>
            {errorMsg && <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>{errorMsg}</div>}
            <div className="form-group mb-24">
               <label>Email</label>
               <input type="email" placeholder="Nhập địa chỉ email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group mb-16">
               <label>Mật khẩu</label>
               <input type="password" placeholder="Nhập mật khẩu" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="text-right mb-24">
               <Link to="/forgot-password" className="text-primary" style={{fontSize: 13, textDecoration: 'none', fontWeight: 500}}>Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="btn btn-primary w-100 pd-btn-h mb-24" style={{fontSize: 16}} disabled={loading}>
               {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="r-divider mb-24">
            <span>Hoặc đăng nhập bằng</span>
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
             Chưa có tài khoản? <Link to="/register" className="text-primary fw-600" style={{textDecoration: 'none'}}>Đăng ký</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
