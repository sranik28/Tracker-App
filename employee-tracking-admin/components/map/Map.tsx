'use client';

import { useEffect, Suspense } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import { useEmployeeStore } from '@/store/employeeStore';
import L from 'leaflet';

// Fix for default Leaflet icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

// Component to handle map center updates if needed
function MapUpdater() {
    const map = useMap();
    const searchParams = useSearchParams();
    const focusId = searchParams.get('focus');
    const { activeEmployees } = useEmployeeStore();

    useEffect(() => {
        map.invalidateSize();

        if (focusId) {
            // Find the employee in active employees
            // We need to iterate map values to find by employeeId (string) or _id
            const activeEmployee = Array.from(activeEmployees.values()).find(p => {
                const pEmpId = typeof p.employee === 'string' ? p.employee : p.employee.employeeId;
                // Compare with both DB ID and custom EmployeeID to be safe
                const pDbId = typeof p.employee === 'string' ? p.employee : p.employee._id;
                return pEmpId === focusId || pDbId === focusId;
            });

            if (activeEmployee) {
                map.flyTo([activeEmployee.location.coordinates[1], activeEmployee.location.coordinates[0]], 16);
            }
        }
    }, [map, focusId, activeEmployees]);

    return null;
}

export default function MapView() {
    const { activeEmployees } = useEmployeeStore();

    // Initial center (Dhaka, Bangladesh as default)
    const defaultCenter: [number, number] = [23.8103, 90.4125];

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Suspense fallback={null}>
                    <MapUpdater />
                </Suspense>

                {Array.from(activeEmployees.values()).map((point) => {
                    // Find employee details
                    const employeeLabel = typeof point.employee === 'string' ? point.employee : (point.employee.name || point.employee.employeeId);

                    return (
                        <Marker
                            key={point._id}
                            position={[point.location.coordinates[1], point.location.coordinates[0]]}
                            icon={defaultIcon}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold">{employeeLabel}</h3>
                                    <p className="text-sm">Accuracy: {Math.round(point.accuracy)}m</p>
                                    <p className="text-xs text-muted-foreground">
                                        Updated: {new Date(point.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
