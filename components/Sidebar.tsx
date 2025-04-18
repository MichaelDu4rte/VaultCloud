"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Image from "next/image";

import { SIDENAV_ITEMS } from "../constants/links";
import { SideNavItem } from "../constants/types";
import { signOutUser } from "@/lib/actions/user.actions";
import FileUploader from "./FileUploader";

interface Props {
  fullName: string;
  avatar: string;
  userId: string;
  accountId: string;
}

const Sidebar = ({ fullName, avatar, userId, accountId }: Props) => {
  return (
    <div className="fixed hidden h-screen w-60 border-r border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 md:flex">
      <div className="flex size-full flex-col">
        {/* Topo - Logo */}
        <Link
          href="/"
          className="flex h-16 items-center space-x-3 border-b border-zinc-200 px-6 dark:border-zinc-700"
        >
          <Image src="/brand.png" alt="" width={40} height={40} />
          <span className="text-xl font-semibold tracking-tight dark:text-white">
            VaultCloud
          </span>
        </Link>

        {/* Menu */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
          {SIDENAV_ITEMS.map((item, idx) => (
            <MenuItem key={idx} item={item} />
          ))}
        </div>

        <div className="px-4 py-6">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <FileUploader
              ownerId={userId}
              accountId={accountId}
              className="flex w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-zinc-300 p-3 transition-all hover:border-zinc-500 dark:border-zinc-600 dark:hover:border-zinc-400"
            />
            <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Arraste ou clique para enviar arquivos
            </p>
          </div>
        </div>
        {/* Rodapé - Usuário */}
        <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={avatar ?? "/assets/images/avatar.png"}
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {fullName}
                </span>
                <Link
                  href="/profile"
                  className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
                >
                  Ver perfil
                </Link>
              </div>
            </div>
            <button
              className="text-zinc-500 transition dark:text-zinc-400"
              onClick={async () => {
                await signOutUser();
              }}
            >
              <Icon icon="lucide:log-out" width="20" height="20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

const MenuItem = ({ item }: { item: SideNavItem }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const isActive = pathname.startsWith(item.path);

  const toggleSubMenu = () => setSubMenuOpen(!subMenuOpen);

  return (
    <div className="group relative">
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-100 hover:shadow-sm dark:text-zinc-100 dark:hover:bg-zinc-800 ${
              isActive ? "bg-zinc-100 font-semibold dark:bg-zinc-800" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <motion.div
              animate={{ rotate: subMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon icon="lucide:chevron-down" width="18" height="18" />
            </motion.div>
          </button>

          <AnimatePresence>
            {subMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-8 mt-2 flex flex-col gap-2 border-l border-zinc-200 pl-4 dark:border-zinc-700"
              >
                {item.subMenuItems?.map((subItem, idx) => (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={`text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white ${
                      pathname === subItem.path
                        ? "font-medium text-black dark:text-white"
                        : ""
                    }`}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-100 hover:shadow-sm dark:text-zinc-100 dark:hover:bg-zinc-800 ${
            isActive ? "bg-zinc-100 font-semibold dark:bg-zinc-800" : ""
          }`}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      )}

      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-0 h-full w-1 rounded-r bg-brand-100"
        />
      )}
    </div>
  );
};
