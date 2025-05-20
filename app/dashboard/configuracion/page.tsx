"use client"

import { useState, useEffect } from "react"
import { Check, Save, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Datos de configuración
  const [restaurantName, setRestaurantName] = useState("")
  const [restaurantAddress, setRestaurantAddress] = useState("")
  const [restaurantPhone, setRestaurantPhone] = useState("")
  const [restaurantEmail, setRestaurantEmail] = useState("")
  const [restaurantRUC, setRestaurantRUC] = useState("")
  const [restaurantLogo, setRestaurantLogo] = useState("")

  // Configuración de impuestos
  const [taxRate, setTaxRate] = useState("18")
  const [includeTax, setIncludeTax] = useState(true)

  // Configuración de usuarios
  const [users, setUsers] = useState([
    { id: 1, username: "admin", name: "Administrador", role: "admin", active: true },
    { id: 2, username: "cajero", name: "Juan Pérez", role: "cajero", active: true },
    { id: 3, username: "mesero", name: "María López", role: "mesero", active: true },
    { id: 4, username: "cocinero", name: "Carlos Gómez", role: "cocinero", active: true },
  ])

  // Datos de ejemplo
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      setRestaurantName("Restaurante El Dorado")
      setRestaurantAddress("Av. La Marina 789, Lima")
      setRestaurantPhone("(01) 555-1234")
      setRestaurantEmail("contacto@eldorado.com")
      setRestaurantRUC("20123456789")
      setRestaurantLogo("/placeholder.svg")

      setIsLoading(false)
    }, 1000)
  }, [])

  const handleSaveGeneral = () => {
    toast({
      title: "Configuración guardada",
      description: "La configuración general ha sido actualizada correctamente.",
    })
  }

  const handleSaveTax = () => {
    toast({
      title: "Configuración de impuestos guardada",
      description: "La configuración de impuestos ha sido actualizada correctamente.",
    })
  }

  const handleSaveUser = (userId: number) => {
    toast({
      title: "Usuario actualizado",
      description: "La información del usuario ha sido actualizada correctamente.",
    })
  }

  // Renderizado condicional para carga
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando configuración...</h2>
          <p className="text-muted-foreground">Por favor espere mientras cargamos los datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Administra la configuración del sistema</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="impuestos">Impuestos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="backup">Respaldo</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Restaurante</CardTitle>
              <CardDescription>
                Configura la información básica de tu restaurante que aparecerá en facturas y documentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Nombre del Restaurante</Label>
                  <Input
                    id="restaurantName"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurantRUC">RUC</Label>
                  <Input id="restaurantRUC" value={restaurantRUC} onChange={(e) => setRestaurantRUC(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurantAddress">Dirección</Label>
                <Input
                  id="restaurantAddress"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="restaurantPhone">Teléfono</Label>
                  <Input
                    id="restaurantPhone"
                    value={restaurantPhone}
                    onChange={(e) => setRestaurantPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurantEmail">Correo Electrónico</Label>
                  <Input
                    id="restaurantEmail"
                    type="email"
                    value={restaurantEmail}
                    onChange={(e) => setRestaurantEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurantLogo">Logo del Restaurante</Label>
                <div className="flex items-center gap-4">
                  <img
                    src={restaurantLogo || "/placeholder.svg?height=64&width=64"}
                    alt="Logo"
                    className="h-16 w-16 rounded-md border object-contain"
                  />
                  <Button variant="outline">Cambiar Logo</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Facturación</CardTitle>
              <CardDescription>Configura los detalles que aparecerán en tus facturas y boletas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceFooter">Pie de Página en Facturas</Label>
                <Textarea id="invoiceFooter" placeholder="Ej: Gracias por su preferencia" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Prefijo de Factura</Label>
                <Input id="invoicePrefix" placeholder="F-" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="autoInvoice" />
                <Label htmlFor="autoInvoice">Generar facturas automáticamente</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="impuestos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Impuestos</CardTitle>
              <CardDescription>Configura los impuestos que se aplicarán a tus ventas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tasa de IGV (%)</Label>
                  <Input id="taxRate" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxName">Nombre del Impuesto</Label>
                  <Input id="taxName" defaultValue="IGV" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="includeTax" checked={includeTax} onCheckedChange={setIncludeTax} />
                <Label htmlFor="includeTax">Precios incluyen impuestos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="showTaxColumn" defaultChecked />
                <Label htmlFor="showTaxColumn">Mostrar columna de impuestos en facturas</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveTax}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra los usuarios que tienen acceso al sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button>
                <User className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>

              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{user.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${user.active ? "bg-green-500" : "bg-red-500"}`}></div>
                          <span className="text-sm text-muted-foreground">{user.active ? "Activo" : "Inactivo"}</span>
                        </div>
                      </div>
                      <CardDescription>Usuario: {user.username}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`role-${user.id}`}>Rol</Label>
                          <Select defaultValue={user.role}>
                            <SelectTrigger id={`role-${user.id}`}>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="cajero">Cajero</SelectItem>
                              <SelectItem value="mesero">Mesero</SelectItem>
                              <SelectItem value="cocinero">Cocinero</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`status-${user.id}`}>Estado</Label>
                          <Select defaultValue={user.active ? "active" : "inactive"}>
                            <SelectTrigger id={`status-${user.id}`}>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="inactive">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Restablecer Contraseña
                        </Button>
                        <Button size="sm" onClick={() => handleSaveUser(user.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Guardar
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Respaldo de Datos</CardTitle>
              <CardDescription>Configura y gestiona los respaldos de la base de datos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Respaldo Manual</Label>
                <div className="flex gap-2">
                  <Button>Crear Respaldo Ahora</Button>
                  <Button variant="outline">Restaurar Respaldo</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Respaldo Automático</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="autoBackup" defaultChecked />
                  <Label htmlFor="autoBackup">Habilitar respaldo automático</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backupFrequency">
                    <SelectValue placeholder="Seleccionar frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Respaldos Recientes</Label>
                <div className="rounded-md border">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-medium">backup_20230514_120000.sql</div>
                      <div className="text-sm text-muted-foreground">14/05/2023 12:00:00</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Descargar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between border-t p-4">
                    <div>
                      <div className="font-medium">backup_20230513_120000.sql</div>
                      <div className="text-sm text-muted-foreground">13/05/2023 12:00:00</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Descargar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between border-t p-4">
                    <div>
                      <div className="font-medium">backup_20230512_120000.sql</div>
                      <div className="text-sm text-muted-foreground">12/05/2023 12:00:00</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Descargar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
