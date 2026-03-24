import React from 'react';
import OrganizationCard from '../components/OrganizationCard';

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

export default OrganizationsPage;
