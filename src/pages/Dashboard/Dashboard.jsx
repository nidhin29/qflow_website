import React, { useEffect, useState, useCallback } from 'react';
// import { io } from 'socket.io-client'; // TODO: npm install socket.io-client
import api from '/src/services/api';
import Card from '/src/components/common/Card/Card.jsx';
import Button from '/src/components/common/Button/Button.jsx';
import { useAuth } from '/src/context/AuthContext.jsx';
import './Dashboard.css';

const StatIconTotal = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const StatIconWaiting = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const StatIconServed = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);

const EmptyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);

const SpinnerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner-icon">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const getLocalYYYYMMDD = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const Dashboard = () => {
    const { user, hospitalDetails } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and pagination
    const [type, setType] = useState('upcoming');
    const [department, setDepartment] = useState(''); // Default to General or leave empty to force selection
    const [filterDate, setFilterDate] = useState(getLocalYYYYMMDD());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    const getDepartments = () => {
        let services = hospitalDetails?.available_services;
        if (!services) return [];
        if (Array.isArray(services)) {
            if (services.length === 1 && typeof services[0] === 'string' && services[0].startsWith('[')) {
                try {
                    const parsed = JSON.parse(services[0]);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    return services[0].replace(/[\[\]"]/g, '').split(',').map(s => s.trim());
                }
            }
            return services;
        } else if (typeof services === 'string') {
            if (services.startsWith('[')) {
                try {
                    let parsed = JSON.parse(services);
                    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    return services.replace(/[\[\]"]/g, '').split(',').map(s => s.trim());
                }
            }
            return services.split(',').map(s => s.trim());
        }
        return [];
    };
    const departmentsList = getDepartments();

    useEffect(() => {
        if (!department && departmentsList.length > 0) {
            setDepartment(departmentsList[0]);
        }
    }, [departmentsList, department]);

    const [liveMetrics, setLiveMetrics] = useState({
        currently_serving: 0,
        patients_ahead: 0
    });

    const fetchIdRef = React.useRef(0);

    const fetchAppointments = useCallback(async () => {
        const fetchId = ++fetchIdRef.current;
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page,
                limit,
                type,
            });
            if (department) {
                queryParams.append('department', department);
            }
            // Aggressively bypass browser Fetch caching to ensure live backend reflection
            queryParams.append('_t', Date.now());

            const response = await api.get(`/appointments/hospital-appointments?${queryParams.toString()}`);

            if (fetchId !== fetchIdRef.current) return; // Abort if another fetch was triggered

            // Aggressively unpeel response wrappers (Fetch -> Backend -> paginate)
            let metaData = response.data || response;
            if (metaData && metaData.data) metaData = metaData.data;

            let docs = metaData.docs || metaData.appointments || metaData;
            const finalAppointments = Array.isArray(docs) ? docs : [];

            setAppointments(finalAppointments);

            setTotalPages(metaData.totalPages || 1);

            // Calculate live metrics defensively from the first document
            if (type === 'upcoming') {
                setLiveMetrics(prev => {
                    let newServing = prev.currently_serving;
                    let newAhead = prev.patients_ahead;

                    if (finalAppointments.length > 0) {
                        const serveDoc = docs[0].currently_serving;
                        const aheadDoc = docs[0].patients_ahead;
                        if (serveDoc) newServing = serveDoc;
                        if (aheadDoc != null) newAhead = aheadDoc;
                    }
                    
                    return {
                        currently_serving: newServing,
                        patients_ahead: newAhead
                    };
                });
            }

        } catch (err) {
            if (fetchId !== fetchIdRef.current) return;
            console.error('Failed to fetch appointments:', err);
        } finally {
            if (fetchId === fetchIdRef.current) setLoading(false);
        }
    }, [page, limit, type, department, filterDate]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // WebSocket Integration for Real-time queue updates
    useEffect(() => {
        if (!user || !user._id) return;

        // Assuming socket.io server is at BASE_URL root
        // TODO: Uncomment once socket.io-client is installed
        /*
        const socketUrl = 'http://localhost:8000';
        const socket = io(socketUrl, {
            withCredentials: true,
        });

        socket.on('connect', () => {
            console.log('Dashboard connected to websocket');
        });

        // The exact event triggered by the backend: `io.to(hospital_${hospital_id}).emit('queueUpdate', ...)`
        socket.on('queueUpdate', (data) => {
            console.log('Received queueUpdate:', data);

            // Only update live metrics if it matches the department we are currently viewing
            if (data.department === department && data.currently_serving !== undefined) {
                setLiveMetrics(prev => ({
                    ...prev,
                    currently_serving: data.currently_serving
                    // We might still need to re-fetch to update the exact list of 'Pending' statuses,
                    // but for immediate UI response, we update the badge.
                }));
                // Realistically, to keep the list completely synchronized (like "Completed" badges), 
                // we drop a quick refetch.
                fetchAppointments();
            }
        });

        return () => {
            socket.disconnect();
        };
        */
    }, [user, department, fetchAppointments]);

    const handleServeNext = async () => {
        if (!department) {
            alert("Please select a department first to serve the next patient.");
            return;
        }

        try {
            console.log(filterDate);
            const res = await api.post('/appointments/serve-next-patient', {
                department: department,
                appointment_date: filterDate
            });
            
            if (res.data?.data?.currently_serving !== undefined) {
                setLiveMetrics(prev => ({
                    ...prev,
                    currently_serving: res.data.data.currently_serving
                }));
            }

            // Result handles live update via socket, but we can fast-refresh anyway
            fetchAppointments();
        } catch (err) {
            console.error(err);
            alert('Failed to serve next patient');
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (!filterDate) return true;
        const aptDateStr = apt.appointment_date ? apt.appointment_date.split('T')[0] : '';
        return aptDateStr === filterDate;
    });

    const waitingCount = filteredAppointments.filter(a => a.status === 'Pending').length;
    const completedCount = filteredAppointments.filter(a => a.status === 'Completed').length;

    return (
        <div className="dashboard-view container-fade-in">
            <header className="dashboard-header-section">
                <div className="header-left-group">
                    <div className="header-text">
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="live-dot-indicator"></span> Live Diagnostics
                        </h1>
                        <p>Department Queue Management</p>
                    </div>

                    <div className="header-controls">
                        <div className="premium-control-group">
                            <label className="premium-control-label">Queue Timeline</label>
                            <select
                                className="premium-select"
                                value={type}
                                onChange={(e) => { setType(e.target.value); setPage(1); }}
                            >
                                <option value="upcoming">Current / Upcoming</option>
                                <option value="past">Past History</option>
                            </select>
                        </div>

                        <div className="premium-control-group">
                            <label className="premium-control-label">Department Filter</label>
                            <select
                                className="premium-select"
                                value={department}
                                onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                            >
                                {departmentsList.map((dep, idx) => (
                                    <option key={idx} value={dep}>{dep}</option>
                                ))}
                            </select>
                        </div>

                        <div className="premium-control-group">
                            <label className="premium-control-label">Date Filter</label>
                            <input
                                type="date"
                                className="premium-date"
                                value={filterDate}
                                onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>
                </div>

                {type === 'upcoming' && (
                    <div className="premium-control-group serve-action-group">
                        <label className="premium-control-label" style={{ opacity: 0, userSelect: 'none' }}>Action</label>
                        <Button onClick={handleServeNext} variant="primary" className="serve-btn shadow-premium">
                            <span className="btn-icon-svg"><PlayIcon /></span> Serve Next
                        </Button>
                    </div>
                )}
            </header>

            <section className="stats-grid">
                <Card className="stat-card glass" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="stat-content">
                        <div className="stat-info">
                            <p className="stat-label">Currently Serving</p>
                            <p className="stat-value text-xl font-bold" style={{ fontSize: '2rem', color: 'var(--primary)' }}>
                                #{liveMetrics.currently_serving || '0'}
                            </p>
                        </div>
                        <div className="stat-badge completed"><StatIconServed /></div>
                    </div>
                </Card>

                <Card className="stat-card glass" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-content">
                        <div className="stat-info">
                            <p className="stat-label">Pending In List</p>
                            <p className="stat-value">{waitingCount}</p>
                        </div>
                        <div className="stat-badge waiting"><StatIconWaiting /></div>
                    </div>
                </Card>

                <Card className="stat-card glass" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-content">
                        <div className="stat-info">
                            <p className="stat-label">Total Dept Load</p>
                            <p className="stat-value">{filteredAppointments.length}</p>
                        </div>
                        <div className="stat-badge total"><StatIconTotal /></div>
                    </div>
                </Card>
            </section>

            <section className="content-section">
                <Card className="main-queue-card" title={`Queue: ${department || 'All Departments'} (${type})`}>
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '120px' }}>Token</th>
                                    <th>Patient Profile</th>
                                    <th>Dept</th>
                                    <th style={{ width: '150px' }}>Status</th>
                                    <th style={{ width: '150px' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map((apt) => (
                                    <tr key={apt._id} className={`table-row ${apt.status === 'Completed' ? 'opacity-50' : ''}`}>
                                        <td>
                                            <span className="token-tag">#{apt.token_number}</span>
                                        </td>
                                        <td>
                                            <div className="patient-cell">
                                                <div className="patient-avatar">
                                                    {(apt.patient_name || apt.patientDetails?.fullName || 'W')?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="patient-info">
                                                    <p className="p-name">{apt.patient_name || apt.patientDetails?.fullName || 'Walk-in'}</p>
                                                    <p className="p-id">ID: {apt._id.substring(apt._id.length - 6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{apt.department}</td>
                                        <td>
                                            <span className={`status-chip ${apt.status?.toLowerCase() || 'pending'}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="time-cell">
                                            {apt.appointment_time || new Date(apt.appointment_date || apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredAppointments.length === 0 && !loading && (
                            <div className="empty-state">
                                <span className="empty-icon"><EmptyIcon /></span>
                                <p>No patients found in this queue.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="queue-loading-state" style={{ textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <SpinnerIcon />
                                <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Loading queue...</span>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', padding: '10px' }}>
                            <Button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                            >
                                Previous
                            </Button>
                            <span style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </Card>
            </section>
        </div>
    );
};

export default Dashboard;
