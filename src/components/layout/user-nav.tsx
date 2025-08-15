
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

export function UserNav() {
  const { user, loading } = useRole()
  const router = useRouter();
  const { state: sidebarState } = useSidebar();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  if (loading) {
    return <Skeleton className="h-9 w-9 rounded-full" />
  }

  if (!user) return null

  if (sidebarState === 'collapsed') {
     return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-primary/80">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://placehold.co/40x40.png`} alt={user.name} data-ai-hint="person portrait" />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
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
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
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

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="ghost" className="w-full h-auto justify-start p-2 rounded-lg hover:bg-primary/80">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://placehold.co/40x40.png`} alt={user.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 items-start">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">
                        {user.email}
                      </p>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-2"/>
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
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
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
