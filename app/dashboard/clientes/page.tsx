"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronDown, Download, Edit, FileText, Filter, Plus, Search, Trash, Users } from "lucide-react"
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
interface Cliente {
  id: number
  codigo: string
  nombre: string
  documento: string
  tipoDocumento: string
  telefono: string
  email: string
  direccion: string
  ciudad: string
  tipo: "regular" | "vip" | "nuevo"
  fechaRegistro: string
  totalCompras: number
}

export default function ClientesPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtroNombre, setFiltroNombre] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("all")
  const [clienteActual, setClienteActual] = useState<Cliente | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)

  // Datos de ejemplo
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      const clientesDummy: Cliente[] = [
        {
          id: 1,
          codigo: "C001",
          nombre: "Juan Pérez",
          documento: "45678912",
          tipoDocumento: "DNI",
          telefono: "987654321",
          email: "juan.perez@example.com",
          direccion: "Av. Principal 123",
          ciudad: "Lima",
          tipo: "vip",
          fechaRegistro: "2022-01-15",
          totalCompras: 12500.75,
        },
        {
          id: 2,
          codigo: "C002",
          nombre: "María López",
          documento: "10293847",
          tipoDocumento: "DNI",
          telefono: "912345678",
          email: "maria.lopez@example.com",
          direccion: "Jr. Los Pinos 456",
          ciudad: "Lima",
          tipo: "regular",
          fechaRegistro: "2022-03-22",
          totalCompras: 5680.3,
        },
        {
          id: 3,
          codigo: "C003",
          nombre: "Restaurante El Dorado",
          documento: "20123456789",
          tipoDocumento: "RUC",
          telefono: "945678123",
          email: "contacto@eldorado.com",
          direccion: "Av. La Marina 789",
          ciudad: "Lima",
          tipo: "vip",
          fechaRegistro: "2021-11-05",
          totalCompras: 28750.0,
        },
        {
          id: 4,
          codigo: "C004",
          nombre: "Carlos Gómez",
          documento: "87654321",
          tipoDocumento: "DNI",
          telefono: "923456789",
          email: "carlos.gomez@example.com",
          direccion: "Calle Las Flores 234",
          ciudad: "Arequipa",
          tipo: "regular",
          fechaRegistro: "2022-05-18",
          totalCompras: 3450.2,
        },
        {
          id: 5,
          codigo: "C005",
          nombre: "Ana Martínez",
          documento: "76543210",
          tipoDocumento: "DNI",
          telefono: "934567890",
          email: "ana.martinez@example.com",
          direccion: "Jr. Los Olivos 567",
          ciudad: "Trujillo",
          tipo: "nuevo",
          fechaRegistro: "2023-01-10",
          totalCompras: 1250.8,
        },
      ]

      setClientes(clientesDummy)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filtrar clientes - Corregido para mostrar todos por defecto
  const clientesFiltrados = clientes.filter((cliente) => {
    return (
      cliente.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      (filtroTipo === "all" || cliente.tipo === filtroTipo)
    )
  })

  // Manejadores de eventos
  const handleNuevoCliente = () => {
    setClienteActual({
      id: 0,
      codigo: "",
      nombre: "",
      documento: "",
      tipoDocumento: "DNI",
      telefono: "",
      email: "",
      direccion: "",
      ciudad: "",
      tipo: "nuevo",
      fechaRegistro: new Date().toISOString().split("T")[0],
      totalCompras: 0,
    })
    setModalAbierto(true)
  }

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteActual(cliente)
    setModalAbierto(true)
  }

  const handleEliminarCliente = (cliente: Cliente) => {
    setClienteActual(cliente)
    setModalEliminar(true)
  }

  const confirmarEliminar = () => {
    if (clienteActual) {
      setClientes(clientes.filter((c) => c.id !== clienteActual.id))
      toast({
        title: "Cliente eliminado",
        description: `El cliente ${clienteActual.nombre} ha sido eliminado correctamente.`,
      })
      setModalEliminar(false)
    }
  }

  const guardarCliente = (e: React.FormEvent) => {
    e.preventDefault()

    if (clienteActual) {
      if (clienteActual.id === 0) {
        // Nuevo cliente
        const nuevoCliente = {
          ...clienteActual,
          id: Math.max(...clientes.map((c) => c.id), 0) + 1,
        }
        setClientes([...clientes, nuevoCliente])
        toast({
          title: "Cliente agregado",
          description: `El cliente ${nuevoCliente.nombre} ha sido agregado correctamente.`,
        })
      } else {
        // Actualizar cliente existente
        setClientes(clientes.map((c) => (c.id === clienteActual.id ? clienteActual : c)))
        toast({
          title: "Cliente actualizado",
          description: `El cliente ${clienteActual.nombre} ha sido actualizado correctamente.`,
        })
      }
      setModalAbierto(false)
    }
  }
  

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.text("Clientes", 14, 16)
    autoTable(doc, {
      head: [['ID', 'Nombre', 'Email', 'Teléfono']],
      body: clientes.map(cliente => [cliente.id, cliente.nombre, cliente.email, cliente.telefono]),
      startY: 20,
    })
    doc.save("clientes.pdf")
  }

  // Renderizado condicional para carga
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando clientes...</h2>
          <p className="text-muted-foreground">Por favor espere mientras cargamos los datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestión de clientes del restaurante</p>
        </div>
        <Button onClick={handleNuevoCliente}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
            <TabsTrigger value="regular">Regulares</TabsTrigger>
            <TabsTrigger value="nuevo">Nuevos</TabsTrigger>
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
                  placeholder="Buscar clientes..."
                  className="pl-8"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo de cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
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
                  <TableHead className="hidden md:table-cell">Documento</TableHead>
                  <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                  <TableHead className="hidden md:table-cell">Ciudad</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Total Compras</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-12 w-12 mb-2" />
                        <h3 className="text-lg font-medium">No se encontraron clientes</h3>
                        <p>Intenta cambiar los filtros o agrega un nuevo cliente</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>{cliente.codigo}</TableCell>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {cliente.tipoDocumento}: {cliente.documento}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{cliente.telefono}</TableCell>
                      <TableCell className="hidden md:table-cell">{cliente.ciudad}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cliente.tipo === "vip" ? "default" : cliente.tipo === "regular" ? "secondary" : "outline"
                          }
                        >
                          {cliente.tipo === "vip" ? "VIP" : cliente.tipo === "regular" ? "Regular" : "Nuevo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(cliente.totalCompras)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditarCliente(cliente)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver historial
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleEliminarCliente(cliente)}
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
              Mostrando {clientesFiltrados.length} de {clientes.length} clientes
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

      {/* Modal para agregar/editar cliente */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{clienteActual && clienteActual.id === 0 ? "Agregar Cliente" : "Editar Cliente"}</DialogTitle>
            <DialogDescription>
              Complete los detalles del cliente. Haga clic en guardar cuando termine.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardarCliente}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={clienteActual?.codigo || ""}
                    onChange={(e) => setClienteActual((prev) => (prev ? { ...prev, codigo: e.target.value } : null))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de cliente</Label>
                  <Select
                    value={clienteActual?.tipo || ""}
                    onValueChange={(value: "regular" | "vip" | "nuevo") =>
                      setClienteActual((prev) => (prev ? { ...prev, tipo: value } : null))
                    }
                  >
                    <SelectTrigger id="tipo">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="nuevo">Nuevo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo / Razón social</Label>
                <Input
                  id="nombre"
                  value={clienteActual?.nombre || ""}
                  onChange={(e) => setClienteActual((prev) => (prev ? { ...prev, nombre: e.target.value } : null))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoDocumento">Tipo de documento</Label>
                  <Select
                    value={clienteActual?.tipoDocumento || ""}
                    onValueChange={(value) =>
                      setClienteActual((prev) => (prev ? { ...prev, tipoDocumento: value } : null))
                    }
                  >
                    <SelectTrigger id="tipoDocumento">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="RUC">RUC</SelectItem>
                      <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Número de documento</Label>
                  <Input
                    id="documento"
                    value={clienteActual?.documento || ""}
                    onChange={(e) => setClienteActual((prev) => (prev ? { ...prev, documento: e.target.value } : null))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={clienteActual?.telefono || ""}
                    onChange={(e) => setClienteActual((prev) => (prev ? { ...prev, telefono: e.target.value } : null))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clienteActual?.email || ""}
                    onChange={(e) => setClienteActual((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={clienteActual?.direccion || ""}
                  onChange={(e) => setClienteActual((prev) => (prev ? { ...prev, direccion: e.target.value } : null))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={clienteActual?.ciudad || ""}
                  onChange={(e) => setClienteActual((prev) => (prev ? { ...prev, ciudad: e.target.value } : null))}
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
              ¿Está seguro que desea eliminar el cliente <strong>{clienteActual?.nombre}</strong>? Esta acción no se
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