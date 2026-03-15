const API_URL = 'http://localhost:5001/api';

// --- Toast Notifications ---
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    const icon = type === 'success'
        ? `<i class="fa-solid fa-circle-check"></i>`
        : `<i class="fa-solid fa-circle-exclamation"></i>`;

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

// --- API Service Utilities ---
const api = {
    // Config
    getHeaders() {
        const user = JSON.parse(localStorage.getItem('user'));
        return {
            'Content-Type': 'application/json',
            'Authorization': user ? `Bearer ${user.token}` : ''
        };
    },

    // Auth checks
    checkAuth() {
        const user = localStorage.getItem('user');
        const path = window.location.pathname;

        if (!user && !path.includes('login.html') && !path.includes('signup.html')) {
            window.location.href = 'login.html';
        } else if (user && (path.includes('login.html') || path.includes('signup.html'))) {
            window.location.href = 'index.html';
        }
        return JSON.parse(user);
    },

    logout() {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    // Auth endpoints
    async login(email, password) {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');
            return data;
        } catch (err) {
            throw err;
        }
    },

    async signup(name, email, password, role) {
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Signup failed');
            return data;
        } catch (err) {
            throw err;
        }
    },

    async getUsers() {
        try {
            const res = await fetch(`${API_URL}/auth/users`, {
                headers: this.getHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (err) {
            if (err.message.includes('Not authorized')) this.logout();
            throw err;
        }
    },

    // Projects endpoints
    async getProjects() {
        try {
            const res = await fetch(`${API_URL}/projects`, {
                headers: this.getHeaders()
            });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 401) this.logout();
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            throw err;
        }
    },

    async createProject(projectData) {
        try {
            const res = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(projectData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (err) {
            throw err;
        }
    },

    async updateProject(id, projectData) {
        try {
            const res = await fetch(`${API_URL}/projects/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(projectData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (err) {
            throw err;
        }
    },

    async deleteProject(id) {
        try {
            const res = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (err) {
            throw err;
        }
    },

    // Tasks endpoints
    async getTasks(projectId = '') {
        try {
            const url = projectId ? `${API_URL}/tasks?projectId=${projectId}` : `${API_URL}/tasks`;
            const res = await fetch(url, {
                headers: this.getHeaders()
            });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 401) this.logout();
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            throw err;
        }
    },

    async createTask(taskData) {
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(taskData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (err) {
            throw err;
        }
    },

    async updateTask(id, taskData) {
        try {
            const res = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(taskData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (err) {
            throw err;
        }
    },

    async deleteTask(id) {
        try {
            const res = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (err) {
            throw err;
        }
    }
};
