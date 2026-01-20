'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Faculty {
    id: string;
    name: string;
    code: string;
}

export interface Department {
    id: string;
    name: string;
    code: string;
    facultyId: string;
}

export async function createFaculty(facultyData: { name: string, code: string }): Promise<void> {
    const facultiesCol = collection(db, 'faculties');
    await addDoc(facultiesCol, {
        ...facultyData,
        createdAt: serverTimestamp(),
    });
}

export async function updateFaculty(id: string, facultyData: Partial<Faculty>): Promise<void> {
    const facultyDoc = doc(db, 'faculties', id);
    await updateDoc(facultyDoc, facultyData);
}

export async function deleteFaculty(id: string): Promise<void> {
    // Note: In a real app, you'd handle cascading deletes for departments, users, etc.
    const facultyDoc = doc(db, 'faculties', id);
    await deleteDoc(facultyDoc);
}


export async function createDepartment(departmentData: { name: string; code: string; facultyId: string }): Promise<void> {
    const departmentsCol = collection(db, 'departments');
    await addDoc(departmentsCol, {
        ...departmentData,
        createdAt: serverTimestamp(),
    });
}

export async function updateDepartment(id: string, departmentData: Partial<Department>): Promise<void> {
    const departmentDoc = doc(db, 'departments', id);
    await updateDoc(departmentDoc, departmentData);
}

export async function deleteDepartment(id: string): Promise<void> {
    const departmentDoc = doc(db, 'departments', id);
    await deleteDoc(departmentDoc);
}


export async function getFaculties(): Promise<Faculty[]> {
    const facultiesCol = collection(db, 'faculties');
    const facultySnapshot = await getDocs(facultiesCol);
    const facultyList = facultySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Faculty));
    return facultyList;
}

export async function getFacultyById(id: string): Promise<Faculty | null> {
    const facultyDoc = doc(db, 'faculties', id);
    const facultySnapshot = await getDoc(facultyDoc);
    if(facultySnapshot.exists()) {
        return {id: facultySnapshot.id, ...facultySnapshot.data()} as Faculty;
    }
    return null;
}

export async function getDepartments(): Promise<Department[]> {
    const departmentsCol = collection(db, 'departments');
    const departmentSnapshot = await getDocs(departmentsCol);
    const departmentList = departmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
    return departmentList;
}

export async function getDepartmentById(id: string): Promise<Department | null> {
     const departmentDoc = doc(db, 'departments', id);
    const departmentSnapshot = await getDoc(departmentDoc);
    if(departmentSnapshot.exists()) {
        return {id: departmentSnapshot.id, ...departmentSnapshot.data()} as Department;
    }
    return null;
}
