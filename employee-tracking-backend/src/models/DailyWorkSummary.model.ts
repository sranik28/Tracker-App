import mongoose, { Schema, Document, Types } from 'mongoose';

export interface SessionSummary {
    sessionId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    duration: number;
}

export interface IDailyWorkSummary extends Document {
    employeeId: Types.ObjectId;
    date: Date;
    totalMinutes: number;
    sessions: SessionSummary[];
    createdAt: Date;
    updatedAt: Date;
}

const dailyWorkSummarySchema = new Schema<IDailyWorkSummary>(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        totalMinutes: {
            type: Number,
            required: true,
            default: 0,
        },
        sessions: [
            {
                sessionId: {
                    type: Schema.Types.ObjectId,
                    ref: 'ActivitySession',
                    required: true,
                },
                startTime: {
                    type: Date,
                    required: true,
                },
                endTime: {
                    type: Date,
                    required: true,
                },
                duration: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Unique compound index
dailyWorkSummarySchema.index({ employeeId: 1, date: 1 }, { unique: true });
dailyWorkSummarySchema.index({ date: -1 });

export default mongoose.model<IDailyWorkSummary>('DailyWorkSummary', dailyWorkSummarySchema);
