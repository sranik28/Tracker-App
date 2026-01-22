import mongoose from 'mongoose';
import User from '../models/User.model';
import env from '../config/env';
import { ROLES } from '../config/constants';

const createAdmin = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@example.com';
        const password = 'admin123';
        const name = 'System Admin';

        let user = await User.findOne({ email });

        if (user) {
            console.log('Admin user found, updating details...');
            user.password = password; // Pre-save hook will hash this
            user.role = ROLES.ADMIN;
            user.name = name;
            await user.save();
            console.log('Admin user updated successfully');
        } else {
            console.log('Creating new admin user...');
            user = await User.create({
                email,
                password, // Pre-save hook will hash this
                name,
                role: ROLES.ADMIN,
                isActive: true,
                employeeId: 'ADMIN-001'
            });
            console.log('Admin user created successfully');
        }

        console.log(`Credentials: ${email} / ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
