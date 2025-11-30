import React, { useEffect, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';
import { FaPlus, FaTrash, FaFolder, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', color: '#6366f1' });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    const handleOpenModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({ name: project.name, description: project.description || '', color: project.color });
        } else {
            setEditingProject(null);
            setFormData({ name: '', description: '', color: '#6366f1' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        setFormData({ name: '', description: '', color: '#6366f1' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProject) {
                await updateProject(editingProject._id, formData);
            } else {
                await createProject(formData);
            }
            handleCloseModal();
            loadProjects();
        } catch (error) {
            console.error('Error saving project:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? Tasks in this project will not be deleted but will be unassigned.')) {
            try {
                await deleteProject(id);
                loadProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    return (
        <div className="container">
            <header className="dashboard-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Dashboard
                        </Link>
                        <span>/</span>
                        <span style={{ color: 'var(--text-main)' }}>Projects</span>
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)' }}>Projects</h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>Organize your tasks into projects.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                >
                    <FaPlus /> New Project
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {projects.map(project => (
                    <div key={project._id} className="card" style={{ borderTop: `4px solid ${project.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaFolder style={{ color: project.color }} />
                                {project.name}
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleOpenModal(project)}
                                    className="btn-icon"
                                    style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: '0.25rem' }}
                                    title="Edit project"
                                >
                                    <FaEdit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(project._id)}
                                    className="btn-icon"
                                    style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: '0.25rem' }}
                                    title="Delete project"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', margin: 0, minHeight: '3rem' }}>
                            {project.description || 'No description'}
                        </p>
                    </div>
                ))}
                {projects.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <p>No projects yet. Create one to get started!</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target.className === 'modal-overlay') handleCloseModal();
                }}>
                    <div className="modal-content">
                        <div className="modal-handle"></div>
                        <h2 style={{ marginTop: 0 }}>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project Name</label>
                                <input
                                    className="input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                <textarea
                                    className="input"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Color</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map(color => (
                                        <div
                                            key={color}
                                            onClick={() => setFormData({ ...formData, color })}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: color,
                                                cursor: 'pointer',
                                                border: formData.color === color ? '3px solid var(--text-main)' : 'none',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProject ? 'Update Project' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
