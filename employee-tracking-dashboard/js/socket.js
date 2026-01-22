// Socket.IO Connection Manager
class SocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.listeners = {};
    }

    connect() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('No access token found');
            return;
        }

        // Connect to admin namespace
        this.socket = io('http://192.168.20.73:5000/admin', {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Socket connected');
            this.connected = true;
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            this.connected = false;
            this.updateConnectionStatus(false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.updateConnectionStatus(false);
        });

        // Listen for location updates
        this.socket.on('location:update', (data) => {
            console.log('📍 Location update:', data);
            this.emit('locationUpdate', data);
        });

        // Listen for session updates
        this.socket.on('session:update', (data) => {
            console.log('🔄 Session update:', data);
            this.emit('sessionUpdate', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;

        const dot = statusElement.querySelector('.status-dot');
        const text = statusElement.querySelector('.status-text');

        if (connected) {
            dot.classList.add('connected');
            dot.classList.remove('disconnected');
            text.textContent = 'Connected';
        } else {
            dot.classList.remove('connected');
            dot.classList.add('disconnected');
            text.textContent = 'Disconnected';
        }
    }
}

// Create global socket manager instance
const socketManager = new SocketManager();
