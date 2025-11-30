import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAnalyticsSummary, getAnalyticsPriority, getAnalyticsDaily } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { FaTasks, FaCheckCircle, FaClock, FaExclamationCircle, FaArrowRight, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 });
    const [priorityData, setPriorityData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const [summaryData, priorityData, dailyData] = await Promise.all([
                    getAnalyticsSummary(),
                    getAnalyticsPriority(),
                    getAnalyticsDaily()
                ]);
                setSummary(summaryData);
                setPriorityData(priorityData);
                setDailyData(dailyData);
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // High, Medium, Low

    if (loading) return <div className="container">Loading dashboard...</div>;

    return (
        <div className="container">
            <header className="dashboard-header">
                <div>
                    <div className="breadcrumb-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-main)' }}>Dashboard</span>
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)' }}>Dashboard</h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>Overview of your productivity</p>
                </div>
                <button onClick={() => navigate('/tasks')} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                    View Tasks <FaArrowRight />
                </button>
            </header>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div
                    className="card"
                    onClick={() => navigate('/tasks')}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                        <FaTasks size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{summary.totalTasks}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Total Tasks</p>
                    </div>
                </div>
                <div
                    className="card"
                    onClick={() => navigate('/tasks', { state: { statusFilter: 'Done' } })}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                        <FaCheckCircle size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{summary.completedTasks}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Completed</p>
                    </div>
                </div>
                <div
                    className="card"
                    onClick={() => navigate('/tasks', { state: { statusFilter: 'Pending' } })}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                        <FaClock size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{summary.pendingTasks}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Pending</p>
                    </div>
                </div>
                <div
                    className="card"
                    onClick={() => navigate('/tasks', { state: { statusFilter: 'Overdue' } })}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                        <FaExclamationCircle size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{summary.overdueTasks}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Overdue</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Tasks by Priority</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'High' ? '#ef4444' : entry.name === 'Medium' ? '#f59e0b' : '#10b981'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Completed Tasks (Last 7 Days)</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
