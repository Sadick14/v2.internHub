'use client'

import { atom, useAtom } from "jotai"
import { useEffect, useState } from "react"
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

const roleAtom = atom<Role>("student");
const userAtom = atom<AppUser | null>(null);
const firebaseUserAtom = atom<FirebaseUser | null>(null);
const authLoadingAtom = atom<boolean>(true);


// This is a global listener, ensures we only have one
onAuthStateChanged(auth, async (user) => {
  const store = userAtom.store;
  if (user) {
    store.set(firebaseUserAtom, user);
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        const name = userData.fullName || "Anonymous";
        store.set(userAtom, {
            uid: user.uid,
            name,
            email: userData.email || "",
            initials: name.split(' ').map((n: string) => n[0]).join(''),
            role: userData.role || "student"
        });
        store.set(roleAtom, userData.role || "student");
    }
  } else {
    store.set(userAtom, null);
    store.set(firebaseUserAtom, null);
  }
  store.set(authLoadingAtom, false);
});


export const useRole = () => {
  const [role, setRole] = useAtom(roleAtom)
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(authLoadingAtom);

  return {
    role,
    setRole,
    user,
    allRoles,
    loading
  }
}
