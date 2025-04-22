"use client";

import { Bell, Package, Trash2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getImpsComLIsDeferindoHoje } from "@/lib/actions/li.actions";

type Notification = {
  id: string;
  imp: string;
  importador: string;
  lida: boolean;
};

const COOKIE_KEY = "notifications";

export function NotificationMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const init = async () => {
      const stored = Cookies.get(COOKIE_KEY);
      let existing: Notification[] = [];
      if (stored) {
        existing = JSON.parse(stored);
      }

      try {
        const imps = await getImpsComLIsDeferindoHoje();
        const fetched = imps.map((item, idx) => ({
          id: `${item.imp}-${idx}`,
          imp: item.imp,
          importador: item.importador,
          lida: false,
        }));

        const merged = [
          ...fetched.filter((f) => !existing.some((e) => e.id === f.id)),
          ...existing,
        ];

        setNotifications(merged);
        Cookies.set(COOKIE_KEY, JSON.stringify(merged));
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
        setNotifications(existing);
      }
    };

    init();
  }, []);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const markAllAsRead = () => {
    const novas = notifications.map((n) => ({ ...n, lida: true }));
    setNotifications(novas);
    Cookies.set(COOKIE_KEY, JSON.stringify(novas));
  };

  const clearAll = () => {
    setNotifications([]);
    Cookies.set(COOKIE_KEY, JSON.stringify([]));
  };

  const markAsRead = (id: string) => {
    const novas = notifications.map((n) =>
      n.id === id ? { ...n, lida: true } : n
    );
    setNotifications(novas);
    Cookies.set(COOKIE_KEY, JSON.stringify(novas));
  };

  const deleteNotification = (id: string) => {
    const novas = notifications.filter((n) => n.id !== id);
    setNotifications(novas);
    Cookies.set(COOKIE_KEY, JSON.stringify(novas));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="relative size-[45px] rounded-xl bg-[#f0f0f0] p-0 text-[#333] shadow-drop-1 hover:bg-[#e0e0e0] dark:border dark:border-white/20 dark:bg-zinc-900 dark:text-white"
        >
          <Bell className="size-6" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-tr from-[#60A5FA] via-[#3B82F6] to-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white shadow-lg ring-2 ring-white/20 dark:ring-black/30">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] rounded-xl p-0 shadow-xl dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
          <DropdownMenuLabel className="text-base font-semibold text-zinc-900 dark:text-white">
            Notificações
          </DropdownMenuLabel>
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-black/80 hover:underline dark:text-white/80"
            >
              Marcar todas
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-black/80 hover:underline dark:text-white/80"
            >
              Limpar tudo
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Nenhuma nova notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group flex items-start gap-3 border-b border-zinc-800 p-4 transition-colors ${
                  notification.lida
                    ? "opacity-50"
                    : "bg-zinc-100 hover:bg-zinc-100 hover:opacity-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="mt-1">
                  <Package className="size-5 text-purple-700 dark:text-purple-400" />
                </div>
                <div className="flex flex-1 flex-col text-sm">
                  <p className="font-medium text-black dark:text-white">
                    LI prevista com deferimento para hoje
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {notification.imp} — Importador:{" "}
                    <span className="font-medium text-purple-300">
                      {notification.importador}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!notification.lida && (
                    <button
                      title="Marcar como lida"
                      onClick={() => markAsRead(notification.id)}
                      className="text-green/80 hover:text-green"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    title="Excluir"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red/80 hover:text-red"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
