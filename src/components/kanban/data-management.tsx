"use client"

import { useRef, useState } from "react"
import { DownloadIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { useKanbanStore } from "@/components/hooks/use-kanban-store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function DataManagement() {
  const { state, importState } = useKanbanStore()
  const [errors, setErrors] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `kanban-export-${Date.now()}.json`
    link.click()
    window.URL.revokeObjectURL(url)
    toast.success("Exportación lista")
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()

    try {
      const json = JSON.parse(text)
      const result = importState(json)
      if (!result.ok) {
        setErrors(result.errors)
        toast.error("Errores en la importación")
      } else {
        setErrors([])
        toast.success("Datos importados correctamente")
      }
    } catch {
      setErrors(["El archivo no es un JSON válido"])
      toast.error("Error al leer el archivo")
    } finally {
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Persistencia y exportación</h2>
      <p className="text-sm text-muted-foreground">
        Exporta el tablero y el log de auditoría o importa un JSON validado.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleExport}>
          <DownloadIcon className="mr-2 size-4" />
          Exportar JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={handleImport}
          className="hidden"
        />
        <Button variant="default" onClick={() => fileRef.current?.click()}>
          <UploadIcon className="mr-2 size-4" />
          Importar JSON
        </Button>
      </div>

      {errors.length > 0 && (
        <Alert className="mt-4 border-destructive/40 bg-destructive/5">
          <AlertTitle>Errores detectados</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc pl-5 text-xs">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
