"use client"

import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { CalendarIcon, ClockIcon, PencilIcon, TagIcon, TrashIcon } from "lucide-react"

import type { Task } from "@/types"
import { useKanbanStore } from "@/components/hooks/use-kanban-store"
import { TaskFormDialog } from "@/components/kanban/task-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card } from "@/components/ui/card"

type TaskCardProps = {
  task: Task
  godMode: boolean
}

const priorityStyles: Record<Task["prioridad"], string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-700",
}

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha"
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  })
}

export function TaskCard({ task, godMode }: TaskCardProps) {
  const { updateTask, deleteTask } = useKanbanStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue =
    task.fechaLimite && new Date(task.fechaLimite) < new Date()

  const cardContent = (
    <Card
      className={`gap-4 border bg-card px-4 py-4 shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-semibold"
              {...attributes}
              {...listeners}
            >
              {task.titulo}
            </h3>
            <Badge className={priorityStyles[task.prioridad]}>
              {task.prioridad.toUpperCase()}
            </Badge>
          </div>
          {task.descripcion && (
            <p className="mt-2 text-xs text-muted-foreground">
              {task.descripcion}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <TaskFormDialog
            mode="edit"
            task={task}
            godMode={godMode}
            trigger={
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label="Editar tarea"
              >
                <PencilIcon className="size-3" />
              </Button>
            }
            onSubmit={(data) => updateTask(task.id, data)}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label="Eliminar tarea"
              >
                <TrashIcon className="size-3 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
                <AlertDialogDescription>
                  Esto eliminará la tarjeta y su historial asociado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteTask(task.id)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {task.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            <TagIcon className="mr-1 size-3" />
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <ClockIcon className="size-3" />
          {task.estimacionMin} min
        </div>
        <div className={`flex items-center gap-1 ${isOverdue ? "text-rose-600" : ""}`}>
          <CalendarIcon className="size-3" />
          {formatDate(task.fechaLimite)}
        </div>
      </div>

      {godMode && (
        <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Observaciones de Javi</p>
          <p className="mt-1">
            {task.observacionesJavi ?? "Sin observaciones."}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">
              Nota: {task.rubrica ?? "—"}
            </Badge>
            <span>{task.rubricaComentario ?? "Sin comentario."}</span>
          </div>
        </div>
      )}
    </Card>
  )

  return (
    <div ref={setNodeRef} style={style}>
      {cardContent}
    </div>
  )
}

export function TaskCardPreview({ task }: { task: Task }) {
  return (
    <Card className="gap-4 border bg-card px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{task.titulo}</h3>
          {task.descripcion && (
            <p className="mt-1 text-xs text-muted-foreground">
              {task.descripcion}
            </p>
          )}
        </div>
        <Badge className={priorityStyles[task.prioridad]}>
          {task.prioridad.toUpperCase()}
        </Badge>
      </div>
    </Card>
  )
}
