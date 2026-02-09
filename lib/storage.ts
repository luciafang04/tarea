import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

import type { BoardState, Task } from "@/types"

const STORAGE_KEY = "kanban_state_v3_school"

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

const ACCENT_REPLACEMENTS: Array<{ from: string; to: string }> = [
  { from: "evaluacion", to: "evaluación" },
  { from: "biologia", to: "biología" },
  { from: "celulas", to: "células" },
  { from: "funcion", to: "función" },
  { from: "matematicas", to: "matemáticas" },
  { from: "algebra", to: "álgebra" },
  { from: "paginas", to: "páginas" },
  { from: "linea", to: "línea" },
  { from: "cronologico", to: "cronológico" },
  { from: "quimica", to: "química" },
  { from: "practica", to: "práctica" },
  { from: "exposicion", to: "exposición" },
  { from: "poesia", to: "poesía" },
]

const normalizeText = (value?: string) => {
  if (!value) return value
  let next = value
  for (const { from, to } of ACCENT_REPLACEMENTS) {
    const pattern = new RegExp(`\\b${from}\\b`, "gi")
    next = next.replace(pattern, (match) => {
      const shouldCapitalize = match[0] === match[0].toUpperCase()
      if (!shouldCapitalize) return to
      return to[0].toUpperCase() + to.slice(1)
    })
  }
  return next
}

const normalizeState = (state: BoardState) => {
  let changed = false
  const tasks = state.tasks.map((task) => {
    const titulo = normalizeText(task.titulo) ?? task.titulo
    const descripcion = normalizeText(task.descripcion) ?? task.descripcion
    const tags = task.tags.map((tag) => normalizeText(tag) ?? tag)
    const observacionesJavi =
      normalizeText(task.observacionesJavi) ?? task.observacionesJavi
    const rubricaComentario =
      normalizeText(task.rubricaComentario) ?? task.rubricaComentario

    if (
      titulo !== task.titulo ||
      descripcion !== task.descripcion ||
      observacionesJavi !== task.observacionesJavi ||
      rubricaComentario !== task.rubricaComentario ||
      tags.some((tag, index) => tag !== task.tags[index])
    ) {
      changed = true
      return {
        ...task,
        titulo,
        descripcion,
        tags,
        observacionesJavi,
        rubricaComentario,
      }
    }
    return task
  })

  return changed ? { state: { ...state, tasks }, changed } : { state, changed }
}

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
      titulo: "Proyecto de biología: células vegetales",
      descripcion: "Resumen de estructura y función con diagrama.",
      prioridad: "high",
      tags: ["biología", "proyecto", "laboratorio"],
      estimacionMin: 70,
      fechaCreacion: isoNow,
      fechaLimite: addDays(2),
      estado: "todo",
    },
    {
      id: uuidv4(),
      titulo: "Matemáticas: ejercicios de álgebra",
      descripcion: "Resolver del libro, páginas 42 a 50.",
      prioridad: "medium",
      tags: ["matemáticas", "tarea", "álgebra"],
      estimacionMin: 50,
      fechaCreacion: isoNow,
      fechaLimite: addDays(1),
      estado: "doing",
    },
    {
      id: uuidv4(),
      titulo: "Historia: línea de tiempo Segunda Guerra",
      descripcion: "Cuadro cronológico con eventos clave.",
      prioridad: "medium",
      tags: ["historia", "resumen", "línea de tiempo"],
      estimacionMin: 90,
      fechaCreacion: isoNow,
      fechaLimite: addDays(3),
      estado: "todo",
    },
    {
      id: uuidv4(),
      titulo: "Química: informe de laboratorio",
      descripcion: "Registrar resultados y conclusiones del experimento.",
      prioridad: "high",
      tags: ["química", "práctica", "laboratorio"],
      estimacionMin: 120,
      fechaCreacion: isoNow,
      fechaLimite: addDays(4),
      estado: "doing",
    },
    {
      id: uuidv4(),
      titulo: "Literatura: exposición de poesía",
      descripcion: "Elegir un poema y analizar estructura y mensaje.",
      prioridad: "low",
      tags: ["literatura", "exposición", "poesía"],
      estimacionMin: 60,
      fechaCreacion: isoNow,
      fechaLimite: addDays(5),
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
      const normalized = normalizeState(result.data)
      if (normalized.changed) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(normalized.state)
        )
      }
      return normalized.state
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
  const normalized = normalizeState(state)
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(normalized.state)
  )
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
