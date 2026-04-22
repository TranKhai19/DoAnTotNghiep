import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', background: '#ffebee', border: '1px solid #f44336', borderRadius: 8, padding: 32 }}>
              <h2 style={{ color: '#d32f2f', marginBottom: 16 }}>Đã có lỗi không mong muốn xảy ra.</h2>
              <p style={{ color: '#7f0000', marginBottom: 24 }}>
                Ứng dụng gặp sự cố trong quá trình chạy. Vui lòng tải lại trang hoặc liên hệ quản trị viên.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Tải lại trang
              </button>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div style={{ marginTop: 32, textAlign: 'left', background: '#fff', padding: 16, borderRadius: 4, overflowX: 'auto', border: '1px solid #ffcdd2' }}>
                    <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>{this.state.error.toString()}</p>
                    <pre style={{ fontSize: 12, color: '#666', margin: 0 }}>
                        {this.state.errorInfo?.componentStack}
                    </pre>
                </div>
              )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
