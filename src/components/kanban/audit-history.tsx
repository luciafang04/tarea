"use client"

import { useMemo, useState } from "react"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

import type { AuditEntry, Task } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type AuditHistoryProps = {
  audit: AuditEntry[]
  tasks: Task[]
}

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "MOVE"] as const

export function AuditHistory({ audit, tasks }: AuditHistoryProps) {
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [taskFilter, setTaskFilter] = useState<string>("")

  const taskMap = useMemo(() => {
    return new Map(tasks.map((task) => [task.id, task.titulo]))
  }, [tasks])

  const filtered = useMemo(() => {
    return audit.filter((entry) => {
      const actionMatches =
        actionFilter === "all" || entry.accion === actionFilter
      const taskMatches = taskFilter
        ? entry.taskId.includes(taskFilter.trim())
        : true
      return actionMatches && taskMatches
    })
  }, [audit, actionFilter, taskFilter])

  const handleCopy = async () => {
    const counts = ACTIONS.reduce<Record<string, number>>((acc, action) => {
      acc[action] = filtered.filter((entry) => entry.accion === action).length
      return acc
    }, {})

    const lines = [
      "Resumen de auditoría",
      `Total eventos: ${filtered.length}`,
      `CREATE: ${counts.CREATE} | UPDATE: ${counts.UPDATE} | DELETE: ${counts.DELETE} | MOVE: ${counts.MOVE}`,
      "Últimos eventos:",
      ...filtered.slice(0, 5).map((entry) => {
        const title = taskMap.get(entry.taskId) ?? "Sin título"
        return `${entry.timestamp} - ${entry.accion} - ${entry.taskId} - ${title}`
      }),
    ]

    try {
      await navigator.clipboard.writeText(lines.join("\n"))
      toast.success("Resumen copiado en el portapapeles")
    } catch {
      toast.error("No se pudo copiar el resumen")
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Log de auditoría</h2>
          <p className="text-xs text-muted-foreground">
            Filtra por acción o taskId para revisar el historial completo.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <CopyIcon className="mr-2 size-4" />
          Copiar resumen
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {ACTIONS.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={taskFilter}
          onChange={(event) => setTaskFilter(event.target.value)}
          placeholder="Filtrar por taskId"
          className="w-60"
          aria-label="Filtrar por taskId"
        />
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No hay eventos que mostrar con estos filtros.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Diff</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(entry.timestamp).toLocaleString("es-ES")}
                  </TableCell>
                  <TableCell>{entry.accion}</TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">
                      {entry.taskId}
                    </p>
                    <p className="text-sm font-medium">
                      {taskMap.get(entry.taskId) ?? "Sin título"}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs">
                    {Object.entries(entry.diff).map(([field, change]) => (
                      <div key={field}>
                        <span className="font-semibold">{field}:</span>{" "}
                        {JSON.stringify(change.before)} →{" "}
                        {JSON.stringify(change.after)}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{entry.userLabel}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
