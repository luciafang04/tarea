"use client"

import type { Task } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type TaskStadisticsProps = {
  tasks: Task[]
  visible: boolean
}

export function TaskStadistics({ tasks, visible }: TaskStadisticsProps) {
  if (!visible) return null

  const scored = tasks.filter((task) => typeof task.rubrica === "number")
  const pending = tasks.filter((task) => task.rubrica === undefined)
  const average =
    scored.length > 0
      ? scored.reduce((acc, task) => acc + (task.rubrica ?? 0), 0) /
        scored.length
      : 0

  return (
    <Card className="flex items-center justify-between gap-4 px-6 py-5">
      <div>
        <p className="text-sm font-semibold">Panel resumen (Modo Dios)</p>
        <p className="text-xs text-muted-foreground">
          Media de evaluaciones y tareas sin evaluar.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary">Media: {average.toFixed(1)}</Badge>
        <Badge variant="outline">Sin evaluar: {pending.length}</Badge>
      </div>
    </Card>
  )
}
