"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { PlusIcon } from "lucide-react"

import type { Estado, Task } from "@/types"
import { TaskCard } from "@/components/kanban/task-card"
import { TaskFormDialog } from "@/components/kanban/task-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ColumnProps = {
  column: { id: Estado; title: string; description: string }
  tasks: Task[]
  godMode: boolean
}

export function Column({ column, tasks, godMode }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${column.id}`,
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{column.title}</h2>
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{column.description}</p>
        </div>
        <TaskFormDialog
          mode="create"
          defaultEstado={column.id}
          godMode={godMode}
          trigger={
            <Button size="icon-sm" variant="outline" aria-label="Crear tarea">
              <PlusIcon className="size-4" />
            </Button>
          }
        />
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[500px] flex-col gap-3 rounded-xl border border-dashed px-3 py-4 transition-colors ${
          isOver ? "border-primary/60 bg-primary/5" : "border-muted-foreground/20"
        }`}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <p>No hay tareas aquí.</p>
              <p className="text-xs">
                Arrastra una tarjeta o crea una nueva.
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} godMode={godMode} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
