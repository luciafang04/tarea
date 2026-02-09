"use client"

import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"

import type { Estado, Task } from "@/types"
import { useKanbanStore } from "@/components/hooks/use-kanban-store"
import { filterTasks, parseQuery } from "@/lib/query"
import { Column } from "@/components/kanban/column"
import { TaskCardPreview } from "@/components/kanban/task-card"
import { SearchAndFilter } from "@/components/kanban/search-and-filter"
import { AuditHistory } from "@/components/kanban/audit-history"
import { DataManagement } from "@/components/kanban/data-management"
import { TaskStadistics } from "@/components/kanban/task-stadistics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"

const COLUMNS: Array<{ id: Estado; title: string; description: string }> = [
  { id: "todo", title: "To do", description: "Pendiente" },
  { id: "doing", title: "Doing", description: "En progreso" },
  { id: "done", title: "Done", description: "Finalizado" },
]

export function KanbanBoard() {
  const [mounted, setMounted] = useState(false)
  const { state, moveTask, setGodMode } = useKanbanStore()
  const [query, setQuery] = useState("")
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const parsedQuery = useMemo(() => parseQuery(query), [query])
  const filteredTasks = useMemo(
    () => filterTasks(state.tasks, parsedQuery),
    [state.tasks, parsedQuery]
  )

  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce<Record<Estado, Task[]>>(
      (acc, column) => {
        acc[column.id] = filteredTasks.filter(
          (task) => task.estado === column.id
        )
        return acc
      },
      {
        todo: [],
        doing: [],
        done: [],
      }
    )
  }, [filteredTasks])

  const handleDragStart = (event: DragStartEvent) => {
    const task = state.tasks.find((item) => item.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const activeTask = state.tasks.find((task) => task.id === activeId)
    if (!activeTask) return

    let targetEstado: Estado | null = null
    if (overId.startsWith("column:")) {
      targetEstado = overId.replace("column:", "") as Estado
    } else {
      const overTask = state.tasks.find((task) => task.id === overId)
      if (overTask) targetEstado = overTask.estado
    }

    if (targetEstado && targetEstado !== activeTask.estado) {
      moveTask(activeId, targetEstado)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 px-8 py-10">
      <Toaster richColors position="top-right" />
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Mesa de operaciones
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Gestor Kanban de Operaciones
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Seguimiento de tareas criticas, auditoria completa y filtros
            avanzados para decisiones rapidas.
          </p>
        </div>
        <Card className="flex items-center gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Modo Dios
            </p>
            <p className="text-sm font-semibold">Evaluación de Javi</p>
          </div>
          <Switch
            checked={state.godMode}
            onCheckedChange={setGodMode}
            aria-label="Activar modo dios"
          />
        </Card>
      </header>

      {!mounted ? (
        <div className="mt-10 flex items-center justify-center text-sm text-muted-foreground">
          Cargando tablero...
        </div>
      ) : (
        <>
          <div className="mt-6">
            <SearchAndFilter query={query} onChange={setQuery} />
          </div>

          <Tabs defaultValue="tablero" className="mt-8">
            <TabsList>
              <TabsTrigger value="tablero">Tablero</TabsTrigger>
              <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
              <TabsTrigger value="datos">Datos</TabsTrigger>
            </TabsList>
            <TabsContent value="tablero">
              <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
              >
                <div className="mt-4 grid grid-cols-3 gap-6">
                  {COLUMNS.map((column) => (
                    <Column
                      key={column.id}
                      column={column}
                      tasks={tasksByColumn[column.id]}
                      godMode={state.godMode}
                    />
                  ))}
                </div>
                <DragOverlay>
                  {activeTask ? (
                    <div className="w-[320px]">
                      <TaskCardPreview task={activeTask} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
              <div className="mt-6">
                <TaskStadistics tasks={state.tasks} visible={state.godMode} />
              </div>
            </TabsContent>
            <TabsContent value="auditoria">
              <AuditHistory audit={state.audit} tasks={state.tasks} />
            </TabsContent>
            <TabsContent value="datos">
              <DataManagement />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
