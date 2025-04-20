import { Icon } from "@iconify/react";

import { SideNavItem } from "./types";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Home",
    path: "/",
    icon: <Icon icon="lucide:home" width="24" height="24" />,
  },
  {
    title: "LI",
    path: "/li",
    icon: <Icon icon="lucide:file-cog" width="24" height="24" />,
    submenu: true,
    subMenuItems: [
      { title: "Controle de li", path: "/li/controledeli" },
      { title: "Recebimento", path: "/li/recebimentodeli" },
    ],
  },
  {
    title: "Certificados",
    path: "/certificados",
    icon: <Icon icon="lucide:shield-check" width="24" height="24" />,
  },
  {
    title: "Configurações",
    path: "/settings",
    icon: <Icon icon="lucide:settings" width="24" height="24" />,
    submenu: true,
    subMenuItems: [
      { title: "Usuarios", path: "/settings/users" },
      { title: "Perfil", path: "/settings/profile" },
    ],
  },
  {
    title: "Help",
    path: "/help",
    icon: <Icon icon="lucide:help-circle" width="24" height="24" />,
  },
];
