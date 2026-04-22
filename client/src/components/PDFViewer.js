import React from 'react';

const PDFViewer = ({ url, width = '100%', height = '400px' }) => {
  if (!url) return null;

  // Simple check for PDF based on url extension or query params
  const isPDF = url.toLowerCase().includes('.pdf');

  return (
    <div style={{ width, height, border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
      {isPDF ? (
        <iframe 
          title="PDF / Document Viewer"
          src={`${url}#toolbar=0`} 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' }}>
          <img 
            src={url} 
            alt="Document preview" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
