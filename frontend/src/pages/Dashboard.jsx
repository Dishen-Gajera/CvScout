import React, { useState, useEffect } from 'react';
import { Upload, FileText, History, Trash2, Plus, Sparkles, AlertCircle, LogOut, Shield, Users, BarChart } from 'lucide-react';
import ScanResult from '../components/ScanResult';

export default function Dashboard({ userEmail, token, userRole, onLogout }) {
  const [scans, setScans] = useState([]);
  const [currentScan, setCurrentScan] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [adminScanDetail, setAdminScanDetail] = useState(null);

  // Scan All modal state (admin feature)
  const [showScanAllModal, setShowScanAllModal] = useState(false);
  const [scanAllRole, setScanAllRole] = useState('');
  const [scanAllJD, setScanAllJD] = useState('');
  const [scanAllAts, setScanAllAts] = useState('');
  const [scanAllLoading, setScanAllLoading] = useState(false);
  const [scanAllResults, setScanAllResults] = useState([]);
  const [scanAllError, setScanAllError] = useState('');


  // Admin View States
  const [viewMode, setViewMode] = useState(userRole === 'admin' ? 'admin' : 'scanner'); // 'scanner' or 'admin'
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminScans, setAdminScans] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  // Fetch scans history on mount
  useEffect(() => {
    fetchScans();
  }, []);

  // Sync viewMode if role changes
  useEffect(() => {
    setViewMode(userRole === 'admin' ? 'admin' : 'scanner');
  }, [userRole]);

  // Fetch admin stats when admin view is toggled
  useEffect(() => {
    if (viewMode === 'admin') {
      fetchAdminData();
    } else {
      setAdminScanDetail(null);
    }
  }, [viewMode]);

  const fetchScans = async () => {
    setSidebarLoading(true);
    try {
      const response = await fetch(`${API_URL}/scans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setScans(data);
      }
    } catch (err) {
      console.error('Error fetching scans:', err);
    } finally {
      setSidebarLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const [usersRes, scansRes] = await Promise.all([
        fetch(`${API_URL}/auth/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_URL}/scans/admin/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (usersRes.ok && scansRes.ok) {
        const usersData = await usersRes.json();
        const scansData = await scansRes.json();
        setAdminUsers(usersData);
        setAdminScans(scansData);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setError('');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['pdf', 'docx', 'txt'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setError('Invalid file format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Maximum size is 5MB.');
      return;
    }

    setResumeFile(file);
  };

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resumeFile) {
      setError('Please upload a resume file.');
      return;
    }

    if (!jobDescription || jobDescription.trim() === '') {
      setError('Please enter a Job Description.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch(`${API_URL}/scans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Scan failed.');
      }

      // Add to list and set current scan
      setScans([data, ...scans]);
      setCurrentScan(data);

      // Reset form fields
      setResumeFile(null);
      setJobDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = async (e, scanId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan from history?')) return;

    try {
      const response = await fetch(`${API_URL}/scans/${scanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setScans(scans.filter(s => s._id !== scanId));
        if (currentScan && currentScan._id === scanId) {
          setCurrentScan(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete scan:', err);
    }
  };

  // --- Scan All (admin) handlers ---
  const openScanAllModal = () => {
    setScanAllError('');
    setScanAllResults([]);
    setScanAllRole('');
    setScanAllJD('');
    setScanAllAts('');
    setShowScanAllModal(true);
  };

  const closeScanAllModal = () => {
    setShowScanAllModal(false);
  };

  const handleScanAllSubmit = async (e) => {
    e && e.preventDefault();
    setScanAllError('');

    if (!scanAllJD || scanAllJD.trim() === '') {
      setScanAllError('Please enter a job description to scan against');
      return;
    }

    setScanAllLoading(true);
    try {
      const payload = {
        jobRole: scanAllRole,
        jobDescription: scanAllJD,
        requiredAts: scanAllAts ? Number(scanAllAts) : 0
      };

      const response = await fetch(`${API_URL}/scans/scan-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error((data && data.msg) || 'Bulk scan failed');
      }

      setScanAllResults(data.results || []);
    } catch (err) {
      console.error('Scan All error:', err);
      setScanAllError(err.message || 'Failed to perform bulk scan');
    } finally {
      setScanAllLoading(false);
    }
  };

  const getBadgeClass = (score) => {
    if (score >= 70) return 'score-badge high';
    if (score >= 45) return 'score-badge medium';
    return 'score-badge low';
  };

  // Compute Admin Stats
  const totalScansCount = adminScans.length;
  const totalUsersCount = adminUsers.length;
  const avgMatchScore = totalScansCount > 0
    ? Math.round(adminScans.reduce((sum, s) => sum + s.matchScore, 0) / totalScansCount)
    : 0;

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="app-header">
        <div className="logo-group">
          <Sparkles className="logo-icon" size={24} />
          <span className="logo-text">CV<span className="gradient-text">Scout</span></span>
          <button
            className="btn-scanall"
            style={{ marginLeft: 12, padding: '6px 10px' }}
            onClick={openScanAllModal}
            title="Scan all stored resumes"
          >
            Scan All
          </button>
        </div>
        <div className="user-nav">
          {userRole === 'admin' && (
            <button
              className="btn-secondary"
              style={{
                borderColor: viewMode === 'admin' ? 'var(--primary-end)' : 'var(--border-color)',
                background: viewMode === 'admin' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={() => {
                setViewMode(viewMode === 'admin' ? 'scanner' : 'admin');
                setCurrentScan(null);
              }}
            >
              <Shield size={16} style={{ color: viewMode === 'admin' ? 'var(--primary-end)' : 'inherit' }} />
              {viewMode === 'admin' ? 'Scanner View' : 'Admin Panel'}
            </button>
          )}
          <span className="user-email">{userEmail}</span>
          <button className="btn-logout" onClick={onLogout}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </header>

      {/* Scan All Inline Panel (Admin) */}
      {showScanAllModal && (
        <div className="inline-scan-panel glass-panel fade-in" style={{ margin: '1rem 2rem' }}>
          <div className="inline-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Scan All Resumes</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Run a bulk ATS check across stored resumes</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="btn-secondary" onClick={closeScanAllModal}>Close</button>
            </div>
          </div>

          <form onSubmit={handleScanAllSubmit} className="modal-body inline-body">
            <div className="form-row">
              <label className="form-label">Job Role (optional)</label>
              <input
                type="text"
                value={scanAllRole}
                onChange={(e) => setScanAllRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, Data Scientist"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Job Description (required)</label>
              <textarea
                value={scanAllJD}
                onChange={(e) => setScanAllJD(e.target.value)}
                placeholder="Paste the job description to scan against"
                rows={6}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: '1' }}>
                <label className="form-label">Required ATS Score (optional)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scanAllAts}
                  onChange={(e) => setScanAllAts(e.target.value)}
                  placeholder="e.g. 60"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn-primary" disabled={scanAllLoading}>
                  {scanAllLoading ? 'Scanning...' : 'Scan All'}
                </button>
              </div>
            </div>

            {scanAllError && (
              <div className="alert alert-danger" style={{ marginTop: '8px' }}>{scanAllError}</div>
            )}
          </form>

          <div className="modal-results" style={{ marginTop: '12px' }}>
            {scanAllLoading ? (
              <div style={{ padding: '12px' }}>Running bulk scan — please wait...</div>
            ) : scanAllResults && scanAllResults.length > 0 ? (
              <div>
                <h4>Results ({scanAllResults.length})</h4>
                <div className="admin-table-wrapper" style={{ maxHeight: '320px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scanAllResults.map((r, idx) => (
                    <div className="result-card" key={r.userId || r.scanId}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-end)' }}>{idx + 1}</div>
                        <div className="result-meta">
                          <div className="email">{r.email || 'unknown'}</div>
                          <div className="resume">{r.resumeFileName || '—'}</div>
                        </div>
                      </div>
                      <div className="result-score">
                        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{r.score}%</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ATS Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '12px', color: 'var(--text-muted)' }}>No results yet. Configure the job description and click "Scan All".</div>
            )}
          </div>
        </div>
      )}

      {/* Main Dashboard Panel */}
      <div className="dashboard">
        {/* Sidebar History (only visible when in scanner view) */}
        {viewMode === 'scanner' ? (
          <aside className="sidebar">
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setCurrentScan(null)}
            >
              <Plus size={18} /> New Scan
            </button>

            <div className="sidebar-title">
              <History size={18} style={{ color: 'var(--primary-end)' }} />
              <span>Scan History</span>
            </div>

            <div className="scans-list">
              {sidebarLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
                  <div className="spinner" style={{ width: '20px', height: '20px' }} />
                </div>
              ) : scans.length > 0 ? (
                scans.map((scan) => (
                  <div
                    key={scan._id}
                    className={`scan-item ${currentScan && currentScan._id === scan._id ? 'active' : ''}`}
                    onClick={() => setCurrentScan(scan)}
                  >
                    <div className="scan-item-header">
                      <span className="scan-filename" title={scan.resumeFileName}>
                        {scan.resumeFileName}
                      </span>
                      <span className={getBadgeClass(scan.matchScore)}>
                        {scan.matchScore}%
                      </span>
                    </div>
                    <div className="scan-item-footer">
                      <span className="scan-date">
                        {new Date(scan.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button
                        className="btn-delete-scan"
                        onClick={(e) => handleDeleteScan(e, scan._id)}
                        title="Delete history entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FileText size={24} />
                  <span>No scans found. Upload your first resume to begin!</span>
                </div>
              )}
            </div>
          </aside>
        ) : null}

        {/* Workspace Panels */}
        <main className="workspace" style={{ gridColumn: viewMode === 'admin' ? '1 / span 2' : 'unset' }}>
          {viewMode === 'admin' ? (
            /* Admin View Panel */
            <div className="admin-container fade-in">
              <div className="workspace-header">
                <div className="workspace-title">
                  <h1>Admin Dashboard</h1>
                  <p>Usage analytics, registered accounts, and recent scan events</p>
                </div>
                <button className="btn-secondary" onClick={fetchAdminData} disabled={adminLoading}>
                  Refresh Stats
                </button>
              </div>

              {adminLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                  <div className="spinner" style={{ width: '32px', height: '32px' }} />
                </div>
              ) : adminScanDetail ? (
                <div className="admin-detail-page fade-in">
                  <div className="workspace-header">
                    <div className="workspace-title">
                      <h1>Scan Report</h1>
                      <p>Full page view of the selected scan details</p>
                    </div>
                    <button className="btn-secondary" onClick={() => setAdminScanDetail(null)}>
                      Back to Dashboard
                    </button>
                  </div>
                  <div className="admin-scan-meta">
                    <div>
                      <strong>User:</strong> {adminScanDetail.userId ? adminScanDetail.userId.email : 'Unknown'}
                    </div>
                    <div>
                      <strong>Resume File:</strong> {adminScanDetail.resumeFileName}
                    </div>
                    <div>
                      <strong>Match Score:</strong> {adminScanDetail.matchScore}%
                    </div>
                    <div>
                      <strong>Scan Date:</strong> {new Date(adminScanDetail.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <ScanResult scan={adminScanDetail} />
                  {adminScanDetail.jobDescriptionText && (
                    <div className="detail-text-block glass-panel">
                      <h3>Job Description</h3>
                      <p>{adminScanDetail.jobDescriptionText}</p>
                    </div>
                  )}
                  {adminScanDetail.resumeText && (
                    <div className="detail-text-block glass-panel">
                      <h3>Resume Text</h3>
                      <p>{adminScanDetail.resumeText}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="stats-grid">
                    <div className="glass-panel stat-card">
                      <span className="form-label">Total Accounts Registered</span>
                      <div className="stat-number">{totalUsersCount}</div>
                      <span className="scan-date">Users using CVScout</span>
                    </div>
                    <div className="glass-panel stat-card">
                      <span className="form-label">Total Scans Executed</span>
                      <div className="stat-number">{totalScansCount}</div>
                      <span className="scan-date">Resumes checked algorithmically</span>
                    </div>
                    <div className="glass-panel stat-card">
                      <span className="form-label">Avg. Resume Match Score</span>
                      <div className="stat-number">{avgMatchScore}%</div>
                      <span className="scan-date">Match rate across all runs</span>
                    </div>
                  </div>

                  {/* Grid Tables */}
                  <div className="admin-grid">
                    {/* Users list table */}
                    <div className="glass-panel admin-table-container">
                      <h3>
                        <Users size={18} style={{ color: 'var(--primary-end)' }} />
                        Registered Users List
                      </h3>
                      <div className="admin-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>User Email</th>
                              <th>Created On</th>
                              <th>Scans</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminUsers.length > 0 ? (
                              adminUsers.map((user) => (
                                <tr key={user._id} className="table-row-clickable">
                                  <td style={{ fontWeight: 600 }}>{user.email}</td>
                                  <td className="scan-date">{new Date(user.createdAt).toLocaleDateString()}</td>
                                  <td>{user.scanCount} scans</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Scan Events Logs */}
                    <div className="glass-panel admin-table-container">
                      <h3>
                        <BarChart size={18} style={{ color: 'var(--primary-end)' }} />
                        Global Scan Events Logs
                      </h3>
                      <div className="admin-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>File Name</th>
                              <th>Score</th>
                              <th>Scanned On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminScans.length > 0 ? (
                              adminScans.map((scan) => (
                                <tr
                                  key={scan._id}
                                  className={adminScanDetail && adminScanDetail._id === scan._id ? 'table-row-selected' : 'table-row-clickable'}
                                  onClick={() => setAdminScanDetail(scan)}
                                >
                                  <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {scan.userId ? scan.userId.email : 'Deleted User'}
                                  </td>
                                  <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={scan.resumeFileName}>
                                    {scan.resumeFileName}
                                  </td>
                                  <td>
                                    <span className={getBadgeClass(scan.matchScore)} style={{ color: '#000', fontSize: '0.75rem', padding: '1px 5px', borderRadius: '4px' }}>
                                      {scan.matchScore}%
                                    </span>
                                  </td>
                                  <td className="scan-date">{new Date(scan.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No scan events found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : currentScan ? (
            /* Resume Scan Summary */
            <div>
              <div className="workspace-header">
                <div className="workspace-title">
                  <h1>Scan Summary</h1>
                  <p>Detailed match report and keyword breakdown</p>
                </div>
                <button className="btn-secondary" onClick={() => setCurrentScan(null)}>
                  Analyze Another
                </button>
              </div>
              <ScanResult scan={currentScan} />
            </div>
          ) : (
            /* Upload Workspace Form */
            <div className="fade-in">
              <div className="workspace-header">
                <div className="workspace-title">
                  <h1>Resume Match Scanner</h1>
                  <p>Upload your resume and paste the job description to find skill gaps and match strength.</p>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleScanSubmit}>
                <div className="upload-grid">
                  {/* Drag-and-drop Resume Box */}
                  <div className="file-upload-container">
                    <label className="form-label" style={{ marginBottom: '8px' }}>Resume File (PDF, DOCX, TXT)</label>
                    <div
                      className={`dropzone ${isDragOver ? 'active' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      <input
                        type="file"
                        id="file-input"
                        style={{ display: 'none' }}
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                      />
                      <Upload className="dropzone-icon" size={48} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          Drag & drop your file here
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                          or click to choose a file
                        </p>
                      </div>
                      <span className="file-specs">Maximum file size: 5MB</span>
                    </div>

                    {resumeFile && (
                      <div className="selected-file-details">
                        <FileText size={18} style={{ color: 'var(--primary-end)' }} />
                        <span className="selected-file-name" title={resumeFile.name}>
                          {resumeFile.name}
                        </span>
                        <span className="file-specs" style={{ marginRight: '10px' }}>
                          {(resumeFile.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          type="button"
                          className="btn-remove-file"
                          onClick={() => setResumeFile(null)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Job Description Textbox */}
                  <div className="jd-input-container">
                    <label className="form-label" style={{ marginBottom: '8px' }}>Job Description</label>
                    <textarea
                      className="jd-textarea"
                      placeholder="Paste the target job description details here... (e.g. required skills, technologies, and responsibilities)"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="action-row">
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ minWidth: '180px', justifyContent: 'center' }}
                    disabled={loading || !resumeFile || !jobDescription.trim()}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Scan Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
