"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  BarChart3,
  ChevronDown,
  Download,
  Edit,
  FileText,
  Filter,
  Search,
  Trash,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import autoTable from "jspdf-autotable"
import jsPDF from "jspdf"

// Tipos de datos
interface Movimiento {
  id: number
  codigo: string
  fecha: string
  tipo: "ingreso" | "egreso"
  categoria: string
  concepto: string
  monto: number
  metodoPago: string
  referencia: string
  notas: string
}

interface Categoria {
  id: number
  nombre: string
  tipo: "ingreso" | "egreso"
}

export default function FinanzasPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [filtroConcepto, setFiltroConcepto] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("all")
  const [filtroCategoria, setFiltroCategoria] = useState("all")
  const [movimientoActual, setMovimientoActual] = useState<Movimiento | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)

  // Datos de ejemplo
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      const movimientosDummy: Movimiento[] = [
        {
          id: 1,
          codigo: "ING-001",
          fecha: "2023-05-14",
          tipo: "ingreso",
          categoria: "Ventas",
          concepto: "Ventas del día",
          monto: 2580.5,
          metodoPago: "Efectivo",
          referencia: "",
          notas: "Ventas totales del restaurante",
        },
        {
          id: 2,
          codigo: "EGR-001",
          fecha: "2023-05-14",
          tipo: "egreso",
          categoria: "Compras",
          concepto: "Compra de insumos",
          monto: 850.75,
          metodoPago: "Transferencia",
          referencia: "TRF-12345",
          notas: "Compra de verduras y carnes",
        },
        {
          id: 3,
          codigo: "ING-002",
          fecha: "2023-05-13",
          tipo: "ingreso",
          categoria: "Ventas",
          concepto: "Ventas del día",
          monto: 1950.0,
          metodoPago: "Efectivo",
          referencia: "",
          notas: "Ventas totales del restaurante",
        },
        {
          id: 4,
          codigo: "EGR-002",
          fecha: "2023-05-13",
          tipo: "egreso",
          categoria: "Servicios",
          concepto: "Pago de electricidad",
          monto: 320.5,
          metodoPago: "Transferencia",
          referencia: "TRF-12346",
          notas: "Factura de electricidad del mes",
        },
        {
          id: 5,
          codigo: "EGR-003",
          fecha: "2023-05-12",
          tipo: "egreso",
          categoria: "Salarios",
          concepto: "Pago de personal",
          monto: 3500.0,
          metodoPago: "Transferencia",
          referencia: "TRF-12347",
          notas: "Pago quincenal de salarios",
        },
      ]

      const categoriasDummy: Categoria[] = [
        { id: 1, nombre: "Ventas", tipo: "ingreso" },
        { id: 2, nombre: "Otros ingresos", tipo: "ingreso" },
        { id: 3, nombre: "Compras", tipo: "egreso" },
        { id: 4, nombre: "Servicios", tipo: "egreso" },
        { id: 5, nombre: "Salarios", tipo: "egreso" },
        { id: 6, nombre: "Impuestos", tipo: "egreso" },
        { id: 7, nombre: "Alquiler", tipo: "egreso" },
        { id: 8, nombre: "Otros gastos", tipo: "egreso" },
      ]

      setMovimientos(movimientosDummy)
      setCategorias(categoriasDummy)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filtrar movimientos
  const movimientosFiltrados = movimientos.filter((movimiento) => {
    return (
      movimiento.concepto.toLowerCase().includes(filtroConcepto.toLowerCase()) &&
      (filtroTipo === "all" || movimiento.tipo === filtroTipo) &&
      (filtroCategoria === "all" || movimiento.categoria === filtroCategoria)
    )
  })

  // Calcular totales
  const totalIngresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((sum, movimiento) => sum + movimiento.monto, 0)

  const totalEgresos = movimientos
    .filter((m) => m.tipo === "egreso")
    .reduce((sum, movimiento) => sum + movimiento.monto, 0)

  const balance = totalIngresos - totalEgresos

  // Manejadores de eventos
  const handleNuevoMovimiento = (tipo: "ingreso" | "egreso") => {
    setMovimientoActual({
      id: 0,
      codigo: tipo === "ingreso" ? "ING-" : "EGR-",
      fecha: new Date().toISOString().split("T")[0],
      tipo: tipo,
      categoria: "",
      concepto: "",
      monto: 0,
      metodoPago: "",
      referencia: "",
      notas: "",
    })
    setModalAbierto(true)
  }

  const handleEditarMovimiento = (movimiento: Movimiento) => {
    setMovimientoActual(movimiento)
    setModalAbierto(true)
  }

  const handleEliminarMovimiento = (movimiento: Movimiento) => {
    setMovimientoActual(movimiento)
    setModalEliminar(true)
  }

  const confirmarEliminar = () => {
    if (movimientoActual) {
      setMovimientos(movimientos.filter((m) => m.id !== movimientoActual.id))
      toast({
        title: "Movimiento eliminado",
        description: `El movimiento ${movimientoActual.codigo} ha sido eliminado correctamente.`,
      })
      setModalEliminar(false)
    }
  }

  const guardarMovimiento = (e: React.FormEvent) => {
    e.preventDefault()

    if (movimientoActual) {
      if (movimientoActual.id === 0) {
        // Nuevo movimiento
        const nuevoMovimiento = {
          ...movimientoActual,
          id: Math.max(...movimientos.map((m) => m.id), 0) + 1,
          codigo:
            movimientoActual.tipo === "ingreso"
              ? `ING-${String(movimientos.filter((m) => m.tipo === "ingreso").length + 1).padStart(3, "0")}`
              : `EGR-${String(movimientos.filter((m) => m.tipo === "egreso").length + 1).padStart(3, "0")}`,
        }
        setMovimientos([...movimientos, nuevoMovimiento])
        toast({
          title: "Movimiento agregado",
          description: `El movimiento ${nuevoMovimiento.codigo} ha sido agregado correctamente.`,
        })
      } else {
        // Actualizar movimiento existente
        setMovimientos(movimientos.map((m) => (m.id === movimientoActual.id ? movimientoActual : m)))
        toast({
          title: "Movimiento actualizado",
          description: `El movimiento ${movimientoActual.codigo} ha sido actualizado correctamente.`,
        })
      }
      setModalAbierto(false)
    }
  }

  // Función para exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Movimientos Financieros", 14, 16); // Título del PDF
    autoTable(doc, {
      head: [['Código', 'Fecha', 'Concepto', 'Categoría', 'Método de Pago', 'Monto', 'Tipo']],
      body: movimientos.map(movimiento => [
        movimiento.codigo,
        formatDate(movimiento.fecha),
        movimiento.concepto,
        movimiento.categoria,
        movimiento.metodoPago,
        formatCurrency(movimiento.monto),
        movimiento.tipo
      ]),
      startY: 20, // Comienza la tabla debajo del título
    });
    doc.save('movimientos_financieros.pdf');
  }

  // Renderizado condicional para carga
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando datos financieros...</h2>
          <p className="text-muted-foreground">Por favor espere mientras cargamos los datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
          <p className="text-muted-foreground">Control de ingresos y egresos del restaurante</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleNuevoMovimiento("egreso")}>
            <TrendingDown className="mr-2 h-4 w-4 text-destructive" />
            Nuevo Egreso
          </Button>
          <Button onClick={() => handleNuevoMovimiento("ingreso")}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIngresos)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-4 w-4 text-green-500" />
              +5% respecto al mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Egresos totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalEgresos)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="mr-1 inline h-4 w-4 text-red-500" />
              +3% respecto al mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? (
                <TrendingUp className="mr-1 inline h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 inline h-4 w-4 text-red-500" />
              )}
              {balance >= 0 ? "Positivo" : "Negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            <TabsTrigger value="egresos">Egresos</TabsTrigger>
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
                  placeholder="Buscar por concepto..."
                  className="pl-8"
                  value={filtroConcepto}
                  onChange={(e) => setFiltroConcepto(e.target.value)}
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="ingreso">Ingresos</SelectItem>
                  <SelectItem value="egreso">Egresos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.nombre}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
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
                  <TableHead>Concepto</TableHead>
                  <TableHead className="hidden md:table-cell">Categoría</TableHead>
                  <TableHead className="hidden md:table-cell">Método de pago</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mb-2" />
                        <h3 className="text-lg font-medium">No se encontraron movimientos</h3>
                        <p>Intenta cambiar los filtros o agrega un nuevo movimiento</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientosFiltrados.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>{movimiento.codigo}</TableCell>
                      <TableCell>{formatDate(movimiento.fecha)}</TableCell>
                      <TableCell className="font-medium">{movimiento.concepto}</TableCell>
                      <TableCell className="hidden md:table-cell">{movimiento.categoria}</TableCell>
                      <TableCell className="hidden md:table-cell">{movimiento.metodoPago}</TableCell>
                      <TableCell
                        className={`font-medium ${movimiento.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}
                      >
                        {movimiento.tipo === "ingreso" ? "+" : "-"}
                        {formatCurrency(movimiento.monto)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={movimiento.tipo === "ingreso" ? "default" : "destructive"}
                          className={movimiento.tipo === "ingreso" ? "bg-green-500" : ""}
                        >
                          {movimiento.tipo === "ingreso" ? "Ingreso" : "Egreso"}
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
                            <DropdownMenuItem onClick={() => handleEditarMovimiento(movimiento)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleEliminarMovimiento(movimiento)}
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
              Mostrando {movimientosFiltrados.length} de {movimientos.length} movimientos
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

      {/* Modal para agregar/editar movimiento */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {movimientoActual && movimientoActual.id === 0
                ? movimientoActual.tipo === "ingreso"
                  ? "Registrar Ingreso"
                  : "Registrar Egreso"
                : "Editar Movimiento"}
            </DialogTitle>
            <DialogDescription>
              Complete los detalles del movimiento. Haga clic en guardar cuando termine.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardarMovimiento}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={movimientoActual?.fecha || ""}
                    onChange={(e) => setMovimientoActual((prev) => (prev ? { ...prev, fecha: e.target.value } : null))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={movimientoActual?.categoria || ""}
                    onValueChange={(value) =>
                      setMovimientoActual((prev) => (prev ? { ...prev, categoria: value } : null))
                    }
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias
                        .filter(
                          (categoria) =>
                            !movimientoActual?.tipo || categoria.tipo === movimientoActual?.tipo || categoria.tipo,
                        )
                        .map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.nombre}>
                            {categoria.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="concepto">Concepto</Label>
                <Input
                  id="concepto"
                  value={movimientoActual?.concepto || ""}
                  onChange={(e) => setMovimientoActual((prev) => (prev ? { ...prev, concepto: e.target.value } : null))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto (S/.)</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={movimientoActual?.monto || ""}
                    onChange={(e) =>
                      setMovimientoActual((prev) =>
                        prev ? { ...prev, monto: Number.parseFloat(e.target.value) } : null,
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metodoPago">Método de pago</Label>
                  <Select
                    value={movimientoActual?.metodoPago || ""}
                    onValueChange={(value) =>
                      setMovimientoActual((prev) => (prev ? { ...prev, metodoPago: value } : null))
                    }
                  >
                    <SelectTrigger id="metodoPago">
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Tarjeta de crédito">Tarjeta de crédito</SelectItem>
                      <SelectItem value="Tarjeta de débito">Tarjeta de débito</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia (opcional)</Label>
                <Input
                  id="referencia"
                  value={movimientoActual?.referencia || ""}
                  onChange={(e) =>
                    setMovimientoActual((prev) => (prev ? { ...prev, referencia: e.target.value } : null))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas (opcional)</Label>
                <Textarea
                  id="notas"
                  value={movimientoActual?.notas || ""}
                  onChange={(e) => setMovimientoActual((prev) => (prev ? { ...prev, notas: e.target.value } : null))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar eliminación */}
      <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar el movimiento <strong>{movimientoActual?.codigo}</strong>? Esta acción no
              se puede deshacer.
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
