"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CreditCard, DollarSign, TrendingDown, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    ventasHoy: 2580.5,
    ventasSemana: 15420.75,
    clientesNuevos: 8,
    productosAgotados: 5,
    ventasPorCategoria: [
      { categoria: "Entradas", valor: 3250.5 },
      { categoria: "Platos principales", valor: 8750.25 },
      { categoria: "Postres", valor: 1850.0 },
      { categoria: "Bebidas", valor: 1570.0 },
    ],
    ultimasVentas: [
      { id: "F-2023-001", cliente: "Juan Pérez", total: 185.5, fecha: "2023-05-14" },
      { id: "F-2023-002", cliente: "María López", total: 320.75, fecha: "2023-05-14" },
      { id: "F-2023-003", cliente: "Carlos Gómez", total: 95.0, fecha: "2023-05-13" },
      { id: "F-2023-004", cliente: "Ana Martínez", total: 210.25, fecha: "2023-05-13" },
    ],
    productosAgotadosLista: [
      { id: 1, nombre: "Aceite de oliva extra virgen", categoria: "Aceites" },
      { id: 2, nombre: "Queso parmesano", categoria: "Lácteos" },
      { id: 3, nombre: "Vino blanco", categoria: "Bebidas" },
      { id: 4, nombre: "Camarones", categoria: "Mariscos" },
      { id: 5, nombre: "Chocolate amargo", categoria: "Repostería" },
    ],
  })

  const [loadingSession, setLoadingSession] = useState(true)

  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem("session")
      if (!session) {
        router.replace("/login")
      } else {
        setLoadingSession(false)
        setIsLoading(false)
        toast({
          title: "Bienvenido al sistema",
          description: "Los datos del dashboard han sido cargados",
        })
      }
    }

    checkSession()
  }, [router, toast])

  if (loadingSession) {
    return null // o un spinner simple, evita renderizar el dashboard mientras no validas sesión
  }

  const handleLogout = () => {
    setIsLoading(true)
    localStorage.removeItem("session")
    router.replace("/login")
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando dashboard...</h2>
          <p className="text-muted-foreground">Por favor espere mientras cargamos los datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de la actividad del restaurante</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del día</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.ventasHoy)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-4 w-4 text-green-500" />
              +12% respecto a ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de la semana</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.ventasSemana)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="mr-1 inline h-4 w-4 text-red-500" />
              -5% respecto a la semana pasada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes nuevos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.clientesNuevos}</div>
            <p className="text-xs text-muted-foreground">En la última semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos agotados</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.productosAgotados}</div>
            <p className="text-xs text-muted-foreground">En inventario</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen" className="text-xs">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="categorias" className="text-xs">
            Ventas por Categoría
          </TabsTrigger>
          <TabsTrigger value="productos" className="text-xs">
            Productos Agotados
          </TabsTrigger>
          <TabsTrigger value="ventas" className="text-xs">
            Últimas Ventas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visión general de ventas</CardTitle>
              <CardDescription>Datos de ventas del día y la semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:justify-around">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-lg font-semibold">{formatCurrency(dashboardData.ventasHoy)}</p>
                    <p className="text-sm text-muted-foreground">Ventas hoy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-lg font-semibold">{formatCurrency(dashboardData.ventasSemana)}</p>
                    <p className="text-sm text-muted-foreground">Ventas esta semana</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Categoría</CardTitle>
              <CardDescription>Distribución de ventas por tipo de plato</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {dashboardData.ventasPorCategoria.map((item) => (
                  <li key={item.categoria} className="flex justify-between">
                    <span>{item.categoria}</span>
                    <span>{formatCurrency(item.valor)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos Agotados</CardTitle>
              <CardDescription>Lista de productos sin stock</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {dashboardData.productosAgotadosLista.map((prod) => (
                  <li key={prod.id}>
                    <strong>{prod.nombre}</strong> - <em>{prod.categoria}</em>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ventas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Ventas</CardTitle>
              <CardDescription>Resumen de facturas recientes</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Factura</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.ultimasVentas.map((venta) => (
                    <tr key={venta.id}>
                      <td className="border border-gray-300 px-4 py-2">{venta.id}</td>
                      <td className="border border-gray-300 px-4 py-2">{venta.cliente}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(venta.total)}</td>
                      <td className="border border-gray-300 px-4 py-2">{venta.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
