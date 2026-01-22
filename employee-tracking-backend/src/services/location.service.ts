import LocationLog from '../models/LocationLog.model';
import ActivitySession from '../models/ActivitySession.model';
import { ACTIVITY_STATUS, ERROR_MESSAGES } from '../config/constants';
import { Types } from 'mongoose';
import { shouldSaveLocation } from '../utils/distance.util';
import env from '../config/env';

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    batteryLevel?: number;
    timestamp: Date;
}

export class LocationService {
    async trackLocation(employeeId: Types.ObjectId, locationData: LocationData) {
        const activeSession = await ActivitySession.findOne({
            employeeId,
            status: ACTIVITY_STATUS.ON,
        });

        if (!activeSession) {
            throw new Error(ERROR_MESSAGES.SESSION_NOT_ACTIVE);
        }

        const lastLocation = await LocationLog.findOne({
            employeeId,
            sessionId: activeSession._id,
        })
            .sort({ timestamp: -1 })
            .select('latitude longitude timestamp')
            .lean();

        const shouldSave = shouldSaveLocation(
            lastLocation,
            locationData,
            env.LOCATION_DISTANCE_THRESHOLD,
            env.LOCATION_TIME_THRESHOLD
        );

        if (!shouldSave) {
            return {
                saved: false,
                message: 'Location not saved (below threshold)',
            };
        }

        const location = await LocationLog.create({
            employeeId,
            sessionId: activeSession._id,
            ...locationData,
        });

        return {
            saved: true,
            locationId: location._id,
            timestamp: location.timestamp,
        };
    }

    async trackBatchLocations(employeeId: Types.ObjectId, locations: LocationData[]) {
        const activeSession = await ActivitySession.findOne({
            employeeId,
            status: ACTIVITY_STATUS.ON,
        });

        if (!activeSession) {
            throw new Error(ERROR_MESSAGES.SESSION_NOT_ACTIVE);
        }

        const lastLocation = await LocationLog.findOne({
            employeeId,
            sessionId: activeSession._id,
        })
            .sort({ timestamp: -1 })
            .select('latitude longitude timestamp')
            .lean();

        const locationsToSave: any[] = [];
        let previousLocation: { latitude: number; longitude: number; timestamp: Date } | null = lastLocation;

        for (const locationData of locations) {
            const shouldSave = shouldSaveLocation(
                previousLocation,
                locationData,
                env.LOCATION_DISTANCE_THRESHOLD,
                env.LOCATION_TIME_THRESHOLD
            );

            if (shouldSave) {
                locationsToSave.push({
                    employeeId,
                    sessionId: activeSession._id,
                    ...locationData,
                });
                previousLocation = {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                    timestamp: locationData.timestamp,
                };
            }
        }

        if (locationsToSave.length === 0) {
            return {
                saved: 0,
                total: locations.length,
            };
        }

        await LocationLog.insertMany(locationsToSave);

        return {
            saved: locationsToSave.length,
            total: locations.length,
        };
    }

    async getLocationHistory(
        employeeId: Types.ObjectId,
        startDate?: Date,
        endDate?: Date,
        limit: number = 100
    ) {
        const query: any = { employeeId };

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = startDate;
            if (endDate) query.timestamp.$lte = endDate;
        }

        const locations = await LocationLog.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('latitude longitude accuracy batteryLevel timestamp sessionId')
            .lean();

        return locations;
    }

    async getLatestLocation(employeeId: Types.ObjectId) {
        const location = await LocationLog.findOne({ employeeId })
            .sort({ timestamp: -1 })
            .select('latitude longitude accuracy timestamp')
            .lean();

        return location;
    }

    async getActiveLocationsSnapshot() {
        const activeSessions = await ActivitySession.find({
            status: ACTIVITY_STATUS.ON
        }).populate('employeeId', 'name email employeeId');

        const snapshot = await Promise.all(activeSessions.map(async (session) => {
            const latestLocation = await LocationLog.findOne({
                sessionId: session._id
            })
                .sort({ timestamp: -1 })
                .select('latitude longitude accuracy timestamp')
                .lean();

            if (!latestLocation) return null;

            return {
                _id: latestLocation._id,
                employee: session.employeeId,
                session: session,
                location: {
                    type: 'Point',
                    coordinates: [latestLocation.longitude, latestLocation.latitude]
                },
                accuracy: latestLocation.accuracy,
                timestamp: latestLocation.timestamp
            };
        }));

        return snapshot.filter(Boolean);
    }
}

export default new LocationService();
