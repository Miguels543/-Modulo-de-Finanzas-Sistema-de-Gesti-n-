"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Download, Edit, FileText, Filter, Plus, Search, ShoppingCart, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Tipos de datos
interface OrdenCompra {
  id: number
  codigo: string
  fecha: string
  proveedor: string
  estado: "pendiente" | "recibida" | "cancelada"
  total: number
  fechaEntrega: string
  metodoPago: string
  notas: string
  items: ItemCompra[]
}

interface ItemCompra {
  id: number
  producto: string
  cantidad: number
  unidad: string
  precioUnitario: number
  subtotal: number
}

interface Proveedor {
  id: number
  nombre: string
}

export default function ComprasPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [filtroCodigo, setFiltroCodigo] = useState("")
  const [filtroProveedor, setFiltroProveedor] = useState("all")
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [ordenActual, setOrdenActual] = useState<OrdenCompra | null>(null)
  const [modalDetalles, setModalDetalles] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)

  // Datos de ejemplo
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      const ordenesDummy: OrdenCompra[] = [
        {
          id: 1,
          codigo: "OC-2023-001",
          fecha: "2023-05-14",
          proveedor: "Distribuidora Olivares",
          estado: "recibida",
          total: 1250.75,
          fechaEntrega: "2023-05-16",
          metodoPago: "Transferencia",
          notas: "Entrega en horario de mañana",
          items: [
            {
              id: 1,
              producto: "Aceite de oliva extra virgen",
              cantidad: 10,
              unidad: "Botella 500ml",
              precioUnitario: 45.9,
              subtotal: 459.0,
            },
            {
              id: 2,
              producto: "Vinagre balsámico",
              cantidad: 5,
              unidad: "Botella 250ml",
              precioUnitario: 28.5,
              subtotal: 142.5,
            },
            {
              id: 3,
              producto: "Sal de mar",
              cantidad: 8,
              unidad: "Paquete 1kg",
              precioUnitario: 12.5,
              subtotal: 100.0,
            },
          ],
        },
        {
          id: 2,
          codigo: "OC-2023-002",
          fecha: "2023-05-13",
          proveedor: "Lácteos Premium",
          estado: "pendiente",
          total: 850.0,
          fechaEntrega: "2023-05-17",
          metodoPago: "Crédito 30 días",
          notas: "Confirmar stock de queso parmesano",
          items: [
            {
              id: 1,
              producto: "Queso parmesano",
              cantidad: 5,
              unidad: "Kg",
              precioUnitario: 85.0,
              subtotal: 425.0,
            },
            {
              id: 2,
              producto: "Queso mozzarella",
              cantidad: 8,
              unidad: "Kg",
              precioUnitario: 45.0,
              subtotal: 360.0,
            },
            {
              id: 3,
              producto: "Crema de leche",
              cantidad: 5,
              unidad: "Litro",
              precioUnitario: 13.0,
              subtotal: 65.0,
            },
          ],
        },
        {
          id: 3,
          codigo: "OC-2023-003",
          fecha: "2023-05-12",
          proveedor: "Viñedos del Sur",
          estado: "cancelada",
          total: 1560.0,
          fechaEntrega: "2023-05-15",
          metodoPago: "Transferencia",
          notas: "Cancelado por falta de stock del proveedor",
          items: [
            {
              id: 1,
              producto: "Vino tinto reserva",
              cantidad: 12,
              unidad: "Botella 750ml",
              precioUnitario: 120.0,
              subtotal: 1440.0,
            },
            {
              id: 2,
              producto: "Vino blanco",
              cantidad: 2,
              unidad: "Botella 750ml",
              precioUnitario: 60.0,
              subtotal: 120.0,
            },
          ],
        },
        {
          id: 4,
          codigo: "OC-2023-004",
          fecha: "2023-05-10",
          proveedor: "Importadora Gourmet",
          estado: "recibida",
          total: 720.5,
          fechaEntrega: "2023-05-12",
          metodoPago: "Efectivo",
          notas: "Entrega completa",
          items: [
            {
              id: 1,
              producto: "Arroz arborio",
              cantidad: 15,
              unidad: "Kg",
              precioUnitario: 18.5,
              subtotal: 277.5,
            },
            {
              id: 2,
              producto: "Pasta italiana",
              cantidad: 20,
              unidad: "Paquete 500g",
              precioUnitario: 12.5,
              subtotal: 250.0,
            },
            {
              id: 3,
              producto: "Trufas negras",
              cantidad: 2,
              unidad: "Frasco 50g",
              precioUnitario: 96.5,
              subtotal: 193.0,
            },
          ],
        },
      ]

      const proveedoresDummy: Proveedor[] = [
        { id: 1, nombre: "Distribuidora Olivares" },
        { id: 2, nombre: "Importadora Gourmet" },
        { id: 3, nombre: "Lácteos Premium" },
        { id: 4, nombre: "Viñedos del Sur" },
        { id: 5, nombre: "Pastificio Italiano" },
        { id: 6, nombre: "Carnes Premium" },
        { id: 7, nombre: "Pescados y Mariscos del Mar" },
      ]

      setOrdenesCompra(ordenesDummy)
      setProveedores(proveedoresDummy)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filtrar órdenes de compra
  const ordenesFiltradas = ordenesCompra.filter((orden) => {
    return (
      orden.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()) &&
      (filtroProveedor === "all" || orden.proveedor === filtroProveedor) &&
      (filtroEstado === "all" || orden.estado === filtroEstado)
    )
  })

  // Manejadores de eventos
  const handleVerDetalles = (orden: OrdenCompra) => {
    setOrdenActual(orden)
    setModalDetalles(true)
  }

  const handleEliminarOrden = (orden: OrdenCompra) => {
    setOrdenActual(orden)
    setModalEliminar(true)
  }

  const confirmarEliminar = () => {
    if (ordenActual) {
      setOrdenesCompra(ordenesCompra.filter((o) => o.id !== ordenActual.id))
      toast({
        title: "Orden eliminada",
        description: `La orden de compra ${ordenActual.codigo} ha sido eliminada correctamente.`,
      })
      setModalEliminar(false)
    }
  }

  // Función para exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Órdenes de Compra", 14, 16); // Título del PDF
    autoTable(doc, {
      head: [['Código', 'Fecha', 'Proveedor', 'Total']],
      body: ordenesCompra.map(orden => [orden.codigo, orden.fecha, orden.proveedor, formatCurrency(orden.total)]),
      startY: 20, // Comienza la tabla debajo del título
    });
    doc.save('ordenes.pdf');
  }

  // Renderizado condicional para carga
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando órdenes de compra...</h2>
          <p className="text-muted-foreground">Por favor espere mientras cargamos los datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
          <p className="text-muted-foreground">Gestión de órdenes de compra a proveedores</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="recibidas">Recibidas</TabsTrigger>
            <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={exportarPDF}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por código..."
                  className="pl-8"
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                />
              </div>
              <Select value={filtroProveedor} onValueChange={setFiltroProveedor}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proveedores</SelectItem>
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} value={proveedor.nombre}>
                      {proveedor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="recibida">Recibida</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="hidden md:table-cell">Entrega</TableHead>
                  <TableHead className="hidden md:table-cell">Método de pago</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordenesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mb-2" />
                        <h3 className="text-lg font-medium">No se encontraron órdenes de compra</h3>
                        <p>Intenta cambiar los filtros o crea una nueva orden</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  ordenesFiltradas.map((orden) => (
                    <TableRow key={orden.id}>
                      <TableCell className="font-medium">{orden.codigo}</TableCell>
                      <TableCell>{formatDate(orden.fecha)}</TableCell>
                      <TableCell>{orden.proveedor}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(orden.fechaEntrega)}</TableCell>
                      <TableCell className="hidden md:table-cell">{orden.metodoPago}</TableCell>
                      <TableCell>{formatCurrency(orden.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            orden.estado === "recibida"
                              ? "default"
                              : orden.estado === "pendiente"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {orden.estado === "recibida"
                            ? "Recibida"
                            : orden.estado === "pendiente"
                              ? "Pendiente"
                              : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <ChevronDown className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleVerDetalles(orden)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleEliminarOrden(orden)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {ordenesFiltradas.length} de {ordenesCompra.length} órdenes
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Tabs>

      {/* Modal para ver detalles de orden */}
      <Dialog open={modalDetalles} onOpenChange={setModalDetalles}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de Orden de Compra</DialogTitle>
            <DialogDescription>Información completa de la orden {ordenActual?.codigo}</DialogDescription>
          </DialogHeader>
          {ordenActual && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Información de orden</h3>
                  <div className="mt-2 space-y-1">
                    <p className="flex justify-between">
                      <span className="font-medium">Código:</span>
                      <span>{ordenActual.codigo}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Fecha:</span>
                      <span>{formatDate(ordenActual.fecha)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <Badge
                        variant={
                          ordenActual.estado === "recibida"
                            ? "default"
                            : ordenActual.estado === "pendiente"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {ordenActual.estado === "recibida"
                          ? "Recibida"
                          : ordenActual.estado === "pendiente"
                            ? "Pendiente"
                            : "Cancelada"}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Información del proveedor</h3>
                  <div className="mt-2 space-y-1">
                    <p className="flex justify-between">
                      <span className="font-medium">Proveedor:</span>
                      <span>{ordenActual.proveedor}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Entrega:</span>
                      <span>{formatDate(ordenActual.fechaEntrega)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Método de pago:</span>
                      <span>{ordenActual.metodoPago}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Detalle de productos</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordenActual.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.producto}</TableCell>
                        <TableCell className="text-right">{item.cantidad}</TableCell>
                        <TableCell>{item.unidad}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.precioUnitario)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {ordenActual.notas && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Notas</h3>
                  <p className="text-sm">{ordenActual.notas}</p>
                </div>
              )}

              <div className="flex justify-between border-t pt-4">
                <span className="font-medium text-lg">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(ordenActual.total)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDetalles(false)}>
              Cerrar
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar eliminación */}
      <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar la orden <strong>{ordenActual?.codigo}</strong>? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEliminar(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEliminar}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
