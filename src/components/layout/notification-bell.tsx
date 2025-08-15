
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, CheckCheck } from 'lucide-react';
import { useRole } from '@/hooks/use-role';
import { getNotifications, markNotificationAsRead, type AppNotification } from '@/services/notificationsService';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationBell() {
    const { user } = useRole();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchNotifications = async () => {
            const userNotifications = await getNotifications(user.uid);
            setNotifications(userNotifications);
            setUnreadCount(userNotifications.filter(n => !n.isRead).length);
        };

        fetchNotifications();
    }, [user]);
    
    useEffect(() => {
        if (isOpen && user?.uid) {
             const fetchNotifications = async () => {
                const userNotifications = await getNotifications(user.uid);
                setNotifications(userNotifications);
                setUnreadCount(userNotifications.filter(n => !n.isRead).length);
            };
            fetchNotifications();
        }
    }, [isOpen, user?.uid])

    const handleMarkAsRead = async (notificationId: string) => {
        await markNotificationAsRead(notificationId);
        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };
    
    const handleMarkAllAsRead = async () => {
        for (const notification of notifications) {
            if (!notification.isRead) {
                await markNotificationAsRead(notification.id);
            }
        }
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
        setUnreadCount(0);
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                 <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-primary">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                         <span className="absolute top-0 right-0 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{unreadCount}</span>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                 <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Notifications</h4>
                        {unreadCount > 0 && 
                            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                                <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
                            </Button>
                        }
                    </div>
                </div>
                 <ScrollArea className="h-96">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                           <div
                                key={notification.id}
                                className={cn(
                                    "p-4 border-b text-sm hover:bg-gray-50",
                                    !notification.isRead && "bg-primary/5"
                                )}
                            >
                                <Link href={notification.href || '#'} className="block" onClick={() => handleMarkAsRead(notification.id)}>
                                    <p className="font-medium">{notification.title}</p>
                                    <p className="text-muted-foreground">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                    </p>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            You have no notifications.
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
