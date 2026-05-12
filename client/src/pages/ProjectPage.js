import React, { useState, useEffect } from 'react';
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
   const [projects, setProjects] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchProjects = async () => {
       try {
         const res = await fetch('http://localhost:3000/api/campaigns?status=active');
         const data = await res.json();
         if (data.success) {
           setProjects(data.data);
         }
       } catch (error) {
         console.error('Error fetching campaigns:', error);
       } finally {
         setLoading(false);
       }
     };
     fetchProjects();
   }, []);

   const categories = ["Bảo vệ trẻ em", "Thiên tai", "Giáo dục", "Hành động khí hậu", "Năng lực", "Sức khỏe", "An ninh lương thực", "Động vật", "Hệ sinh thái", "Văn hóa", "Cộng đồng", "Thể thao"];

   if (loading) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Đang tải danh sách chiến dịch...</div>;

   return (
       <div className="project-page">
           <ProjectHero />
           
           <section className="container section-spacing pt-0">
               <h2 className="section-title text-left mb-32">Dự án đang quyên góp</h2>
               <div className="p-grid-3">
                   {projects.length > 0 ? (
                     projects.map((p) => (
                       <ProjectCard 
                        key={p.id} 
                        id={p.id}
                        image={p.image_url || "/assets/placeholder-project.png"} 
                        category={p.category_name || "Cộng đồng"} 
                        location="Việt Nam" 
                        title={p.title} 
                        desc={p.description} 
                        raised={p.raised_amount?.toLocaleString()} 
                        target={p.goal_amount?.toLocaleString()} 
                        percent={Math.round((p.raised_amount / p.goal_amount) * 100)} 
                       />
                     ))
                   ) : (
                     <div className="col-span-3 text-center py-40 text-muted">
                        Hiện chưa có chiến dịch nào đang diễn ra.
                     </div>
                   )}
               </div>
           </section>

           <section className="container section-spacing text-center">
               <h2 className="section-title mb-40">Duyệt trang theo danh mục</h2>
               <div className="cat-grid">
                   {categories.map((c, i) => <CategoryIcon key={i} label={c} />)}
               </div>
           </section>
       </div>
   );
};

export default ProjectPage;
