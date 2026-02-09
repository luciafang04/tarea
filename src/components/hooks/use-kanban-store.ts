"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { v4 as uuidv4 } from "uuid"

import type { AuditAccion, BoardState, DiffMap, Estado, Task } from "@/types"
import { loadState, saveState, validateImportData } from "@/lib/storage"

type CreateTaskInput = {
  titulo: string
  descripcion?: string
  prioridad: Task["prioridad"]
  tags: string[]
  estimacionMin: number
  fechaLimite?: string
  estado?: Estado
}

type UpdateTaskInput = {
  titulo: string
  descripcion?: string
  prioridad: Task["prioridad"]
  tags: string[]
  estimacionMin: number
  fechaLimite?: string
  observacionesJavi?: string
  rubrica?: number
  rubricaComentario?: string
}

const createDiff = (before: Task, after: Task): DiffMap => {
  const fields: Array<keyof Task> = [
    "titulo",
    "descripcion",
    "prioridad",
    "tags",
    "estimacionMin",
    "fechaLimite",
    "estado",
    "observacionesJavi",
    "rubrica",
    "rubricaComentario",
  ]

  return fields.reduce<DiffMap>((acc, field) => {
    const beforeValue = before[field]
    const afterValue = after[field]
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      acc[field] = { before: beforeValue, after: afterValue }
    }
    return acc
  }, {})
}

const buildAuditEntry = (accion: AuditAccion, taskId: string, diff: DiffMap) => ({
  id: uuidv4(),
  timestamp: new Date().toISOString(),
  accion,
  taskId,
  diff,
  userLabel: "Alumno/a" as const,
})

export const useKanbanStore = () => {
  const [state, setState] = useState<BoardState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const createTask = useCallback((input: CreateTaskInput) => {
    const now = new Date().toISOString()
    const task: Task = {
      id: uuidv4(),
      titulo: input.titulo,
      descripcion: input.descripcion?.trim() || undefined,
      prioridad: input.prioridad,
      tags: input.tags,
      estimacionMin: input.estimacionMin,
      fechaCreacion: now,
      fechaLimite: input.fechaLimite || undefined,
      estado: input.estado ?? "todo",
    }

    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
      audit: [buildAuditEntry("CREATE", task.id, { task: { before: null, after: task } }), ...prev.audit],
    }))
  }, [])

  const updateTask = useCallback((id: string, input: UpdateTaskInput) => {
    setState((prev) => {
      const existing = prev.tasks.find((task) => task.id === id)
      if (!existing) return prev

      const updated: Task = {
        ...existing,
        titulo: input.titulo,
        descripcion: input.descripcion?.trim() || undefined,
        prioridad: input.prioridad,
        tags: input.tags,
        estimacionMin: input.estimacionMin,
        fechaLimite: input.fechaLimite || undefined,
        observacionesJavi: input.observacionesJavi?.trim() || undefined,
        rubrica: input.rubrica,
        rubricaComentario: input.rubricaComentario?.trim() || undefined,
      }

      const diff = createDiff(existing, updated)
      if (Object.keys(diff).length === 0) return prev

      return {
        ...prev,
        tasks: prev.tasks.map((task) => (task.id === id ? updated : task)),
        audit: [buildAuditEntry("UPDATE", id, diff), ...prev.audit],
      }
    })
  }, [])

  const deleteTask = useCallback((id: string) => {
    setState((prev) => {
      const existing = prev.tasks.find((task) => task.id === id)
      if (!existing) return prev

      return {
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== id),
        audit: [
          buildAuditEntry("DELETE", id, { task: { before: existing, after: null } }),
          ...prev.audit,
        ],
      }
    })
  }, [])

  const moveTask = useCallback((id: string, nuevoEstado: Estado) => {
    setState((prev) => {
      const existing = prev.tasks.find((task) => task.id === id)
      if (!existing || existing.estado === nuevoEstado) return prev

      const updated = { ...existing, estado: nuevoEstado }
      return {
        ...prev,
        tasks: prev.tasks.map((task) => (task.id === id ? updated : task)),
        audit: [
          buildAuditEntry("MOVE", id, {
            estado: { before: existing.estado, after: nuevoEstado },
          }),
          ...prev.audit,
        ],
      }
    })
  }, [])

  const setGodMode = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, godMode: value }))
  }, [])

  const importState = useCallback((data: unknown) => {
    const result = validateImportData(data)
    if (!result.ok) return result

    const audit = [...result.state.audit]
    if (result.idReplacements.length > 0) {
      result.idReplacements.forEach(({ oldId, newId }) => {
        audit.unshift(
          buildAuditEntry("UPDATE", newId, {
            id: { before: oldId, after: newId },
          })
        )
      })
    }

    setState({
      ...result.state,
      audit,
    })

    return result
  }, [])

  const stateMemo = useMemo(() => state, [state])

  return {
    state: stateMemo,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    setGodMode,
    importState,
  }
}
