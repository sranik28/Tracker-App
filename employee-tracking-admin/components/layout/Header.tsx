'use client';

import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
    const { user } = useAuthStore();

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-6 gap-4 justify-between">
                <div className="font-semibold text-lg">
                    Employee Tracker
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-right hidden md:block">
                        <p className="font-medium">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Avatar>
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}`} />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
