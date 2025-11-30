import React, { useEffect, useState } from 'react';
import { getTasks, createTask, reorderTasks, getProjects } from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaCalendar, FaTag, FaFolder } from 'react-icons/fa';
import { format, isBefore, isToday } from 'date-fns';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableTaskItem = ({ task, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

const Tasks = () => {
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState('All');
    const [projectFilter, setProjectFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', dueDate: '', tags: [], project: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('All Time');
    const [sortBy, setSortBy] = useState('Newest');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (location.state?.statusFilter) {
            const statusFilter = location.state.statusFilter;
            // Map Dashboard filter values to actual task status values
            if (statusFilter === 'Done') {
                setFilter('Done');
            } else if (statusFilter === 'Pending') {
                // Pending means Todo or In Progress
                setFilter('All'); // We'll handle this differently
            } else if (statusFilter === 'Overdue') {
                setFilter('All'); // Overdue is handled by date check, not status
            }
        } else if (location.state?.filter) {
            setFilter(location.state.filter);
        }
        loadTasks();
    }, [location.state]);

    const loadTasks = async () => {
        const [tasksData, projectsData] = await Promise.all([getTasks(), getProjects()]);
        setTasks(tasksData);
        setProjects(projectsData);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        await createTask(newTask);
        setIsModalOpen(false);
        setNewTask({ title: '', description: '', priority: 'Medium', status: 'Todo', dueDate: '', tags: [], project: '' });
        loadTasks();
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setTasks((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id);
                const newIndex = items.findIndex((item) => item._id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Update order in backend
                // We need to send the new order of all tasks or just the affected ones
                // For simplicity, let's update local state first then call backend
                // Note: In a real app, we should debounce this or handle errors

                // Assign new order values
                const updatedTasks = newOrder.map((task, index) => ({ ...task, order: index }));

                // Call API (fire and forget for now, or handle error)
                reorderTasks(updatedTasks);

                return updatedTasks;
            });
        }
    };

    const filteredTasks = tasks.filter(task => {
        // Handle special status filters from Dashboard
        let matchesStatus = true;
        if (location.state?.statusFilter) {
            const statusFilter = location.state.statusFilter;
            if (statusFilter === 'Done') {
                matchesStatus = task.status === 'Done';
            } else if (statusFilter === 'Pending') {
                // Pending means not Done (Todo or In Progress)
                matchesStatus = task.status !== 'Done';
            } else if (statusFilter === 'Overdue') {
                // Overdue means past due date and not done
                matchesStatus = task.dueDate &&
                    isBefore(new Date(task.dueDate), new Date()) &&
                    !isToday(new Date(task.dueDate)) &&
                    task.status !== 'Done';
            }
        } else {
            // Normal status filter
            matchesStatus = filter === 'All' || task.status === filter;
        }

        const matchesProject = projectFilter === 'All' || (task.project && task.project._id === projectFilter);
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.subtasks.some(sub =>
                sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );

        let matchesDate = true;
        if (dateFilter !== 'All Time') {
            const taskDate = new Date(task.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - taskDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (dateFilter === 'Last 24 Hours') matchesDate = diffDays <= 1;
            if (dateFilter === 'Last 7 Days') matchesDate = diffDays <= 7;
            if (dateFilter === 'Last 30 Days') matchesDate = diffDays <= 30;
        }

        return matchesStatus && matchesSearch && matchesDate && matchesProject;
    });

    return (
        <div className="container">
            <header className="dashboard-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Dashboard
                        </Link>
                        <span>/</span>
                        <span style={{ color: 'var(--text-main)' }}>Tasks</span>
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)' }}>My Tasks</h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>Manage, track, and organize your daily work.</p>
                </div>
                {!isMobile && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                    >
                        <FaPlus /> Create New Task
                    </button>
                )}
            </header>

            {/* Mobile Filter & Search Layout */}
            <div className="card tasks-filter-bar" style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '1rem', alignItems: isMobile ? 'stretch' : 'center' }}>

                {/* Top Row: Search + Filter Toggle (Mobile) */}
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            placeholder="Search tasks..."
                            style={{ paddingLeft: '2.5rem', width: '100%' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {isMobile && (
                        <button
                            className={`btn ${isFilterOpen ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            style={{ padding: '0.5rem', width: '42px', flexShrink: 0 }}
                        >
                            <FaFilter />
                        </button>
                    )}
                </div>

                {/* Collapsible Filters (Mobile) or Regular Filters (Desktop) */}
                <div className={`filter-group-container ${isMobile ? 'mobile-filters-container' : ''}`} style={{
                    display: isMobile && !isFilterOpen ? 'none' : 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '0.5rem',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    {!isMobile && <div className="filter-group"><FaFilter style={{ color: 'var(--text-muted)' }} /></div>}

                    <div className="filter-group">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="input"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="input"
                        >
                            <option value="All">All Projects</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="input"
                        >
                            <option>All Time</option>
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="input"
                        >
                            <option value="Newest">Newest First</option>
                            <option value="Oldest">Oldest First</option>
                            <option value="Manual">Custom Order (Drag & Drop)</option>
                        </select>

                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '4rem' }}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredTasks.map(t => t._id)}
                        strategy={verticalListSortingStrategy}
                        disabled={sortBy !== 'Manual'}
                    >
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {filteredTasks.sort((a, b) => {
                                if (sortBy === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
                                if (sortBy === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                                if (sortBy === 'Manual') return (a.order || 0) - (b.order || 0);
                                return 0;
                            }).map(task => {
                                const TaskCard = (
                                    <Link key={task._id} to={`/tasks/${task._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="card" style={{
                                            transition: 'transform 0.2s',
                                            height: '100%',
                                            borderLeft: task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate)) && task.status !== 'Done'
                                                ? '4px solid var(--danger)'
                                                : task.status === 'Done'
                                                    ? '4px solid var(--success)'
                                                    : task.status === 'In Progress'
                                                        ? '4px solid var(--warning)'
                                                        : '4px solid var(--primary)',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                                <h3 style={{ margin: 0 }}>{task.title}</h3>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>

                                                    {task.project && (
                                                        <span className="badge" style={{ background: task.project.color, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <FaFolder size={10} /> {task.project.name}
                                                        </span>
                                                    )}
                                                    {task.dueDate && (
                                                        <span style={{
                                                            fontSize: '0.8rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            color: task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate)) && task.status !== 'Done' ? 'var(--danger)' : 'var(--primary)',
                                                            background: task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate)) && task.status !== 'Done' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontWeight: task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate)) && task.status !== 'Done' ? 'bold' : 'normal'
                                                        }}>
                                                            <FaCalendar size={10} />
                                                            {format(new Date(task.dueDate), 'do MMM yyyy')}
                                                            {task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate)) && task.status !== 'Done'}
                                                        </span>
                                                    )}
                                                    {/* <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>
                                                        {task.status}
                                                    </span> */}

                                                </div>
                                            </div>
                                            <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>{task.description}</p>

                                            {/* Tags & Due Date */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>

                                                {task.tags && task.tags.map((tag, i) => (
                                                    <span key={i} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', background: 'var(--background)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                                        <FaTag size={10} /> {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                <span>Subtasks: {task.subtasks.filter(s => s.status === 'Done').length}/{task.subtasks.length}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Created: {format(new Date(task.createdAt), 'do MMM yyyy')}</span>
                                                <span>Updated: {format(new Date(task.updatedAt), 'do MMM yyyy')}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );

                                return sortBy === 'Manual' ? (
                                    <SortableTaskItem key={task._id} task={task}>
                                        {TaskCard}
                                    </SortableTaskItem>
                                ) : (
                                    <div key={task._id}>{TaskCard}</div>
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Mobile FAB */}
            {
                isMobile && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="fab-btn"
                    >
                        <FaPlus />
                    </button>
                )
            }

            {
                isModalOpen && (
                    <div className="modal-overlay" onClick={(e) => {
                        if (e.target.className === 'modal-overlay') setIsModalOpen(false);
                    }}>
                        <div className="modal-content">
                            <div className="modal-handle"></div>
                            <h2 style={{ marginTop: 0 }}>Create New Task</h2>
                            <form onSubmit={handleCreate}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                                    <input
                                        className="input"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                    <textarea
                                        className="input"
                                        rows="3"
                                        value={newTask.description}
                                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                                    <select
                                        className="input"
                                        value={newTask.status}
                                        onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                                    >
                                        <option>Todo</option>
                                        <option>In Progress</option>
                                        <option>Done</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project</label>
                                    <select
                                        className="input"
                                        value={newTask.project}
                                        onChange={e => setNewTask({ ...newTask, project: e.target.value })}
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Due Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tags (comma separated)</label>
                                    <input
                                        className="input"
                                        placeholder="e.g. Work, Urgent, Personal"
                                        value={newTask.tags.join(', ')}
                                        onChange={e => setNewTask({ ...newTask, tags: e.target.value.split(',').map(t => t.trim()) })}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Task</button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }
        </div >
    );
};

export default Tasks;
