// API Configuration
const API_BASE_URL = 'http://192.168.20.73:5000/api/v1';

// API Client
class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (data.success && data.data) {
            this.accessToken = data.data.accessToken;
            this.refreshToken = data.data.refreshToken;
            localStorage.setItem('accessToken', this.accessToken);
            localStorage.setItem('refreshToken', this.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            return data.data;
        }

        throw new Error('Login failed');
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
        }
    }

    clearAuth() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    isAuthenticated() {
        return !!this.accessToken;
    }

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    async getEmployees() {
        const data = await this.request('/employees');
        return data.data || [];
    }
}

// Create global API client instance
const apiClient = new ApiClient();

// Login Form Handler
if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.querySelector('.btn-text').style.display = 'none';
        loginBtn.querySelector('.btn-loader').style.display = 'inline';
        errorMessage.style.display = 'none';

        try {
            const result = await apiClient.login(email, password);

            // Check if user is admin
            if (result.user.role !== 'ADMIN') {
                throw new Error('Access denied. Admin privileges required.');
            }

            // Redirect to dashboard
            window.location.href = 'index.html';
        } catch (error) {
            errorMessage.textContent = error.message || 'Login failed. Please try again.';
            errorMessage.style.display = 'block';
        } finally {
            loginBtn.disabled = false;
            loginBtn.querySelector('.btn-text').style.display = 'inline';
            loginBtn.querySelector('.btn-loader').style.display = 'none';
        }
    });
}

// Dashboard Auth Check
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    if (!apiClient.isAuthenticated()) {
        window.location.href = 'login.html';
    } else {
        const user = apiClient.getUser();
        if (user && user.role !== 'ADMIN') {
            apiClient.clearAuth();
            window.location.href = 'login.html';
        }
    }
}
