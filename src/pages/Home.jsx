import { useNavigate } from 'react-router-dom';

// Landing page component with hero section and navigation to login/register
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-background">
        <div className="home-overlay"></div>
        <div className="military-pattern"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="home-content">
        <div className="home-hero">
          <div className="hero-badge">
            <span>⚡ OPERATIONAL EXCELLENCE</span>
          </div>
          <div className="home-logo">
            <div className="logo-icon">
              <div className="logo-glow"></div>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10L60 35H85L70 50L80 75L50 60L20 75L30 50L15 35H40L50 10Z" fill="#DAA520"/>
                <circle cx="50" cy="50" r="30" stroke="#DAA520" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h1 className="home-title">
              <span className="title-main">MILITARY</span>
              <span className="title-accent">ASSET</span>
            </h1>
            <h2 className="home-subtitle">MANAGEMENT SYSTEM</h2>
            <div className="home-divider">
              <div className="divider-line"></div>
              <div className="divider-diamond"></div>
              <div className="divider-line"></div>
            </div>
            <p className="home-description">
              <span className="description-highlight">Comprehensive solution</span> for tracking, managing, and optimizing military assets
              across multiple bases with <span className="description-highlight">complete transparency</span> and <span className="description-highlight">accountability</span>.
            </p>
          </div>
        </div>

        <div className="home-actions">
          <button 
            className="home-btn home-btn-primary"
            onClick={() => navigate('/login?mode=register')}
          >
            <span>REGISTER</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="home-btn home-btn-secondary"
            onClick={() => navigate('/login?mode=login')}
          >
            <span>LOGIN</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Dashboard</h3>
            <p>Real-time metrics and analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Purchases</h3>
            <p>Track asset acquisitions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Transfers</h3>
            <p>Manage inter-base movements</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Assignments</h3>
            <p>Track personnel assignments</p>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="key-features-section">
          <h3 className="section-title">Key Features</h3>
          <div className="key-features-grid">
            <div className="key-feature-item">
              <div className="key-feature-icon">🔒</div>
              <h4>Role-Based Access</h4>
              <p>Admin, Base Commander, and Logistics Officer roles with appropriate permissions</p>
            </div>
            <div className="key-feature-item">
              <div className="key-feature-icon">📈</div>
              <h4>Real-Time Analytics</h4>
              <p>Track opening balances, closing balances, and net movements instantly</p>
            </div>
            <div className="key-feature-item">
              <div className="key-feature-icon">📋</div>
              <h4>Complete Audit Trail</h4>
              <p>Every transaction is logged for comprehensive accountability</p>
            </div>
            <div className="key-feature-item">
              <div className="key-feature-icon">🌐</div>
              <h4>Multi-Base Support</h4>
              <p>Manage assets across multiple military bases seamlessly</p>
            </div>
          </div>
        </div>

        {/* Asset Types Showcase */}
        <div className="asset-types-section">
          <h3 className="section-title">Asset Types We Manage</h3>
          <div className="asset-types-grid">
            <div className="asset-type-card">
              <div className="asset-icon-wrapper">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="30" y="40" width="40" height="15" fill="#556B2F" stroke="#DAA520" strokeWidth="2"/>
                  <rect x="40" y="25" width="20" height="20" fill="#3D4A2A" stroke="#DAA520" strokeWidth="2"/>
                  <line x1="50" y1="20" x2="50" y2="25" stroke="#DAA520" strokeWidth="3"/>
                  <line x1="45" y1="55" x2="45" y2="65" stroke="#DAA520" strokeWidth="2"/>
                  <line x1="55" y1="55" x2="55" y2="65" stroke="#DAA520" strokeWidth="2"/>
                </svg>
              </div>
              <h4>Weapons</h4>
            </div>
            <div className="asset-type-card">
              <div className="asset-icon-wrapper">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="50" width="60" height="30" rx="5" fill="#556B2F" stroke="#DAA520" strokeWidth="2"/>
                  <circle cx="25" cy="75" r="8" fill="#3D4A2A"/>
                  <circle cx="75" cy="75" r="8" fill="#3D4A2A"/>
                  <rect x="35" y="35" width="30" height="20" rx="3" fill="#8B6914" stroke="#DAA520" strokeWidth="2"/>
                  <line x1="50" y1="30" x2="50" y2="25" stroke="#DAA520" strokeWidth="3"/>
                </svg>
              </div>
              <h4>Vehicles</h4>
            </div>
            <div className="asset-type-card">
              <div className="asset-icon-wrapper">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="25" fill="#556B2F" stroke="#DAA520" strokeWidth="3"/>
                  <circle cx="50" cy="50" r="15" fill="#3D4A2A"/>
                  <path d="M50 25 L50 35 M50 65 L50 75 M25 50 L35 50 M65 50 L75 50" stroke="#DAA520" strokeWidth="2"/>
                </svg>
              </div>
              <h4>Ammunition</h4>
            </div>
            <div className="asset-type-card">
              <div className="asset-icon-wrapper">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="30" y="30" width="40" height="40" rx="5" fill="#556B2F" stroke="#DAA520" strokeWidth="2"/>
                  <rect x="35" y="35" width="30" height="30" fill="#3D4A2A"/>
                  <line x1="50" y1="35" x2="50" y2="65" stroke="#DAA520" strokeWidth="2"/>
                  <line x1="35" y1="50" x2="65" y2="50" stroke="#DAA520" strokeWidth="2"/>
                </svg>
              </div>
              <h4>Equipment</h4>
            </div>
          </div>
        </div>

        <div className="home-footer">
          <p>Secure • Reliable • Efficient • Military-Grade</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
