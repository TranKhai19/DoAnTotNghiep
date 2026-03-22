import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


import './App.css';


// Using functional component structure internally to keep App.js readable
const Header = () => (
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
      <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Đăng ký</Link>
      <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Đăng nhập</Link>
    </div>
  </header>
);

const Hero = () => (
  <section className="hero container">
    <div className="hero-content">
      <h1>Tạo ra những thay đổi<br/>và giúp đỡ thế giới</h1>
      <p style={{ maxWidth: '480px' }}>Hope for Tomorrow là tổ chức phi lợi nhuận hợp tác với các tình nguyện viên để cung cấp viện trợ nhân đạo và cứu trợ thiên tai cho các cộng đồng dễ bị tổn thương.</p>
      <div className="hero-buttons">
        <button className="btn btn-primary lg">Quyên góp ngay!</button>
        <button className="btn btn-outline lg">Tìm hiểu thêm</button>
      </div>
    </div>
    <div className="hero-visuals">
      <div className="blob-bg"></div>
      <img src="/assets/Visily-Export-to-Image-Image 120-2026-03-14.png" alt="Wheelchair character" className="hero-char-left" />
      <div className="hero-cards">
        <div className="hero-card">
          <img src="/assets/Visily-Export-to-Image-Image 117-2026-03-14.png" alt="Educate" />
          <div className="card-info">
            <h4>Giáo dục 500 trẻ mồ côi tại Syria</h4>
            <div className="progress-bar"><div className="progress" style={{width: '60%'}}></div></div>
            <div className="card-footer">
              <span>Giáo dục</span>
              <a href="#more">Xem thêm</a>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <img src="/assets/Visily-Export-to-Image-Image 118-2026-03-14.png" alt="Medical" />
          <div className="card-info">
            <h4>Cung cấp chăm sóc y tế khẩn cấp</h4>
            <div className="progress-bar"><div className="progress" style={{width: '85%'}}></div></div>
            <div className="card-footer">
              <span>Sức khỏe</span>
              <a href="#more">Xem thêm</a>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <img src="/assets/Visily-Export-to-Image-Image 119-2026-03-14.png" alt="Food" />
          <div className="card-info">
            <h4>Nuôi dưỡng hy vọng: Lương thực</h4>
            <div className="progress-bar"><div className="progress" style={{width: '40%'}}></div></div>
            <div className="card-footer">
              <span>An ninh lương thực</span>
              <a href="#more">Xem thêm</a>
            </div>
          </div>
        </div>
      </div>
      <img src="/assets/Visily-Export-to-Image-Image 121-2026-03-14.png" alt="Standing character" className="hero-char-right" />
    </div>
  </section>
);

const ExploreProjects = () => {
  const tags = [
    "Nổi bật", "Gần đạt mục tiêu", "Bảo vệ trẻ em", "Ứng phó thiên tai", "Giáo dục", "Hành động khí hậu",
    "Bình đẳng giới", "Sức khỏe y tế", "An ninh lương thực", "Phúc lợi động vật", "Phục hồi hệ sinh thái", "Xem tất cả >"
  ];
  return (
    <section className="explore container">
      <div className="explore-wrapper">
        <span className="explore-label">Khám phá dự án:</span>
        <div className="tags">
          {tags.map((tag, idx) => (
            <span key={idx} className={`tag ${tag === 'Featured' ? 'active' : ''} ${tag.includes('See All') ? 'see-all' : ''}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  return (
    <section className="how-it-works-section">
      <img src="/assets/Visily-Export-to-Image-Image 144-2026-03-14.png" alt="Decoration" className="hw-deco-left" />
      <div className="container" style={{ position: 'relative' }}>
        <div className="section-title text-center text-white">
          <h2>Cách hoạt động</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="icon-wrapper">
              <img src="/assets/Visily-Export-to-Image-Image 124-2026-03-14.png" alt="Step 1 Icon" className="hw-icon" />
            </div>
            <h3>Sẵn sàng hành động</h3>
            <p>Cam kết hành động khẩn trương và cung cấp hỗ trợ kịp thời nhất khi có thiên tai xảy ra.</p>
          </div>
          <div className="step-card">
            <div className="icon-wrapper">
              <img src="/assets/Visily-Export-to-Image-Image 125-2026-03-14.png" alt="Step 2 Icon" className="hw-icon" />
            </div>
            <h3>Hỗ trợ thiết thực</h3>
            <p>Đảm bảo mọi khoản đóng góp đều được sử dụng hiệu quả để cung cấp lương thực và vật tư y tế.</p>
          </div>
          <div className="step-card">
            <div className="icon-wrapper">
              <img src="/assets/Visily-Export-to-Image-Image 126-2026-03-14.png" alt="Step 3 Icon" className="hw-icon" />
            </div>
            <h3>Mạng lưới toàn cầu</h3>
            <p>Đội ngũ tình nguyện viên trải rộng khắp nơi, sát cánh cùng các cộng đồng dễ bị tổn thương nhất.</p>
          </div>
        </div>

        <div className="stats-row" style={{ position: 'relative' }}>
          <div className="stat">
            <h2 className="stat-val text-cyan">21</h2><span className="stat-label">Năm</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">$877M</h2><span className="stat-label">Đô la</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">1,793,907</h2><span className="stat-label">Người quyên góp</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">35,706</h2><span className="stat-label">Dự án</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">175+</h2><span className="stat-label">Quốc gia</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">580</h2><span className="stat-label">Công ty</span>
          </div>
          <img src="/assets/Visily-Export-to-Image-Image 128-2026-03-14.png" alt="Decoration" className="hw-deco-right" />
        </div>
      </div>
    </section>
  );
};

const DisasterRecovery = () => (
  <section className="disaster container">
    <div className="disaster-content">
      <h2 style={{ marginBottom: '16px' }}>Khắc phục thiên tai</h2>
      <p style={{ maxWidth: '380px' }}>Hope for Tomorrow giúp bạn dễ dàng đóng góp một cách an toàn cho các hoạt động cứu trợ và khắc phục thiên tai do địa phương dẫn dắt trên toàn thế giới.</p>
      <div className="hero-buttons">
        <button className="btn btn-primary lg">Quyên góp ngay!</button>
        <button className="btn btn-outline lg">Tìm hiểu thêm</button>
      </div>
    </div>
    <div className="disaster-visual" style={{ flex: 1.5, display: 'flex', justifyContent: 'center' }}>
      <div className="map-container">
        <img src="/assets/Visily-Export-to-Image-Image 129-2026-03-14.png" alt="World Map" className="map-img" />
        <img src="/assets/Visily-Export-to-Image-Image 131-2026-03-14.png" alt="Pin 1" className="map-pin pin-1" />
        <img src="/assets/Visily-Export-to-Image-Image 133-2026-03-14.png" alt="Pin 2" className="map-pin pin-2" />
        <img src="/assets/Visily-Export-to-Image-Image 135-2026-03-14.png" alt="Pin 3" className="map-pin pin-3" />
        <img src="/assets/Visily-Export-to-Image-Image 137-2026-03-14.png" alt="Pin 4" className="map-pin pin-4" />
      </div>
    </div>
  </section>
);

const News = () => {
  const articles = [
    {
      img: "/assets/Visily-Export-to-Image-Image 138-2026-03-14.png",
      date: "12 Thg 11",
      title: "Gặp gỡ các thành viên Cộng đồng Tiếng nói",
      desc: "Elit id aliqup in idicudunt fugital proident excepteur magna tempor. Laborum et onim ad magnus do is magna in id.",
      link: "#"
    },
    {
      img: "/assets/Visily-Export-to-Image-Image 140-2026-03-14.png",
      date: "08 Thg 11",
      title: "Động đất tấn công vào trung tâm thế giới",
      desc: "In ut ex ut est on ipsu aliqup veniam id eiusmod onim ut ex labore id nisi tempor. Ut min do fugiat",
      link: "#"
    },
    {
      img: "/assets/Visily-Export-to-Image-Image 141-2026-03-14.png",
      date: "04 Thg 11",
      title: "Dành 10 phút cho quyền riêng tư và sức khỏe tâm thần",
      desc: "In ex liborum est on idc denari en in do veniam aliquip excepteur ipsu non. Minin magna eu ut eu voluptate.",
      link: "#"
    },
    {
      img: "/assets/Visily-Export-to-Image-Image 139-2026-03-14.png",
      date: "02 Thg 11",
      title: "Làm sao để giúp Thổ Nhĩ Kỳ, Syria: Nỗ lực cứu trợ sau động đất",
      desc: "Occaecat ullam incididunt enim fugital nostrud nostr...",
      link: "#"
    }
  ];

  return (
    <section className="news-section">
      <div className="container">
        <h2 className="text-center section-title">Tin tức</h2>
        <div className="news-grid">
          {articles.map((article, i) => (
            <div key={i} className="news-card">
              <img src={article.img} alt={article.title} />
              <div className="news-content">
                <span className="news-date">{article.date}</span>
                <h4>{article.title}</h4>
                <p>{article.desc}</p>
                <div className="news-footer">
                  <a href={article.link}>Đọc thêm</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

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

const ProjectHero = () => (
  <section className="project-hero container">
    <div className="ph-content">
      <h1>Mọi người trên khắp thế giới đang quyên góp cho niềm đam mê của họ</h1>
    </div>
    <div className="ph-illustration">
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="120" cy="120" r="120" fill="#f0edf9"/>
        <path d="M120 40c44 0 80 36 80 80s-36 80-80 80-80-36-80-80 36-80 80-80z" fill="#3b2397" opacity="0.1"/>
        <text x="120" y="125" textAnchor="middle" fill="#3b2397" fontSize="24" fontWeight="bold">Minh họa</text>
      </svg>
    </div>
  </section>
);

const ProjectCard = ({ id, image, category, location, title, desc, raised, target, percent }) => (
  <Link to={`/project/${id || '1'}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <div className="p-card h-100">
      <div className="p-card-img-wrapper">
        <img src={image} alt={title} />
      </div>
      <div className="p-card-body">
        <div className="p-card-meta">
          <span>{category} • {location}</span>
          <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
        </div>
        <h4>{title}</h4>
        <p>{desc}</p>
        <div className="p-card-progress mt-auto">
          <div className="p-progress" style={{ width: Math.min(100, percent) + '%' }}></div>
        </div>
        <div className="p-card-stats mt-16">
          <strong>${raised} đã nhận</strong> trên mục tiêu ${target}
        </div>
      </div>
    </div>
  </Link>
);

const OrganizationCard = ({ id, image, type, location, name, desc, raised, projects }) => (
  <Link to={`/beneficiary/${id || '1'}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <div className="p-card h-100">
      <div className="p-card-img-wrapper">
        <img src={image} alt={name} />
      </div>
      <div className="p-card-body">
        <div className="p-card-meta">
          <span>{type} • {location}</span>
          <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <h4 style={{fontSize: 20, marginBottom: 8}}>{name}</h4>
        <p style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{desc}</p>
        
        <div className="mt-auto pt-16 d-flex" style={{borderTop: '1px solid #eaeaea', justifyContent: 'space-between', alignItems: 'center'}}>
           <div>
              <strong style={{color: 'var(--primary)'}}>{projects}</strong> <span style={{fontSize: 12}} className="text-muted">dự án</span>
           </div>
           <div>
              <strong style={{color: 'var(--primary)'}}>{raised}</strong> <span style={{fontSize: 12}} className="text-muted">đã nhận</span>
           </div>
        </div>
      </div>
    </div>
  </Link>
);

const OrgHero = () => (
  <section className="project-hero container">
    <div className="ph-content">
      <h1>Cùng đồng hành với những tổ chức thiện nguyện uy tín</h1>
    </div>
    <div className="ph-illustration">
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="120" cy="120" r="120" fill="#f0edf9"/>
        <path d="M120 40c44 0 80 36 80 80s-36 80-80 80-80-36-80-80 36-80 80-80z" fill="#3b2397" opacity="0.1"/>
        <text x="120" y="125" textAnchor="middle" fill="#3b2397" fontSize="24" fontWeight="bold">Tổ chức</text>
      </svg>
    </div>
  </section>
);

const OrganizationsPage = () => {
   const orgs = [
      { id: 1, image: "/assets/Visily-Export-to-Image-Image 138-2026-03-14.png", type: "Tổ chức phi chính phủ", location: "Hà Nội, VN", name: "Quỹ Bảo trợ Trẻ em Việt Nam", desc: "Quỹ Bảo trợ trẻ em Việt Nam là tổ chức phi chính phủ thuộc Bộ Lao động - Thương binh và Xã hội.", raised: "5.2M+", projects: "214" },
      { id: 2, image: "/assets/Visily-Export-to-Image-Image 140-2026-03-14.png", type: "Tổ chức NPO", location: "TP.HCM, VN", name: "Làng Trẻ em SOS Việt Nam", desc: "Mái ấm yêu thương dành cho trẻ mồ côi, trẻ bị bỏ rơi và trẻ có hoàn cảnh đặc biệt khó khăn trải dài khắp mọi miền.", raised: "3.1M+", projects: "15" },
      { id: 3, image: "/assets/Visily-Export-to-Image-Image 141-2026-03-14.png", type: "Cộng đồng", location: "Đà Nẵng, VN", name: "Trái Tim Nhân Ái", desc: "Nhóm tình nguyện viên hỗ trợ suất ăn miễn phí và khám chữa bệnh cho người nghèo, vô gia cư tại miền Trung.", raised: "500K+", projects: "42" },
      { id: 4, image: "/assets/Visily-Export-to-Image-Image 120-2026-03-14.png", type: "Quỹ từ thiện", location: "Cần Thơ, VN", name: "Quỹ Vì Tương Lai Việt", desc: "Đồng hành cùng học sinh sinh viên nghèo học giỏi, cấp học bổng giúp các em không bị gián đoạn việc học.", raised: "1.2M+", projects: "80" },
      { id: 5, image: "/assets/Visily-Export-to-Image-Image 118-2026-03-14.png", type: "Hội Chữ thập đỏ", location: "Toàn quốc", name: "Hội Chữ thập đỏ Việt Nam", desc: "Tổ chức xã hội nhân đạo quần chúng, tập hợp mọi người Việt Nam vì mục tiêu nhân đạo - hòa bình - hữu nghị.", raised: "10M+", projects: "560" },
      { id: 6, image: "/assets/Visily-Export-to-Image-Image 119-2026-03-14.png", type: "Nhóm Tình Nguyện", location: "Hà Nội, VN", name: "Hành Trình Xanh", desc: "Hoạt động bảo vệ môi trường, giáo dục cộng đồng về rác thải nhựa, phủ xanh đồi trọc và phục hồi hệ sinh thái.", raised: "250K+", projects: "12" }
   ];

   return (
       <div className="project-page">
           <OrgHero />
           <section className="container section-spacing pt-0">
               <div className="section-header-row mb-32">
                   <h2 className="section-title text-left m-0">Danh sách các Đơn vị tổ chức</h2>
               </div>
               <div className="p-grid-3">
                   {orgs.map((org, i) => <OrganizationCard key={i} {...org} />)}
               </div>
               <div className="text-center" style={{ marginTop: '50px' }}>
                   <button className="btn btn-outline lg">Tải thêm tổ chức</button>
               </div>
           </section>
       </div>
   );
};

const CategoryIcon = ({ label }) => (
  <div className="cat-icon-container">
    <div className="cat-icon">
      <svg stroke="white" fill="none" viewBox="0 0 24 24" width="28" height="28" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    </div>
    <span>{label}</span>
  </div>
);

const ProjectPage = () => {
   const topProjects = [
      { img: "/assets/Visily-Export-to-Image-Image 138-2026-03-14.png", cat: "Giáo dục", loc: "Syria", title: "Giáo dục cho 500 trẻ mồ côi tại Syria", desc: "Laborum elit id aliquip in id deserunt fugiat proident ex anim labore id magna anim magna irure id.", raised: "2,460", target: "5,750", percent: 42 },
      { img: "/assets/Visily-Export-to-Image-Image 140-2026-03-14.png", cat: "Giáo dục", loc: "Haiti", title: "Giáo dục con gái. Giáo dục quốc gia - Sierra Leone", desc: "Magna do ut eiusmod in veniam anim qui ut aliquip aute voluptate magna anim dolore ullamco do irure.", raised: "3,400", target: "7,500", percent: 45 },
      { img: "/assets/Visily-Export-to-Image-Image 141-2026-03-14.png", cat: "Thực phẩm", loc: "USA", title: "Nuôi dưỡng hy vọng: Phục vụ thức ăn cho người đói", desc: "Elit duis ullamco commodo ad laboris dolor dolore proident. Ad in veniam enim excepteur enim aute adipisicing duis.", raised: "2,150", target: "5,000", percent: 43 },
      { img: "/assets/Visily-Export-to-Image-Image 120-2026-03-14.png", cat: "Ứng phó thiên tai", loc: "Morocco", title: "Hỗ trợ cộng đồng High Atlas sau động đất", desc: "Eiusmod veniam sit commodo id ad dolor qui proident quis amet veniam exercitation.", raised: "1,050", target: "6,000", percent: 17 },
      { img: "/assets/Visily-Export-to-Image-Image 118-2026-03-14.png", cat: "Ứng phó thiên tai", loc: "Morocco", title: "Cứu trợ động đất cho các cộng đồng ở Ma-rốc", desc: "Aute do ut et laborum esse nisi incididunt aute est commodo dolore ut in eu cillum ut ex tempor in.", raised: "1,450", target: "4,200", percent: 34 },
      { img: "/assets/Visily-Export-to-Image-Image 119-2026-03-14.png", cat: "Giáo dục", loc: "Uganda", title: "Trao quyền cho bé gái: Để tự lập", desc: "Cupidatat ea ea occaecat elit in elit ex consectetur do esse enim quis labore ex cillum deserunt nostrud in adipisicing eiusmod.", raised: "2,100", target: "4,500", percent: 46 }
   ];

   const categories = ["Bảo vệ trẻ em", "Thiên tai", "Giáo dục", "Hành động khí hậu", "Năng lực", "Sức khỏe", "An ninh lương thực", "Động vật", "Hệ sinh thái", "Văn hóa", "Cộng đồng", "Thể thao"];

   return (
       <div className="project-page">
           <ProjectHero />
           
           <section className="container section-spacing pt-0">
               <h2 className="section-title text-left mb-32">Dự án quan trọng</h2>
               <div className="p-grid-3">
                   {topProjects.map((p, i) => <ProjectCard key={i} image={p.img} category={p.cat} location={p.loc} title={p.title} desc={p.desc} raised={p.raised} target={p.target} percent={p.percent} />)}
               </div>
           </section>

           <section className="container section-spacing text-center">
               <h2 className="section-title mb-40">Duyệt trang theo danh mục</h2>
               <div className="cat-grid">
                   {categories.map((c, i) => <CategoryIcon key={i} label={c} />)}
               </div>
           </section>

           <section className="container section-spacing">
               <div className="section-header-row mb-32">
                   <h2 className="section-title text-left m-0">Giáo dục</h2>
                   <a href="#more" className="view-more">Xem thêm</a>
               </div>
               <div className="p-grid-3">
                   {topProjects.slice(0, 3).map((p, i) => <ProjectCard key={i} {...p} />)}
               </div>
           </section>

           <section className="container section-spacing">
               <div className="section-header-row mb-32">
                   <h2 className="section-title text-left m-0">An ninh lương thực</h2>
                   <a href="#more" className="view-more">Xem thêm</a>
               </div>
               <div className="p-grid-3">
                   {topProjects.slice(2, 5).map((p, i) => <ProjectCard key={i} {...p} />)}
               </div>
           </section>

           <section className="container section-spacing pb-60">
               <div className="section-header-row mb-32">
                   <h2 className="section-title text-left m-0">Hành động khí hậu</h2>
                   <a href="#more" className="view-more">Xem thêm</a>
               </div>
               <div className="p-grid-3">
                   <ProjectCard {...topProjects[5]} />
                   <ProjectCard {...topProjects[4]} />
                   <ProjectCard {...topProjects[3]} />
               </div>
               <div className="text-center" style={{ marginTop: '40px' }}>
                   <button className="btn cat-btn">Hiển thị thêm danh mục</button>
               </div>
           </section>
       </div>
   );
};

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

const ProjectDetail = () => {
  const thumbs = [
    "/assets/Visily-Export-to-Image-Image 105-2026-03-17.png",
    "/assets/Visily-Export-to-Image-Image 106-2026-03-17.png",
    "/assets/Visily-Export-to-Image-Image 107-2026-03-17.png",
    "/assets/Visily-Export-to-Image-Image 108-2026-03-17.png",
    "/assets/Visily-Export-to-Image-Image 109-2026-03-17.png"
  ];
  return (
    <div className="project-detail container section-spacing">
       <div className="breadcrumb mb-32"><Link to="/projects">← Quay lại danh sách</Link></div>
       
       <div className="pd-grid">
          <div className="pd-main">
             <img src="/assets/Visily-Export-to-Image-Image 99-2026-03-17.png" alt="Children with backpacks" className="pd-hero-img" />
             
             <div className="pd-thumbnails mt-16">
               <button className="thumb-nav left">{"<"}</button>
               {thumbs.map((img, i) => (
                 <img key={i} src={img} alt={"Thumb " + i} className={`thumb-img ${i===0?'active':''}`} />
               ))}
               <button className="thumb-nav right">{">"}</button>
             </div>

             <div className="pd-info mt-40">
                <h2 style={{fontSize: 28, marginBottom: 24}}>Trao quyền cho bé gái: Để tự lập</h2>
                <p style={{lineHeight: 1.8, color: 'var(--text-muted)'}}>Pariatur commodo non dolor est aliqua irure eiusmod nisi qui officia proident Lorem sit qui sint ullamco Lorem tempor. Ullamco nisi enim ipsum nulla reprehenderit incididunt ad voluptate voluptate. Quis sit enim duis exercitation culpa ex adipisicing occaecat laboris dolore ex minim. Pariatur aliqua deserunt eu et ea enim occaecat est cupidatat anim do laboris veniam non aute reprehenderit cupidatat culpa in. Non ex duis pariatur elit esse incididunt veniam adipisicing ut. Aliquip et culpa do ipsum esse incididunt Lorem ex. Irure quis et labore magna tempor qui exercitation mollit minim deseru</p>
                <div className="pd-actions d-flex gap-24 mt-40">
                   <button className="btn btn-outline lg flex-1 pd-btn-h">Chia sẻ</button>
                   <button className="btn btn-primary lg flex-1 pd-btn-h">Quyên góp ngay!</button>
                </div>
             </div>
             
             <div className="pd-comments mt-60">
                <h3 className="mb-8" style={{fontSize: 24}}>Lời động viên (27)</h3>
                <p className="text-muted mb-32" style={{fontSize: 14}}>Hãy quyên góp để chia sẻ những lời động viên.</p>
                
                <div className="comment-list d-flex flex-column gap-16">
                   <div className="comment-item">
                      <div className="comment-avatar">
                         <img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar" />
                      </div>
                      <div className="comment-body">
                         <div className="c-header d-flex align-center gap-16 mb-8">
                            <strong style={{fontSize: 14}}>Nguyễn Thanh Thư</strong>
                            <div className="c-meta text-muted" style={{fontSize: 12}}><span className="c-amount fw-600 mr-8">2.540.000₫</span><span className="c-time">4 ngày</span></div>
                         </div>
                         <p className="text-muted m-0" style={{fontSize: 13, lineHeight: 1.5}}>Cố lên các em nhé, mọi điều tốt đẹp sẽ đến 😍😍😍</p>
                      </div>
                   </div>
                   <div className="comment-item">
                      <div className="comment-avatar">
                         <img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar" />
                      </div>
                      <div className="comment-body">
                         <div className="c-header d-flex align-center gap-16 mb-8">
                            <strong style={{fontSize: 14}}>Hà My</strong>
                            <div className="c-meta text-muted" style={{fontSize: 12}}><span className="c-amount fw-600 mr-8">1.270.000₫</span><span className="c-time">7 ngày</span></div>
                         </div>
                         <p className="text-muted m-0" style={{fontSize: 13, lineHeight: 1.5}}>Chúc dự án thành công tốt đẹp, mong lan tỏa được nhiều yêu thương đến mọi người.</p>
                      </div>
                   </div>
                   <div className="comment-item">
                      <div className="comment-avatar">
                         <img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar" />
                      </div>
                      <div className="comment-body">
                         <div className="c-header d-flex align-center gap-16 mb-8">
                            <strong style={{fontSize: 14}}>Phạm Hải Yến</strong>
                            <div className="c-meta text-muted" style={{fontSize: 12}}><span className="c-amount fw-600 mr-8">500.000₫</span><span className="c-time">9 ngày</span></div>
                         </div>
                         <p className="text-muted m-0" style={{fontSize: 13, lineHeight: 1.5}}>Một chút tấm lòng gửi đến các em.</p>
                      </div>
                   </div>
                </div>
                <button className="btn btn-outline mt-32 px-32">Xem thêm</button>
             </div>
          </div>
          
          <div className="pd-sidebar">
             <div className="donate-card sticky">
                <div className="tags mb-24"><span className="tag active" style={{fontSize: 11, padding: '4px 12px'}}>Giáo dục</span><span className="tag" style={{fontSize: 11, padding: '4px 12px'}}>Uganda</span></div>
                <h3 className="mb-24" style={{fontSize: 22, fontWeight: 500}}>Trao quyền cho bé gái: Để tự lập</h3>
                <div className="d-stats d-flex align-baseline gap-8 mt-24">
                   <h2 style={{fontSize: 36, m: 0}}>$82,567</h2> <span className="text-muted" style={{fontSize: 12, fontWeight: 500}}>USD đã nhận trên mục tiêu $100,000</span>
                </div>
                <div className="p-card-progress mt-16 mb-8">
                  <div className="p-progress" style={{ width: '82%', backgroundColor: '#00e5c9' }}></div>
                </div>
                <p className="text-muted mt-8 mb-32" style={{fontSize: 13}}>11.000 lượt quyên góp</p>
                
                <div className="pd-actions d-flex gap-16 mb-40">
                   <button className="btn btn-outline flex-1 pd-btn-h">Chia sẻ</button>
                   <button className="btn btn-primary flex-1 pd-btn-h">Quyên góp ngay!</button>
                </div>
                
                <div className="recent-donations d-flex flex-column gap-24">
                   {[
                     {name: "Quốc Tuấn", amt: "508.000₫", time: "4 ngày"},
                     {name: "Minh Trang", amt: "254.000₫", time: "4 ngày"},
                     {name: "Đức Nguyễn", amt: "1.270.000₫", time: "4 ngày"},
                     {name: "Lan Hương", amt: "2.540.000₫", time: "4 ngày"}
                   ].map((d, i) => (
                     <div key={i} className="r-donation-item d-flex align-center gap-16">
                       <div className="r-avatar"><img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar"/></div>
                       <div className="r-info flex-1">
                         <strong style={{fontSize: 13}}>{d.name}</strong><br/>
                         <span style={{fontSize: 13, fontWeight: 600}}>{d.amt}</span>
                       </div>
                       <span className="r-time text-muted" style={{fontSize: 12}}>{d.time}</span>
                     </div>
                   ))}
                </div>
                
                <div className="d-card-footer d-flex gap-16 mt-32">
                   <button className="btn btn-outline flex-1">Xem tất cả</button>
                   <button className="btn btn-outline flex-1 d-flex align-center gap-8 justify-center">
                     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> 
                     Ủng hộ hàng đầu
                   </button>
                </div>
             </div>
          </div>
       </div>

       <div className="related-projects mt-80 pt-40" style={{borderTop: '2px solid var(--primary)'}}>
           <div className="section-header-row mb-32 mt-40">
               <h2 className="section-title text-left m-0" style={{fontSize: 28}}>Dự án liên quan</h2>
               <a href="#more" className="view-more">Xem thêm</a>
           </div>
           <div className="p-grid-3">
               <ProjectCard id={2} image="/assets/Visily-Export-to-Image-Image 138-2026-03-14.png" category="Giáo dục" location="Sierra Leone" title="Giáo dục những nhà lãnh đạo tương lai của Sierra Leone" desc="Id quis ex tempor veniam laborum minim ea officia duis cillum elit. Do irure consectetur duis" raised="52,210" target="115,000" percent={45} />
               <ProjectCard id={3} image="/assets/Visily-Export-to-Image-Image 140-2026-03-14.png" category="Giáo dục" location="Thailand" title="Ngăn chặn nạn buôn bán trẻ em thông qua giáo dục" desc="Culpa irure pariatur id enim in eiusmod irure aute aliquip. Laboris consectetur ut esse ipsum" raised="15,445" target="500,000" percent={3} />
               <ProjectCard id={4} image="/assets/Visily-Export-to-Image-Image 141-2026-03-14.png" category="Giáo dục" location="Peru" title="Bảo vệ 300 bé gái khỏi lao động giúp việc nhà ở Peru" desc="Cillum voluptate est ea cupidatat dolore voluptate. Deserunt consectetur cillum culpa. Lo" raised="52,567" target="145,000" percent={36} />
           </div>
       </div>
    </div>
  );
};

const BeneficiaryDetail = () => {
  return (
    <div className="project-detail container section-spacing">
       <div className="breadcrumb mb-32"><Link to="/projects">← Quay lại danh sách</Link></div>
       
       <div className="pd-grid">
          <div className="pd-main">
             <div className="bene-header d-flex gap-24 align-center mb-32" style={{borderBottom: '1px solid #eaeaea', paddingBottom: '32px'}}>
                <img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar" style={{width: 120, height: 120, borderRadius: '50%', objectFit: 'cover'}} />
                <div>
                   <h2 style={{fontSize: 32, marginBottom: 12}}>Quỹ Bảo trợ Trẻ em Việt Nam</h2>
                   <div className="d-flex align-center gap-16 mb-16 text-muted" style={{fontSize: 14}}>
                      <span>Tổ chức phi chính phủ</span>
                      <span>•</span>
                      <span>Hà Nội, Việt Nam</span>
                   </div>
                   <div className="tags">
                      <span className="tag active" style={{fontSize: 12, padding: '4px 12px', display: 'inline-flex', alignItems: 'center'}}>
                         <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" width="14" height="14" style={{marginRight: 4}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                         Đã xác thực
                      </span>
                   </div>
                </div>
             </div>

             <div className="pd-info mt-32">
                <h3 className="mb-16" style={{fontSize: 22}}>Về tổ chức</h3>
                <p style={{lineHeight: 1.8, color: 'var(--text-muted)', fontSize: 15, marginBottom: 16}}>
                   Quỹ Bảo trợ trẻ em Việt Nam là tổ chức phi chính phủ, có chức năng vận động sự đóng góp tự nguyện của cơ quan, tổ chức, cá nhân ở trong nước và ngoài nước, viện trợ quốc tế để thực hiện các mục tiêu về trẻ em...
                </p>
                <p style={{lineHeight: 1.8, color: 'var(--text-muted)', fontSize: 15}}>
                   Sứ mệnh của chúng tôi là "Tận tâm, minh bạch, kịp thời và hiệu quả". Các khoản đóng góp sẽ được chuyển đến tận tay trẻ em có hoàn cảnh đặc biệt, trẻ em nghèo, trẻ em dân tộc thiểu số và trẻ em vùng sâu, vùng xa, vùng biên giới, hải đảo...
                </p>
             </div>
             
             <div className="pd-comments mt-60">
                <h3 className="mb-24" style={{fontSize: 22}}>Các dự án đang kêu gọi (2)</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px'}}>
                   <ProjectCard id={7} image="/assets/Visily-Export-to-Image-Image 117-2026-03-14.png" category="Giáo dục" location="Lai Châu" title="Cùng em đến trường - Xây trường Bản Hô" desc="Dự án xây 2 phòng học kiên cố cho học sinh điểm trường Bản Hô, huyện Nậm Nhùn." raised="120,000" target="350,000" percent={34} />
                   <ProjectCard id={8} image="/assets/Visily-Export-to-Image-Image 118-2026-03-14.png" category="Y tế" location="Toàn quốc" title="Chương trình Mổ tim nhân đạo" desc="Tài trợ chi phí phẫu thuật cho 50 trẻ em bị dị tật tim bẩm sinh có hoàn cảnh gia đình khó khăn." raised="250,500" target="500,000" percent={50} />
                </div>
             </div>
          </div>
          
          <div className="pd-sidebar">
             <div className="donate-card sticky">
                <h3 className="mb-24" style={{fontSize: 20, fontWeight: 500}}>Hoạt động tóm tắt</h3>
                
                <div className="d-stats mt-24 mb-32 text-center" style={{padding: '24px 0', borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea'}}>
                   <h2 style={{fontSize: 36, margin: 0, color: 'var(--primary)'}}>5.2M+</h2>
                   <p className="text-muted mt-8" style={{fontSize: 14, fontWeight: 500}}>USD đã nhận tài trợ</p>
                </div>

                <div className="d-flex mb-32" style={{justifyContent: 'space-between', textAlign: 'center'}}>
                   <div style={{flex: 1}}>
                      <h3 style={{fontSize: 24, margin: '0 0 4px 0'}}>214</h3>
                      <p className="text-muted" style={{fontSize: 12, margin: 0}}>Dự án<br/>đã hoàn thành</p>
                   </div>
                   <div style={{width: 1, backgroundColor: '#eaeaea'}}></div>
                   <div style={{flex: 1}}>
                      <h3 style={{fontSize: 24, margin: '0 0 4px 0'}}>12K+</h3>
                      <p className="text-muted" style={{fontSize: 12, margin: 0}}>Người<br/>đã đóng góp</p>
                   </div>
                </div>
                
                <div className="pd-actions d-flex flex-column gap-16 mb-40">
                   <button className="btn btn-primary w-100 pd-btn-h d-flex align-center justify-center gap-8" style={{fontSize: 16}}>
                     Ủng hộ quỹ
                   </button>
                   <button className="btn btn-outline w-100 pd-btn-h d-flex align-center justify-center gap-8" style={{fontSize: 16}}>
                     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     Liên hệ
                   </button>
                </div>
                
                <h4 className="mb-16" style={{fontSize: 16}}>Thông tin liên hệ</h4>
                <div className="bene-details d-flex flex-column gap-16 mt-16 pt-16 pb-16">
                   <div className="d-flex text-muted" style={{justifyContent: 'space-between', fontSize: 13}}>
                      <span>Website</span>
                      <a href="#qbt" style={{color: 'var(--primary)', textDecoration: 'none', fontWeight: 500}}>nfvc.org.vn</a>
                   </div>
                   <div className="d-flex text-muted" style={{justifyContent: 'space-between', fontSize: 13}}>
                      <span>Email</span>
                      <span style={{fontWeight: 500, color: '#333'}}>lienhe@nfvc.org</span>
                   </div>
                   <div className="d-flex text-muted" style={{justifyContent: 'space-between', fontSize: 13}}>
                      <span>Số điện thoại</span>
                      <span style={{fontWeight: 500, color: '#333'}}>(024) 3 8439959</span>
                   </div>
                   <div className="d-flex text-muted" style={{justifyContent: 'space-between', fontSize: 13}}>
                      <span>Ngày tham gia</span>
                      <span style={{fontWeight: 500, color: '#333'}}>23 Tháng 7, 2019</span>
                   </div>
                </div>

                <div className="d-card-footer mt-16 pt-16" style={{borderTop: '1px solid #eaeaea'}}>
                   <button className="btn w-100 text-muted" style={{fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                     <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" width="14" height="14" style={{marginRight: 6}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                     Báo cáo tài khoản này
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const RegisterPageLegacy = () => {
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

const LoginPageLegacy = () => {
  return (
    <div className="register-page">
      <div className="r-container">
        <div className="r-card">
          <div className="r-header text-center mb-32">
            <h2>Đăng nhập</h2>
            <p className="text-muted mt-8">Đăng nhập để tham gia và quản lý chiến dịch của bạn</p>
          </div>
          
          <form className="r-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group mb-24">
              <label>Email</label>
              <input type="email" placeholder="Nhập địa chỉ email" required />
            </div>

            <div className="form-group mb-16">
              <label>Mật khẩu</label>
              <input type="password" placeholder="Nhập mật khẩu" required />
            </div>

            <div className="text-right mb-24">
              <a href="#forgot" className="text-primary" style={{fontSize: 13, textDecoration: 'none', fontWeight: 500}}>Quên mật khẩu?</a>
            </div>

            <button type="submit" className="btn btn-primary w-100 pd-btn-h mb-24" style={{fontSize: 16}}>
              Đăng nhập
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

const HomePage = () => (
  <>
    <Hero />
    <ExploreProjects />
    <HowItWorks />
    <DisasterRecovery />
    <News />
  </>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectPage />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/beneficiary/:id" element={<BeneficiaryDetail />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
           <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
        <Newsletter />
        <Footer />
      </div>
    </Router>
  );
}


export default App;
