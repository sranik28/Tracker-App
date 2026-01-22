'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Map,
    Settings,
    LogOut,
    Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { clearUser } = useAuthStore();

    const handleLogout = async () => {
        try {
            await apiClient.logout();
            clearUser();
            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Force logout even if API call fails
            clearUser();
            router.push('/login');
        }
    };

    const links = [
        {
            href: '/dashboard',
            label: 'Overview',
            icon: LayoutDashboard,
        },
        {
            href: '/dashboard/map',
            label: 'Live Map',
            icon: Map,
        },
        {
            href: '/dashboard/employees',
            label: 'Employees',
            icon: Users,
        },
        {
            href: '/dashboard/settings',
            label: 'Settings',
            icon: Settings,
        },
    ];

    return (
        <div className={cn('pb-12 min-h-screen border-r bg-background', className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Admin Dashboard
                    </h2>
                    <div className="space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Button
                                    key={link.href}
                                    variant={pathname === link.href ? 'secondary' : 'ghost'}
                                    className={cn(
                                        'w-full justify-start',
                                        pathname === link.href && 'bg-secondary'
                                    )}
                                    asChild
                                >
                                    <Link href={link.href}>
                                        <Icon className="mr-2 h-4 w-4" />
                                        {link.label}
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="px-3 py-2 mt-auto absolute bottom-4 w-full border-t pt-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
