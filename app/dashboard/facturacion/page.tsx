"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Download, FileText, Filter, Plus, Printer, Search, Trash } from "lucide-react"
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
import autoTable from "jspdf-autotable"
import jsPDF from "jspdf"

// Tipos de datos
interface Factura {
  id: number
  numero: string
  cliente: string
  fecha: string
  total: number
  estado: "pagada" | "pendiente" | "anulada"
  metodoPago: string
  items: FacturaItem[]
}

interface FacturaItem {
  id: number
  producto: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export default function FacturacionPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [filtroNumero, setFiltroNumero] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [facturaActual, setFacturaActual] = useState<Factura | null>(null)
  const [modalDetalles, setModalDetalles] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)

  // Datos de ejemplo
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      const facturasDummy: Factura[] = [
        {
          id: 1,
          numero: "F-2023-001",
          cliente: "Juan Pérez",
          fecha: "2023-05-14",
          total: 185.5,
          estado: "pagada",
          metodoPago: "Efectivo",
          items: [
            {
              id: 1,
              producto: "Lomo saltado",
              cantidad: 2,
              precioUnitario: 35.0,
              subtotal: 70.0,
            },
            {
              id: 2,
              producto: "Ceviche",
              cantidad: 1,
              precioUnitario: 45.5,
              subtotal: 45.5,
            },
            {
              id: 3,
              producto: "Chicha morada",
              cantidad: 3,
              precioUnitario: 8.0,
              subtotal: 24.0,
            },
            {
              id: 4,
              producto: "Postre del día",
              cantidad: 2,
              precioUnitario: 12.0,
              subtotal: 24.0,
            },
          ],
        },
        {
          id: 2,
          numero: "F-2023-002",
          cliente: "María López",
          fecha: "2023-05-14",
          total: 320.75,
          estado: "pagada",
          metodoPago: "Tarjeta de crédito",
          items: [
            {
              id: 1,
              producto: "Parrilla familiar",
              cantidad: 1,
              precioUnitario: 180.0,
              subtotal: 180.0,
            },
            {
              id: 2,
              producto: "Ensalada mixta",
              cantidad: 2,
              precioUnitario: 25.0,
              subtotal: 50.0,
            },
            {
              id: 3,
              producto: "Vino tinto",
              cantidad: 1,
              precioUnitario: 65.0,
              subtotal: 65.0,
            },
          ],
        },
        {
          id: 3,
          numero: "F-2023-003",
          cliente: "Carlos Gómez",
          fecha: "2023-05-13",
          total: 95.0,
          estado: "pagada",
          metodoPago: "Efectivo",
          items: [
            {
              id: 1,
              producto: "Pollo a la brasa",
              cantidad: 1,
              precioUnitario: 65.0,
              subtotal: 65.0,
            },
            {
              id: 2,
              producto: "Gaseosa 1L",
              cantidad: 1,
              precioUnitario: 10.0,
              subtotal: 10.0,
            },
            {
              id: 3,
              producto: "Papas fritas",
              cantidad: 1,
              precioUnitario: 20.0,
              subtotal: 20.0,
            },
          ],
        },
        {
          id: 4,
          numero: "F-2023-004",
          cliente: "Ana Martínez",
          fecha: "2023-05-13",
          total: 210.25,
          estado: "pendiente",
          metodoPago: "Transferencia",
          items: [
            {
              id: 1,
              producto: "Arroz con mariscos",
              cantidad: 2,
              precioUnitario: 55.0,
              subtotal: 110.0,
            },
            {
              id: 2,
              producto: "Causa limeña",
              cantidad: 1,
              precioUnitario: 35.0,
              subtotal: 35.0,
            },
            {
              id: 3,
              producto: "Pisco sour",
              cantidad: 3,
              precioUnitario: 18.0,
              subtotal: 54.0,
            },
          ],
        },
        {
          id: 5,
          numero: "F-2023-005",
          cliente: "Restaurante El Dorado",
          fecha: "2023-05-12",
          total: 1250.8,
          estado: "anulada",
          metodoPago: "Transferencia",
          items: [
            {
              id: 1,
              producto: "Aceite de oliva (caja)",
              cantidad: 5,
              precioUnitario: 120.0,
              subtotal: 600.0,
            },
            {
              id: 2,
              producto: "Queso parmesano (kg)",
              cantidad: 3,
              precioUnitario: 85.0,
              subtotal: 255.0,
            },
            {
              id: 3,
              producto: "Vino tinto reserva (caja)",
              cantidad: 2,
              precioUnitario: 180.0,
              subtotal: 360.0,
            },
          ],
        },
      ]

      setFacturas(facturasDummy)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filtrar facturas - Corregido para mostrar todas por defecto
  const facturasFiltradas = facturas.filter((factura) => {
    return (
      factura.numero.toLowerCase().includes(filtroNumero.toLowerCase()) &&
      (filtroEstado === "all" || factura.estado === filtroEstado)
    )
  })

  // Manejadores de eventos
  const handleVerDetalles = (factura: Factura) => {
    setFacturaActual(factura)
    setModalDetalles(true)
  }

  const handleEliminarFactura = (factura: Factura) => {
    setFacturaActual(factura)
    setModalEliminar(true)
  }

  const confirmarEliminar = () => {
    if (facturaActual) {
      setFacturas(facturas.filter((f) => f.id !== facturaActual.id))
      toast({
        title: "Factura eliminada",
        description: `La factura ${facturaActual.numero} ha sido eliminada correctamente.`,
      })
      setModalEliminar(false)
    }
  }

  // Función para exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Facturas", 14, 16); // Título del PDF
    autoTable(doc, {
      head: [['Número', 'Cliente', 'Fecha', 'Método de Pago', 'Total', 'Estado']],
      body: facturas.map(factura => [
        factura.numero,
        factura.cliente,
        formatDate(factura.fecha),
        factura.metodoPago,
        formatCurrency(factura.total),
        factura.estado
      ]),
      startY: 20, // Comienza la tabla debajo del título
    });
    doc.save('facturas.pdf');
  }

  // Renderizado condicional para carga
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando facturas...</h2>
          <p className="text-muted-foreground">Por favor espere mientras cargamos los datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground">Gestión de facturas y ventas</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pagadas">Pagadas</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="anuladas">Anuladas</TabsTrigger>
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
                  placeholder="Buscar por número de factura..."
                  className="pl-8"
                  value={filtroNumero}
                  onChange={(e) => setFiltroNumero(e.target.value)}
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pagada">Pagada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="hidden md:table-cell">Método de pago</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facturasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-2" />
                        <h3 className="text-lg font-medium">No se encontraron facturas</h3>
                        <p>Intenta cambiar los filtros o crea una nueva factura</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  facturasFiltradas.map((factura) => (
                    <TableRow key={factura.id}>
                      <TableCell className="font-medium">{factura.numero}</TableCell>
                      <TableCell>{factura.cliente}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(factura.fecha)}</TableCell>
                      <TableCell className="hidden md:table-cell">{factura.metodoPago}</TableCell>
                      <TableCell>{formatCurrency(factura.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            factura.estado === "pagada"
                              ? "default"
                              : factura.estado === "pendiente"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {factura.estado === "pagada"
                            ? "Pagada"
                            : factura.estado === "pendiente"
                              ? "Pendiente"
                              : "Anulada"}
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
                            <DropdownMenuItem onClick={() => handleVerDetalles(factura)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimir
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Descargar PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleEliminarFactura(factura)}
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
              Mostrando {facturasFiltradas.length} de {facturas.length} facturas
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

      {/* Modal para ver detalles de factura */}
      <Dialog open={modalDetalles} onOpenChange={setModalDetalles}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de Factura</DialogTitle>
            <DialogDescription>Información completa de la factura {facturaActual?.numero}</DialogDescription>
          </DialogHeader>
          {facturaActual && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Información de factura</h3>
                  <div className="mt-2 space-y-1">
                    <p className="flex justify-between">
                      <span className="font-medium">Número:</span>
                      <span>{facturaActual.numero}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Fecha:</span>
                      <span>{formatDate(facturaActual.fecha)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <Badge
                        variant={
                          facturaActual.estado === "pagada"
                            ? "default"
                            : facturaActual.estado === "pendiente"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {facturaActual.estado === "pagada"
                          ? "Pagada"
                          : facturaActual.estado === "pendiente"
                            ? "Pendiente"
                            : "Anulada"}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Información del cliente</h3>
                  <div className="mt-2 space-y-1">
                    <p className="flex justify-between">
                      <span className="font-medium">Cliente:</span>
                      <span>{facturaActual.cliente}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Método de pago:</span>
                      <span>{facturaActual.metodoPago}</span>
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
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturaActual.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.producto}</TableCell>
                        <TableCell className="text-right">{item.cantidad}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.precioUnitario)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between border-t pt-4">
                <span className="font-medium text-lg">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(facturaActual.total)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDetalles(false)}>
              Cerrar
            </Button>
            <Button>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
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
              ¿Está seguro que desea eliminar la factura <strong>{facturaActual?.numero}</strong>? Esta acción no se
              puede deshacer.
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
