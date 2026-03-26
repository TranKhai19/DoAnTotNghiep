import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Header = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile(userId) {
      const { data } = await supabase.from('profiles').select('full_name, role').eq('id', userId).single();
      if (data && mounted) {
        setProfile(data);
      }
    }

    async function fetchSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mounted) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    }
    
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    });

    return () => {
      mounted = false;
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="header container">
      <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear)"/>
            <path d="M2 17L12 22L22 17" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="url(#paint2_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b2397"/>
                <stop offset="1" stopColor="#5533d3"/>
              </linearGradient>
              <linearGradient id="paint1_linear" x1="12" y1="17" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b2397"/>
                <stop offset="1" stopColor="#5533d3"/>
              </linearGradient>
              <linearGradient id="paint2_linear" x1="12" y1="12" x2="12" y2="17" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b2397"/>
                <stop offset="1" stopColor="#5533d3"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <strong>Hope for</strong><br />
          <span>Tomorrow</span>
        </div>
      </Link>
      
      <nav className="nav-links">
        <Link to="/projects" className="dropdown" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dự án <span className="arrow">▼</span>
        </Link>
        <Link to="/organizations" style={{ textDecoration: 'none', color: 'inherit' }}>
          Tổ chức thiện nguyện
        </Link>
        <a href="#how-it-works">Cách hoạt động</a>
        <a href="#about-us">Về chúng tôi</a>
        <a href="#faqs">Câu hỏi thường gặp</a>
      </nav>

      <div className="header-actions">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Tìm kiếm" />
        </div>
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Xin chào, {profile ? profile.full_name : user.email.split('@')[0]}
            </span>
            {profile && (profile.role === 'admin' || profile.role === 'staff') && (
               <Link to="/admin" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px' }}>Trang Quản Trị</Link>
            )}
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px' }}>Đăng xuất</button>
          </div>
        ) : (
          <>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Đăng ký</Link>
            <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Đăng nhập</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
