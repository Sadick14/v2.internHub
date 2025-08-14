'use client'

import { atom, useAtom, createStore } from "jotai"
import { useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export type Role = "student" | "lecturer" | "hod" | "supervisor" | "admin"

type AppUser = {
  uid: string
  name: string
  email: string
  initials: string
  role: Role
}

const allRoles: Role[] = ["student", "lecturer", "hod", "supervisor", "admin"];

// Create a store for our atoms
const appStore = createStore();

const roleAtom = atom<Role | null>(null);
const userAtom = atom<AppUser | null>(null);
const firebaseUserAtom = atom<FirebaseUser | null>(null);
const authLoadingAtom = atom<boolean>(true);


// This is a global listener, ensures we only have one
onAuthStateChanged(auth, async (user) => {
  if (user) {
    appStore.set(firebaseUserAtom, user);
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        const name = userData.fullName || "Anonymous";
        const userRole = userData.role || "student";
        appStore.set(userAtom, {
            uid: user.uid,
            name,
            email: userData.email || "",
            initials: name.split(' ').map((n: string) => n[0]).join(''),
            role: userRole
        });
        appStore.set(roleAtom, userRole);
    } else {
        // Handle case where user exists in Auth but not in Firestore
        appStore.set(userAtom, null);
        appStore.set(roleAtom, null);
    }
  } else {
    appStore.set(userAtom, null);
    appStore.set(firebaseUserAtom, null);
    appStore.set(roleAtom, null);
  }
  appStore.set(authLoadingAtom, false);
});


export const useRole = () => {
  const [role, setRole] = useAtom(roleAtom, { store: appStore })
  const [user] = useAtom(userAtom, { store: appStore });
  const [loading] = useAtom(authLoadingAtom, { store: appStore });

  return {
    role,
    setRole,
    user,
    allRoles,
    loading
  }
}
