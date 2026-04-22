import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import OnchainHistoryTable from '../components/OnchainHistoryTable';

const ProjectDetail = () => {
  const { id } = useParams();
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

       <OnchainHistoryTable campaignId={id} />

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

export default ProjectDetail;
