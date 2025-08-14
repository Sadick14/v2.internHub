'use client'

import { useRole, type Role } from "@/hooks/use-role"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function RoleSwitcher() {
  const { role, setRole, allRoles } = useRole()

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole)
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="role-switcher" className="text-sm font-medium whitespace-nowrap">
        Viewing as:
      </Label>
      <Select value={role} onValueChange={handleRoleChange}>
        <SelectTrigger id="role-switcher" className="w-full md:w-[180px]">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          {allRoles.map((r) => (
            <SelectItem key={r} value={r} className="capitalize">
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
