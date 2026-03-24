import React from 'react';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-brand">
         <div className="logo text-white">
            <div className="logo-icon bg-white text-primary rounded" style={{padding: 4, display:'inline-block', marginRight: 8}}>HT</div>
            <div>
              <strong>Hope for</strong><br />
              <span>Tomorrow</span>
            </div>
         </div>
         <p className="contact-info">
           (324) 1142-9902<br/>
           2912 West Avenue, San Diego, CA 02122
         </p>
      </div>
      <div className="footer-links">
        <ul>
          <li><a href="#1">Dự án</a></li>
          <li><a href="#2">Cách hoạt động</a></li>
          <li><a href="#3">Người được giúp đỡ</a></li>
          <li><a href="#4">Tham gia cùng chúng tôi</a></li>
        </ul>
        <ul>
          <li><a href="#5">Về chúng tôi</a></li>
          <li><a href="#6">Cơ hội việc làm</a></li>
          <li><a href="#7">Câu hỏi thường gặp</a></li>
          <li><a href="#8">Liên hệ</a></li>
        </ul>
        <ul>
          <li><a href="#9">Quyền riêng tư</a></li>
          <li><a href="#10">Điều khoản</a></li>
          <li><a href="#11">Sơ đồ trang</a></li>
          <li><span className="text-muted">© 2026 Brand, Inc</span></li>
        </ul>
      </div>
      <div className="footer-actions">
         <button className="btn btn-outline-white">Trung tâm hỗ trợ</button>
         <div className="social-icons">
            <a href="#twitter">T</a>
            <a href="#fb">F</a>
            <a href="#in">In</a>
            <a href="#yt">Y</a>
         </div>
      </div>
    </div>
  </footer>
);

export default Footer;
