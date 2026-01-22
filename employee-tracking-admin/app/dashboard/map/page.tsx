'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import Map component with ssr disabled
const MapView = dynamic(() => import('@/components/map/Map'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-[600px] w-full" />
                <p className="text-muted-foreground">Loading Map...</p>
            </div>
        </div>
    ),
});

export default function MapPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Live Tracking</h1>
            </div>

            <Card className="h-full overflow-hidden border-2">
                <MapView />
            </Card>
        </div>
    );
}
