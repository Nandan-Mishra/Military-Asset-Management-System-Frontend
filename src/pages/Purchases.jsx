import { useState, useEffect } from 'react';
import { purchasesAPI, basesAPI, assetsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Component for managing asset purchases with create and filter functionality
const Purchases = () => {
  const { user, isAdmin, isBaseCommander } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    base: user?.baseId || '',
    equipmentType: '',
    asset: '',
    quantity: '',
    unitPrice: '',
    vendor: '',
    purchaseOrderNumber: '',
    notes: '',
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: user?.baseId || '',
    equipmentType: '',
  });
  const [createNewAsset, setCreateNewAsset] = useState(false);
  const [assetName, setAssetName] = useState('');

  useEffect(() => {
    loadBases();
    loadPurchases();
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [filters]);

  // Loads all available bases for purchase form
  const loadBases = async () => {
    try {
      const response = await basesAPI.getAll();
      setBases(response.data.data);
    } catch (error) {
      console.error('Failed to load bases:', error);
    }
  };

  // Fetches available assets for the selected base and equipment type
  const loadAssets = async (baseId, equipmentType) => {
    if (!baseId || !equipmentType) {
      setAssets([]);
      return;
    }
    try {
      const response = await assetsAPI.getAll({ baseId, equipmentType });
      setAssets(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setAssets([]);
    }
  };


  // Loads purchase records with applied filters
  const loadPurchases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.baseId) params.baseId = filters.baseId;
      if (filters.equipmentType) params.equipmentType = filters.equipmentType;

      const response = await purchasesAPI.getAll(params);
      setPurchases(response.data.data || []);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  // If there are no assets for selected base/type, default to create-new mode
  useEffect(() => {
    if (!showForm) return;
    // Only switch automatically when no assets available
    if (assets && assets.length === 0 && formData.base && formData.equipmentType) {
      setCreateNewAsset(true);
    }
  }, [assets, showForm, formData.base, formData.equipmentType]);

  // Submits purchase form and handles both new asset creation and existing asset selection
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        asset: createNewAsset ? assetName : formData.asset,
      };
      await purchasesAPI.create(payload);
      setShowForm(false);
      setFormData({
        base: user?.baseId || '',
        equipmentType: '',
        asset: '',
        quantity: '',
        unitPrice: '',
        vendor: '',
        purchaseOrderNumber: '',
        notes: '',
      });
      setAssetName('');
      setCreateNewAsset(false);
      loadPurchases();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create purchase');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Purchases</h1>
        {(isAdmin() || isBaseCommander() || user?.role === 'logistics_officer') && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : 'New Purchase'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Create Purchase</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Base *</label>
                <select
                  value={formData.base}
                  onChange={(e) => {
                    setFormData({ ...formData, base: e.target.value, asset: '' });
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
                <label>Equipment Type *</label>
                <select
                  value={formData.equipmentType}
                  onChange={(e) => {
                    setFormData({ ...formData, equipmentType: e.target.value, asset: '' });
                    loadAssets(formData.base, e.target.value);
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
                {!createNewAsset ? (
                  <select
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                    required={!createNewAsset}
                    disabled={!formData.base || !formData.equipmentType || assets.length === 0}
                  >
                    <option value="">
                      {!formData.base || !formData.equipmentType
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
                ) : (
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="Enter new asset name"
                    required={createNewAsset}
                  />
                )}
                <div className="new-asset-toggle">
                  <input
                    id="createNewAsset"
                    type="checkbox"
                    checked={createNewAsset}
                    onChange={(e) => {
                      setCreateNewAsset(e.target.checked);
                      if (e.target.checked) {
                        setFormData({ ...formData, asset: '' });
                      } else {
                        setAssetName('');
                      }
                    }}
                  />
                  <label htmlFor="createNewAsset">Create new asset</label>
                </div>
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

              <div className="form-group">
                <label>Unit Price (₹) *</label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vendor</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Purchase Order Number</label>
                <input
                  type="text"
                  value={formData.purchaseOrderNumber}
                  onChange={(e) => setFormData({ ...formData, purchaseOrderNumber: e.target.value })}
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

            <button type="submit" className="btn-primary">Create Purchase</button>
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
            <label>Equipment Type</label>
            <select
              value={filters.equipmentType}
              onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="weapon">Weapon</option>
              <option value="vehicle">Vehicle</option>
              <option value="ammunition">Ammunition</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading purchases...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Purchase #</th>
                <th>Date</th>
                <th>Base</th>
                <th>Equipment Type</th>
                <th>Quantity</th>
                <th>Unit Price (₹)</th>
                <th>Total Amount (₹)</th>
                <th>Vendor</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No purchases found</td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase._id}>
                    <td>{purchase.purchaseNumber}</td>
                    <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                    <td>{purchase.base?.name || 'N/A'}</td>
                    <td>{purchase.equipmentType}</td>
                    <td>{purchase.quantity}</td>
                    <td>₹{((purchase.unitPrice || 0)).toLocaleString('en-IN')}</td>
                    <td>₹{((purchase.totalAmount || 0)).toLocaleString('en-IN')}</td>
                    <td>{purchase.vendor || 'N/A'}</td>
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

export default Purchases;

