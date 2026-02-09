export type Prioridad = "low" | "medium" | "high"
export type Estado = "todo" | "doing" | "done"

export type AuditAccion = "CREATE" | "UPDATE" | "DELETE" | "MOVE"

export type DiffEntry = {
  before?: unknown
  after?: unknown
}

export type DiffMap = Record<string, DiffEntry>

export type Task = {
  id: string
  titulo: string
  descripcion?: string
  prioridad: Prioridad
  tags: string[]
  estimacionMin: number
  fechaCreacion: string
  fechaLimite?: string
  estado: Estado
  observacionesJavi?: string
  rubrica?: number
  rubricaComentario?: string
}

export type AuditEntry = {
  id: string
  timestamp: string
  accion: AuditAccion
  taskId: string
  diff: DiffMap
  userLabel: "Alumno/a"
}

export type BoardState = {
  tasks: Task[]
  audit: AuditEntry[]
  godMode: boolean
}
