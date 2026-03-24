import React from 'react';

const Newsletter = () => (
   <section className="newsletter container">
      <div className="newsletter-img text-center">
         <img src="/assets/Visily-Export-to-Image-Image 143-2026-03-14.png" alt="Character pointing" style={{ maxWidth: '300px' }} /> 
      </div>
      <div className="newsletter-form">
         <h2>Nhận những câu chuyện, tin tức, <br/>tuyệt vời trong hộp thư của bản</h2>
         <div className="input-group">
            <input type="email" placeholder="youremail@example.com" />
            <button className="btn btn-primary">Đăng ký ngay</button>
         </div>
      </div>
   </section>
);

export default Newsletter;
