"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  CheckCircle2,
  MessageSquare,
  User,
} from "lucide-react";
import { BOTTOM_MENU_CONFIG } from "@/constants/navigation";

/**
 * BottomMenu Component
 * 
 * Componente de navegação fixa inferior exibido apenas em dispositivos móveis.
 * Renderiza menu adaptativo baseado no tipo de usuário (aluno/personal).
 * 
 * @component
 * @example
 * // Uso no layout
 * import BottomMenu from "@/app/_components/BottomMenu";
 * 
 * export function RootLayout({ children }) {
 *   return (
 *     <SessionProvider>
 *       {children}
 *       <BottomMenu />
 *     </SessionProvider>
 *   );
 * }
 */
export default function BottomMenu() {
  const pathname = usePathname();

  // Detectar tipo de usuário baseado na pathname
  const isAluno = Boolean(pathname?.includes("/aluno"));
  const isPersonal = Boolean(pathname?.includes("/personal"));

  // Não renderizar se não está em dashboard
  const isDashboard = isAluno || isPersonal;

  /**
   * Verifica se o link atual é a rota ativa
   */
  const isActive = (href: string): boolean => pathname === href;

  /**
   * Obter itens do menu baseado no tipo de usuário
   */
  const getMenuItems = () => {
    return isAluno ? BOTTOM_MENU_CONFIG.aluno : BOTTOM_MENU_CONFIG.personal;
  };

  // Não renderizar se não está em dashboard
  if (!isDashboard) {
    return null;
  }

  const menuItems = getMenuItems();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
      role="navigation"
      aria-label="Menu inferior de navegação"
    >
      <div className="flex justify-around items-center h-16">
        {/* Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                active
                  ? "text-[#319F43] bg-green-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
              <span className="text-xs mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
