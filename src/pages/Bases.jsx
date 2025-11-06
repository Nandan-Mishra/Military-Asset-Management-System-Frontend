import { useState, useEffect } from 'react';
import { basesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Component for managing military bases with create and delete functionality for admins
const Bases = () => {
  const { isAdmin } = useAuth();
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
  });

  useEffect(() => {
    loadBases();
  }, []);

  // Fetches all base records from the API
  const loadBases = async () => {
    setLoading(true);
    try {
      const response = await basesAPI.getAll();
      setBases(response.data.data || []);
    } catch (error) {
      console.error('Failed to load bases:', error);
    } finally {
      setLoading(false);
    }
  };

  // Creates a new base record with name, code, and location
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await basesAPI.create(formData);
      setShowForm(false);
      setFormData({ name: '', code: '', location: '' });
      loadBases();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create base');
    }
  };

  // Deletes a base record after user confirmation
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this base?')) {
      return;
    }
    try {
      await basesAPI.delete(id);
      loadBases();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete base');
    }
  };

  if (!isAdmin()) {
    return <div className="page">Access denied. Admin only.</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Bases Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'New Base'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Create Base</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Base Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Base Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="e.g., BA01"
                />
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Create Base</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading bases...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bases.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No bases found</td>
                </tr>
              ) : (
                bases.map((base) => (
                  <tr key={base._id}>
                    <td>{base.name}</td>
                    <td>{base.code}</td>
                    <td>{base.location}</td>
                    <td>
                      <span className={`status-badge ${base.isActive ? 'status-completed' : 'status-rejected'}`}>
                        {base.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(base._id)}
                        className="btn-sm"
                        style={{ backgroundColor: '#e74c3c', color: 'white' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Bases;

