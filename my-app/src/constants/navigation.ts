import {
  Home,
  Search,
  CheckCircle2,
  MessageSquare,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MenuConfig {
  aluno: MenuItem[];
  personal: MenuItem[];
}

/**
 * Configuração centralizada do menu de navegação inferior
 * 
 * Mantém as rotas e labels em um único lugar para fácil manutenção
 * e consistência em toda a aplicação
 */
export const BOTTOM_MENU_CONFIG: MenuConfig = {
  aluno: [
    {
      href: "/dashboard/aluno",
      label: "Home",
      icon: Home,
    },
    {
      href: "/dashboard/aluno/buscar-personal",
      label: "Buscar",
      icon: Search,
    },
    {
      href: "/dashboard/aluno/minhas-solicitacoes",
      label: "Solicitações",
      icon: CheckCircle2,
    },
    {
      href: "/dashboard/aluno/chats",
      label: "Chats",
      icon: MessageSquare,
    },
    {
      href: "/dashboard/aluno/complete-perfil",
      label: "Perfil",
      icon: User,
    },
  ],
  personal: [
    {
      href: "/dashboard/personal",
      label: "Home",
      icon: Home,
    },
    {
      href: "/dashboard/personal/solicitacoes",
      label: "Solicitações",
      icon: CheckCircle2,
    },
    {
      href: "/dashboard/personal/chats",
      label: "Chats",
      icon: MessageSquare,
    },
    {
      href: "/dashboard/personal/complete-perfil",
      label: "Perfil",
      icon: User,
    },
  ],
};
