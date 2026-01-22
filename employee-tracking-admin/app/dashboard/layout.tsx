'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, user } = useAuth(true);
    useSocket(); // Initialize socket connection

    // Prevent flicker before auth check completes is handled by useAuth redirect,
    // but we can return null here to be safe if user is not authenticated yet
    if (!isAuthenticated && typeof window !== 'undefined') {
        return null;
    }

    return (
        <div className="min-h-screen flex bg-background">
            <div className="hidden md:block w-64 fixed h-full z-30">
                <Sidebar className="h-full" />
            </div>
            <div className="flex-1 flex flex-col md:pl-64 h-screen overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 bg-secondary/10">
                    {children}
                </main>
            </div>
        </div>
    );
}
