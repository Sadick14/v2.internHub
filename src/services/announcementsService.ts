'use server';

import { getAllUsers, type Role, type UserProfile } from "./userService";
import { createNotification } from "./notificationsService";
import { sendAnnouncementEmail } from "./emailService";
import { createAuditLog } from "./auditLogService";

export type AnnouncementTarget = 'all' | 'students' | 'lecturers' | 'supervisors' | 'admins' | 'hods';

interface AnnouncementPayload {
    actor: { uid: string; name: string, email: string };
    title: string;
    message: string;
    targetRoles: AnnouncementTarget;
}

export async function sendAnnouncement(payload: AnnouncementPayload): Promise<{ success: boolean; message: string; recipientsCount?: number }> {
    const { actor, title, message, targetRoles } = payload;

    try {
        const allUsers = await getAllUsers();
        let targetUsers: UserProfile[] = [];

        if (targetRoles === 'all') {
            targetUsers = allUsers.filter(u => u.status === 'active');
        } else {
            // map plural to singular roles
            const roleMap: Record<AnnouncementTarget, Role | null> = {
                all: null,
                students: 'student',
                lecturers: 'lecturer',
                supervisors: 'supervisor',
                admins: 'admin',
                hods: 'hod',
            };
            const targetRole = roleMap[targetRoles];
            if (targetRole) {
                targetUsers = allUsers.filter(u => u.role === targetRole && u.status === 'active');
            }
        }

        if (targetUsers.length === 0) {
            return { success: false, message: 'No active users found for the selected audience.' };
        }

        // Use Promise.all to send notifications and emails concurrently
        await Promise.all(targetUsers.map(async (user) => {
            // Create in-app notification
            await createNotification({
                userId: user.uid,
                type: 'ANNOUNCEMENT', // We'll need to add this type
                title: title,
                message: message.substring(0, 150) + (message.length > 150 ? '...' : ''), // Keep notification message shorter
                href: '/dashboard', // Or a dedicated announcements page later
            });

            // Send email
            await sendAnnouncementEmail(user.email, user.fullName, title, message);
        }));

        // Create a single audit log for the action
        await createAuditLog({
            userId: actor.uid,
            userName: actor.name,
            userEmail: actor.email,
            action: 'Send Announcement',
            details: `Sent announcement "${title}" to ${targetRoles} (${targetUsers.length} users).`,
        });

        return { success: true, message: 'Announcement sent successfully.', recipientsCount: targetUsers.length };

    } catch (error: any) {
        console.error("Error sending announcement:", error);
        return { success: false, message: `An unexpected error occurred: ${error.message}` };
    }
}
