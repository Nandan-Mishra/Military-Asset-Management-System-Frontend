import { useState, useEffect } from 'react';
import { transfersAPI, basesAPI, assetsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Transfers = () => {
  const { user, isAdmin, isBaseCommander } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asset: '',
    equipmentType: '',
    quantity: '',
    fromBase: user?.baseId || '',
    toBase: '',
    notes: '',
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: user?.baseId || '',
    equipmentType: '',
    status: '',
  });

  useEffect(() => {
    loadBases();
    loadTransfers();
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [filters]);

  // Loads all available bases for transfer form
  const loadBases = async () => {
    try {
      const response = await basesAPI.getAll();
      setBases(response.data.data);
    } catch (error) {
      console.error('Failed to load bases:', error);
    }
  };

  // Fetches available assets from source base for transfer selection
  const loadAssets = async (baseId, equipmentType) => {
    if (!baseId || !equipmentType) {
      setAssets([]);
      return;
    }
    try {
      const res = await assetsAPI.getAll({ baseId, equipmentType });
      setAssets(res.data?.data || []);
    } catch (e) {
      console.error('Failed to load assets:', e);
      setAssets([]);
    }
  };


  // Loads transfer records with applied filters and pagination
  const loadTransfers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.baseId) params.baseId = filters.baseId;
      if (filters.equipmentType) params.equipmentType = filters.equipmentType;
      if (filters.status) params.status = filters.status;

      const response = await transfersAPI.getAll(params);
      setTransfers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transfersAPI.create(formData);
      setShowForm(false);
      setFormData({
        asset: '',
        equipmentType: '',
        quantity: '',
        fromBase: user?.baseId || '',
        toBase: '',
        notes: '',
      });
      loadTransfers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create transfer');
    }
  };

  // Approves a pending transfer request for execution
  const handleApprove = async (id) => {
    try {
      await transfersAPI.approve(id);
      loadTransfers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve transfer');
    }
  };

  // Completes an approved transfer and updates asset quantities at both bases
  const handleComplete = async (id) => {
    try {
      await transfersAPI.complete(id);
      loadTransfers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete transfer');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transfers</h1>
        {(isAdmin() || isBaseCommander()) && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : 'New Transfer'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Create Transfer</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>From Base *</label>
                <select
                  value={formData.fromBase}
                  onChange={(e) => {
                    setFormData({ ...formData, fromBase: e.target.value, asset: '' });
                    loadAssets(e.target.value, formData.equipmentType);
                  }}
                  required
                >
                  <option value="">Select Base</option>
                  {bases.map((base) => (
                    <option key={base._id} value={base._id}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>To Base *</label>
                <select
                  value={formData.toBase}
                  onChange={(e) => setFormData({ ...formData, toBase: e.target.value })}
                  required
                >
                  <option value="">Select Base</option>
                  {bases.map((base) => (
                    <option key={base._id} value={base._id}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Equipment Type *</label>
                <select
                  value={formData.equipmentType}
                  onChange={(e) => {
                    setFormData({ ...formData, equipmentType: e.target.value, asset: '' });
                    loadAssets(formData.fromBase, e.target.value);
                  }}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="weapon">Weapon</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="ammunition">Ammunition</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>

              <div className="form-group">
                <label>Asset *</label>
                <select
                  value={formData.asset}
                  onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                  required
                  disabled={!formData.fromBase || !formData.equipmentType || assets.length === 0}
                >
                  <option value="">
                    {!formData.fromBase || !formData.equipmentType
                      ? 'Select From Base and Equipment Type first'
                      : assets.length === 0
                      ? 'No assets available'
                      : 'Select Asset'}
                  </option>
                  {assets.map((asset) => (
                    <option key={asset._id} value={asset._id}>
                      {asset.name} (Qty: {asset.currentQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
              />
            </div>

            <button type="submit" className="btn-primary">Create Transfer</button>
          </form>
        </div>
      )}

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-item">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="filter-item">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          {isAdmin() && (
            <div className="filter-item">
              <label>Base</label>
              <select
                value={filters.baseId}
                onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
              >
                <option value="">All Bases</option>
                {bases.map((base) => (
                  <option key={base._id} value={base._id}>
                    {base.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="filter-item">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading transfers...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transfer #</th>
                <th>Date</th>
                <th>From Base</th>
                <th>To Base</th>
                <th>Equipment Type</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No transfers found</td>
                </tr>
              ) : (
                transfers.map((transfer) => (
                  <tr key={transfer._id}>
                    <td>{transfer.transferNumber}</td>
                    <td>{new Date(transfer.transferDate).toLocaleDateString()}</td>
                    <td>{transfer.fromBase?.name || 'N/A'}</td>
                    <td>{transfer.toBase?.name || 'N/A'}</td>
                    <td>{transfer.equipmentType}</td>
                    <td>{transfer.quantity}</td>
                    <td>
                      <span className={`status-badge status-${transfer.status}`}>
                        {transfer.status}
                      </span>
                    </td>
                    <td>
                      {transfer.status === 'pending' && (isAdmin() || isBaseCommander()) && (
                        <button
                          onClick={() => handleApprove(transfer._id)}
                          className="btn-sm btn-success"
                        >
                          Approve
                        </button>
                      )}
                      {transfer.status === 'approved' && (
                        <button
                          onClick={() => handleComplete(transfer._id)}
                          className="btn-sm btn-primary"
                        >
                          Complete
                        </button>
                      )}
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

export default Transfers;

