import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { basesAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin',
    username: '',
    fullName: '',
    baseId: '',
  });
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Validates password strength with uppercase, lowercase, number, and special character requirements
  const isStrongPassword = (pw) => {
    // At least 8 chars, one uppercase, one lowercase, one number, one special
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
  };
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsRegister(true);
      setError('');
      setSuccess('');
    } else if (mode === 'login') {
      setIsRegister(false);
      setError('');
      setSuccess('');
    }
  }, [searchParams]);

  useEffect(() => {
    // Load bases when role is base commander (both login and register)
    if (formData.role === 'base commander') {
      loadBases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role]);

  // Fetches available bases for base commander role selection
  const loadBases = async () => {
    try {
      const response = await basesAPI.getAll();
      setBases(response.data.data);
    } catch (err) {
      console.error('Failed to load bases:', err);
    }
  };

  // Handles form submission for both login and registration with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Enforce strong password for registration
    if (isRegister && !isStrongPassword(formData.password)) {
      setLoading(false);
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }

    // Only send baseId if registering (not logging in)
    const baseIdToSend = isRegister ? (formData.baseId || undefined) : undefined;

    const result = await login(
      formData.email,
      formData.password,
      formData.role,
      isRegister ? (formData.username || formData.email.split('@')[0]) : undefined,
      isRegister ? (formData.fullName || 'New User') : undefined,
      baseIdToSend
    );

    setLoading(false);

    if (result.success) {
      if (isRegister) {
        // Only show success on explicit registration
        setSuccess('Registration successful. You can now log in.');
        // Switch UI to login mode and clear sensitive fields
        setIsRegister(false);
        setFormData((prev) => ({
          ...prev,
          password: '',
          username: '',
          fullName: ''
        }));
      } else if (result.mode === 'register') {
        // Login attempted but backend created a new user – treat as error
        setError('User does not exist.');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  const handleRoleChange = (newRole) => {
    setFormData({ ...formData, role: newRole, baseId: '' });
    if (newRole === 'base commander') {
      loadBases();
    }
  };

  const handleRegisterToggle = (value) => {
    setIsRegister(value);
    setError('');
    setSuccess('');
    if (formData.role === 'base commander') {
      loadBases();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button 
          className="back-to-home-btn"
          onClick={() => navigate('/home')}
          title="Back to Home"
        >
          ← Back to Home
        </button>
        <h2>Military Asset Management</h2>
        <h3>{isRegister ? 'Register' : 'Login'}</h3>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message" style={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            color: '#2e7d32',
            padding: '12px 15px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '2px solid #c8e6c9',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {isRegister && formData.password && !isStrongPassword(formData.password) && (
              <small style={{ display: 'block', marginTop: '8px', color: '#b71c1c' }}>
                Use 8+ chars with upper, lower, number, and special character.
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="base commander">Base Commander</option>
              <option value="logistics officer">Logistics Officer</option>
            </select>
          </div>

          {/* Base selection for Base Commander - shown in both login and register */}
          {formData.role === 'base commander' && (
            <div className={`form-group base-selection-group ${isRegister ? 'required' : 'optional'}`}>
              <label>Select Base {isRegister && '*'}</label>
              <select
                value={formData.baseId}
                onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                required={isRegister}
                className={formData.baseId ? 'base-selected' : ''}
              >
                <option value="">-- Select a base --</option>
                {bases.length === 0 ? (
                  <option value="" disabled>Loading bases...</option>
                ) : (
                  bases.map((base) => (
                    <option key={base._id} value={base._id}>
                      {base.name} ({base.code}) - {base.location}
                    </option>
                  ))
                )}
              </select>
              {!isRegister && (
                <small style={{ color: '#7f8c8d', display: 'block', marginTop: '8px', fontStyle: 'italic' }}>
                  Optional: Select your base for reference
                </small>
              )}
              {bases.length === 0 && (
                <small className="base-warning">
                  ⚠️ No bases available. Please create a base first or contact administrator.
                </small>
              )}
              {formData.baseId && bases.length > 0 && isRegister && (
                <small className="base-success">
                  ✓ Base selected successfully
                </small>
              )}
            </div>
          )}

          {isRegister && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Auto-generated from email if empty"
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="toggle-auth">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => handleRegisterToggle(false)}>
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button type="button" onClick={() => handleRegisterToggle(true)}>
                Register
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;

