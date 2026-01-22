// Map Manager
class MapManager {
    constructor() {
        this.map = null;
        this.markers = {};
        this.defaultCenter = [23.8103, 90.4125]; // Dhaka, Bangladesh
        this.defaultZoom = 12;
    }

    initialize() {
        // Initialize Leaflet map
        this.map = L.map('map').setView(this.defaultCenter, this.defaultZoom);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(this.map);

        console.log('🗺️ Map initialized');
    }

    addOrUpdateMarker(employee) {
        const { id, name, latitude, longitude, isTracking } = employee;

        if (!latitude || !longitude) {
            return;
        }

        const position = [latitude, longitude];

        // Create custom icon based on tracking status
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-pin ${isTracking ? 'tracking' : 'offline'}">
                    <div class="marker-dot"></div>
                </div>
            `,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -42],
        });

        // If marker exists, update position
        if (this.markers[id]) {
            this.markers[id].setLatLng(position);
            this.markers[id].setIcon(icon);
            this.markers[id].getPopup().setContent(this.createPopupContent(employee));
        } else {
            // Create new marker
            const marker = L.marker(position, { icon })
                .addTo(this.map)
                .bindPopup(this.createPopupContent(employee));

            this.markers[id] = marker;
        }
    }

    removeMarker(employeeId) {
        if (this.markers[employeeId]) {
            this.map.removeLayer(this.markers[employeeId]);
            delete this.markers[employeeId];
        }
    }

    createPopupContent(employee) {
        const { name, employeeId, lastUpdate, isTracking } = employee;
        const status = isTracking ? '🟢 Tracking' : '🔴 Offline';
        const time = lastUpdate ? this.formatTime(lastUpdate) : 'N/A';

        return `
            <div style="padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px;">${name}</h3>
                <p style="margin: 4px 0; font-size: 13px; color: #666;">
                    <strong>ID:</strong> ${employeeId || 'N/A'}
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #666;">
                    <strong>Status:</strong> ${status}
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #666;">
                    <strong>Last Update:</strong> ${time}
                </p>
            </div>
        `;
    }

    centerOnEmployees() {
        const positions = Object.values(this.markers).map(marker => marker.getLatLng());

        if (positions.length === 0) {
            this.map.setView(this.defaultCenter, this.defaultZoom);
            return;
        }

        if (positions.length === 1) {
            this.map.setView(positions[0], 15);
            return;
        }

        const bounds = L.latLngBounds(positions);
        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    }
}

// Add custom marker styles
const style = document.createElement('style');
style.textContent = `
    .custom-marker {
        background: none;
        border: none;
    }
    
    .marker-pin {
        width: 30px;
        height: 42px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .marker-pin::before {
        content: '';
        position: absolute;
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        top: 0;
        left: 0;
    }
    
    .marker-pin.tracking::before {
        background: #4CAF50;
        box-shadow: 0 4px 8px rgba(76, 175, 80, 0.4);
    }
    
    .marker-pin.offline::before {
        background: #F44336;
        box-shadow: 0 4px 8px rgba(244, 67, 54, 0.4);
    }
    
    .marker-dot {
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        position: relative;
        z-index: 1;
        margin-bottom: 12px;
    }
`;
document.head.appendChild(style);

// Create global map manager instance
const mapManager = new MapManager();
