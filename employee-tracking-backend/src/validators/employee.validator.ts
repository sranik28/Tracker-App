import { z } from 'zod';

export const createEmployeeSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        employeeId: z.string().min(1, 'Employee ID is required'),
    }),
});

export const updateEmployeeSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        isActive: z.boolean().optional(),
    }),
    params: z.object({
        id: z.string().min(1, 'Employee ID is required'),
    }),
});

export const updateEmployeeStatusSchema = z.object({
    body: z.object({
        isActive: z.boolean(),
    }),
    params: z.object({
        id: z.string().min(1, 'Employee ID is required'),
    }),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>['body'];
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>['body'];
export type UpdateEmployeeStatusInput = z.infer<typeof updateEmployeeStatusSchema>['body'];
