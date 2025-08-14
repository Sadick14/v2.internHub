
'use client'

import { atom, useAtom, createStore } from "jotai"
import { useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc, query, where, collection, getDocs } from "firebase/firestore"

export type Role = "student" | "lecturer" | "hod" | "supervisor" | "admin"

type AppUser = {
  uid: string // This will be the Firestore Document ID
  authUid: string // This is the Firebase Auth UID
  name: string
  email: string
  initials: string
  role: Role,
  internshipId?: string
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
    // Use the auth uid to find the user document
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const name = userData.fullName || "Anonymous";
        const userRole = userData.role || "student";
        appStore.set(userAtom, {
            uid: userDoc.id, // Firestore Document ID
            authUid: user.uid, // Firebase Auth UID
            name,
            email: userData.email || "",
            initials: name.split(' ').map((n: string) => n[0]).join(''),
            role: userRole,
            internshipId: userData.internshipId,
        });
        appStore.set(roleAtom, userRole);
    } else {
        // Handle case where user exists in Auth but not in Firestore
        // This might happen if registration didn't complete
        console.warn(`[useRole] No Firestore document found for user UID: ${user.uid}`);
        appStore.set(userAtom, null);
        appStore.set(roleAtom, null);
    }
  } else {
    // No user logged in
    appStore.set(userAtom, null);
    appStore.set(firebaseUserAtom, null);
    appStore.set(roleAtom, null);
  }
  // Finished loading
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
