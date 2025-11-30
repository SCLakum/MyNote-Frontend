import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTask, updateTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask, getHistory, deleteHistory, updateSubtask, clearHistory, getProjects } from '../services/api';
import { FaArrowLeft, FaTrash, FaCheck, FaHistory, FaPlus, FaTimes, FaEdit, FaSearch, FaCalendar, FaTag, FaFolder } from 'react-icons/fa';
import { format, isBefore, isToday } from 'date-fns';

const SubtaskItem = ({ sub, onToggle, onDelete, onEdit }) => {
    const priorityColors = {
        'High': 'var(--danger)',
        'Medium': 'var(--warning)',
        'Low': 'var(--success)'
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            borderLeft: `4px solid ${priorityColors[sub.priority] || 'var(--border)'}`,
            opacity: sub.isCompleted ? 0.7 : 1,
            transition: 'all 0.2s ease',
            position: 'relative',
            minWidth: 0,
            maxWidth: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(sub._id); }}
                    style={{
                        background: sub.isCompleted ? 'var(--success)' : 'transparent',
                        border: '2px solid var(--border)',
                        width: '24px', height: '24px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', padding: 0, marginTop: '0.1rem', flexShrink: 0,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {sub.isCompleted && <FaCheck size={12} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{
                            textDecoration: sub.isCompleted ? 'line-through' : 'none',
                            fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-main)',
                            wordBreak: 'break-word'
                        }}>
                            {sub.title}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(sub); }} className="btn-icon" style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
                                <FaEdit />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(sub._id); }} className="btn-icon" style={{ color: 'var(--danger)', cursor: 'pointer', background: 'none', border: 'none' }}>
                                <FaTrash size={14} />
                            </button>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                        {sub.createdAt ? format(new Date(sub.createdAt), 'MMM d, h:mm a') : 'Just now'}
                    </span>
                </div>
            </div>

            {sub.description && (
                <div style={{ marginLeft: '2.5rem', minWidth: 0 }}>
                    <p style={{
                        margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        wordBreak: 'break-all',
                        overflowWrap: 'anywhere'
                    }}>
                        {sub.description}
                    </p>
                </div>
            )}
        </div>
    );
};

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [history, setHistory] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
    const [newSubtaskPriority, setNewSubtaskPriority] = useState('Medium');
    const [subtaskSearch, setSubtaskSearch] = useState('');
    const [subtaskSort, setSubtaskSort] = useState('Newest');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);

    const [editingSubtask, setEditingSubtask] = useState(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const taskData = await getTask(id);
            setTask(taskData);
            setEditForm(taskData);
            const historyData = await getHistory(id);
            setHistory(historyData);
            const projectsData = await getProjects();
            setProjects(projectsData);
        } catch (error) {
            console.error('Error loading task:', error);
        }
    };

    const handleUpdate = async () => {
        await updateTask(id, editForm);
        setIsEditing(false);
        loadData();
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask(id);
            navigate('/tasks');
        }
    };

    const openAddSubtaskModal = () => {
        setEditingSubtask(null);
        setNewSubtask('');
        setNewSubtaskDescription('');
        setNewSubtaskPriority('Medium');
        setIsSubtaskModalOpen(true);
    };

    const openEditSubtaskModal = (sub) => {
        setEditingSubtask(sub);
        setNewSubtask(sub.title);
        setNewSubtaskDescription(sub.description || '');
        setNewSubtaskPriority(sub.priority || 'Medium');
        setIsSubtaskModalOpen(true);
    };

    const handleSubtaskSubmit = async (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        try {
            if (editingSubtask) {
                await updateSubtask(id, editingSubtask._id, {
                    title: newSubtask,
                    description: newSubtaskDescription,
                    priority: newSubtaskPriority
                });
            } else {
                await addSubtask(id, newSubtask, newSubtaskDescription, newSubtaskPriority);
            }

            setNewSubtask('');
            setNewSubtaskDescription('');
            setNewSubtaskPriority('Medium');
            setEditingSubtask(null);
            setIsSubtaskModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Error saving subtask:', error);
            alert('Failed to save subtask. Please try again.');
        }
    };

    const getFilteredSubtasks = () => {
        if (!task) return [];
        let filtered = task.subtasks.filter(sub =>
            sub.title.toLowerCase().includes(subtaskSearch.toLowerCase()) ||
            (sub.description && sub.description.toLowerCase().includes(subtaskSearch.toLowerCase()))
        );

        return filtered.sort((a, b) => {
            if (subtaskSort === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (subtaskSort === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (subtaskSort === 'Priority') {
                const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityMap[b.priority] - priorityMap[a.priority];
            }
            return 0;
        });
    };

    const filteredSubtasks = getFilteredSubtasks();

    const handleToggleSubtask = async (subtaskId) => {
        await toggleSubtask(id, subtaskId);
        loadData();
    };

    const handleDeleteSubtask = async (subtaskId) => {
        if (window.confirm('Delete this subtask?')) {
            await deleteSubtask(id, subtaskId);
            loadData();
        }
    };

    const handleDeleteHistory = async (historyId) => {
        if (window.confirm('Delete this history item?')) {
            try {
                await deleteHistory(id, historyId);
                loadData();
            } catch (error) {
                console.error('Error deleting history:', error);
                alert('Failed to delete history item.');
            }
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm('Are you sure you want to clear ALL history for this task?')) {
            try {
                await clearHistory(id);
                loadData();
            } catch (error) {
                console.error('Error clearing history:', error);
                alert('Failed to clear history.');
            }
        }
    };

    if (!task) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <button onClick={() => navigate('/tasks')} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                <FaArrowLeft /> Back to Tasks
            </button>

            <div className="task-detail-grid">

                {/* Main Task Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    className="input"
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                />
                                <textarea
                                    className="input"
                                    rows="3"
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <select
                                        className="input"
                                        value={editForm.status}
                                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                    >
                                        <option>Todo</option>
                                        <option>In Progress</option>
                                        <option>Done</option>
                                    </select>
                                    <select
                                        className="input"
                                        value={editForm.priority}
                                        onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Project</label>
                                    <select
                                        className="input"
                                        value={editForm.project ? (typeof editForm.project === 'object' ? editForm.project._id : editForm.project) : ''}
                                        onChange={e => setEditForm({ ...editForm, project: e.target.value })}
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Due Date</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={editForm.dueDate ? editForm.dueDate.split('T')[0] : ''}
                                            onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tags (comma separated)</label>
                                        <input
                                            className="input"
                                            value={editForm.tags ? editForm.tags.join(', ') : ''}
                                            onChange={e => setEditForm({ ...editForm, tags: e.target.value.split(',').map(t => t.trim()) })}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
                                    <button onClick={handleUpdate} className="btn btn-primary">Save Changes</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: '600' }}>{task.title}</h1>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Edit</button>
                                            <button onClick={handleDelete} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}><FaTrash /></button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>{task.status}</span>
                                        <span className="badge" style={{ border: '1px solid var(--border)', fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>{task.priority} Priority</span>
                                        {task.project && (
                                            <span className="badge" style={{ background: task.project.color, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                                                <FaFolder size={12} /> {task.project.name}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        {task.dueDate && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate)) && task.status !== 'Done' ? 'var(--danger)' : 'var(--text-muted)',
                                            }}>
                                                <FaCalendar />
                                                <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                                                {task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate)) && task.status !== 'Done' && (
                                                    <span style={{ color: 'var(--danger)', fontWeight: '600' }}>(Overdue)</span>
                                                )}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaCalendar />
                                            <span>Created: {format(new Date(task.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaCalendar />
                                            <span>Updated: {format(new Date(task.updatedAt), 'MMM dd, yyyy h:mm a')}</span>
                                        </div>
                                    </div>
                                </div>

                                {task.tags && task.tags.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {task.tags.map((tag, idx) => (
                                                <span key={idx} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.25rem 0.65rem',
                                                    background: 'var(--background)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    <FaTag size={10} /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {task.description && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                        <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6' }}>{task.description}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Subtasks */}
                    <div className="card">
                        <div className="subtask-header-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Subtasks</h3>
                                {/* Mobile Add Button (Icon Only) */}
                                <button
                                    onClick={openAddSubtaskModal}
                                    className="btn btn-primary mobile-only-btn"
                                    style={{ padding: '0.5rem', borderRadius: '50%', width: '32px', height: '32px', display: 'none' }}
                                >
                                    <FaPlus size={12} />
                                </button>
                                {/* Desktop Add Button */}
                                <button
                                    onClick={openAddSubtaskModal}
                                    className="btn btn-primary desktop-only-btn"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                                >
                                    <FaPlus /> Add
                                </button>
                            </div>

                            <div className="subtask-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <FaSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                                    <input
                                        className="input"
                                        placeholder="Search..."
                                        style={{ padding: '0.25rem 0.5rem 0.25rem 2rem', fontSize: '0.9rem', width: '100%' }}
                                        value={subtaskSearch}
                                        onChange={e => setSubtaskSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="input"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', width: 'auto' }}
                                    value={subtaskSort}
                                    onChange={e => setSubtaskSort(e.target.value)}
                                >
                                    <option value="Newest">Newest</option>
                                    <option value="Oldest">Oldest</option>
                                    <option value="Priority">Priority</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {filteredSubtasks.map(sub => (
                                <SubtaskItem
                                    key={sub._id}
                                    sub={sub}
                                    onToggle={handleToggleSubtask}
                                    onDelete={handleDeleteSubtask}
                                    onEdit={openEditSubtaskModal}
                                />
                            ))}
                            {filteredSubtasks.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No subtasks found.</p>}
                        </div>
                    </div>
                </div >

                {/* History Sidebar */}
                <div className="card history-card">
                    <div className="history-header">
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaHistory /> History
                        </h3>
                        {history.length > 0 && (
                            <button
                                onClick={handleClearHistory}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--danger)',
                                    fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline'
                                }}
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="history-list">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {history.map((item) => (
                                <div key={item._id} className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content" style={{ minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', fontSize: '0.9rem' }}>{item.action}</p>
                                            <button onClick={() => handleDeleteHistory(item._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5, padding: 0 }}>
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{item.details}</p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7, display: 'block', marginTop: '0.5rem' }}>
                                            {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {history.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontStyle: 'italic' }}>
                                    No history found.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Subtask Modal */}
            {isSubtaskModalOpen && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target.className === 'modal-overlay') setIsSubtaskModalOpen(false);
                }}>
                    <div className="modal-content">
                        <div className="modal-handle"></div>
                        <h3 style={{ marginTop: 0 }}>{editingSubtask ? 'Edit Subtask' : 'Add New Subtask'}</h3>
                        <form onSubmit={handleSubtaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                className="input"
                                placeholder="Subtask Title"
                                value={newSubtask}
                                onChange={e => setNewSubtask(e.target.value)}
                                required
                            />
                            <textarea
                                className="input"
                                placeholder="Subtask Details (Optional)"
                                rows="8"
                                value={newSubtaskDescription}
                                onChange={e => setNewSubtaskDescription(e.target.value)}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <select
                                    className="input"
                                    style={{ width: '150px' }}
                                    value={newSubtaskPriority}
                                    onChange={e => setNewSubtaskPriority(e.target.value)}
                                >
                                    <option value="Low">Low Priority</option>
                                    <option value="Medium">Medium Priority</option>
                                    <option value="High">High Priority</option>
                                </select>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setIsSubtaskModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editingSubtask ? 'Save Changes' : 'Add Subtask'}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskDetail;
