import { useState, useEffect } from 'react';
import { assignmentsAPI, expendituresAPI, basesAPI, assetsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Component for managing asset assignments and expenditures with separate tabs
const Assignments = () => {
  const { user, isAdmin, isBaseCommander } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    asset: '',
    equipmentType: '',
    base: user?.baseId || '',
    quantity: '',
    assignedTo: '',
    personnelId: '',
    notes: '',
  });
  const [selectedAssetQty, setSelectedAssetQty] = useState(0);
  const [expenditureForm, setExpenditureForm] = useState({
    asset: '',
    equipmentType: '',
    base: user?.baseId || '',
    quantity: '',
    reason: '',
    notes: '',
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: user?.baseId || '',
    equipmentType: '',
  });

  useEffect(() => {
    loadBases();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters, activeTab]);

  // Fetches all available bases for form dropdowns
  const loadBases = async () => {
    try {
      const response = await basesAPI.getAll();
      setBases(response.data.data);
    } catch (error) {
      console.error('Failed to load bases:', error);
    }
  };

  // Loads available assets and tracks selected asset quantity for validation
  const loadAssets = async (baseId, equipmentType) => {
    if (!baseId || !equipmentType) {
      setAssets([]);
      setSelectedAssetQty(0);
      return;
    }
    try {
      const response = await assetsAPI.getAll({ baseId, equipmentType });
      const list = response.data.data || [];
      setAssets(list);
      const current = list.find(a => a._id === assignmentForm.asset);
      setSelectedAssetQty(current?.currentQuantity || 0);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setAssets([]);
      setSelectedAssetQty(0);
    }
  };


  // Loads assignments or expenditures data based on active tab with applied filters
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.baseId) params.baseId = filters.baseId;
      if (filters.equipmentType) params.equipmentType = filters.equipmentType;

      if (activeTab === 'assignments') {
        const response = await assignmentsAPI.getAll(params);
        setAssignments(response.data.data || []);
      } else {
        const response = await expendituresAPI.getAll(params);
        setExpenditures(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Creates new assignment after validating quantity does not exceed available assets
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      // Frontend guard: prevent assigning more than available
      const selected = assets.find(a => a._id === assignmentForm.asset);
      const available = selected?.currentQuantity ?? 0;
      if (Number(assignmentForm.quantity) > Number(available)) {
        alert(`Only ${available} available for this asset at the selected base.`);
        return;
      }
      await assignmentsAPI.create(assignmentForm);
      setShowAssignmentForm(false);
      setAssignmentForm({
        asset: '',
        equipmentType: '',
        base: user?.baseId || '',
        quantity: '',
        assignedTo: '',
        personnelId: '',
        notes: '',
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  // Records asset expenditure and permanently removes quantity from inventory
  const handleExpenditureSubmit = async (e) => {
    e.preventDefault();
    try {
      await expendituresAPI.create(expenditureForm);
      setShowExpenditureForm(false);
      setExpenditureForm({
        asset: '',
        equipmentType: '',
        base: user?.baseId || '',
        quantity: '',
        reason: '',
        notes: '',
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create expenditure');
    }
  };

  // Returns an assigned asset and restores its quantity to available inventory
  const handleReturn = async (id) => {
    try {
      await assignmentsAPI.return(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return assignment');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Assignments & Expenditures</h1>
        <div className="tabs">
          <button
            className={activeTab === 'assignments' ? 'active' : ''}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
          <button
            className={activeTab === 'expenditures' ? 'active' : ''}
            onClick={() => setActiveTab('expenditures')}
          >
            Expenditures
          </button>
        </div>
      </div>

      {activeTab === 'assignments' && (
        <>
          <div className="page-header">
            {(isAdmin() || isBaseCommander()) && (
              <button
                onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                className="btn-primary"
              >
                {showAssignmentForm ? 'Cancel' : 'New Assignment'}
              </button>
            )}
          </div>

          {showAssignmentForm && (
            <div className="form-card">
              <h2>Create Assignment</h2>
              <form onSubmit={handleAssignmentSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Base *</label>
                    <select
                      value={assignmentForm.base}
                      onChange={(e) => {
                        setAssignmentForm({ ...assignmentForm, base: e.target.value, asset: '' });
                        loadAssets(e.target.value, assignmentForm.equipmentType);
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
                    <label>Equipment Type *</label>
                    <select
                      value={assignmentForm.equipmentType}
                      onChange={(e) => {
                        setAssignmentForm({ ...assignmentForm, equipmentType: e.target.value, asset: '' });
                        loadAssets(assignmentForm.base, e.target.value);
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Asset *</label>
                    <select
                      value={assignmentForm.asset}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAssignmentForm({ ...assignmentForm, asset: val });
                        const found = assets.find(a => a._id === val);
                        setSelectedAssetQty(found?.currentQuantity || 0);
                        setAssignmentForm(prev => ({
                          ...prev,
                          quantity: prev.quantity && found ? String(Math.min(Number(prev.quantity), Number(found.currentQuantity))) : prev.quantity
                        }));
                      }}
                      required
                      disabled={!assignmentForm.base || !assignmentForm.equipmentType || assets.length === 0}
                    >
                      <option value="">
                        {!assignmentForm.base || !assignmentForm.equipmentType
                          ? 'Select Base and Equipment Type first'
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
                      value={assignmentForm.quantity}
                      onChange={(e) => {
                        const next = e.target.value;
                        const max = Number(selectedAssetQty || 0);
                        const clamped = max ? Math.min(Number(next), max) : Number(next);
                        setAssignmentForm({ ...assignmentForm, quantity: isNaN(clamped) ? '' : String(clamped) });
                      }}
                      min="1"
                      max={selectedAssetQty || undefined}
                      placeholder={selectedAssetQty ? `Available: ${selectedAssetQty}` : ''}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Assigned To *</label>
                    <input
                      type="text"
                      value={assignmentForm.assignedTo}
                      onChange={(e) =>
                        setAssignmentForm({ ...assignmentForm, assignedTo: e.target.value })
                      }
                      placeholder="Person name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Personal ID</label>
                    <input
                      type="text"
                      value={assignmentForm.personnelId}
                      onChange={(e) =>
                        setAssignmentForm({ ...assignmentForm, personnelId: e.target.value })
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={assignmentForm.notes}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, notes: e.target.value })
                    }
                    rows="3"
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Create Assignment
                </button>
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
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading assignments...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Assignment #</th>
                    <th>Date</th>
                    <th>Base</th>
                    <th>Assigned To</th>
                    <th>Equipment Type</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-data">
                        No assignments found
                      </td>
                    </tr>
                  ) : (
                    assignments.map((assignment) => (
                      <tr key={assignment._id}>
                        <td>{assignment.assignmentNumber}</td>
                        <td>
                          {new Date(assignment.assignmentDate).toLocaleDateString()}
                        </td>
                        <td>{assignment.base?.name || 'N/A'}</td>
                        <td>{assignment.assignedTo}</td>
                        <td>{assignment.equipmentType}</td>
                        <td>{assignment.quantity}</td>
                        <td>
                          {assignment.isReturned ? (
                            <span className="status-badge status-completed">Returned</span>
                          ) : (
                            <span className="status-badge status-pending">Active</span>
                          )}
                        </td>
                        <td>
                          {!assignment.isReturned && (
                            <button
                              onClick={() => handleReturn(assignment._id)}
                              className="btn-sm btn-primary"
                            >
                              Return
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
        </>
      )}

      {activeTab === 'expenditures' && (
        <>
          <div className="page-header">
            {(isAdmin() || isBaseCommander()) && (
              <button
                onClick={() => setShowExpenditureForm(!showExpenditureForm)}
                className="btn-primary"
              >
                {showExpenditureForm ? 'Cancel' : 'New Expenditure'}
              </button>
            )}
          </div>

          {showExpenditureForm && (
            <div className="form-card">
              <h2>Create Expenditure</h2>
              <form onSubmit={handleExpenditureSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Base *</label>
                    <select
                      value={expenditureForm.base}
                      onChange={(e) => {
                        setExpenditureForm({ ...expenditureForm, base: e.target.value, asset: '' });
                        loadAssets(e.target.value, expenditureForm.equipmentType);
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
                    <label>Equipment Type *</label>
                    <select
                      value={expenditureForm.equipmentType}
                      onChange={(e) => {
                        setExpenditureForm({
                          ...expenditureForm,
                          equipmentType: e.target.value,
                          asset: '',
                        });
                        loadAssets(expenditureForm.base, e.target.value);
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Asset *</label>
                    <select
                      value={expenditureForm.asset}
                      onChange={(e) =>
                        setExpenditureForm({ ...expenditureForm, asset: e.target.value })
                      }
                      required
                      disabled={!expenditureForm.base || !expenditureForm.equipmentType || assets.length === 0}
                    >
                      <option value="">
                        {!expenditureForm.base || !expenditureForm.equipmentType
                          ? 'Select Base and Equipment Type first'
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
                      value={expenditureForm.quantity}
                      onChange={(e) =>
                        setExpenditureForm({ ...expenditureForm, quantity: e.target.value })
                      }
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason *</label>
                  <textarea
                    value={expenditureForm.reason}
                    onChange={(e) =>
                      setExpenditureForm({ ...expenditureForm, reason: e.target.value })
                    }
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={expenditureForm.notes}
                    onChange={(e) =>
                      setExpenditureForm({ ...expenditureForm, notes: e.target.value })
                    }
                    rows="3"
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Create Expenditure
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading expenditures...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Expenditure #</th>
                    <th>Date</th>
                    <th>Base</th>
                    <th>Equipment Type</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No expenditures found
                      </td>
                    </tr>
                  ) : (
                    expenditures.map((expenditure) => (
                      <tr key={expenditure._id}>
                        <td>{expenditure.expenditureNumber}</td>
                        <td>
                          {new Date(expenditure.expenditureDate).toLocaleDateString()}
                        </td>
                        <td>{expenditure.base?.name || 'N/A'}</td>
                        <td>{expenditure.equipmentType}</td>
                        <td>{expenditure.quantity}</td>
                        <td>{expenditure.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Assignments;

