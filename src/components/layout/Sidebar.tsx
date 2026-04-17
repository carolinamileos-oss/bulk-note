'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, History, CalendarDays,
  ShoppingCart, TrendingUp, Shuffle, Leaf, Menu, X, Apple
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/recipes', label: 'Receitas', icon: BookOpen },
  { href: '/ingredients', label: 'Ingredientes', icon: Apple },
  { href: '/history', label: 'Histórico', icon: History },
  { href: '/planning', label: 'Planeamento', icon: CalendarDays },
  { href: '/shopping', label: 'Lista de Compras', icon: ShoppingCart },
  { href: '/costs', label: 'Custos', icon: TrendingUp },
  { href: '/substitutions', label: 'Substituições', icon: Shuffle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-foreground text-base leading-tight">Bulk Note</h1>
            <p className="text-xs text-muted-foreground">Dieta de ganho</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted">
          <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center">
            <span className="text-white text-xs font-semibold">B</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Bulk Note</p>
            <p className="text-xs text-muted-foreground">Uso pessoal</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-border">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-white border border-border shadow-sm flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white border-r border-border shadow-xl animate-fade-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
