import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

import type { BoardState, Task } from "@/types"

const STORAGE_KEY = "kanban_state_v1"

const isIsoDateString = (value: string) => !Number.isNaN(Date.parse(value))

const TaskSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(3),
  descripcion: z.string().optional(),
  prioridad: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string()),
  estimacionMin: z.number().int().nonnegative(),
  fechaCreacion: z.string().refine(isIsoDateString, {
    message: "fechaCreacion debe ser ISO",
  }),
  fechaLimite: z
    .string()
    .optional()
    .refine((value) => (value ? isIsoDateString(value) : true), {
      message: "fechaLimite debe ser ISO",
    }),
  estado: z.enum(["todo", "doing", "done"]),
  observacionesJavi: z.string().optional(),
  rubrica: z.number().min(0).max(10).optional(),
  rubricaComentario: z.string().optional(),
})

const AuditSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().refine(isIsoDateString, {
    message: "timestamp debe ser ISO",
  }),
  accion: z.enum(["CREATE", "UPDATE", "DELETE", "MOVE"]),
  taskId: z.string(),
  diff: z.record(
    z.object({
      before: z.unknown(),
      after: z.unknown(),
    })
  ),
  userLabel: z.literal("Alumno/a"),
})

const BoardSchema = z.object({
  tasks: z.array(TaskSchema),
  audit: z.array(AuditSchema),
  godMode: z.boolean(),
})

export type ImportResult =
  | {
      ok: true
      state: BoardState
      idReplacements: Array<{ oldId: string; newId: string }>
    }
  | { ok: false; errors: string[] }

const createSeedTasks = (): Task[] => {
  const now = new Date()
  const isoNow = now.toISOString()
  const addDays = (days: number) => {
    const date = new Date(now)
    date.setDate(date.getDate() + days)
    return date.toISOString()
  }

  return [
    {
      id: uuidv4(),
      titulo: "Rebalanceo diario de portafolio LATAM",
      descripcion:
        "Ajustar posiciones en ADRs con volatilidad > 2.5 y revisar stop-loss.",
      prioridad: "high",
      tags: ["broker", "riesgo", "latam"],
      estimacionMin: 90,
      fechaCreacion: isoNow,
      fechaLimite: addDays(1),
      estado: "todo",
    },
    {
      id: uuidv4(),
      titulo: "Validar señales de arbitraje cripto",
      descripcion: "Cruzar spreads entre exchanges y registrar gaps > 1.2%",
      prioridad: "medium",
      tags: ["cripto", "arbitraje"],
      estimacionMin: 45,
      fechaCreacion: isoNow,
      fechaLimite: addDays(3),
      estado: "doing",
    },
    {
      id: uuidv4(),
      titulo: "Reporte semanal de liquidez",
      descripcion: "Comparar cash vs. colateral y preparar resumen ejecutivo.",
      prioridad: "low",
      tags: ["reporting", "liquidez"],
      estimacionMin: 120,
      fechaCreacion: isoNow,
      fechaLimite: addDays(5),
      estado: "todo",
    },
    {
      id: uuidv4(),
      titulo: "Auditar operaciones fuera de ventana",
      descripcion: "Verificar ejecuciones fuera del horario aprobado.",
      prioridad: "high",
      tags: ["compliance", "auditoria"],
      estimacionMin: 60,
      fechaCreacion: isoNow,
      fechaLimite: addDays(-1),
      estado: "doing",
    },
    {
      id: uuidv4(),
      titulo: "Cerrar posiciones de riesgo residual",
      descripcion: "Vender posiciones con correlación inversa baja.",
      prioridad: "medium",
      tags: ["riesgo", "cierre"],
      estimacionMin: 75,
      fechaCreacion: isoNow,
      fechaLimite: addDays(2),
      estado: "done",
    },
  ]
}

const createSeedState = (): BoardState => ({
  tasks: createSeedTasks(),
  audit: [],
  godMode: false,
})

export const loadState = (): BoardState => {
  if (typeof window === "undefined") {
    return createSeedState()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = createSeedState()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    const parsed = JSON.parse(raw)
    const result = BoardSchema.safeParse(parsed)
    if (result.success) {
      return result.data
    }
  } catch {
    // ignore and reset below
  }

  const fallback = createSeedState()
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
  return fallback
}

export const saveState = (state: BoardState) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const validateImportData = (data: unknown): ImportResult => {
  const result = BoardSchema.safeParse(data)
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      ),
    }
  }

  const seen = new Set<string>()
  const idReplacements: Array<{ oldId: string; newId: string }> = []
  const normalizedTasks = result.data.tasks.map((task) => {
    if (!seen.has(task.id)) {
      seen.add(task.id)
      return task
    }

    const newId = uuidv4()
    idReplacements.push({ oldId: task.id, newId })
    return { ...task, id: newId }
  })

  return {
    ok: true,
    state: {
      ...result.data,
      tasks: normalizedTasks,
    },
    idReplacements,
  }
}
