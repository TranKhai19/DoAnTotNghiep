import React from 'react';
import ProjectCard from '../components/ProjectCard';

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

export default ProjectPage;
