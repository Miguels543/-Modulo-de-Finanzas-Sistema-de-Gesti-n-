"use client"

// Nuevo componente para ofrecer una alternativa cuando falla la generación de PDF
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToCSV } from "@/lib/pdf-utils"
import { useToast } from "@/components/ui/use-toast"

interface FallbackExportProps {
  data: any[]
  fileName?: string
}

export function FallbackExport({ data, fileName = "datos.csv" }: FallbackExportProps) {
  const { toast } = useToast()

  const handleExport = () => {
    try {
      const success = exportToCSV(data, fileName)
      if (success) {
        toast({
          title: "CSV generado correctamente",
          description: "Los datos han sido exportados como CSV",
        })
      } else {
        throw new Error("No se pudo exportar a CSV")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al exportar CSV",
        description: "Ocurrió un problema al exportar los datos",
      })
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  )
}
