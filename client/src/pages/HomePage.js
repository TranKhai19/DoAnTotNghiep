import React from 'react';

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

const HomePage = () => (
  <>
    <Hero />
    <ExploreProjects />
    <HowItWorks />
    <DisasterRecovery />
    <News />
  </>
);

export default HomePage;
