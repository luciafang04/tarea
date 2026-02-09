"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import type { Estado, Task } from "@/types"
import { useKanbanStore } from "@/components/hooks/use-kanban-store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const TaskFormSchema = z.object({
  titulo: z.string().min(3, "Mínimo 3 caracteres"),
  descripcion: z.string().optional(),
  prioridad: z.enum(["low", "medium", "high"]),
  tagsInput: z.string().optional(),
  estimacionMin: z.number().min(0, "Debe ser mayor o igual a 0"),
  fechaLimite: z.string().optional(),
  observacionesJavi: z.string().optional(),
  rubrica: z.number().min(0).max(10).optional(),
  rubricaComentario: z.string().optional(),
})

type TaskFormValues = z.infer<typeof TaskFormSchema>

type TaskFormDialogProps = {
  mode: "create" | "edit"
  trigger: React.ReactNode
  task?: Task
  defaultEstado?: Estado
  godMode: boolean
  onSubmit?: (data: {
    titulo: string
    descripcion?: string
    prioridad: Task["prioridad"]
    tags: string[]
    estimacionMin: number
    fechaLimite?: string
    observacionesJavi?: string
    rubrica?: number
    rubricaComentario?: string
  }) => void
}

export function TaskFormDialog({
  mode,
  trigger,
  task,
  defaultEstado,
  godMode,
  onSubmit,
}: TaskFormDialogProps) {
  const { createTask } = useKanbanStore()
  const [open, setOpen] = useState(false)
  const titleRef = useRef<HTMLInputElement | null>(null)

  const defaultValues = useMemo<TaskFormValues>(
    () => ({
      titulo: task?.titulo ?? "",
      descripcion: task?.descripcion ?? "",
      prioridad: task?.prioridad ?? "medium",
      tagsInput: task?.tags.join(", ") ?? "",
      estimacionMin: task?.estimacionMin ?? 30,
      fechaLimite: task?.fechaLimite ? task.fechaLimite.slice(0, 10) : "",
      observacionesJavi: task?.observacionesJavi ?? "",
      rubrica: task?.rubrica,
      rubricaComentario: task?.rubricaComentario ?? "",
    }),
    [task]
  )

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const handleSubmit = (values: TaskFormValues) => {
    const tags = values.tagsInput
      ? values.tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []

    const payload = {
      titulo: values.titulo,
      descripcion: values.descripcion?.trim() || undefined,
      prioridad: values.prioridad,
      tags,
      estimacionMin: values.estimacionMin,
      fechaLimite: values.fechaLimite
        ? new Date(values.fechaLimite).toISOString()
        : undefined,
      observacionesJavi: values.observacionesJavi?.trim() || undefined,
      rubrica: values.rubrica,
      rubricaComentario: values.rubricaComentario?.trim() || undefined,
    }

    if (mode === "create") {
      createTask({ ...payload, estado: defaultEstado })
    } else if (onSubmit) {
      onSubmit(payload)
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          titleRef.current?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva tarea" : "Editar tarea"}
          </DialogTitle>
          <DialogDescription>
            Completa la información con datos reales y verificables.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="titulo">Título</Label>
            {(() => {
              const field = form.register("titulo")
              return (
                <Input
                  id="titulo"
                  {...field}
                  ref={(node) => {
                    field.ref(node)
                    titleRef.current = node
                  }}
                />
              )
            })()}
            {form.formState.errors.titulo && (
              <p className="text-xs text-destructive">
                {form.formState.errors.titulo.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" {...form.register("descripcion")} />
          </div>
          <div className="grid gap-2">
            <Label>Prioridad</Label>
            <Select
              value={form.watch("prioridad")}
              onValueChange={(value) =>
                form.setValue("prioridad", value as Task["prioridad"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tagsInput">Tags</Label>
            <Input
              id="tagsInput"
              placeholder="broker, riesgo, latam"
              {...form.register("tagsInput")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estimacionMin">Estimación (min)</Label>
            <Input
              id="estimacionMin"
              type="number"
              min={0}
              {...form.register("estimacionMin", {
                valueAsNumber: true,
              })}
            />
            {form.formState.errors.estimacionMin && (
              <p className="text-xs text-destructive">
                {form.formState.errors.estimacionMin.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fechaLimite">Fecha límite</Label>
            <Input id="fechaLimite" type="date" {...form.register("fechaLimite")} />
          </div>

          {godMode && (
            <div className="rounded-lg border border-dashed border-muted-foreground/40 p-4">
              <p className="text-sm font-semibold">Observaciones de Javi</p>
              <div className="mt-3 grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="observacionesJavi">Observaciones</Label>
                  <Textarea
                    id="observacionesJavi"
                    {...form.register("observacionesJavi")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rubrica">Rúbrica (0-10)</Label>
                  <Input
                    id="rubrica"
                    type="number"
                    min={0}
                    max={10}
                    {...form.register("rubrica", {
                      setValueAs: (value) =>
                        value === "" ? undefined : Number(value),
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rubricaComentario">Comentario</Label>
                  <Textarea
                    id="rubricaComentario"
                    {...form.register("rubricaComentario")}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit">
              {mode === "create" ? "Crear tarea" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
