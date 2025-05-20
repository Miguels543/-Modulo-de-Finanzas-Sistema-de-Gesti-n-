// Utilidades para generar y descargar PDFs
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

// Función para generar una vista previa del PDF (devuelve la URL de la imagen y el objeto PDF)
export async function generatePDFPreview(
  elementId: string,
): Promise<{ imgUrl: string; pdf: jsPDF; imgWidth: number; imgHeight: number }> {
  // Obtener el elemento que queremos convertir a PDF
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Elemento con ID ${elementId} no encontrado`)
  }

  // Crear un canvas a partir del elemento HTML con opciones mejoradas para manejar recursos
  const canvas = await html2canvas(element, {
    scale: 2, // Mayor escala para mejor calidad
    useCORS: true, // Permitir imágenes de otros dominios
    allowTaint: true, // Permitir imágenes que pueden "contaminar" el canvas
    logging: false,
    imageTimeout: 0, // Sin timeout para cargar imágenes
    onclone: (document) => {
      // Manipular el clon del documento antes de renderizar
      const images = document.getElementsByTagName("img")
      for (let i = 0; i < images.length; i++) {
        // Asegurarse de que las imágenes tengan crossOrigin="anonymous"
        images[i].crossOrigin = "anonymous"
      }
    },
  })

  // Crear un nuevo documento PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Calcular las dimensiones para ajustar el contenido al PDF
  const imgWidth = 210 // Ancho de página A4 en mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // Obtener la URL de la imagen del canvas
  const imgUrl = canvas.toDataURL("image/png")

  return { imgUrl, pdf, imgWidth, imgHeight }
}

// Función para descargar el PDF a partir de la vista previa
export function downloadPDF(pdf: jsPDF, imgUrl: string, imgWidth: number, imgHeight: number, fileName = "reporte.pdf") {
  // Añadir la imagen del canvas al PDF
  pdf.addImage(imgUrl, "PNG", 0, 0, imgWidth, imgHeight)

  // Descargar el PDF
  pdf.save(fileName)

  return true
}

// Función para generar un PDF a partir de un elemento HTML (mantiene la compatibilidad con el código existente)
export async function generatePDF(elementId: string, fileName = "reporte.pdf") {
  try {
    // Generar la vista previa
    const { imgUrl, pdf, imgWidth, imgHeight } = await generatePDFPreview(elementId)

    // Descargar el PDF
    return downloadPDF(pdf, imgUrl, imgWidth, imgHeight, fileName)
  } catch (error) {
    console.error("Error al generar el PDF:", error)
    return false
  }
}

// Función para exportar datos como CSV
export function exportToCSV(data: any[], fileName = "datos.csv") {
  try {
    if (!data || !data.length) {
      throw new Error("No hay datos para exportar")
    }

    // Obtener los encabezados (nombres de las propiedades)
    const headers = Object.keys(data[0])

    // Crear las filas de datos
    const csvRows = []

    // Añadir los encabezados
    csvRows.push(headers.join(","))

    // Añadir los datos
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header]
        // Escapar comillas y formatear correctamente
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(","))
    }

    // Combinar en un solo string CSV
    const csvString = csvRows.join("\n")

    // Crear un blob y descargar
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    // Crear URL para descargar
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"

    // Añadir al DOM, hacer clic y eliminar
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return true
  } catch (error) {
    console.error("Error al exportar a CSV:", error)
    return false
  }
}
