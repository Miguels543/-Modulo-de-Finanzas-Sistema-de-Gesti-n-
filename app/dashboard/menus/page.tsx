"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChefHat, ChevronDown, Download, Edit, FileText, Filter, Plus, Search, Trash } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import autoTable from "jspdf-autotable"
import jsPDF from "jspdf"

// Tipos de datos
interface Menu {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  precio: number
  costo: number
  disponible: boolean
  ingredientes: string[]
  imagen: string
}

interface Categoria {
  id: number
  nombre: string
}

export default function MenusPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [menus, setMenus] = useState<Menu[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [filtroNombre, setFiltroNombre] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("all")
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState("all")
  const [menuActual, setMenuActual] = useState<Menu | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)

  // Datos de ejemplo
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      const menusDummy: Menu[] = [
        {
          id: 1,
          codigo: "M001",
          nombre: "Lomo Saltado",
          descripcion: "Plato tradicional peruano con carne de res, cebolla, tomate y papas fritas",
          categoria: "Platos principales",
          precio: 35.0,
          costo: 18.5,
          disponible: true,
          ingredientes: ["Carne de res", "Cebolla", "Tomate", "Papas", "Arroz", "Sillao"],
          imagen: "/placeholder.svg",
        },
        {
          id: 2,
          codigo: "M002",
          nombre: "Ceviche Clásico",
          descripcion: "Pescado fresco marinado en limón con cebolla, cilantro, ají y camote",
          categoria: "Entradas",
          precio: 45.5,
          costo: 25.0,
          disponible: true,
          ingredientes: ["Pescado blanco", "Limón", "Cebolla", "Cilantro", "Ají limo", "Camote"],
          imagen: "/placeholder.svg",
        },
        {
          id: 3,
          codigo: "M003",
          nombre: "Ají de Gallina",
          descripcion: "Pollo deshilachado en salsa cremosa de ají amarillo con papas y arroz",
          categoria: "Platos principales",
          precio: 32.0,
          costo: 16.8,
          disponible: true,
          ingredientes: ["Pollo", "Ají amarillo", "Pan", "Leche", "Papas", "Arroz", "Huevo"],
          imagen: "/placeholder.svg",
        },
        {
          id: 4,
          codigo: "M004",
          nombre: "Causa Limeña",
          descripcion: "Terrina de papa amarilla rellena de pollo o atún con mayonesa",
          categoria: "Entradas",
          precio: 28.0,
          costo: 14.5,
          disponible: false,
          ingredientes: ["Papa amarilla", "Limón", "Ají amarillo", "Pollo", "Mayonesa", "Palta"],
          imagen: "/placeholder.svg",
        },
        {
          id: 5,
          codigo: "M005",
          nombre: "Arroz con Mariscos",
          descripcion: "Arroz cocido con variedad de mariscos y verduras",
          categoria: "Platos principales",
          precio: 48.0,
          costo: 28.5,
          disponible: true,
          ingredientes: ["Arroz", "Calamares", "Conchas", "Langostinos", "Mejillones", "Pimiento", "Ají panca"],
          imagen: "/placeholder.svg",
        },
      ]

      const categoriasDummy: Categoria[] = [
        { id: 1, nombre: "Entradas" },
        { id: 2, nombre: "Platos principales" },
        { id: 3, nombre: "Postres" },
        { id: 4, nombre: "Bebidas" },
        { id: 5, nombre: "Menú del día" },
      ]

      setMenus(menusDummy)
      setCategorias(categoriasDummy)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filtrar menús - Corregido para mostrar todos por defecto
  const menusFiltrados = menus.filter((menu) => {
    return (
      menu.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      (filtroCategoria === "all" || menu.categoria === filtroCategoria) &&
      (filtroDisponibilidad === "all" ||
        (filtroDisponibilidad === "disponible" && menu.disponible) ||
        (filtroDisponibilidad === "no_disponible" && !menu.disponible))
    )
  })

  // Manejadores de eventos
  const handleNuevoMenu = () => {
    setMenuActual({
      id: 0,
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: 0,
      costo: 0,
      disponible: true,
      ingredientes: [],
      imagen: "/placeholder.svg",
    })
    setModalAbierto(true)
  }

  const handleEditarMenu = (menu: Menu) => {
    setMenuActual(menu)
    setModalAbierto(true)
  }

  const handleEliminarMenu = (menu: Menu) => {
    setMenuActual(menu)
    setModalEliminar(true)
  }

  const confirmarEliminar = () => {
    if (menuActual) {
      setMenus(menus.filter((m) => m.id !== menuActual.id))
      toast({
        title: "Menú eliminado",
        description: `El menú ${menuActual.nombre} ha sido eliminado correctamente.`,
      })
      setModalEliminar(false)
    }
  }

  const guardarMenu = (e: React.FormEvent) => {
    e.preventDefault()

    if (menuActual) {
      if (menuActual.id === 0) {
        // Nuevo menú
        const nuevoMenu = {
          ...menuActual,
          id: Math.max(...menus.map((m) => m.id), 0) + 1,
        }
        setMenus([...menus, nuevoMenu])
        toast({
          title: "Menú agregado",
          description: `El menú ${nuevoMenu.nombre} ha sido agregado correctamente.`,
        })
      } else {
        // Actualizar menú existente
        setMenus(menus.map((m) => (m.id === menuActual.id ? menuActual : m)))
        toast({
          title: "Menú actualizado",
          description: `El menú ${menuActual.nombre} ha sido actualizado correctamente.`,
        })
      }
      setModalAbierto(false)
    }
  }

  // Función para exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Menús", 14, 16); // Título del PDF
    autoTable(doc, {
      head: [['Código', 'Nombre', 'Descripción', 'Categoría', 'Precio', 'Disponibilidad']],
      body: menus.map(menu => [
        menu.codigo,
        menu.nombre,
        menu.descripcion,
        menu.categoria,
        formatCurrency(menu.precio),
        menu.disponible ? "Disponible" : "No disponible"
      ]),
      startY: 20, // Comienza la tabla debajo del título
    });
    doc.save('menus.pdf');
  }

  // Renderizado condicional para carga
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando menús...</h2>
          <p className="text-muted-foreground">Por favor espere mientras cargamos los datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menús</h1>
          <p className="text-muted-foreground">Gestión de platos y menús del restaurante</p>
        </div>
        <Button onClick={handleNuevoMenu}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Menú
        </Button>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="entradas">Entradas</TabsTrigger>
            <TabsTrigger value="principales">Platos principales</TabsTrigger>
            <TabsTrigger value="postres">Postres</TabsTrigger>
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
                  placeholder="Buscar menús..."
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
              <Select value={filtroDisponibilidad} onValueChange={setFiltroDisponibilidad}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="no_disponible">No disponible</SelectItem>
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
                  <TableHead className="hidden md:table-cell">Ingredientes</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menusFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ChefHat className="h-12 w-12 mb-2" />
                        <h3 className="text-lg font-medium">No se encontraron menús</h3>
                        <p>Intenta cambiar los filtros o agrega un nuevo menú</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  menusFiltrados.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>{menu.codigo}</TableCell>
                      <TableCell className="font-medium">{menu.nombre}</TableCell>
                      <TableCell className="hidden md:table-cell">{menu.categoria}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {menu.ingredientes.slice(0, 3).map((ingrediente, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ingrediente}
                            </Badge>
                          ))}
                          {menu.ingredientes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{menu.ingredientes.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(menu.precio)}</TableCell>
                      <TableCell>
                        <Badge variant={menu.disponible ? "default" : "secondary"}>
                          {menu.disponible ? "Disponible" : "No disponible"}
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
                            <DropdownMenuItem onClick={() => handleEditarMenu(menu)}>
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
                              onClick={() => handleEliminarMenu(menu)}
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
              Mostrando {menusFiltrados.length} de {menus.length} menús
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

      {/* Modal para agregar/editar menú */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{menuActual && menuActual.id === 0 ? "Agregar Menú" : "Editar Menú"}</DialogTitle>
            <DialogDescription>Complete los detalles del menú. Haga clic en guardar cuando termine.</DialogDescription>
          </DialogHeader>
          <form onSubmit={guardarMenu}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={menuActual?.codigo || ""}
                    onChange={(e) => setMenuActual((prev) => (prev ? { ...prev, codigo: e.target.value } : null))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={menuActual?.categoria || ""}
                    onValueChange={(value) => setMenuActual((prev) => (prev ? { ...prev, categoria: value } : null))}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del plato</Label>
                <Input
                  id="nombre"
                  value={menuActual?.nombre || ""}
                  onChange={(e) => setMenuActual((prev) => (prev ? { ...prev, nombre: e.target.value } : null))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={menuActual?.descripcion || ""}
                  onChange={(e) => setMenuActual((prev) => (prev ? { ...prev, descripcion: e.target.value } : null))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio de venta (S/.)</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={menuActual?.precio || ""}
                    onChange={(e) =>
                      setMenuActual((prev) => (prev ? { ...prev, precio: Number.parseFloat(e.target.value) } : null))
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
                    value={menuActual?.costo || ""}
                    onChange={(e) =>
                      setMenuActual((prev) => (prev ? { ...prev, costo: Number.parseFloat(e.target.value) } : null))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredientes">Ingredientes (separados por coma)</Label>
                <Input
                  id="ingredientes"
                  value={menuActual?.ingredientes.join(", ") || ""}
                  onChange={(e) =>
                    setMenuActual((prev) =>
                      prev
                        ? {
                            ...prev,
                            ingredientes: e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="disponible"
                    checked={menuActual?.disponible || false}
                    onChange={(e) => setMenuActual((prev) => (prev ? { ...prev, disponible: e.target.checked } : null))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="disponible">Disponible para venta</Label>
                </div>
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
              ¿Está seguro que desea eliminar el menú <strong>{menuActual?.nombre}</strong>? Esta acción no se puede
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
