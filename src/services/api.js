import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasks';

export const getTasks = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getTask = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createTask = async (task) => {
    const response = await axios.post(API_URL, task);
    return response.data;
};

export const updateTask = async (id, updates) => {
    const response = await axios.put(`${API_URL}/${id}`, updates);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const addSubtask = async (taskId, title, description, priority, dueDate) => {
    const response = await axios.post(`${API_URL}/${taskId}/subtasks`, { title, description, priority, dueDate });
    return response.data;
};

export const updateSubtaskStatus = async (taskId, subtaskId, status) => {
    const response = await axios.put(`${API_URL}/${taskId}/subtasks/${subtaskId}`, { status });
    return response.data;
};

export const clearHistory = async (taskId) => {
    const response = await axios.delete(`${API_URL}/${taskId}/history`);
    return response.data;
};

export const updateSubtask = async (taskId, subtaskId, updates) => {
    const response = await axios.put(`${API_URL}/${taskId}/subtasks/${subtaskId}`, updates);
    return response.data;
};

export const deleteSubtask = async (taskId, subtaskId) => {
    const response = await axios.delete(`${API_URL}/${taskId}/subtasks/${subtaskId}`);
    return response.data;
};

export const getHistory = async (taskId) => {
    const response = await axios.get(`${API_URL}/${taskId}/history`);
    return response.data;
};

export const deleteHistory = async (taskId, historyId) => {
    const response = await axios.delete(`${API_URL}/${taskId}/history/${historyId}`);
    return response.data;
};

export const reorderTasks = async (tasks) => {
    const response = await axios.put(`${API_URL}/reorder`, { tasks });
    return response.data;
};

// Project APIs
const PROJECT_API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/tasks', '/projects') : 'http://localhost:5000/api/projects';

export const getProjects = async () => {
    const response = await axios.get(PROJECT_API_URL);
    return response.data;
};

export const createProject = async (project) => {
    const response = await axios.post(PROJECT_API_URL, project);
    return response.data;
};

export const updateProject = async (id, project) => {
    const response = await axios.put(`${PROJECT_API_URL}/${id}`, project);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await axios.delete(`${PROJECT_API_URL}/${id}`);
    return response.data;
};

// Analytics APIs
const ANALYTICS_API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/tasks', '/analytics') : 'http://localhost:5000/api/analytics';

export const getAnalyticsSummary = async () => {
    const response = await axios.get(`${ANALYTICS_API_URL}/summary`);
    return response.data;
};

export const getAnalyticsPriority = async () => {
    const response = await axios.get(`${ANALYTICS_API_URL}/priority`);
    return response.data;
};

export const getAnalyticsDaily = async () => {
    const response = await axios.get(`${ANALYTICS_API_URL}/daily-completion`);
    return response.data;
};




