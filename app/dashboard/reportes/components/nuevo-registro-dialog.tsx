"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

// Esquemas de validación para cada tipo de registro
const clienteSchema = z.object({
  tipo: z.literal("cliente"),
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }).optional().or(z.literal("")),
  telefono: z.string().min(9, { message: "El teléfono debe tener al menos 9 dígitos" }),
  direccion: z.string().optional(),
  estado: z.enum(["activo", "inactivo"]),
  notas: z.string().optional(),
})

const productoSchema = z.object({
  tipo: z.literal("producto"),
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  categoria: z.string().min(1, { message: "Seleccione una categoría" }),
  stock: z.coerce.number().min(0, { message: "El stock no puede ser negativo" }),
  precioCompra: z.coerce.number().min(0, { message: "El precio de compra debe ser mayor a 0" }),
  precioVenta: z.coerce.number().min(0, { message: "El precio de venta debe ser mayor a 0" }),
  unidad: z.string().min(1, { message: "Seleccione una unidad de medida" }),
  estado: z.enum(["disponible", "agotado", "descontinuado"]),
  descripcion: z.string().optional(),
})

const ingresoSchema = z.object({
  tipo: z.literal("ingreso"),
  fecha: z.date({ required_error: "La fecha es requerida" }),
  monto: z.coerce.number().min(0.01, { message: "El monto debe ser mayor a 0" }),
  origen: z.string().min(1, { message: "El origen es requerido" }),
  metodoPago: z.string().min(1, { message: "Seleccione un método de pago" }),
  comprobante: z.string().optional(),
  detalles: z.string().optional(),
})

const egresoSchema = z.object({
  tipo: z.literal("egreso"),
  fecha: z.date({ required_error: "La fecha es requerida" }),
  monto: z.coerce.number().min(0.01, { message: "El monto debe ser mayor a 0" }),
  concepto: z.string().min(1, { message: "El concepto es requerido" }),
  proveedor: z.string().min(1, { message: "El proveedor es requerido" }),
  metodoPago: z.string().min(1, { message: "Seleccione un método de pago" }),
  comprobante: z.string().optional(),
  detalles: z.string().optional(),
})

const movimientoSchema = z.object({
  tipo: z.literal("movimiento"),
  fecha: z.date({ required_error: "La fecha es requerida" }),
  producto: z.string().min(1, { message: "Seleccione un producto" }),
  cantidad: z.coerce.number().min(0.01, { message: "La cantidad debe ser mayor a 0" }),
  unidad: z.string().min(1, { message: "Seleccione una unidad de medida" }),
  origen: z.string().min(1, { message: "Seleccione el origen" }),
  destino: z.string().min(1, { message: "Seleccione el destino" }),
  responsable: z.string().min(1, { message: "El responsable es requerido" }),
  motivo: z.string().optional(),
})

// Esquema combinado para todos los tipos
const formSchema = z.discriminatedUnion("tipo", [
  clienteSchema,
  productoSchema,
  ingresoSchema,
  egresoSchema,
  movimientoSchema,
])

// Datos para los selects
const categoriasProducto = [
  { value: "platos", label: "Platos" },
  { value: "bebidas", label: "Bebidas" },
  { value: "postres", label: "Postres" },
  { value: "insumos", label: "Insumos" },
  { value: "limpieza", label: "Artículos de Limpieza" },
  { value: "empaques", label: "Empaques" },
]

const unidadesMedida = [
  { value: "unidad", label: "Unidad" },
  { value: "kg", label: "Kilogramo" },
  { value: "g", label: "Gramo" },
  { value: "l", label: "Litro" },
  { value: "ml", label: "Mililitro" },
  { value: "caja", label: "Caja" },
  { value: "paquete", label: "Paquete" },
]

const metodosPago = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta de Crédito/Débito" },
  { value: "transferencia", label: "Transferencia Bancaria" },
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
  { value: "otro", label: "Otro" },
]

const origenesIngreso = [
  { value: "venta_local", label: "Venta en Local" },
  { value: "delivery", label: "Delivery" },
  { value: "evento", label: "Evento/Catering" },
  { value: "otro", label: "Otro" },
]

const conceptosEgreso = [
  { value: "compra_insumos", label: "Compra de Insumos" },
  { value: "pago_servicios", label: "Pago de Servicios" },
  { value: "pago_personal", label: "Pago de Personal" },
  { value: "alquiler", label: "Alquiler" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "otro", label: "Otro" },
]

const ubicaciones = [
  { value: "cocina", label: "Cocina" },
  { value: "barra", label: "Barra" },
  { value: "almacen", label: "Almacén Principal" },
  { value: "almacen_secundario", label: "Almacén Secundario" },
  { value: "refrigerador", label: "Refrigerador" },
  { value: "congelador", label: "Congelador" },
]

// Productos de ejemplo para el combobox
const productos = [
  { value: "arroz", label: "Arroz" },
  { value: "aceite", label: "Aceite" },
  { value: "pollo", label: "Pollo" },
  { value: "carne", label: "Carne de Res" },
  { value: "papa", label: "Papa" },
  { value: "cebolla", label: "Cebolla" },
  { value: "tomate", label: "Tomate" },
  { value: "lechuga", label: "Lechuga" },
  { value: "gaseosa", label: "Gaseosa" },
  { value: "cerveza", label: "Cerveza" },
]

interface NuevoRegistroDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoInicial?: string
}

export function NuevoRegistroDialog({ open, onOpenChange, tipoInicial = "cliente" }: NuevoRegistroDialogProps) {
  const { toast } = useToast()
  const [tipoRegistro, setTipoRegistro] = useState<string>(tipoInicial)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openProducto, setOpenProducto] = useState(false)

  // Inicializar el formulario con valores por defecto según el tipo
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: tipoInicial as any,
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      estado: "activo",
      notas: "",
    },
  })

  // Cambiar los valores por defecto cuando cambia el tipo de registro
  const handleTipoChange = (value: string) => {
    setTipoRegistro(value)

    // Resetear el formulario con los valores por defecto según el tipo
    switch (value) {
      case "cliente":
        form.reset({
          tipo: "cliente" as const,
          nombre: "",
          email: "",
          telefono: "",
          direccion: "",
          estado: "activo",
          notas: "",
        })
        break
      case "producto":
        form.reset({
          tipo: "producto" as const,
          nombre: "",
          categoria: "",
          stock: 0,
          precioCompra: 0,
          precioVenta: 0,
          unidad: "",
          estado: "disponible",
          descripcion: "",
        })
        break
      case "ingreso":
        form.reset({
          tipo: "ingreso" as const,
          fecha: new Date(),
          monto: 0,
          origen: "",
          metodoPago: "",
          comprobante: "",
          detalles: "",
        })
        break
      case "egreso":
        form.reset({
          tipo: "egreso" as const,
          fecha: new Date(),
          monto: 0,
          concepto: "",
          proveedor: "",
          metodoPago: "",
          comprobante: "",
          detalles: "",
        })
        break
      case "movimiento":
        form.reset({
          tipo: "movimiento" as const,
          fecha: new Date(),
          producto: "",
          cantidad: 0,
          unidad: "",
          origen: "",
          destino: "",
          responsable: "",
          motivo: "",
        })
        break
    }
  }

  // Manejar el envío del formulario
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    try {
      // Aquí iría la lógica para guardar los datos en la base de datos
      console.log("Datos enviados:", data)

      // Simular una petición a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mostrar mensaje de éxito
      toast({
        title: "Registro guardado",
        description: `El ${tipoRegistro} ha sido registrado correctamente.`,
      })

      // Cerrar el diálogo
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar:", error)
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "Ocurrió un problema al guardar el registro. Intente nuevamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar el formulario según el tipo de registro
  const renderFormFields = () => {
    switch (tipoRegistro) {
      case "cliente":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="987654321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="cliente@ejemplo.com" {...field} />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección del cliente" {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Preferencias, alergias u otra información relevante"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      case "producto":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del producto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriasProducto.map((categoria) => (
                          <SelectItem key={categoria.value} value={categoria.value}>
                            {categoria.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unidad"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Unidad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unidadesMedida.map((unidad) => (
                            <SelectItem key={unidad.value} value={unidad.value}>
                              {unidad.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="precioCompra"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Precio de compra</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="precioVenta"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Precio de venta</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="agotado">Agotado</SelectItem>
                      <SelectItem value="descontinuado">Descontinuado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del producto, receta, instrucciones, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      case "ingreso":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input type="number" min="0.01" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="origen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {origenesIngreso.map((origen) => (
                          <SelectItem key={origen.value} value={origen.value}>
                            {origen.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {metodosPago.map((metodo) => (
                          <SelectItem key={metodo.value} value={metodo.value}>
                            {metodo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="comprobante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de comprobante</FormLabel>
                  <FormControl>
                    <Input placeholder="Boleta, factura, etc." {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="detalles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles adicionales sobre el ingreso" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      case "egreso":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input type="number" min="0.01" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="concepto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar concepto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conceptosEgreso.map((concepto) => (
                          <SelectItem key={concepto.value} value={concepto.value}>
                            {concepto.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {metodosPago.map((metodo) => (
                          <SelectItem key={metodo.value} value={metodo.value}>
                            {metodo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="proveedor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del proveedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comprobante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de comprobante</FormLabel>
                  <FormControl>
                    <Input placeholder="Boleta, factura, etc." {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="detalles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles adicionales sobre el egreso" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      case "movimiento":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="producto"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Producto</FormLabel>
                    <Popover open={openProducto} onOpenChange={setOpenProducto}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openProducto}
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                          >
                            {field.value
                              ? productos.find((producto) => producto.value === field.value)?.label
                              : "Seleccionar producto"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar producto..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron productos.</CommandEmpty>
                            <CommandGroup>
                              {productos.map((producto) => (
                                <CommandItem
                                  key={producto.value}
                                  value={producto.value}
                                  onSelect={(value) => {
                                    form.setValue("producto", value)
                                    setOpenProducto(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      producto.value === field.value ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {producto.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="cantidad"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input type="number" min="0.01" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unidad"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Unidad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unidadesMedida.map((unidad) => (
                            <SelectItem key={unidad.value} value={unidad.value}>
                              {unidad.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="responsable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del responsable" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ubicaciones.map((ubicacion) => (
                          <SelectItem key={ubicacion.value} value={ubicacion.value}>
                            {ubicacion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar destino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ubicaciones.map((ubicacion) => (
                          <SelectItem key={ubicacion.value} value={ubicacion.value}>
                            {ubicacion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Motivo del movimiento" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Registro</DialogTitle>
          <DialogDescription>Complete los campos para crear un nuevo registro en el sistema.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Registro</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleTipoChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo de registro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="producto">Producto</SelectItem>
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="egreso">Egreso</SelectItem>
                      <SelectItem value="movimiento">Movimiento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>El formulario se ajustará según el tipo de registro seleccionado</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-6">{renderFormFields()}</div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
