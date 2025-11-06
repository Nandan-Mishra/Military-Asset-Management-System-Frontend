import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Main layout component with sidebar navigation and role-based menu items
const Layout = ({ children }) => {
  const { user, logout, isAdmin, isBaseCommander, isLogisticsOfficer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handles user logout and redirects to login page
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Checks if the current route matches the given path for active styling
  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Military Assets</h2>
          <div className="user-info-container">
            {user?.role && (
              <div className="officer-image">
                {user.role === 'admin' ? (
                  <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="officer-admin">
                    {/* Peak Cap */}
                    <ellipse cx="50" cy="20" rx="32" ry="18" fill="#1a1a1a" />
                    <rect x="22" y="20" width="56" height="10" fill="#000" />
                    <path d="M 50 20 L 30 15 L 50 12 L 70 15 Z" fill="#DAA520" />
                    {/* Head */}
                    <circle cx="50" cy="52" r="20" fill="#d4a574" />
                    {/* Eyes */}
                    <circle cx="44" cy="49" r="2.5" fill="#1a1a1a" />
                    <circle cx="56" cy="49" r="2.5" fill="#1a1a1a" />
                    {/* Nose */}
                    <ellipse cx="50" cy="55" rx="1.5" ry="2.5" fill="#b8936a" />
                    {/* Mustache */}
                    <path d="M 43 58 Q 50 61 57 58" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    {/* Elaborate Uniform with Epaulettes */}
                    <rect x="32" y="72" width="36" height="40" fill="#1a2a1a" rx="4" />
                    <rect x="38" y="78" width="24" height="30" fill="#0a1a0a" />
                    {/* Epaulettes */}
                    <ellipse cx="25" cy="75" rx="10" ry="14" fill="#DAA520" />
                    <ellipse cx="75" cy="75" rx="10" ry="14" fill="#DAA520" />
                    <circle cx="25" cy="75" r="4" fill="#fff" />
                    <circle cx="75" cy="75" r="4" fill="#fff" />
                    {/* Multiple Stars Badge */}
                    <circle cx="50" cy="90" r="8" fill="#DAA520" />
                    <path d="M 50 82 L 52 86 L 56 86 L 53 89 L 54 93 L 50 90 L 46 93 L 47 89 L 44 86 L 48 86 Z" fill="#fff" />
                    <path d="M 50 88 L 52 92 L 56 92 L 53 95 L 54 99 L 50 96 L 46 99 L 47 95 L 44 92 L 48 92 Z" fill="#fff" />
                    <circle cx="50" cy="90" r="2" fill="#1a1a1a" />
                    {/* Medals */}
                    <circle cx="42" cy="100" r="3" fill="#DAA520" />
                    <circle cx="58" cy="100" r="3" fill="#DAA520" />
                  </svg>
                ) : user.role === 'base_commander' ? (
                  <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="officer-commander">
                    {/* Beret */}
                    <ellipse cx="50" cy="22" rx="38" ry="25" fill="#8B0000" />
                    <ellipse cx="50" cy="22" rx="28" ry="18" fill="#A00000" />
                    <circle cx="50" cy="22" r="12" fill="#1a1a1a" />
                    {/* Head */}
                    <circle cx="50" cy="52" r="20" fill="#d4a574" />
                    {/* Eyes */}
                    <circle cx="44" cy="49" r="2.5" fill="#1a1a1a" />
                    <circle cx="56" cy="49" r="2.5" fill="#1a1a1a" />
                    {/* Nose */}
                    <ellipse cx="50" cy="55" rx="1.5" ry="2.5" fill="#b8936a" />
                    {/* Mustache */}
                    <path d="M 43 58 Q 50 61 57 58" stroke="#1a1a1a" strokeWidth="2" fill="none" />
                    {/* Tactical Uniform */}
                    <rect x="35" y="72" width="30" height="40" fill="#2a4a2a" rx="3" />
                    <rect x="40" y="78" width="20" height="32" fill="#1a3a1a" />
                    {/* Shoulder Patches */}
                    <rect x="28" y="75" width="8" height="10" fill="#C8A84A" rx="2" />
                    <rect x="64" y="75" width="8" height="10" fill="#C8A84A" rx="2" />
                    {/* Single Star Badge */}
                    <circle cx="50" cy="92" r="7" fill="#C8A84A" />
                    <path d="M 50 85 L 52 89 L 56 89 L 53 92 L 54 96 L 50 93 L 46 96 L 47 92 L 44 89 L 48 89 Z" fill="#fff" />
                    {/* Tactical Belt */}
                    <rect x="32" y="105" width="36" height="5" fill="#1a1a1a" rx="2" />
                    <circle cx="50" cy="107.5" r="2" fill="#C8A84A" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="officer-logistics">
                    {/* Service Cap */}
                    <ellipse cx="50" cy="24" rx="34" ry="19" fill="#2a2a2a" />
                    <rect x="24" y="24" width="52" height="9" fill="#1a1a1a" />
                    <path d="M 24 24 L 24 33 L 76 33 L 76 24 Z" fill="#3a3a3a" />
                    {/* Head */}
                    <circle cx="50" cy="52" r="20" fill="#d4a574" />
                    {/* Eyes */}
                    <circle cx="44" cy="49" r="2.5" fill="#1a1a1a" />
                    <circle cx="56" cy="49" r="2.5" fill="#1a1a1a" />
                    {/* Glasses */}
                    <rect x="38" y="47" width="12" height="6" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
                    <rect x="50" y="47" width="12" height="6" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
                    <line x1="50" y1="50" x2="50" y2="50" stroke="#1a1a1a" strokeWidth="1.5" />
                    {/* Nose */}
                    <ellipse cx="50" cy="55" rx="1.5" ry="2.5" fill="#b8936a" />
                    {/* Simple Uniform */}
                    <rect x="36" y="72" width="28" height="40" fill="#3a4a3a" rx="3" />
                    <rect x="40" y="78" width="20" height="30" fill="#2a3a2a" />
                    {/* Simple Badge */}
                    <circle cx="50" cy="92" r="5" fill="#8B6914" />
                    <circle cx="50" cy="92" r="3" fill="#fff" />
                    {/* Clipboard in hand */}
                    <rect x="68" y="80" width="8" height="12" fill="#f5f5f5" rx="1" />
                    <line x1="70" y1="82" x2="74" y2="82" stroke="#1a1a1a" strokeWidth="0.5" />
                    <line x1="70" y1="85" x2="74" y2="85" stroke="#1a1a1a" strokeWidth="0.5" />
                    <line x1="70" y1="88" x2="74" y2="88" stroke="#1a1a1a" strokeWidth="0.5" />
                    <circle cx="72" cy="90" r="1" fill="#1a1a1a" />
                  </svg>
                )}
              </div>
            )}
            <p className="user-info">
              {user?.fullName} ({user?.role?.replace('_', ' ')})
            </p>
          </div>
        </div>

        <ul className="nav-menu">
          <li>
            <Link
              to="/dashboard"
              className={isActive('/dashboard') ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>

          {(isAdmin() || isBaseCommander() || isLogisticsOfficer()) && (
            <li>
              <Link
                to="/purchases"
                className={isActive('/purchases') ? 'active' : ''}
              >
                Purchases
              </Link>
            </li>
          )}

          {(isAdmin() || isBaseCommander()) && (
            <li>
              <Link
                to="/transfers"
                className={isActive('/transfers') ? 'active' : ''}
              >
                Transfers
              </Link>
            </li>
          )}

          {(isAdmin() || isBaseCommander()) && (
            <li>
              <Link
                to="/assignments"
                className={isActive('/assignments') ? 'active' : ''}
              >
                Assignments & Expenditures
              </Link>
            </li>
          )}

          {isAdmin() && (
            <li>
              <Link
                to="/bases"
                className={isActive('/bases') ? 'active' : ''}
              >
                Bases Management
              </Link>
            </li>
          )}
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

