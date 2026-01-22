import User from '../models/User.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { ERROR_MESSAGES } from '../config/constants';

export class AuthService {
    async register(name: string, email: string, password: string, employeeId?: string) {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Check if employeeId is already taken
        if (employeeId) {
            const existingEmployeeId = await User.findOne({ employeeId });
            if (existingEmployeeId) {
                throw new Error('Employee ID already exists');
            }
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            employeeId: employeeId || `EMP${Date.now()}`,
            role: 'EMPLOYEE',
            isActive: true,
        });

        const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            employeeId: user.employeeId,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
            },
            accessToken,
            refreshToken,
        };
    }

    async login(email: string, password: string) {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        if (!user.isActive) {
            throw new Error(ERROR_MESSAGES.USER_INACTIVE);
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            employeeId: user.employeeId,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const decoded = verifyRefreshToken(refreshToken);

            const user = await User.findById(decoded.id);

            if (!user || !user.isActive) {
                throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
            }

            const tokenPayload = {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
            };

            const newAccessToken = generateAccessToken(tokenPayload);

            return {
                accessToken: newAccessToken,
            };
        } catch (error) {
            throw new Error(ERROR_MESSAGES.TOKEN_INVALID);
        }
    }
}

export default new AuthService();
