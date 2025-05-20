"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import type { jsPDF } from "jspdf"
import { downloadPDF } from "@/lib/pdf-utils"
import { useToast } from "@/components/ui/use-toast"

interface PDFPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  previewUrl: string
  pdfData: {
    pdf: jsPDF
    imgUrl: string
    imgWidth: number
    imgHeight: number
  } | null
  fileName: string
}

export function PDFPreviewDialog({ isOpen, onClose, previewUrl, pdfData, fileName }: PDFPreviewDialogProps) {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    if (!pdfData) return

    setIsDownloading(true)
    try {
      const { pdf, imgUrl, imgWidth, imgHeight } = pdfData
      const success = downloadPDF(pdf, imgUrl, imgWidth, imgHeight, fileName)

      if (success) {
        toast({
          title: "PDF descargado correctamente",
          description: `El archivo ${fileName} ha sido descargado`,
        })
        onClose()
      } else {
        throw new Error("Error al descargar el PDF")
      }
    } catch (error) {
      console.error("Error al descargar el PDF:", error)
      toast({
        variant: "destructive",
        title: "Error al descargar el PDF",
        description: "Ocurrió un problema al descargar el documento",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Vista previa del PDF</DialogTitle>
          <DialogDescription>Verifique el contenido antes de descargar el documento</DialogDescription>
        </DialogHeader>

        <div className="my-4 max-h-[70vh] overflow-auto border rounded-md">
          {previewUrl ? (
            <img src={previewUrl || "/placeholder.svg"} alt="Vista previa del PDF" className="w-full h-auto" />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Cargando vista previa...</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleDownload} disabled={!pdfData || isDownloading}>
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Descargando..." : "Descargar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
