"use client"

import type React from "react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ReportCardProps {
  title: string
  icon?: React.ReactNode
  value: string | number
  subtext?: string
  onDownload?: () => void
}

export function ReportCard({ title, icon, value, subtext, onDownload }: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
      {onDownload && (
        <CardFooter className="p-2">
          <Button variant="ghost" size="sm" className="w-full" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
