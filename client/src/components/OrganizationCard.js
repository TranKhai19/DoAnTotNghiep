import React from 'react';
import { Link } from 'react-router-dom';

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

export default OrganizationCard;
