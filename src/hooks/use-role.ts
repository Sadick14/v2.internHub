'use client'

import { atom, useAtom } from "jotai"

export type Role = "student" | "lecturer" | "hod" | "supervisor" | "admin"

type User = {
  name: string
  email: string
  initials: string
}

const roleAtom = atom<Role>("student")

const users: Record<Role, User> = {
  student: { name: "Alex Doe", email: "alex.doe@university.edu", initials: "AD" },
  lecturer: { name: "Dr. Evelyn Reed", email: "e.reed@university.edu", initials: "ER" },
  hod: { name: "Prof. Samuel Chen", email: "s.chen@university.edu", initials: "SC" },
  supervisor: { name: "Jane Smith", email: "jane.s@company.com", initials: "JS" },
  admin: { name: "Admin User", email: "admin@internshiptrack.app", initials: "AU" },
}

export const useRole = () => {
  const [role, setRole] = useAtom(roleAtom)

  return {
    role,
    setRole,
    user: users[role],
    allRoles: Object.keys(users) as Role[],
  }
}
