"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronDown, Download, Edit, FileText, Filter, Package, Plus, Search, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import autoTable from "jspdf-autotable"
import jsPDF from "jspdf"

// Tipos de datos
interface Producto {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  proveedor: string
  precio: number
  costo: number
  stock: number
  stockMinimo: number
  unidad: string
  estado: "activo" | "inactivo" | "agotado"
}

interface Categoria {
  id: number
  nombre: string
}

interface Proveedor {
  id: number
  nombre: string
}

export default function ProductosPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [filtroNombre, setFiltroNombre] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("all")
  const [filtroProveedor, setFiltroProveedor] = useState("all")
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [productoActual, setProductoActual] = useState<Producto | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)

  // Datos de ejemplo
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      const productosDummy: Producto[] = [
        {
          id: 1,
          codigo: "P001",
          nombre: "Aceite de oliva extra virgen",
          descripcion: "Aceite de oliva de primera presión en frío",
          categoria: "Aceites",
          proveedor: "Distribuidora Olivares",
          precio: 45.9,
          costo: 32.5,
          stock: 5,
          stockMinimo: 10,
          unidad: "Botella 500ml",
          estado: "agotado",
        },
        {
          id: 2,
          codigo: "P002",
          nombre: "Arroz arborio",
          descripcion: "Arroz para risotto de grano corto",
          categoria: "Granos",
          proveedor: "Importadora Gourmet",
          precio: 18.5,
          costo: 12.75,
          stock: 25,
          stockMinimo: 15,
          unidad: "Kg",
          estado: "activo",
        },
        {
          id: 3,
          codigo: "P003",
          nombre: "Queso parmesano",
          descripcion: "Queso parmesano reggiano importado",
          categoria: "Lácteos",
          proveedor: "Lácteos Premium",
          precio: 85.0,
          costo: 65.3,
          stock: 3,
          stockMinimo: 5,
          unidad: "Kg",
          estado: "agotado",
        },
        {
          id: 4,
          codigo: "P004",
          nombre: "Vino tinto reserva",
          descripcion: "Vino tinto reserva cosecha 2018",
          categoria: "Bebidas",
          proveedor: "Viñedos del Sur",
          precio: 120.0,
          costo: 85.0,
          stock: 24,
          stockMinimo: 12,
          unidad: "Botella 750ml",
          estado: "activo",
        },
        {
          id: 5,
          codigo: "P005",
          nombre: "Pasta fresca fettuccine",
          descripcion: "Pasta fresca artesanal",
          categoria: "Pastas",
          proveedor: "Pastificio Italiano",
          precio: 22.5,
          costo: 14.8,
          stock: 18,
          stockMinimo: 10,
          unidad: "500g",
          estado: "activo",
        },
      ]

      const categoriasDummy: Categoria[] = [
        { id: 1, nombre: "Aceites" },
        { id: 2, nombre: "Granos" },
        { id: 3, nombre: "Lácteos" },
        { id: 4, nombre: "Bebidas" },
        { id: 5, nombre: "Pastas" },
        { id: 6, nombre: "Carnes" },
        { id: 7, nombre: "Mariscos" },
        { id: 8, nombre: "Especias" },
        { id: 9, nombre: "Repostería" },
      ]

      const proveedoresDummy: Proveedor[] = [
        { id: 1, nombre: "Distribuidora Olivares" },
        { id: 2, nombre: "Importadora Gourmet" },
        { id: 3, nombre: "Lácteos Premium" },
        { id: 4, nombre: "Viñedos del Sur" },
        { id: 5, nombre: "Pastificio Italiano" },
      ]

      setProductos(productosDummy)
      setCategorias(categoriasDummy)
      setProveedores(proveedoresDummy)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filtrar productos - Corregido para mostrar todos por defecto
  const productosFiltrados = productos.filter((producto) => {
    return (
      producto.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      (filtroCategoria === "all" || producto.categoria === filtroCategoria) &&
      (filtroProveedor === "all" || producto.proveedor === filtroProveedor) &&
      (filtroEstado === "all" || producto.estado === filtroEstado)
    )
  })

  // Manejadores de eventos
  const handleNuevoProducto = () => {
    setProductoActual({
      id: 0,
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria: "",
      proveedor: "",
      precio: 0,
      costo: 0,
      stock: 0,
      stockMinimo: 0,
      unidad: "",
      estado: "activo",
    })
    setModalAbierto(true)
  }

  const handleEditarProducto = (producto: Producto) => {
    setProductoActual(producto)
    setModalAbierto(true)
  }

  const handleEliminarProducto = (producto: Producto) => {
    setProductoActual(producto)
    setModalEliminar(true)
  }

  const confirmarEliminar = () => {
    if (productoActual) {
      setProductos(productos.filter((p) => p.id !== productoActual.id))
      toast({
        title: "Producto eliminado",
        description: `El producto ${productoActual.nombre} ha sido eliminado correctamente.`,
      })
      setModalEliminar(false)
    }
  }

  const guardarProducto = (e: React.FormEvent) => {
    e.preventDefault()

    if (productoActual) {
      if (productoActual.id === 0) {
        // Nuevo producto
        const nuevoProducto = {
          ...productoActual,
          id: Math.max(...productos.map((p) => p.id), 0) + 1,
        }
        setProductos([...productos, nuevoProducto])
        toast({
          title: "Producto agregado",
          description: `El producto ${nuevoProducto.nombre} ha sido agregado correctamente.`,
        })
      } else {
        // Actualizar producto existente
        setProductos(productos.map((p) => (p.id === productoActual.id ? productoActual : p)))
        toast({
          title: "Producto actualizado",
          description: `El producto ${productoActual.nombre} ha sido actualizado correctamente.`,
        })
      }
      setModalAbierto(false)
    }
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.text("Productos", 14, 16)
    autoTable(doc, {
      head: [['Código', 'Nombre', 'Categoría', 'Proveedor', 'Stock', 'Precio', 'Estado']],
      body: productos.map(producto => [
        producto.codigo,
        producto.nombre,
        producto.categoria,
        producto.proveedor,
        producto.stock,
        formatCurrency(producto.precio),
        producto.estado
      ]),
      startY: 20,
    })
    doc.save("productos.pdf")
  }

  // Renderizado condicional para carga
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando productos...</h2>
          <p className="text-muted-foreground">Por favor espere mientras cargamos los datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestión del inventario de productos</p>
        </div>
        <Button onClick={handleNuevoProducto}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="agotados">Agotados</TabsTrigger>
            <TabsTrigger value="bajoStock">Bajo stock</TabsTrigger>
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
                  placeholder="Buscar productos..."
                  className="pl-8"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                />
              </div>
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
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="agotado">Agotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Categoría</TableHead>
                  <TableHead className="hidden md:table-cell">Proveedor</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12 mb-2" />
                        <h3 className="text-lg font-medium">No se encontraron productos</h3>
                        <p>Intenta cambiar los filtros o agrega un nuevo producto</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  productosFiltrados.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell>{producto.codigo}</TableCell>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell className="hidden md:table-cell">{producto.categoria}</TableCell>
                      <TableCell className="hidden md:table-cell">{producto.proveedor}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <span className="mr-2">{producto.stock}</span>
                          {producto.stock <= producto.stockMinimo && (
                            <Badge variant="destructive" className="text-xs">
                              Bajo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(producto.precio)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            producto.estado === "activo"
                              ? "default"
                              : producto.estado === "inactivo"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {producto.estado === "activo"
                            ? "Activo"
                            : producto.estado === "inactivo"
                              ? "Inactivo"
                              : "Agotado"}
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
                            <DropdownMenuItem onClick={() => handleEditarProducto(producto)}>
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
                              onClick={() => handleEliminarProducto(producto)}
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
              Mostrando {productosFiltrados.length} de {productos.length} productos
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

      {/* Modal para agregar/editar producto */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {productoActual && productoActual.id === 0 ? "Agregar Producto" : "Editar Producto"}
            </DialogTitle>
            <DialogDescription>
              Complete los detalles del producto. Haga clic en guardar cuando termine.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardarProducto}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={productoActual?.codigo || ""}
                    onChange={(e) => setProductoActual((prev) => (prev ? { ...prev, codigo: e.target.value } : null))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidad">Unidad de medida</Label>
                  <Input
                    id="unidad"
                    value={productoActual?.unidad || ""}
                    onChange={(e) => setProductoActual((prev) => (prev ? { ...prev, unidad: e.target.value } : null))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del producto</Label>
                <Input
                  id="nombre"
                  value={productoActual?.nombre || ""}
                  onChange={(e) => setProductoActual((prev) => (prev ? { ...prev, nombre: e.target.value } : null))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={productoActual?.descripcion || ""}
                  onChange={(e) =>
                    setProductoActual((prev) => (prev ? { ...prev, descripcion: e.target.value } : null))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={productoActual?.categoria || ""}
                    onValueChange={(value) =>
                      setProductoActual((prev) => (prev ? { ...prev, categoria: value } : null))
                    }
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.nombre}>
                          {categoria.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Select
                    value={productoActual?.proveedor || ""}
                    onValueChange={(value) =>
                      setProductoActual((prev) => (prev ? { ...prev, proveedor: value } : null))
                    }
                  >
                    <SelectTrigger id="proveedor">
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor.id} value={proveedor.nombre}>
                          {proveedor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio de venta (S/.)</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productoActual?.precio || ""}
                    onChange={(e) =>
                      setProductoActual((prev) =>
                        prev ? { ...prev, precio: Number.parseFloat(e.target.value) } : null,
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costo">Costo (S/.)</Label>
                  <Input
                    id="costo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productoActual?.costo || ""}
                    onChange={(e) =>
                      setProductoActual((prev) => (prev ? { ...prev, costo: Number.parseFloat(e.target.value) } : null))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock actual</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={productoActual?.stock || ""}
                    onChange={(e) =>
                      setProductoActual((prev) => (prev ? { ...prev, stock: Number.parseInt(e.target.value) } : null))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockMinimo">Stock mínimo</Label>
                  <Input
                    id="stockMinimo"
                    type="number"
                    min="0"
                    value={productoActual?.stockMinimo || ""}
                    onChange={(e) =>
                      setProductoActual((prev) =>
                        prev ? { ...prev, stockMinimo: Number.parseInt(e.target.value) } : null,
                      )
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={productoActual?.estado || ""}
                  onValueChange={(value: "activo" | "inactivo" | "agotado") =>
                    setProductoActual((prev) => (prev ? { ...prev, estado: value } : null))
                  }
                >
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="agotado">Agotado</SelectItem>
                  </SelectContent>
                </Select>
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
              ¿Está seguro que desea eliminar el producto <strong>{productoActual?.nombre}</strong>? Esta acción no se
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
