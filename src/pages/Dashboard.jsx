import { useState, useEffect } from 'react';
import { dashboardAPI, basesAPI, purchasesAPI, transfersAPI, assetsAPI, assignmentsAPI, expendituresAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Main dashboard component displaying key metrics and filters for asset management
const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bases, setBases] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: '',
    equipmentType: '',
  });

  const [netModalOpen, setNetModalOpen] = useState(false);
  const [netDetails, setNetDetails] = useState({ purchases: [], transfersIn: [], transfersOut: [] });
  const [netLoading, setNetLoading] = useState(false);

  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [openingDetails, setOpeningDetails] = useState([]);
  const [openingLoading, setOpeningLoading] = useState(false);

  const [closingModalOpen, setClosingModalOpen] = useState(false);
  const [closingDetails, setClosingDetails] = useState([]);
  const [closingLoading, setClosingLoading] = useState(false);

  const [assignedModalOpen, setAssignedModalOpen] = useState(false);
  const [assignedDetails, setAssignedDetails] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(false);

  const [expendedModalOpen, setExpendedModalOpen] = useState(false);
  const [expendedDetails, setExpendedDetails] = useState([]);
  const [expendedLoading, setExpendedLoading] = useState(false);

  // Fetches all available bases for filter dropdown
  const loadBases = async () => {
    try {
      const response = await basesAPI.getAll();
      setBases(response.data.data);
    } catch (error) {
      console.error('Failed to load bases:', error);
    }
  };

  // Loads dashboard metrics with optional silent mode to prevent redirects on auth errors
  const loadMetrics = async (silent = false) => {
    if (!silent) {
    setLoading(true);
    }
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (isAdmin() && filters.baseId) params.baseId = filters.baseId;
      if (filters.equipmentType) params.equipmentType = filters.equipmentType;

      const config = silent ? { silent: true } : {};
      const response = await dashboardAPI.getMetrics(params, config);
      setMetrics(response.data.data);
    } catch (error) {
      if (error.response?.status === 401 && silent) {
        console.warn('Auto-refresh skipped: Authentication required');
        return;
      }
      console.error('Failed to load metrics:', error);
    } finally {
      if (!silent) {
      setLoading(false);
    }
    }
  };

  useEffect(() => {
    loadBases();
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadMetrics(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [filters]);

  // Updates filter state and triggers metrics reload
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Builds filter parameters object from current filter state
  const getFilterParams = () => {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (isAdmin() && filters.baseId) params.baseId = filters.baseId;
    if (filters.equipmentType) params.equipmentType = filters.equipmentType;
    params.limit = 100;
    return params;
  };

  // Opens modal and loads detailed net movement data including purchases and transfers
  const openNetMovementDetails = async () => {
    setNetLoading(true);
    setNetModalOpen(true);
    try {
      const params = getFilterParams();
      const [pRes, tRes] = await Promise.all([
        purchasesAPI.getAll(params),
        transfersAPI.getAll({ ...params, status: 'completed' })
      ]);

      const purchases = pRes.data?.data || [];
      const transfers = tRes.data?.data || [];

      // Classify transfers in/out
      const baseForDirection = isAdmin() ? filters.baseId : user?.baseId;
      let transfersIn = transfers;
      let transfersOut = [];
      if (baseForDirection) {
        transfersIn = transfers.filter(tr => tr.toBase?._id === baseForDirection);
        transfersOut = transfers.filter(tr => tr.fromBase?._id === baseForDirection);
      } else {
        // No specific base chosen; show all as inbound/outbound lists with labels
        transfersIn = transfers.filter(tr => !!tr.toBase);
        transfersOut = transfers.filter(tr => !!tr.fromBase);
      }

      setNetDetails({ purchases, transfersIn, transfersOut });
    } catch (e) {
      console.error('Failed to load net movement details', e);
      setNetDetails({ purchases: [], transfersIn: [], transfersOut: [] });
    } finally {
      setNetLoading(false);
    }
  };

  // Opens modal and loads opening balance details from purchase records
  const openOpeningBalanceDetails = async () => {
    setOpeningLoading(true);
    setOpeningModalOpen(true);
    try {
      const params = getFilterParams();
      // Opening balance = all purchases (initial quantities)
      const response = await purchasesAPI.getAll(params);
      setOpeningDetails(response.data?.data || []);
    } catch (e) {
      console.error('Failed to load opening balance details', e);
      setOpeningDetails([]);
    } finally {
      setOpeningLoading(false);
    }
  };

  // Opens modal and loads closing balance details from current asset quantities
  const openClosingBalanceDetails = async () => {
    setClosingLoading(true);
    setClosingModalOpen(true);
    try {
      const params = {};
      if (isAdmin() && filters.baseId) params.baseId = filters.baseId;
      if (filters.equipmentType) params.equipmentType = filters.equipmentType;
      // Closing balance = current assets with quantity > 0
      const response = await assetsAPI.getAll(params);
      setClosingDetails(response.data?.data || []);
    } catch (e) {
      console.error('Failed to load closing balance details', e);
      setClosingDetails([]);
    } finally {
      setClosingLoading(false);
    }
  };

  // Opens modal and loads assigned asset details excluding returned items
  const openAssignedDetails = async () => {
    setAssignedLoading(true);
    setAssignedModalOpen(true);
    try {
      const params = getFilterParams();
      // Only show non-returned assignments
      const response = await assignmentsAPI.getAll({ ...params, isReturned: false });
      setAssignedDetails(response.data?.data || []);
    } catch (e) {
      console.error('Failed to load assigned details', e);
      setAssignedDetails([]);
    } finally {
      setAssignedLoading(false);
    }
  };

  // Opens modal and loads expended asset details
  const openExpendedDetails = async () => {
    setExpendedLoading(true);
    setExpendedModalOpen(true);
    try {
      const params = getFilterParams();
      const response = await expendituresAPI.getAll(params);
      setExpendedDetails(response.data?.data || []);
    } catch (e) {
      console.error('Failed to load expended details', e);
      setExpendedDetails([]);
    } finally {
      setExpendedLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-item">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          {isAdmin() && (
            <div className="filter-item">
              <label>Base</label>
              <select
                value={filters.baseId}
                onChange={(e) => handleFilterChange('baseId', e.target.value)}
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
              onChange={(e) => handleFilterChange('equipmentType', e.target.value)}
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

      {metrics && (
        <div className="metrics-grid">
          <div className="metric-card" onClick={openOpeningBalanceDetails} style={{ cursor: 'pointer' }}>
            <h3>Opening Balance</h3>
            <p className="metric-value">{metrics.openingBalance || 0}</p>
          </div>

          <div className="metric-card" onClick={openClosingBalanceDetails} style={{ cursor: 'pointer' }}>
            <h3>Closing Balance</h3>
            <p className="metric-value">{metrics.closingBalance || 0}</p>
          </div>

          <div className="metric-card net-movement" onClick={openNetMovementDetails} style={{ cursor: 'pointer' }}>
            <h3>Net Movement</h3>
            <p className="metric-value">{metrics.netMovement?.total || 0}</p>
            <div className="net-movement-details">
              <span>Purchases: {metrics.netMovement?.purchases || 0}</span>
              <span>Transfer In: {metrics.netMovement?.transfersIn || 0}</span>
              <span>Transfer Out: {metrics.netMovement?.transfersOut || 0}</span>
            </div>
          </div>

          <div className="metric-card" onClick={openAssignedDetails} style={{ cursor: 'pointer' }}>
            <h3>Assigned</h3>
            <p className="metric-value">{metrics.assigned || 0}</p>
          </div>

          <div className="metric-card" onClick={openExpendedDetails} style={{ cursor: 'pointer' }}>
            <h3>Expended</h3>
            <p className="metric-value">{metrics.expended || 0}</p>
          </div>
        </div>
      )}

      {/* Net Movement Modal */}
      {netModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setNetModalOpen(false)}>
          <div style={{
            background: '#1f1f1f', color: 'white', width: '90%', maxWidth: 900, maxHeight: '80vh', overflowY: 'auto', borderRadius: 12, padding: 20, border: '2px solid rgba(218,165,32,0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>Net Movement Details</h2>
              <button onClick={() => setNetModalOpen(false)} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Close</button>
            </div>

            {netLoading ? (
              <div>Loading...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <h3>Purchases</h3>
                  {netDetails.purchases.length === 0 ? (
                    <p style={{ opacity: 0.8 }}>No purchases in range.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {netDetails.purchases.map((p) => (
                        <li key={p._id} style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontWeight: 700 }}>{p.asset?.name || 'Asset'}</div>
                          <div style={{ fontSize: 12, opacity: 0.8 }}>{new Date(p.purchaseDate).toLocaleDateString()} • Qty: {p.quantity} • Amount: ₹{(p.totalAmount || 0).toLocaleString('en-IN')}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3>Transfer In</h3>
                  {netDetails.transfersIn.length === 0 ? (
                    <p style={{ opacity: 0.8 }}>No inbound transfers.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {netDetails.transfersIn.map((t) => (
                        <li key={t._id} style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontWeight: 700 }}>{t.asset?.name || 'Asset'}</div>
                          <div style={{ fontSize: 12, opacity: 0.8 }}>{new Date(t.transferDate).toLocaleDateString()} • Qty: {t.quantity} • From: {t.fromBase?.name}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3>Transfer Out</h3>
                  {netDetails.transfersOut.length === 0 ? (
                    <p style={{ opacity: 0.8 }}>No outbound transfers.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {netDetails.transfersOut.map((t) => (
                        <li key={t._id} style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontWeight: 700 }}>{t.asset?.name || 'Asset'}</div>
                          <div style={{ fontSize: 12, opacity: 0.8 }}>{new Date(t.transferDate).toLocaleDateString()} • Qty: {t.quantity} • To: {t.toBase?.name}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Opening Balance Modal */}
      {openingModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setOpeningModalOpen(false)}>
          <div style={{
            background: '#1f1f1f', color: 'white', width: '90%', maxWidth: 800, maxHeight: '80vh', overflowY: 'auto', borderRadius: 12, padding: 20, border: '2px solid rgba(218,165,32,0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>Opening Balance Details (All Purchases)</h2>
              <button onClick={() => setOpeningModalOpen(false)} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Close</button>
            </div>

            {openingLoading ? (
              <div>Loading...</div>
            ) : (
              <div>
                {openingDetails.length === 0 ? (
                  <p style={{ opacity: 0.8 }}>No purchases recorded.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {openingDetails.map((p) => (
                      <li key={p._id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.asset?.name || 'Asset'}</div>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>
                          <div>Base: {p.base?.name || 'N/A'}</div>
                          <div>Quantity: {p.quantity} • Unit Price: ₹{((p.unitPrice || 0)).toLocaleString('en-IN')}</div>
                          <div>Date: {new Date(p.purchaseDate).toLocaleDateString()}</div>
                          <div>Equipment Type: {p.equipmentType || 'N/A'}</div>
                          <div>Total Amount: ₹{((p.totalAmount || 0)).toLocaleString('en-IN')}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Closing Balance Modal */}
      {closingModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setClosingModalOpen(false)}>
          <div style={{
            background: '#1f1f1f', color: 'white', width: '90%', maxWidth: 800, maxHeight: '80vh', overflowY: 'auto', borderRadius: 12, padding: 20, border: '2px solid rgba(218,165,32,0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>Closing Balance Details (Current Assets)</h2>
              <button onClick={() => setClosingModalOpen(false)} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Close</button>
            </div>

            {closingLoading ? (
              <div>Loading...</div>
            ) : (
              <div>
                {closingDetails.length === 0 ? (
                  <p style={{ opacity: 0.8 }}>No assets available.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {closingDetails.map((asset) => (
                      <li key={asset._id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{asset.name || 'Asset'}</div>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>
                          <div>Asset Number: {asset.assetNumber || 'N/A'}</div>
                          <div>Current Quantity: {asset.currentQuantity || 0}</div>
                          <div>Base: {asset.currentBase?.name || 'N/A'}</div>
                          <div>Equipment Type: {asset.equipmentType || 'N/A'}</div>
                          <div>Status: {asset.status || 'N/A'}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assigned Modal */}
      {assignedModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setAssignedModalOpen(false)}>
          <div style={{
            background: '#1f1f1f', color: 'white', width: '90%', maxWidth: 800, maxHeight: '80vh', overflowY: 'auto', borderRadius: 12, padding: 20, border: '2px solid rgba(218,165,32,0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>Assigned Assets Details</h2>
              <button onClick={() => setAssignedModalOpen(false)} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Close</button>
            </div>

            {assignedLoading ? (
              <div>Loading...</div>
            ) : (
              <div>
                {assignedDetails.length === 0 ? (
                  <p style={{ opacity: 0.8 }}>No assignments recorded.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {assignedDetails.map((a) => (
                      <li key={a._id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{a.asset?.name || 'Asset'}</div>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>
                          <div>Assigned To: {a.assignedTo || 'N/A'}</div>
                          <div>Quantity: {a.quantity}</div>
                          <div>Base: {a.base?.name || 'N/A'}</div>
                          <div>Assignment Date: {new Date(a.assignmentDate).toLocaleDateString()}</div>
                          <div>Equipment Type: {a.equipmentType || 'N/A'}</div>
                          <div>Status: {a.isReturned ? 'Returned' : 'Active'}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expended Modal */}
      {expendedModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setExpendedModalOpen(false)}>
          <div style={{
            background: '#1f1f1f', color: 'white', width: '90%', maxWidth: 800, maxHeight: '80vh', overflowY: 'auto', borderRadius: 12, padding: 20, border: '2px solid rgba(218,165,32,0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>Expended Assets Details</h2>
              <button onClick={() => setExpendedModalOpen(false)} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Close</button>
            </div>

            {expendedLoading ? (
              <div>Loading...</div>
            ) : (
              <div>
                {expendedDetails.length === 0 ? (
                  <p style={{ opacity: 0.8 }}>No expenditures recorded.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {expendedDetails.map((e) => (
                      <li key={e._id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{e.asset?.name || 'Asset'}</div>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>
                          <div>Quantity Expended: {e.quantity}</div>
                          <div>Base: {e.base?.name || 'N/A'}</div>
                          <div>Expenditure Date: {new Date(e.expenditureDate).toLocaleDateString()}</div>
                          <div>Equipment Type: {e.equipmentType || 'N/A'}</div>
                          <div>Reason: {e.reason || 'N/A'}</div>
                          {e.notes && <div>Notes: {e.notes}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

