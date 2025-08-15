
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, serverTimestamp, doc, updateDoc, orderBy, getDoc } from 'firebase/firestore';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { getUserById } from './userService';
import { createNotification } from './notificationsService';

export interface DailyTask {
    id: string;
    studentId: string;
    internshipId: string;
    supervisorId: string;
    date: Date;
    description: string;
    learningObjectives: string;
    status: 'Pending' | 'Completed' | 'Approved' | 'Rejected';
    supervisorFeedback?: string;
    createdAt: Date;
}

export interface NewDailyTask {
    studentId: string;
    internshipId: string;
    supervisorId: string;
    date: Date;
    description: string;
    learningObjectives: string;
}

const tasksCollectionRef = collection(db, 'daily_tasks');

export async function createTask(taskData: NewDailyTask): Promise<void> {
    await addDoc(tasksCollectionRef, {
        ...taskData,
        status: 'Pending',
        createdAt: serverTimestamp(),
    });
    
    const supervisorProfile = await getUserById(taskData.supervisorId);
    const studentProfile = await getUserById(taskData.studentId);

    if (supervisorProfile && studentProfile) {
        await createNotification({
            userId: supervisorProfile.uid,
            title: 'New Task Declared',
            message: `${studentProfile.fullName} has declared a new task for today.`,
            href: '/supervisor/tasks'
        });
    }
}

export async function getTasksByDate(studentId: string, date: Date): Promise<DailyTask[]> {
    // Simplified query to avoid composite index requirement.
    // We fetch all tasks for a student and then filter by date in the application code.
    const q = query(
        tasksCollectionRef,
        where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(q);

    const todayInterval = {
        start: startOfDay(date),
        end: endOfDay(date),
    };

    const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as DailyTask;
    });

    // Filter by date and sort in the application code
    const tasksForDate = tasks
        .filter(task => isWithinInterval(task.date, todayInterval))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return tasksForDate;
}

export async function getAllTasksByStudentId(studentId: string): Promise<DailyTask[]> {
    const q = query(
        tasksCollectionRef,
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as DailyTask;
    });
}


export async function getTasksBySupervisor(supervisorAuthId: string, statusFilter: DailyTask['status'][]): Promise<DailyTask[]> {
    const supervisorProfile = await getUserById(supervisorAuthId);
    if (!supervisorProfile || !supervisorProfile.firestoreId) {
        console.error("Could not find supervisor profile for auth UID:", supervisorAuthId);
        return [];
    }
    const supervisorFirestoreId = supervisorProfile.firestoreId;

    const q = query(
        tasksCollectionRef,
        where('supervisorId', '==', supervisorFirestoreId)
    );
    const snapshot = await getDocs(q);

    const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as DailyTask;
    });

    // Filter by status and sort by date in code to avoid composite index
    return tasks
        .filter(task => statusFilter.includes(task.status))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function updateTaskStatus(taskId: string, status: 'Completed' | 'Approved' | 'Rejected', supervisorFeedback?: string): Promise<void> {
    const taskRef = doc(db, 'daily_tasks', taskId);
    const dataToUpdate: any = { status };
    if (supervisorFeedback) {
        dataToUpdate.supervisorFeedback = supervisorFeedback;
    }
    await updateDoc(taskRef, dataToUpdate);

    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists()) return;

    const taskData = taskSnap.data() as DailyTask;
    
    if (status === 'Approved' || status === 'Rejected') {
        const student = await getUserById(taskData.studentId);
        if (student) {
            await createNotification({
                userId: student.uid,
                title: `Task ${status}`,
                message: `Your supervisor has ${status.toLowerCase()} your task: "${taskData.description.substring(0, 30)}..."`,
                href: '/student/daily-tasks'
            });
        }
    }
}
