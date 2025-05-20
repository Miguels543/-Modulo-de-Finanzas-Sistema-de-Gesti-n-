"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import { VentasReportTable, InventarioReportTable } from "./report-table"
import { generatePDFPreview, exportToCSV } from "@/lib/pdf-utils"
import { useToast } from "@/components/ui/use-toast"
import { PDFPreviewDialog } from "./pdf-preview-dialog"
import type { jsPDF } from "jspdf"

interface ReportDetailProps {
  reportType: string
  startDate: string
  endDate: string
}

export function ReportDetail({ reportType, startDate, endDate }: ReportDetailProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  // Estado para la vista previa del PDF
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [pdfData, setPdfData] = useState<{
    pdf: jsPDF
    imgUrl: string
    imgWidth: number
    imgHeight: number
  } | null>(null)
  const [pdfFileName, setPdfFileName] = useState("reporte.pdf")

  // Modificar la función para mostrar la vista previa del PDF
  const handleShowPDFPreview = async (containerId: string) => {
    setIsGenerating(true)
    toast({
      title: "Generando vista previa",
      description: "Preparando la vista previa del documento...",
    })

    try {
      // Primero, asegurarse de que todas las imágenes tengan crossOrigin="anonymous"
      const container = document.getElementById(containerId)
      if (container) {
        const images = container.querySelectorAll("img")
        images.forEach((img) => {
          img.crossOrigin = "anonymous"
          // Si la imagen tiene un src que es un blob URL, podríamos necesitar manejarlo de manera especial
          if (img.src.startsWith("blob:")) {
            console.log("Imagen con blob URL detectada:", img.src)
          }
        })
      }

      // Generar la vista previa del PDF
      const fileName = `reporte-${reportType}-${new Date().toISOString().split("T")[0]}.pdf`
      const previewData = await generatePDFPreview(containerId)

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

  const handleExportCSV = (data: any[], fileName: string) => {
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

  // Datos de ejemplo para exportar
  const ventasData = [
    { fecha: "2023-05-10", producto: "Lomo Saltado", cantidad: 15, total: 525.0 },
    { fecha: "2023-05-10", producto: "Ceviche", cantidad: 12, total: 546.0 },
    { fecha: "2023-05-11", producto: "Arroz con Mariscos", cantidad: 8, total: 384.0 },
    { fecha: "2023-05-11", producto: "Ají de Gallina", cantidad: 10, total: 320.0 },
    { fecha: "2023-05-12", producto: "Lomo Saltado", cantidad: 18, total: 630.0 },
  ]

  const inventarioData = [
    { codigo: "P001", nombre: "Aceite de oliva", stock: 5, valor: 229.5 },
    { codigo: "P002", nombre: "Arroz arborio", stock: 25, valor: 462.5 },
    { codigo: "P003", nombre: "Queso parmesano", stock: 3, valor: 255.0 },
    { codigo: "P004", nombre: "Vino tinto", stock: 24, valor: 2880.0 },
    { codigo: "P005", nombre: "Pasta fresca", stock: 18, valor: 405.0 },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            Reporte de {reportType === "ventas" ? "Ventas" : reportType === "inventario" ? "Inventario" : reportType}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Período: {startDate} al {endDate}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const data = reportType === "ventas" ? ventasData : inventarioData
                const fileName = `reporte-${reportType}-${new Date().toISOString().split("T")[0]}.csv`
                handleExportCSV(data, fileName)
              }}
              disabled={isGenerating}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShowPDFPreview("report-detail-content")}
              disabled={isGenerating}
            >
              <Eye className="mr-2 h-4 w-4" />
              {isGenerating ? "Generando..." : "Vista previa PDF"}
            </Button>
          </div>

          <div id="report-detail-content">
            {reportType === "ventas" && <VentasReportTable />}
            {reportType === "inventario" && <InventarioReportTable />}
            {/* Añadir más tipos de reportes según sea necesario */}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de vista previa del PDF */}
      <PDFPreviewDialog
        isOpen={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        previewUrl={previewUrl}
        pdfData={pdfData}
        fileName={pdfFileName}
      />
    </div>
  )
}
