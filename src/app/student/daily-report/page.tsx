
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DailyReportHistoryPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/student/reports');
    }, [router]);

    return null;
}
