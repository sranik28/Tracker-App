import { z } from 'zod';

const locationSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0),
    batteryLevel: z.number().min(0).max(100).optional(),
    timestamp: z.string().datetime().or(z.date()),
});

export const trackLocationSchema = z.object({
    body: locationSchema,
});

export const batchLocationSchema = z.object({
    body: z.object({
        locations: z.array(locationSchema).min(1).max(50),
    }),
});

export const locationHistorySchema = z.object({
    params: z.object({
        employeeId: z.string().min(1),
    }),
    query: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.string().regex(/^\d+$/).optional(),
    }),
});

export type TrackLocationInput = z.infer<typeof trackLocationSchema>['body'];
export type BatchLocationInput = z.infer<typeof batchLocationSchema>['body'];
export type LocationHistoryQuery = z.infer<typeof locationHistorySchema>['query'];
