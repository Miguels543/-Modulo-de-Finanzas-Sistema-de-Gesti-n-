"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ReportTableProps {
  title: string
  data: any[]
  columns: {
    key: string
    header: string
    format?: (value: any) => string
  }[]
  onDownload?: () => void
}

export function ReportTable({ title, data, columns, onDownload }: ReportTableProps) {
  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {onDownload && (
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                No hay datos disponibles
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={`${index}-${column.key}`}>
                    {column.format ? column.format(row[column.key]) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function VentasReportTable({ onDownload }: { onDownload?: () => void }) {
  const data = [
    { fecha: "2023-05-10", producto: "Lomo Saltado", cantidad: 15, total: 525.0 },
    { fecha: "2023-05-10", producto: "Ceviche", cantidad: 12, total: 546.0 },
    { fecha: "2023-05-11", producto: "Arroz con Mariscos", cantidad: 8, total: 384.0 },
    { fecha: "2023-05-11", producto: "Ají de Gallina", cantidad: 10, total: 320.0 },
    { fecha: "2023-05-12", producto: "Lomo Saltado", cantidad: 18, total: 630.0 },
  ]

  const columns = [
    { key: "fecha", header: "Fecha" },
    { key: "producto", header: "Producto" },
    { key: "cantidad", header: "Cantidad" },
    { key: "total", header: "Total", format: (value: number) => formatCurrency(value) },
  ]

  return <ReportTable title="Detalle de Ventas" data={data} columns={columns} onDownload={onDownload} />
}

export function InventarioReportTable({ onDownload }: { onDownload?: () => void }) {
  const data = [
    { codigo: "P001", nombre: "Aceite de oliva", stock: 5, valor: 229.5 },
    { codigo: "P002", nombre: "Arroz arborio", stock: 25, valor: 462.5 },
    { codigo: "P003", nombre: "Queso parmesano", stock: 3, valor: 255.0 },
    { codigo: "P004", nombre: "Vino tinto", stock: 24, valor: 2880.0 },
    { codigo: "P005", nombre: "Pasta fresca", stock: 18, valor: 405.0 },
  ]

  const columns = [
    { key: "codigo", header: "Código" },
    { key: "nombre", header: "Producto" },
    { key: "stock", header: "Stock" },
    { key: "valor", header: "Valor", format: (value: number) => formatCurrency(value) },
  ]

  return <ReportTable title="Inventario Actual" data={data} columns={columns} onDownload={onDownload} />
}
