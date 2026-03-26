import React from 'react';
import { Link } from 'react-router-dom';

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

export default ProjectCard;
