import mongoose, { Schema, Document, Types } from 'mongoose';
import { ACTIVITY_STATUS } from '../config/constants';

export interface IActivitySession extends Document {
    employeeId: Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    status: typeof ACTIVITY_STATUS.ON | typeof ACTIVITY_STATUS.OFF | typeof ACTIVITY_STATUS.AUTO_OFF;
    startLocation: {
        lat: number;
        lng: number;
    };
    endLocation?: {
        lat: number;
        lng: number;
    };
    duration: number;
    createdAt: Date;
    updatedAt: Date;
}

const activitySessionSchema = new Schema<IActivitySession>(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
        },
        status: {
            type: String,
            enum: Object.values(ACTIVITY_STATUS),
            required: true,
            default: ACTIVITY_STATUS.ON,
        },
        startLocation: {
            lat: {
                type: Number,
                required: true,
            },
            lng: {
                type: Number,
                required: true,
            },
        },
        endLocation: {
            lat: Number,
            lng: Number,
        },
        duration: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes
activitySessionSchema.index({ employeeId: 1, startTime: -1 });
activitySessionSchema.index({ status: 1 });
activitySessionSchema.index({ createdAt: 1 });

// Calculate duration before saving
activitySessionSchema.pre('save', function (next) {
    if (this.endTime && this.startTime) {
        this.duration = Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 60000);
    }
    next();
});

export default mongoose.model<IActivitySession>('ActivitySession', activitySessionSchema);
