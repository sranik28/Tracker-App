import User from '../models/User.model';
import { ROLES, ERROR_MESSAGES } from '../config/constants';
import { Types } from 'mongoose';

interface CreateEmployeeData {
    name: string;
    email: string;
    password: string;
    employeeId: string;
}

interface UpdateEmployeeData {
    name?: string;
    email?: string;
    isActive?: boolean;
}

export class EmployeeService {
    async createEmployee(data: CreateEmployeeData) {
        const existingUser = await User.findOne({
            $or: [{ email: data.email }, { employeeId: data.employeeId }],
        });

        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
            }
            throw new Error(ERROR_MESSAGES.DUPLICATE_EMPLOYEE_ID);
        }

        const employee = await User.create({
            ...data,
            role: ROLES.EMPLOYEE,
            isActive: true,
        });

        return {
            id: employee._id,
            name: employee.name,
            email: employee.email,
            employeeId: employee.employeeId,
            isActive: employee.isActive,
            createdAt: employee.createdAt,
        };
    }

    async getEmployees(filters: { isActive?: boolean } = {}) {
        const query: any = { role: ROLES.EMPLOYEE };

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        const employees = await User.find(query)
            .select('_id name email employeeId role isActive createdAt updatedAt')
            .sort({ createdAt: -1 })
            .lean();

        return employees;
    }

    async getEmployeeById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid employee ID');
        }

        const employee = await User.findOne({
            _id: id,
            role: ROLES.EMPLOYEE,
        }).select('_id name email employeeId role isActive createdAt updatedAt').lean();

        if (!employee) {
            throw new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);
        }

        return employee;
    }

    async updateEmployee(id: string, data: UpdateEmployeeData) {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid employee ID');
        }

        const employee = await User.findOneAndUpdate(
            { _id: id, role: ROLES.EMPLOYEE },
            { $set: data },
            { new: true, runValidators: true }
        ).select('name email employeeId isActive updatedAt');

        if (!employee) {
            throw new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);
        }

        return employee;
    }

    async updateEmployeeStatus(id: string, isActive: boolean) {
        return this.updateEmployee(id, { isActive });
    }
}

export default new EmployeeService();
