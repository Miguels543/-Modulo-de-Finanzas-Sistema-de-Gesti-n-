"use client"

import { useState, useRef } from "react"
import { Eye, Search, Filter, MoreHorizontal, Edit, Trash, History, ExternalLink, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { generatePDFPreview } from "@/lib/pdf-utils"
import { PDFPreviewDialog } from "./components/pdf-preview-dialog"
import { NuevoRegistroDialog } from "./components/nuevo-registro-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from 'date-fns'

// Tipos de datos
interface Ingreso {
  id: string
  fecha: string
  monto: number
  origen: string
  metodoPago: string
  detalles: string
}

interface Egreso {
  id: string
  fecha: string
  monto: number
  concepto: string
  proveedor: string
  metodoPago: string
  detalles: string
}

interface Producto {
  id: string
  codigo: string
  nombre: string
  categoria: string
  stock: number
  precioCompra: number
  precioVenta: number
  estado: "normal" | "bajo" | "agotado"
}

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  totalCompras: number
  ultimaCompra: string
  estado: "activo" | "inactivo"
}

interface Movimiento {
  id: string
  fecha: string
  producto: string
  cantidad: number
  tiendaOrigen: string
  tiendaDestino: string
  responsable: string
  estado: "pendiente" | "completado" | "cancelado"
}

export default function ReportesPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("ingresos")
  const [searchTerm, setSearchTerm] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [nuevoRegistroOpen, setNuevoRegistroOpen] = useState(false)

  // Filtros específicos por tipo de reporte
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("")
  const [filtroFechaFin, setFiltroFechaFin] = useState("")
  const [filtroMetodoPago, setFiltroMetodoPago] = useState<string[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState<string[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string[]>([])
  const [filtroTienda, setFiltroTienda] = useState<string[]>([])

  // Estado para la vista previa del PDF
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [pdfData, setPdfData] = useState<any>(null)
  const [pdfFileName, setPdfFileName] = useState("reporte.pdf")

  // Referencias para los contenedores de reportes
  const reportContainerRef = useRef<HTMLDivElement>(null)

  // Datos de ejemplo
  const ingresos: Ingreso[] = [
    {
      id: "ING001",
      fecha: "2023-05-15",
      monto: 1500.0,
      origen: "Venta en tienda",
      metodoPago: "Efectivo",
      detalles: "Venta de productos varios",
    },
    {
      id: "ING002",
      fecha: "2023-05-16",
      monto: 2300.5,
      origen: "Venta online",
      metodoPago: "Tarjeta",
      detalles: "Pedido #12345",
    },
    {
      id: "ING003",
      fecha: "2023-05-16",
      monto: 850.75,
      origen: "Venta en tienda",
      metodoPago: "Transferencia",
      detalles: "Cliente frecuente",
    },
    {
      id: "ING004",
      fecha: "2023-05-17",
      monto: 1200.0,
      origen: "Venta corporativa",
      metodoPago: "Transferencia",
      detalles: "Empresa ABC S.A.",
    },
    {
      id: "ING005",
      fecha: "2023-05-18",
      monto: 950.25,
      origen: "Venta en tienda",
      metodoPago: "Efectivo",
      detalles: "Promoción de fin de semana",
    },
  ]

  const egresos: Egreso[] = [
    {
      id: "EGR001",
      fecha: "2023-05-14",
      monto: 500.0,
      concepto: "Pago servicios",
      proveedor: "Empresa Eléctrica",
      metodoPago: "Transferencia",
      detalles: "Factura #E-2023-456",
    },
    {
      id: "EGR002",
      fecha: "2023-05-15",
      monto: 1200.0,
      concepto: "Compra insumos",
      proveedor: "Distribuidora XYZ",
      metodoPago: "Transferencia",
      detalles: "Orden #789",
    },
    {
      id: "EGR003",
      fecha: "2023-05-16",
      monto: 350.5,
      concepto: "Mantenimiento",
      proveedor: "Servicios Técnicos",
      metodoPago: "Efectivo",
      detalles: "Reparación equipo",
    },
    {
      id: "EGR004",
      fecha: "2023-05-17",
      monto: 800.0,
      concepto: "Alquiler",
      proveedor: "Inmobiliaria Central",
      metodoPago: "Transferencia",
      detalles: "Alquiler mensual local",
    },
    {
      id: "EGR005",
      fecha: "2023-05-18",
      monto: 450.75,
      concepto: "Publicidad",
      proveedor: "Marketing Digital",
      metodoPago: "Tarjeta",
      detalles: "Campaña redes sociales",
    },
  ]

  const productos: Producto[] = [
    {
      id: "PRD001",
      codigo: "P001",
      nombre: "Arroz",
      categoria: "Insumos",
      stock: 15,
      precioCompra: 80.0,
      precioVenta: 120.0,
      estado: "normal",
    },
    {
      id: "PRD002",
      codigo: "P002",
      nombre: "Aceite",
      categoria: "Insumos",
      stock: 8,
      precioCompra: 15.0,
      precioVenta: 25.0,
      estado: "normal",
    },
    {
      id: "PRD003",
      codigo: "P003",
      nombre: "Pollo",
      categoria: "Insumos",
      stock: 3,
      precioCompra: 45.0,
      precioVenta: 85.0,
      estado: "bajo",
    },
    {
      id: "PRD004",
      codigo: "P004",
      nombre: "Cebolla",
      categoria: "Insumos",
      stock: 0,
      precioCompra: 12.0,
      precioVenta: 25.0,
      estado: "agotado",
    },
    {
      id: "PRD005",
      codigo: "P005",
      nombre: "Gaseosa",
      categoria: "Bebidas",
      stock: 20,
      precioCompra: 6.5,
      precioVenta: 11.0,
      estado: "normal",
    },
  ]

  const clientes: Cliente[] = [
    {
      id: "CLI001",
      nombre: "Juan Pérez",
      email: "juan@example.com",
      telefono: "987654321",
      totalCompras: 3500.0,
      ultimaCompra: "2023-05-15",
      estado: "activo",
    },
    {
      id: "CLI002",
      nombre: "María López",
      email: "maria@example.com",
      telefono: "987123456",
      totalCompras: 1200.5,
      ultimaCompra: "2023-05-10",
      estado: "activo",
    },
    {
      id: "CLI003",
      nombre: "Carlos Gómez",
      email: "carlos@example.com",
      telefono: "912345678",
      totalCompras: 850.75,
      ultimaCompra: "2023-04-28",
      estado: "inactivo",
    },
    {
      id: "CLI004",
      nombre: "Ana Martínez",
      email: "ana@example.com",
      telefono: "945678123",
      totalCompras: 4200.0,
      ultimaCompra: "2023-05-16",
      estado: "activo",
    },
    {
      id: "CLI005",
      nombre: "Pedro Sánchez",
      email: "pedro@example.com",
      telefono: "956781234",
      totalCompras: 0.0,
      ultimaCompra: "",
      estado: "inactivo",
    },
  ]

  const movimientos: Movimiento[] = [
    {
      id: "MOV001",
      fecha: "2023-05-14",
      producto: "Arroz",
      cantidad: 2,
      tiendaOrigen: "Almacén Principal",
      tiendaDestino: "Cocina",
      responsable: "Luis Ramírez",
      estado: "completado",
    },
    {
      id: "MOV002",
      fecha: "2023-05-15",
      producto: "Aceite",
      cantidad: 3,
      tiendaOrigen: "Almacén Principal",
      tiendaDestino: "Cocina",
      responsable: "Ana Castillo",
      estado: "completado",
    },
    {
      id: "MOV003",
      fecha: "2023-05-16",
      producto: "Pollo",
      cantidad: 5,
      tiendaOrigen: "Refrigerador",
      tiendaDestino: "Cocina",
      responsable: "Carlos Mendoza",
      estado: "pendiente",
    },
    {
      id: "MOV004",
      fecha: "2023-05-17",
      producto: "Gaseosa",
      cantidad: 10,
      tiendaOrigen: "Almacén Principal",
      tiendaDestino: "Barra",
      responsable: "María Torres",
      estado: "pendiente",
    },
    {
      id: "MOV005",
      fecha: "2023-05-18",
      producto: "Cebolla",
      cantidad: 8,
      tiendaOrigen: "Almacén Principal",
      tiendaDestino: "Cocina",
      responsable: "Juan Pérez",
      estado: "cancelado",
    },
  ]

  // Función para filtrar datos según el término de búsqueda y filtros aplicados
  const filtrarDatos = (datos: any[], tipo: string) => {
    // Filtrar por término de búsqueda
    let datosFiltrados = datos.filter((item) => {
      const searchFields = Object.values(item).join(" ").toLowerCase()
      return searchFields.includes(searchTerm.toLowerCase())
    })

    // Aplicar filtros específicos según el tipo de reporte
    if (filtroFechaInicio) {
      datosFiltrados = datosFiltrados.filter(
        (item) => item.fecha && new Date(item.fecha) >= new Date(filtroFechaInicio),
      )
    }

    if (filtroFechaFin) {
      datosFiltrados = datosFiltrados.filter((item) => item.fecha && new Date(item.fecha) <= new Date(filtroFechaFin))
    }

    if (filtroMetodoPago.length > 0 && (tipo === "ingresos" || tipo === "egresos")) {
      datosFiltrados = datosFiltrados.filter((item) => filtroMetodoPago.includes(item.metodoPago))
    }

    if (filtroCategoria.length > 0 && tipo === "productos") {
      datosFiltrados = datosFiltrados.filter((item) => filtroCategoria.includes(item.categoria))
    }

    if (filtroEstado.length > 0) {
      datosFiltrados = datosFiltrados.filter((item) => filtroEstado.includes(item.estado))
    }

    if (filtroTienda.length > 0 && tipo === "movimientos") {
      datosFiltrados = datosFiltrados.filter(
        (item) => filtroTienda.includes(item.tiendaOrigen) || filtroTienda.includes(item.tiendaDestino),
      )
    }

    // Ordenar datos si hay una columna de ordenación seleccionada
    if (sortColumn) {
      datosFiltrados.sort((a, b) => {
        const valueA = a[sortColumn]
        const valueB = b[sortColumn]

        // Manejar diferentes tipos de datos
        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortDirection === "asc" ? valueA - valueB : valueB - valueA
        } else if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
        } else if (valueA instanceof Date && valueB instanceof Date) {
          return sortDirection === "asc" ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime()
        }

        // Fallback para otros tipos o valores nulos
        return 0
      })
    }

    return datosFiltrados
  }

  // Obtener los datos filtrados según la pestaña activa
  const getDatosFiltrados = () => {
    switch (activeTab) {
      case "ingresos":
        return filtrarDatos(ingresos, "ingresos")
      case "egresos":
        return filtrarDatos(egresos, "egresos")
      case "productos":
        return filtrarDatos(productos, "productos")
      case "clientes":
        return filtrarDatos(clientes, "clientes")
      case "movimientos":
        return filtrarDatos(movimientos, "movimientos")
      default:
        return []
    }
  }

  // Función para manejar el ordenamiento al hacer clic en una columna
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Si ya estamos ordenando por esta columna, cambiamos la dirección
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Si es una nueva columna, establecemos la columna y dirección por defecto
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Función para mostrar la vista previa del PDF
  const handleShowPDFPreview = async () => {
    if (!reportContainerRef.current) return

    setIsGenerating(true)
    toast({
      title: "Generando vista previa",
      description: "Preparando la vista previa del documento...",
    })

    try {
      // Asegurarse de que todas las imágenes tengan crossOrigin="anonymous"
      const images = reportContainerRef.current.querySelectorAll("img")
      images.forEach((img) => {
        img.crossOrigin = "anonymous"
        if (img.src.startsWith("blob:")) {
          console.log("Imagen con blob URL detectada:", img.src)
        }
      })

      // Generar la vista previa del PDF
      const fileName = `reporte-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`
      const previewData = await generatePDFPreview("report-container")

      // Guardar los datos para su uso posterior
      setPreviewUrl(previewData.imgUrl)
      setPdfData(previewData)
      setPdfFileName(fileName)

      // Mostrar el diálogo de vista previa
      setPreviewDialogOpen(true)

      toast({
        title: "Vista previa generada",
        description: "Puede revisar el documento antes de descargarlo",
      })
    } catch (error) {
      console.error("Error al generar la vista previa:", error)
      toast({
        variant: "destructive",
        title: "Error al generar vista previa",
        description: "Ocurrió un problema al crear la vista previa. Intente con un reporte más simple o exporte a CSV.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Función para mostrar el diálogo de detalles
  const handleShowDetails = (item: any) => {
    setSelectedItem(item)
    setDetailsDialogOpen(true)
  }

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchTerm("")
    setFiltroFechaInicio("")
    setFiltroFechaFin("")
    setFiltroMetodoPago([])
    setFiltroCategoria([])
    setFiltroEstado([])
    setFiltroTienda([])
    setSortColumn(null)
    setSortDirection("asc")
    setFilterDialogOpen(false)
  }

  // Función para abrir el diálogo de nuevo registro con el tipo correspondiente
  const handleNuevoRegistro = () => {
    setNuevoRegistroOpen(true)
  }

  // Renderizar el encabezado de la tabla según el tipo de reporte
  const renderTableHeader = () => {
    switch (activeTab) {
      case "ingresos":
        return (
          <TableRow>
            <TableHead className="w-[100px]" onClick={() => handleSort("id")}>
              ID
            </TableHead>
            <TableHead onClick={() => handleSort("fecha")}>Fecha</TableHead>
            <TableHead onClick={() => handleSort("monto")}>Monto</TableHead>
            <TableHead onClick={() => handleSort("origen")}>Origen</TableHead>
            <TableHead onClick={() => handleSort("metodoPago")}>Método de Pago</TableHead>
            <TableHead className="hidden md:table-cell" onClick={() => handleSort("detalles")}>
              Detalles
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        )
      case "egresos":
        return (
          <TableRow>
            <TableHead className="w-[100px]" onClick={() => handleSort("id")}>
              ID
            </TableHead>
            <TableHead onClick={() => handleSort("fecha")}>Fecha</TableHead>
            <TableHead onClick={() => handleSort("monto")}>Monto</TableHead>
            <TableHead onClick={() => handleSort("concepto")}>Concepto</TableHead>
            <TableHead className="hidden md:table-cell" onClick={() => handleSort("proveedor")}>
              Proveedor
            </TableHead>
            <TableHead onClick={() => handleSort("metodoPago")}>Método de Pago</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        )
      case "productos":
        return (
          <TableRow>
            <TableHead className="w-[100px]" onClick={() => handleSort("codigo")}>
              Código
            </TableHead>
            <TableHead onClick={() => handleSort("nombre")}>Nombre</TableHead>
            <TableHead className="hidden md:table-cell" onClick={() => handleSort("categoria")}>
              Categoría
            </TableHead>
            <TableHead onClick={() => handleSort("stock")}>Stock</TableHead>
            <TableHead onClick={() => handleSort("precioCompra")}>Precio Compra</TableHead>
            <TableHead onClick={() => handleSort("precioVenta")}>Precio Venta</TableHead>
            <TableHead onClick={() => handleSort("estado")}>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        )
      case "clientes":
        return (
          <TableRow>
            <TableHead className="w-[100px]" onClick={() => handleSort("id")}>
              ID
            </TableHead>
            <TableHead onClick={() => handleSort("nombre")}>Nombre</TableHead>
            <TableHead className="hidden md:table-cell" onClick={() => handleSort("email")}>
              Email
            </TableHead>
            <TableHead className="hidden md:table-cell" onClick={() => handleSort("telefono")}>
              Teléfono
            </TableHead>
            <TableHead onClick={() => handleSort("totalCompras")}>Total Compras</TableHead>
            <TableHead onClick={() => handleSort("ultimaCompra")}>Última Compra</TableHead>
            <TableHead onClick={() => handleSort("estado")}>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        )
      case "movimientos":
        return (
          <TableRow>
            <TableHead className="w-[100px]" onClick={() => handleSort("id")}>
              ID
            </TableHead>
            <TableHead onClick={() => handleSort("fecha")}>Fecha</TableHead>
            <TableHead onClick={() => handleSort("producto")}>Producto</TableHead>
            <TableHead onClick={() => handleSort("cantidad")}>Cantidad</TableHead>
            <TableHead className="hidden md:table-cell" onClick={() => handleSort("tiendaOrigen")}>
              Origen
            </TableHead>
            <TableHead className="hidden md:table-cell" onClick={() => handleSort("tiendaDestino")}>
              Destino
            </TableHead>
            <TableHead onClick={() => handleSort("estado")}>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        )
      default:
        return null
    }
  }

  // Renderizar las filas de la tabla según el tipo de reporte
  const renderTableRows = () => {
    const datosFiltrados = getDatosFiltrados()

    if (datosFiltrados.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="h-24 text-center">
            No se encontraron resultados.
          </TableCell>
        </TableRow>
      )
    }

    switch (activeTab) {
      case "ingresos":
        return datosFiltrados.map((ingreso: Ingreso) => (
          <TableRow key={ingreso.id}>
            <TableCell className="font-medium">{ingreso.id}</TableCell>
            <TableCell>{formatDate(ingreso.fecha)}</TableCell>
            <TableCell>{formatCurrency(ingreso.monto)}</TableCell>
            <TableCell>{ingreso.origen}</TableCell>
            <TableCell>{ingreso.metodoPago}</TableCell>
            <TableCell className="hidden md:table-cell">{ingreso.detalles}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleShowDetails(ingreso)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))
      case "egresos":
        return datosFiltrados.map((egreso: Egreso) => (
          <TableRow key={egreso.id}>
            <TableCell className="font-medium">{egreso.id}</TableCell>
            <TableCell>{formatDate(egreso.fecha)}</TableCell>
            <TableCell>{formatCurrency(egreso.monto)}</TableCell>
            <TableCell>{egreso.concepto}</TableCell>
            <TableCell className="hidden md:table-cell">{egreso.proveedor}</TableCell>
            <TableCell>{egreso.metodoPago}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleShowDetails(egreso)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))
      case "productos":
        return datosFiltrados.map((producto: Producto) => (
          <TableRow key={producto.id}>
            <TableCell className="font-medium">{producto.codigo}</TableCell>
            <TableCell>{producto.nombre}</TableCell>
            <TableCell className="hidden md:table-cell">{producto.categoria}</TableCell>
            <TableCell>
              <Badge
                variant={
                  producto.estado === "normal" ? "default" : producto.estado === "bajo" ? "secondary" : "destructive"
                }
              >
                {producto.stock}
              </Badge>
            </TableCell>
            <TableCell>{formatCurrency(producto.precioCompra)}</TableCell>
            <TableCell>{formatCurrency(producto.precioVenta)}</TableCell>
            <TableCell>
              <Badge
                variant={
                  producto.estado === "normal" ? "default" : producto.estado === "bajo" ? "secondary" : "destructive"
                }
              >
                {producto.estado === "normal" ? "Normal" : producto.estado === "bajo" ? "Bajo" : "Agotado"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleShowDetails(producto)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <History className="mr-2 h-4 w-4" />
                    Historial
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))
      case "clientes":
        return datosFiltrados.map((cliente: Cliente) => (
          <TableRow key={cliente.id}>
            <TableCell className="font-medium">{cliente.id}</TableCell>
            <TableCell>{cliente.nombre}</TableCell>
            <TableCell className="hidden md:table-cell">{cliente.email}</TableCell>
            <TableCell className="hidden md:table-cell">{cliente.telefono}</TableCell>
            <TableCell>{formatCurrency(cliente.totalCompras)}</TableCell>
            <TableCell>{cliente.ultimaCompra ? formatDate(cliente.ultimaCompra) : "N/A"}</TableCell>
            <TableCell>
              <Badge variant={cliente.estado === "activo" ? "default" : "secondary"}>
                {cliente.estado === "activo" ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleShowDetails(cliente)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <History className="mr-2 h-4 w-4" />
                    Historial de compras
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))
      case "movimientos":
        return datosFiltrados.map((movimiento: Movimiento) => (
          <TableRow key={movimiento.id}>
            <TableCell className="font-medium">{movimiento.id}</TableCell>
            <TableCell>{formatDate(movimiento.fecha)}</TableCell>
            <TableCell>{movimiento.producto}</TableCell>
            <TableCell>{movimiento.cantidad}</TableCell>
            <TableCell className="hidden md:table-cell">{movimiento.tiendaOrigen}</TableCell>
            <TableCell className="hidden md:table-cell">{movimiento.tiendaDestino}</TableCell>
            <TableCell>
              <Badge
                variant={
                  movimiento.estado === "completado"
                    ? "default"
                    : movimiento.estado === "pendiente"
                      ? "secondary"
                      : "destructive"
                }
              >
                {movimiento.estado === "completado"
                  ? "Completado"
                  : movimiento.estado === "pendiente"
                    ? "Pendiente"
                    : "Cancelado"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleShowDetails(movimiento)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <History className="mr-2 h-4 w-4" />
                    Historial
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))
      default:
        return null
    }
  }

  // Renderizar el contenido del diálogo de detalles según el tipo de reporte
  const renderDetailsContent = () => {
    if (!selectedItem) return null

    switch (activeTab) {
      case "ingresos":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">ID:</p>
                <p>{selectedItem.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Fecha:</p>
                <p>{formatDate(selectedItem.fecha)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Monto:</p>
                <p>{formatCurrency(selectedItem.monto)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Origen:</p>
                <p>{selectedItem.origen}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Método de Pago:</p>
                <p>{selectedItem.metodoPago}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Detalles:</p>
                <p>{selectedItem.detalles}</p>
              </div>
            </div>
          </>
        )
      case "egresos":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">ID:</p>
                <p>{selectedItem.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Fecha:</p>
                <p>{formatDate(selectedItem.fecha)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Monto:</p>
                <p>{formatCurrency(selectedItem.monto)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Concepto:</p>
                <p>{selectedItem.concepto}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Proveedor:</p>
                <p>{selectedItem.proveedor}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Método de Pago:</p>
                <p>{selectedItem.metodoPago}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium">Detalles:</p>
                <p>{selectedItem.detalles}</p>
              </div>
            </div>
          </>
        )
      case "productos":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Código:</p>
                <p>{selectedItem.codigo}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Nombre:</p>
                <p>{selectedItem.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Categoría:</p>
                <p>{selectedItem.categoria}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Stock:</p>
                <p>{selectedItem.stock}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Precio de Compra:</p>
                <p>{formatCurrency(selectedItem.precioCompra)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Precio de Venta:</p>
                <p>{formatCurrency(selectedItem.precioVenta)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Estado:</p>
                <Badge
                  variant={
                    selectedItem.estado === "normal"
                      ? "default"
                      : selectedItem.estado === "bajo"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {selectedItem.estado === "normal" ? "Normal" : selectedItem.estado === "bajo" ? "Bajo" : "Agotado"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Margen:</p>
                <p>
                  {(((selectedItem.precioVenta - selectedItem.precioCompra) / selectedItem.precioCompra) * 100).toFixed(
                    2,
                  )}
                  %
                </p>
              </div>
            </div>
          </>
        )
      case "clientes":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">ID:</p>
                <p>{selectedItem.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Nombre:</p>
                <p>{selectedItem.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email:</p>
                <p>{selectedItem.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Teléfono:</p>
                <p>{selectedItem.telefono}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Compras:</p>
                <p>{formatCurrency(selectedItem.totalCompras)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Última Compra:</p>
                <p>{selectedItem.ultimaCompra ? formatDate(selectedItem.ultimaCompra) : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Estado:</p>
                <Badge variant={selectedItem.estado === "activo" ? "default" : "secondary"}>
                  {selectedItem.estado === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </>
        )
      case "movimientos":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">ID:</p>
                <p>{selectedItem.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Fecha:</p>
                <p>{formatDate(selectedItem.fecha)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Producto:</p>
                <p>{selectedItem.producto}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Cantidad:</p>
                <p>{selectedItem.cantidad}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tienda Origen:</p>
                <p>{selectedItem.tiendaOrigen}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tienda Destino:</p>
                <p>{selectedItem.tiendaDestino}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Responsable:</p>
                <p>{selectedItem.responsable}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Estado:</p>
                <Badge
                  variant={
                    selectedItem.estado === "completado"
                      ? "default"
                      : selectedItem.estado === "pendiente"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {selectedItem.estado === "completado"
                    ? "Completado"
                    : selectedItem.estado === "pendiente"
                      ? "Pendiente"
                      : "Cancelado"}
                </Badge>
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  // Renderizar el contenido del diálogo de filtros según el tipo de reporte
  const renderFilterContent = () => {
    return (
      <>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
              />
            </div>
          </div>

          {(activeTab === "ingresos" || activeTab === "egresos") && (
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Efectivo", "Tarjeta", "Transferencia"].map((metodo) => (
                  <div key={metodo} className="flex items-center space-x-2">
                    <Checkbox
                      id={`metodo-${metodo}`}
                      checked={filtroMetodoPago.includes(metodo)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltroMetodoPago([...filtroMetodoPago, metodo])
                        } else {
                          setFiltroMetodoPago(filtroMetodoPago.filter((m) => m !== metodo))
                        }
                      }}
                    />
                    <Label htmlFor={`metodo-${metodo}`}>{metodo}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "productos" && (
            <div className="space-y-2">
              <Label>Categoría</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Insumos", "Bebidas", "Platos", "Postres"].map((categoria) => (
                  <div key={categoria} className="flex items-center space-x-2">
                    <Checkbox
                      id={`categoria-${categoria}`}
                      checked={filtroCategoria.includes(categoria)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltroCategoria([...filtroCategoria, categoria])
                        } else {
                          setFiltroCategoria(filtroCategoria.filter((c) => c !== categoria))
                        }
                      }}
                    />
                    <Label htmlFor={`categoria-${categoria}`}>{categoria}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "productos" && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="grid grid-cols-3 gap-2">
                {["normal", "bajo", "agotado"].map((estado) => (
                  <div key={estado} className="flex items-center space-x-2">
                    <Checkbox
                      id={`estado-${estado}`}
                      checked={filtroEstado.includes(estado)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltroEstado([...filtroEstado, estado])
                        } else {
                          setFiltroEstado(filtroEstado.filter((e) => e !== estado))
                        }
                      }}
                    />
                    <Label htmlFor={`estado-${estado}`}>
                      {estado === "normal" ? "Normal" : estado === "bajo" ? "Bajo" : "Agotado"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "clientes" && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="grid grid-cols-2 gap-2">
                {["activo", "inactivo"].map((estado) => (
                  <div key={estado} className="flex items-center space-x-2">
                    <Checkbox
                      id={`estado-${estado}`}
                      checked={filtroEstado.includes(estado)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltroEstado([...filtroEstado, estado])
                        } else {
                          setFiltroEstado(filtroEstado.filter((e) => e !== estado))
                        }
                      }}
                    />
                    <Label htmlFor={`estado-${estado}`}>{estado === "activo" ? "Activo" : "Inactivo"}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "movimientos" && (
            <>
              <div className="space-y-2">
                <Label>Ubicaciones</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Cocina", "Barra", "Almacén Principal", "Refrigerador"].map((tienda) => (
                    <div key={tienda} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tienda-${tienda}`}
                        checked={filtroTienda.includes(tienda)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFiltroTienda([...filtroTienda, tienda])
                          } else {
                            setFiltroTienda(filtroTienda.filter((t) => t !== tienda))
                          }
                        }}
                      />
                      <Label htmlFor={`tienda-${tienda}`}>{tienda}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["completado", "pendiente", "cancelado"].map((estado) => (
                    <div key={estado} className="flex items-center space-x-2">
                      <Checkbox
                        id={`estado-${estado}`}
                        checked={filtroEstado.includes(estado)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFiltroEstado([...filtroEstado, estado])
                          } else {
                            setFiltroEstado(filtroEstado.filter((e) => e !== estado))
                          }
                        }}
                      />
                      <Label htmlFor={`estado-${estado}`}>
                        {estado === "completado" ? "Completado" : estado === "pendiente" ? "Pendiente" : "Cancelado"}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Gestión y análisis de datos del sistema</p>
        </div>
        <Button onClick={handleNuevoRegistro}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>

      <Tabs defaultValue="ingresos" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            <TabsTrigger value="egresos">Egresos</TabsTrigger>
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Popover open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filtros</h4>
                    <p className="text-sm text-muted-foreground">Ajuste los filtros para el reporte de {activeTab}</p>
                  </div>
                  {renderFilterContent()}
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                      Limpiar
                    </Button>
                    <Button size="sm" onClick={() => setFilterDialogOpen(false)}>
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={handleShowPDFPreview} disabled={isGenerating}>
              <Eye className="mr-2 h-4 w-4" />
              {isGenerating ? "Generando..." : "Vista previa PDF"}
            </Button>
          </div>
        </div>

        <div id="report-container" ref={reportContainerRef}>
          <Card>
            <CardHeader>
              <CardTitle>
                Reporte de{" "}
                {activeTab === "ingresos"
                  ? "Ingresos"
                  : activeTab === "egresos"
                    ? "Egresos"
                    : activeTab === "productos"
                      ? "Productos"
                      : activeTab === "clientes"
                        ? "Clientes"
                        : "Movimientos entre Áreas"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>{renderTableHeader()}</TableHeader>
                <TableBody>{renderTableRows()}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Diálogo de vista previa del PDF */}
      <PDFPreviewDialog
        isOpen={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        previewUrl={previewUrl}
        pdfData={pdfData}
        fileName={pdfFileName}
      />

      {/* Diálogo de detalles */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles</DialogTitle>
            <DialogDescription>Información detallada del registro seleccionado</DialogDescription>
          </DialogHeader>
          {renderDetailsContent()}
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de nuevo registro */}
      <NuevoRegistroDialog
        open={nuevoRegistroOpen}
        onOpenChange={setNuevoRegistroOpen}
        tipoInicial={activeTab === "movimientos" ? "movimiento" : activeTab.slice(0, -1)}
      />
    </div>
  )
}
