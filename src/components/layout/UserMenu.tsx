"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export type UserMenuProps = {
  name: string;
  email: string;
  /** Avatar URL override (optional — fallback to initials) */
  avatarUrl?: string;
};

/**
 * User avatar dropdown menu for the OS Glass App Header.
 * Shows user initials in a circular avatar and a dropdown with
 * Profile, Settings, and Sign Out options.
 */
export function UserMenu({ name, email }: UserMenuProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild aria-label={`${name} menu`}>
        <button className="shAppHeaderAvatar" type="button" aria-label={`${name} menu`}>
          <span className="shAppHeaderAvatarFallback">{initials}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Help & Feedback</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-rose">Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
