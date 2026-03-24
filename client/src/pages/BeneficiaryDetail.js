import React from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';

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

export default BeneficiaryDetail;
