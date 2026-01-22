import mongoose from 'mongoose';
import ActivitySession from '../models/ActivitySession.model';
import LocationLog from '../models/LocationLog.model';
import env from '../config/env';
import { ACTIVITY_STATUS } from '../config/constants';

const checkActiveSessions = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const activeSessions = await ActivitySession.find({ status: ACTIVITY_STATUS.ON });
        console.log(`Found ${activeSessions.length} active sessions.`);

        if (activeSessions.length > 0) {
            for (const session of activeSessions) {
                console.log(`Session ID: ${session._id}, Employee: ${session.employeeId}, Start: ${session.startTime}`);

                const latestLog = await LocationLog.findOne({ sessionId: session._id }).sort({ timestamp: -1 });
                if (latestLog) {
                    console.log(`  Latest Log: Lat: ${latestLog.latitude}, Lng: ${latestLog.longitude}, Time: ${latestLog.timestamp}`);
                } else {
                    console.log(`  No location logs found for this session.`);
                }
            }
        } else {
            console.log('No active sessions found. Please start tracking from the mobile app.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking sessions:', error);
        process.exit(1);
    }
};

checkActiveSessions();
