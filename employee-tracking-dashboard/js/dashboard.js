// Dashboard Manager
class DashboardManager {
    constructor() {
        this.employees = [];
        this.filter = 'all';
        this.searchQuery = '';
    }

    async initialize() {
        console.log('🚀 Initializing dashboard...');

        // Set admin name
        const user = apiClient.getUser();
        if (user) {
            document.getElementById('adminName').textContent = user.name;
        }

        // Initialize map
        mapManager.initialize();

        // Connect to Socket.IO
        socketManager.connect();

        // Set up event listeners
        this.setupEventListeners();

        // Load initial data
        await this.loadEmployees();

        // Set up real-time updates
        this.setupRealtimeUpdates();

        console.log('✅ Dashboard initialized');
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            await apiClient.logout();
            window.location.href = 'login.html';
        });

        // Filter buttons
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filter = e.target.dataset.filter;
                this.renderEmployeeList();
            });
        });

        // Search input
        document.getElementById('searchEmployee').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderEmployeeList();
        });

        // Map controls
        document.getElementById('centerMapBtn').addEventListener('click', () => {
            mapManager.centerOnEmployees();
        });

        document.getElementById('refreshBtn').addEventListener('click', async () => {
            await this.loadEmployees();
        });
    }

    setupRealtimeUpdates() {
        // Listen for location updates
        socketManager.on('locationUpdate', (data) => {
            console.log('📍 Real-time location update:', data);
            this.updateEmployeeLocation(data);
        });

        // Listen for session updates
        socketManager.on('sessionUpdate', (data) => {
            console.log('🔄 Real-time session update:', data);
            this.updateEmployeeSession(data);
        });
    }

    async loadEmployees() {
        try {
            const employees = await apiClient.getEmployees();
            this.employees = employees.map(emp => ({
                id: emp._id,
                name: emp.name,
                email: emp.email,
                employeeId: emp.employeeId,
                isActive: emp.isActive,
                isTracking: false,
                latitude: null,
                longitude: null,
                lastUpdate: null,
            }));

            this.renderEmployeeList();
            this.updateStatistics();
            console.log(`Loaded ${this.employees.length} employees`);
        } catch (error) {
            console.error('Failed to load employees:', error);
        }
    }

    updateEmployeeLocation(data) {
        const employee = this.employees.find(emp => emp.id === data.employeeId);
        if (employee) {
            employee.latitude = data.latitude;
            employee.longitude = data.longitude;
            employee.lastUpdate = data.timestamp;
            employee.isTracking = true;

            // Update map marker
            mapManager.addOrUpdateMarker(employee);

            // Update employee list
            this.renderEmployeeList();
            this.updateStatistics();
        }
    }

    updateEmployeeSession(data) {
        const employee = this.employees.find(emp => emp.id === data.employeeId);
        if (employee) {
            employee.isTracking = data.status === 'ON';
            employee.lastUpdate = data.timestamp;

            // Update map marker or remove it
            if (employee.isTracking && employee.latitude && employee.longitude) {
                mapManager.addOrUpdateMarker(employee);
            } else {
                mapManager.removeMarker(employee.id);
            }

            // Update employee list
            this.renderEmployeeList();
            this.updateStatistics();
        }
    }

    renderEmployeeList() {
        const listContainer = document.getElementById('employeeList');

        // Filter employees
        let filtered = this.employees;

        if (this.filter === 'tracking') {
            filtered = filtered.filter(emp => emp.isTracking);
        } else if (this.filter === 'offline') {
            filtered = filtered.filter(emp => !emp.isTracking);
        }

        if (this.searchQuery) {
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(this.searchQuery) ||
                emp.email.toLowerCase().includes(this.searchQuery) ||
                (emp.employeeId && emp.employeeId.toLowerCase().includes(this.searchQuery))
            );
        }

        // Render employee items
        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="loading-state">
                    <p>No employees found</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = filtered.map(emp => `
            <div class="employee-item" data-id="${emp.id}">
                <div class="employee-header">
                    <div class="employee-status ${emp.isTracking ? 'tracking' : ''}"></div>
                    <div class="employee-name">${emp.name}</div>
                </div>
                <div class="employee-details">
                    <div>ID: ${emp.employeeId || 'N/A'}</div>
                    <div>Status: ${emp.isTracking ? '🟢 Tracking' : '🔴 Offline'}</div>
                    ${emp.lastUpdate ? `<div>Last update: ${this.formatTime(emp.lastUpdate)}</div>` : ''}
                </div>
            </div>
        `).join('');

        // Add click handlers
        listContainer.querySelectorAll('.employee-item').forEach(item => {
            item.addEventListener('click', () => {
                const empId = item.dataset.id;
                const employee = this.employees.find(e => e.id === empId);
                if (employee && employee.latitude && employee.longitude) {
                    mapManager.map.setView([employee.latitude, employee.longitude], 16);
                    mapManager.markers[empId]?.openPopup();
                }
            });
        });
    }

    updateStatistics() {
        const total = this.employees.length;
        const tracking = this.employees.filter(emp => emp.isTracking).length;
        const offline = total - tracking;

        document.getElementById('totalEmployees').textContent = total;
        document.getElementById('trackingCount').textContent = tracking;
        document.getElementById('offlineCount').textContent = offline;

        // Note: todaySessions would need a separate API call
        // For now, we'll keep it as 0 or implement later
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardManager();
    dashboard.initialize();
});
