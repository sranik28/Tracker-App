'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    useAuth(false); // Redirect to dashboard if already logged in

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useAuthStore();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await apiClient.login(data);

            // Check if user is admin
            if (response.user.role !== 'ADMIN') {
                toast.error('Access denied. Admin privileges required.');
                apiClient.clearTokens();
                return;
            }

            setUser(response.user);

            // Save user to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Admin Dashboard</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to access the employee tracking system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    }
                                })}
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
                                Demo: admin@example.com / admin123
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
