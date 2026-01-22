import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILocationLog extends Document {
    employeeId: Types.ObjectId;
    latitude: number;
    longitude: number;
    accuracy: number;
    batteryLevel?: number;
    timestamp: Date;
    sessionId: Types.ObjectId;
    createdAt: Date;
}

const locationLogSchema = new Schema<ILocationLog>(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180,
        },
        accuracy: {
            type: Number,
            required: true,
            min: 0,
        },
        batteryLevel: {
            type: Number,
            min: 0,
            max: 100,
        },
        timestamp: {
            type: Date,
            required: true,
            index: true,
        },
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: 'ActivitySession',
            required: true,
            index: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound index for efficient queries
locationLogSchema.index({ employeeId: 1, timestamp: -1 });
locationLogSchema.index({ sessionId: 1, timestamp: -1 });

// TTL index - automatically delete records older than 90 days
locationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model<ILocationLog>('LocationLog', locationLogSchema);
