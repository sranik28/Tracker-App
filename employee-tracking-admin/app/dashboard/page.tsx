'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { Users, Activity, MapPin, Clock } from 'lucide-react';
import type { DashboardStats } from '@/lib/types';
import { useSocket } from '@/hooks/useSocket'; // Ensure socket is connected

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    useSocket(); // Connect to socket for updates

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiClient.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Total Employees',
            value: stats?.totalEmployees || 0,
            icon: Users,
            description: 'Registered employees',
        },
        {
            title: 'Active Sessions',
            value: stats?.activeSessions || 0,
            icon: Activity,
            description: 'Currently tracking',
        },
        {
            title: 'Total Sessions',
            value: stats?.totalSessions || 0,
            icon: Clock,
            description: 'All time sessions',
        },
        {
            title: 'Active Employees',
            value: stats?.activeEmployees || 0,
            icon: MapPin,
            description: 'Online now',
        },
    ];

    if (isLoading) {
        return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-4 w-4 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-12 bg-muted rounded mb-2"></div>
                        <div className="h-3 w-32 bg-muted rounded"></div>
                    </CardContent>
                </Card>
            ))}
        </div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
