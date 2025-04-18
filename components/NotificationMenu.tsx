"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="h-[45px] gap-2 rounded-lg bg-[#f0f0f0] px-5 text-[#333] shadow-drop-1 hover:bg-[#e0e0e0]"
        >
          <Bell className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuItem>Nenhuma nova notificação</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
