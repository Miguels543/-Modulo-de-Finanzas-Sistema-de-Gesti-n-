"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, ChefHat, ClipboardList, CreditCard, Home, LogOut, Menu, Package, Settings, ShoppingCart, Users, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-provider"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Productos",
    href: "/dashboard/productos",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Facturación",
    href: "/dashboard/facturacion",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Finanzas",
    href: "/dashboard/finanzas",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Menús",
    href: "/dashboard/menus",
    icon: <ChefHat className="h-5 w-5" />,
  },
  {
    title: "Compras",
    href: "/dashboard/compras",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: "Reportes",
    href: "/dashboard/reportes",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  // Marcar que estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Verificar autenticación
  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [router, isClient, isLoading, isAuthenticated])

  // No renderizamos nada hasta que estemos en el cliente
  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando...</h2>
          <p className="text-muted-foreground">Verificando autenticación</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <ChefHat className="h-6 w-6" />
                  <span>Gestión Restaurante</span>
                </Link>
                <Button variant="ghost" size="icon" className="ml-auto md:hidden" asChild>
                  <SheetTrigger>
                    <X className="h-5 w-5" />
                  </SheetTrigger>
                </Button>
              </div>
              <nav className="grid gap-2 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-4">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <ChefHat className="h-6 w-6" />
          <span className="hidden md:inline-block">Sistema de Gestión de Restaurante</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex">
            {user && (
              <span className="text-sm text-muted-foreground">
                Usuario: <strong>{user.username}</strong>
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Cerrar sesión</span>
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
