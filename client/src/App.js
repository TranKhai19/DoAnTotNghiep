import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
        Project <span className="arrow">▼</span>
      </Link>
      <a href="#how-it-works">How it works</a>
      <a href="#about-us">About us</a>
      <a href="#faqs">FAQs</a>
    </nav>

    <div className="header-actions">
      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search" />
      </div>
      <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Sign up</Link>
      <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Sign in</Link>
    </div>
  </header>
);

const Hero = () => (
  <section className="hero container">
    <div className="hero-content">
      <h1>Make changes and<br/>help the world</h1>
      <p style={{ maxWidth: '480px' }}>Hope for Tomorrow non-profit organization that collaborates with volunteers to deliver humanitarian aid and disaster relief to vulnerable communities.</p>
      <div className="hero-buttons">
        <button className="btn btn-primary lg">Donate now!</button>
        <button className="btn btn-outline lg">Learn more</button>
      </div>
    </div>
    <div className="hero-visuals">
      <div className="blob-bg"></div>
      <img src="/assets/Visily-Export-to-Image-Image 120-2026-03-14.png" alt="Wheelchair character" className="hero-char-left" />
      <div className="hero-cards">
        <div className="hero-card">
          <img src="/assets/Visily-Export-to-Image-Image 117-2026-03-14.png" alt="Educate" />
          <div className="card-info">
            <h4>Educate 500 Orphans in Syria</h4>
            <div className="progress-bar"><div className="progress" style={{width: '60%'}}></div></div>
            <div className="card-footer">
              <span>Education</span>
              <a href="#more">View more</a>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <img src="/assets/Visily-Export-to-Image-Image 118-2026-03-14.png" alt="Medical" />
          <div className="card-info">
            <h4>Provide Urgent Medical Attention</h4>
            <div className="progress-bar"><div className="progress" style={{width: '85%'}}></div></div>
            <div className="card-footer">
              <span>Physical Health</span>
              <a href="#more">View more</a>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <img src="/assets/Visily-Export-to-Image-Image 119-2026-03-14.png" alt="Food" />
          <div className="card-info">
            <h4>Nourishing Hope: Serving Food</h4>
            <div className="progress-bar"><div className="progress" style={{width: '40%'}}></div></div>
            <div className="card-footer">
              <span>Food Security</span>
              <a href="#more">View more</a>
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
    "Featured", "Nearly Funded", "Child Protection", "Disaster Response", "Education", "Climate Action",
    "Gender Equality", "Physical Health", "Food Security", "Animal Welfare", "Ecosystem Restoration", "See All >"
  ];
  return (
    <section className="explore container">
      <div className="explore-wrapper">
        <span className="explore-label">Explore project:</span>
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
          <h2>How it works</h2>
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
            <h2 className="stat-val text-cyan">21</h2><span className="stat-label">Years</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">$877M</h2><span className="stat-label">Dollars</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">1,793,907</h2><span className="stat-label">Donors</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">35,706</h2><span className="stat-label">Projects</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">175+</h2><span className="stat-label">Countries</span>
          </div>
          <div className="stat">
            <h2 className="stat-val text-cyan">580</h2><span className="stat-label">Companies</span>
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
      <h2 style={{ marginBottom: '16px' }}>Disaster Recovery</h2>
      <p style={{ maxWidth: '380px' }}>Hope for Tomorrow makes it easy to donate to reliable, locally-led disaster relief and recovery efforts around the world.</p>
      <div className="hero-buttons">
        <button className="btn btn-primary lg">Donate now!</button>
        <button className="btn btn-outline lg">Learn more</button>
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
      date: "Nov 12",
      title: "Meet The Community Voices Fellows",
      desc: "Elit id aliqup in idicudunt fugital proident excepteur magna tempor. Laborum et onim ad magnus do is magna in id.",
      link: "#"
    },
    {
      img: "/assets/Visily-Export-to-Image-Image 140-2026-03-14.png",
      date: "Nov 08",
      title: "Earthquakes Struck The Heart of The World's Largest",
      desc: "In ut ex ut est on ipsu aliqup veniam id eiusmod onim ut ex labore id nisi tempor. Ut min do fugiat",
      link: "#"
    },
    {
      img: "/assets/Visily-Export-to-Image-Image 141-2026-03-14.png",
      date: "Nov 04",
      title: "Take 10 for privacy and mental health",
      desc: "In ex liborum est on idc denari en in do veniam aliquip excepteur ipsu non. Minin magna eu ut eu voluptate.",
      link: "#"
    },
    {
      img: "/assets/Visily-Export-to-Image-Image 139-2026-03-14.png",
      date: "Nov 02",
      title: "How to help Turkey, Syria: Relief efforts ongoing after earthquakes",
      desc: "Occaecat ullam incididunt enim fugital nostrud nostr...",
      link: "#"
    }
  ];

  return (
    <section className="news-section">
      <div className="container">
        <h2 className="text-center section-title">News</h2>
        <div className="news-grid">
          {articles.map((article, i) => (
            <div key={i} className="news-card">
              <img src={article.img} alt={article.title} />
              <div className="news-content">
                <span className="news-date">{article.date}</span>
                <h4>{article.title}</h4>
                <p>{article.desc}</p>
                <div className="news-footer">
                  <a href={article.link}>Read more</a>
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
         <h2>Get incredible stories, promotions, <br/>& offers in your inbox</h2>
         <div className="input-group">
            <input type="email" placeholder="youremail@example.com" />
            <button className="btn btn-primary">Subscribe</button>
         </div>
      </div>
   </section>
);

const ProjectHero = () => (
  <section className="project-hero container">
    <div className="ph-content">
      <h1>People around the world are raising money for their passionation</h1>
    </div>
    <div className="ph-illustration">
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="120" cy="120" r="120" fill="#f0edf9"/>
        <path d="M120 40c44 0 80 36 80 80s-36 80-80 80-80-36-80-80 36-80 80-80z" fill="#3b2397" opacity="0.1"/>
        <text x="120" y="125" textAnchor="middle" fill="#3b2397" fontSize="24" fontWeight="bold">Illustration</text>
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
          <strong>${raised} raised</strong> of ${target} goal
        </div>
      </div>
    </div>
  </Link>
);

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
      { img: "/assets/Visily-Export-to-Image-Image 138-2026-03-14.png", cat: "Education", loc: "Syria", title: "Educate for 500 Orphans in Syria", desc: "Laborum elit id aliquip in id deserunt fugiat proident ex anim labore id magna anim magna irure id.", raised: "2,460", target: "5,750", percent: 42 },
      { img: "/assets/Visily-Export-to-Image-Image 140-2026-03-14.png", cat: "Education", loc: "Haiti", title: "Educate a Girl. Educate a Nation - Sierra Leone", desc: "Magna do ut eiusmod in veniam anim qui ut aliquip aute voluptate magna anim dolore ullamco do irure.", raised: "3,400", target: "7,500", percent: 45 },
      { img: "/assets/Visily-Export-to-Image-Image 141-2026-03-14.png", cat: "Food Security", loc: "USA", title: "Nourishing Hope: Serving Food for the Hunger", desc: "Elit duis ullamco commodo ad laboris dolor dolore proident. Ad in veniam enim excepteur enim aute adipisicing duis.", raised: "2,150", target: "5,000", percent: 43 },
      { img: "/assets/Visily-Export-to-Image-Image 120-2026-03-14.png", cat: "Disaster Response", loc: "Morocco", title: "Support High Atlas community earthquake", desc: "Eiusmod veniam sit commodo id ad dolor qui proident quis amet veniam exercitation.", raised: "1,050", target: "6,000", percent: 17 },
      { img: "/assets/Visily-Export-to-Image-Image 118-2026-03-14.png", cat: "Disaster Response", loc: "Morocco", title: "Earthquake Relief for Moroccan Communities", desc: "Aute do ut et laborum esse nisi incididunt aute est commodo dolore ut in eu cillum ut ex tempor in.", raised: "1,450", target: "4,200", percent: 34 },
      { img: "/assets/Visily-Export-to-Image-Image 119-2026-03-14.png", cat: "Education", loc: "Uganda", title: "Empower a Girl for Self-Reliance", desc: "Cupidatat ea ea occaecat elit in elit ex consectetur do esse enim quis labore ex cillum deserunt nostrud in adipisicing eiusmod.", raised: "2,100", target: "4,500", percent: 46 }
   ];

   const categories = ["Child Protection", "Disaster", "Education", "Climate Action", "Capacity", "Health", "Food Security", "Animal", "Ecosystem", "Culture", "Community", "Sport"];

   return (
       <div className="project-page">
           <ProjectHero />
           
           <section className="container section-spacing pt-0">
               <h2 className="section-title text-left mb-32">Top Projects</h2>
               <div className="p-grid-3">
                   {topProjects.map((p, i) => <ProjectCard key={i} image={p.img} category={p.cat} location={p.loc} title={p.title} desc={p.desc} raised={p.raised} target={p.target} percent={p.percent} />)}
               </div>
           </section>

           <section className="container section-spacing text-center">
               <h2 className="section-title mb-40">Browse fundraisers by category</h2>
               <div className="cat-grid">
                   {categories.map((c, i) => <CategoryIcon key={i} label={c} />)}
               </div>
           </section>

           <section className="container section-spacing">
               <div className="section-header-row mb-32">
                   <h2 className="section-title text-left m-0">Education</h2>
                   <a href="#more" className="view-more">View more</a>
               </div>
               <div className="p-grid-3">
                   {topProjects.slice(0, 3).map((p, i) => <ProjectCard key={i} {...p} />)}
               </div>
           </section>

           <section className="container section-spacing">
               <div className="section-header-row mb-32">
                   <h2 className="section-title text-left m-0">Food Security</h2>
                   <a href="#more" className="view-more">View more</a>
               </div>
               <div className="p-grid-3">
                   {topProjects.slice(2, 5).map((p, i) => <ProjectCard key={i} {...p} />)}
               </div>
           </section>

           <section className="container section-spacing pb-60">
               <div className="section-header-row mb-32">
                   <h2 className="section-title text-left m-0">Climate Action</h2>
                   <a href="#more" className="view-more">View more</a>
               </div>
               <div className="p-grid-3">
                   <ProjectCard {...topProjects[5]} />
                   <ProjectCard {...topProjects[4]} />
                   <ProjectCard {...topProjects[3]} />
               </div>
               <div className="text-center" style={{ marginTop: '40px' }}>
                   <button className="btn cat-btn">Show more category</button>
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
          <li><a href="#1">Project</a></li>
          <li><a href="#2">How it works</a></li>
          <li><a href="#3">Who we help</a></li>
          <li><a href="#4">Get involved</a></li>
        </ul>
        <ul>
          <li><a href="#5">About us</a></li>
          <li><a href="#6">Vacancies</a></li>
          <li><a href="#7">FAQs</a></li>
          <li><a href="#8">Contact</a></li>
        </ul>
        <ul>
          <li><a href="#9">Privacy</a></li>
          <li><a href="#10">Terms</a></li>
          <li><a href="#11">Sitemap</a></li>
          <li><span className="text-muted">© 2023 Brand, Inc</span></li>
        </ul>
      </div>
      <div className="footer-actions">
         <button className="btn btn-outline-white">Help Center</button>
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
       <div className="breadcrumb mb-32"><Link to="/projects">← Back Projects</Link></div>
       
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
                <h2 style={{fontSize: 28, marginBottom: 24}}>Empower a Girl: For Self-Reliance</h2>
                <p style={{lineHeight: 1.8, color: 'var(--text-muted)'}}>Pariatur commodo non dolor est aliqua irure eiusmod nisi qui officia proident Lorem sit qui sint ullamco Lorem tempor. Ullamco nisi enim ipsum nulla reprehenderit incididunt ad voluptate voluptate. Quis sit enim duis exercitation culpa ex adipisicing occaecat laboris dolore ex minim. Pariatur aliqua deserunt eu et ea enim occaecat est cupidatat anim do laboris veniam non aute reprehenderit cupidatat culpa in. Non ex duis pariatur elit esse incididunt veniam adipisicing ut. Aliquip et culpa do ipsum esse incididunt Lorem ex. Irure quis et labore magna tempor qui exercitation mollit minim deseru</p>
                <div className="pd-actions d-flex gap-24 mt-40">
                   <button className="btn btn-outline lg flex-1 pd-btn-h">Share</button>
                   <button className="btn btn-primary lg flex-1 pd-btn-h">Donate now!</button>
                </div>
             </div>
             
             <div className="pd-comments mt-60">
                <h3 className="mb-8" style={{fontSize: 24}}>Words of support (27)</h3>
                <p className="text-muted mb-32" style={{fontSize: 14}}>Let's donate in order to share words of support.</p>
                
                <div className="comment-list d-flex flex-column gap-16">
                   <div className="comment-item">
                      <div className="comment-avatar">
                         <img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar" />
                      </div>
                      <div className="comment-body">
                         <div className="c-header d-flex align-center gap-16 mb-8">
                            <strong style={{fontSize: 14}}>Natalia Lopez</strong>
                            <div className="c-meta text-muted" style={{fontSize: 12}}><span className="c-amount fw-600 mr-8">$100</span><span className="c-time">4d</span></div>
                         </div>
                         <p className="text-muted m-0" style={{fontSize: 13, lineHeight: 1.5}}>Nulla laboris fugiat fugiat minim minim excepteur eiusmod quis. Laborum est minim id cillum nostrud cillum consectetur 😍😍😍</p>
                      </div>
                   </div>
                   <div className="comment-item">
                      <div className="comment-avatar">
                         <img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar" />
                      </div>
                      <div className="comment-body">
                         <div className="c-header d-flex align-center gap-16 mb-8">
                            <strong style={{fontSize: 14}}>Sarah Lopez</strong>
                            <div className="c-meta text-muted" style={{fontSize: 12}}><span className="c-amount fw-600 mr-8">$50</span><span className="c-time">7d</span></div>
                         </div>
                         <p className="text-muted m-0" style={{fontSize: 13, lineHeight: 1.5}}>Quis veniam consectetur ea occaecat qui commodo ut cupidatat irure labore qui consectetur duis veniam magna cillum</p>
                      </div>
                   </div>
                   <div className="comment-item">
                      <div className="comment-avatar">
                         <img src="/assets/Visily-Export-to-Image-Image 110-2026-03-17.png" alt="Avatar" />
                      </div>
                      <div className="comment-body">
                         <div className="c-header d-flex align-center gap-16 mb-8">
                            <strong style={{fontSize: 14}}>Hailey Adams</strong>
                            <div className="c-meta text-muted" style={{fontSize: 12}}><span className="c-amount fw-600 mr-8">$20</span><span className="c-time">9d</span></div>
                         </div>
                         <p className="text-muted m-0" style={{fontSize: 13, lineHeight: 1.5}}>Ut reprehenderit excepteur reprehenderit aute eiusmod ullamco. Ullamco nisi excepteur dolore conse</p>
                      </div>
                   </div>
                </div>
                <button className="btn btn-outline mt-32 px-32">Show more</button>
             </div>
          </div>
          
          <div className="pd-sidebar">
             <div className="donate-card sticky">
                <div className="tags mb-24"><span className="tag active" style={{fontSize: 11, padding: '4px 12px'}}>Education</span><span className="tag" style={{fontSize: 11, padding: '4px 12px'}}>Uganda</span></div>
                <h3 className="mb-24" style={{fontSize: 22, fontWeight: 500}}>Empower a Girl: For Self-Reliance</h3>
                <div className="d-stats d-flex align-baseline gap-8 mt-24">
                   <h2 style={{fontSize: 36, m: 0}}>$82,567</h2> <span className="text-muted" style={{fontSize: 12, fontWeight: 500}}>USD raised of $100,000 goal</span>
                </div>
                <div className="p-card-progress mt-16 mb-8">
                  <div className="p-progress" style={{ width: '82%', backgroundColor: '#00e5c9' }}></div>
                </div>
                <p className="text-muted mt-8 mb-32" style={{fontSize: 13}}>1.1K donations</p>
                
                <div className="pd-actions d-flex gap-16 mb-40">
                   <button className="btn btn-outline flex-1 pd-btn-h">Share</button>
                   <button className="btn btn-primary flex-1 pd-btn-h">Donate now!</button>
                </div>
                
                <div className="recent-donations d-flex flex-column gap-24">
                   {[
                     {name: "William Davis", amt: "$20", time: "4d"},
                     {name: "Paula Martinez", amt: "$10", time: "4d"},
                     {name: "John Smith", amt: "$50", time: "4d"},
                     {name: "Elisabeth Watson", amt: "$100", time: "4d"}
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
                   <button className="btn btn-outline flex-1">See all</button>
                   <button className="btn btn-outline flex-1 d-flex align-center gap-8 justify-center">
                     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> 
                     See top donations
                   </button>
                </div>
             </div>
          </div>
       </div>

       <div className="related-projects mt-80 pt-40" style={{borderTop: '2px solid var(--primary)'}}>
           <div className="section-header-row mb-32 mt-40">
               <h2 className="section-title text-left m-0" style={{fontSize: 28}}>Related projects</h2>
               <a href="#more" className="view-more">View more</a>
           </div>
           <div className="p-grid-3">
               <ProjectCard id={2} image="/assets/Visily-Export-to-Image-Image 138-2026-03-14.png" category="Education" location="Sierra Leone" title="Educate the Future Leaders of Sierra Leone" desc="Id quis ex tempor veniam laborum minim ea officia duis cillum elit. Do irure consectetur duis" raised="52,210" target="115,000" percent={45} />
               <ProjectCard id={3} image="/assets/Visily-Export-to-Image-Image 140-2026-03-14.png" category="Education" location="Thailand" title="Prevent Child Trafficking Through Education" desc="Culpa irure pariatur id enim in eiusmod irure aute aliquip. Laboris consectetur ut esse ipsum" raised="15,445" target="500,000" percent={3} />
               <ProjectCard id={4} image="/assets/Visily-Export-to-Image-Image 141-2026-03-14.png" category="Education" location="Peru" title="Protect 300 girls from Child domestic work in Peru" desc="Cillum voluptate est ea cupidatat dolore voluptate. Deserunt consectetur cillum culpa. Lo" raised="52,567" target="145,000" percent={36} />
           </div>
       </div>
    </div>
  );
};

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

const LoginPage = () => {
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
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <Newsletter />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
