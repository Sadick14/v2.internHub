
'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRole } from "@/hooks/use-role"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Skeleton } from "../ui/skeleton"
import { useSidebar } from "../ui/sidebar"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function UserNav() {
  const { user, loading } = useRole()
  const router = useRouter();
  const { state: sidebarState } = useSidebar();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  if (loading) {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className={cn("space-y-1", sidebarState === 'collapsed' && 'hidden')}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-28" />
            </div>
        </div>
    )
  }

  if (!user) return null

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="ghost" className="w-full h-auto justify-start p-0 rounded-lg hover:bg-transparent">
              <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                      <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className={cn("flex flex-col items-start text-left", sidebarState === 'collapsed' && 'hidden')}>
                      <p className="text-sm font-medium text-primary-foreground leading-tight">{user.name}</p>
                      <p className="text-xs text-primary-foreground/80 leading-tight capitalize">{user.role}</p>
                  </div>
              </div>
           </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/account/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}
