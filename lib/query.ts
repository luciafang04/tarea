import type { Prioridad, Task } from "@/types"

export type EstFilter = {
  op: "<" | "<=" | ">" | ">=" | "="
  value: number
}

export type DueFilter = "overdue" | "week"

export type QueryFilters = {
  text: string
  tags: string[]
  prioridad?: Prioridad
  due?: DueFilter
  est?: EstFilter
}

const normalize = (value: string) => value.trim().toLowerCase()

export const parseQuery = (input: string): QueryFilters => {
  const tokens = input.split(/\s+/).filter(Boolean)
  const textTokens: string[] = []
  const tags: string[] = []
  let prioridad: Prioridad | undefined
  let due: DueFilter | undefined
  let est: EstFilter | undefined

  tokens.forEach((token) => {
    const lower = normalize(token)
    if (lower.startsWith("tag:")) {
      const tag = lower.replace("tag:", "")
      if (tag) tags.push(tag)
      return
    }
    if (lower.startsWith("p:")) {
      const value = lower.replace("p:", "")
      if (value === "low" || value === "medium" || value === "high") {
        prioridad = value
        return
      }
    }
    if (lower.startsWith("due:")) {
      const value = lower.replace("due:", "")
      if (value === "overdue" || value === "week") {
        due = value
        return
      }
    }
    if (lower.startsWith("est:")) {
      const value = lower.replace("est:", "")
      const match = value.match(/^(<=|>=|<|>|=)?(\d+)$/)
      if (match) {
        const op = (match[1] ?? "=") as EstFilter["op"]
        est = { op, value: Number(match[2]) }
        return
      }
    }
    textTokens.push(token)
  })

  return {
    text: textTokens.join(" "),
    tags,
    prioridad,
    due,
    est,
  }
}

const compareEst = (value: number, filter: EstFilter) => {
  switch (filter.op) {
    case "<":
      return value < filter.value
    case "<=":
      return value <= filter.value
    case ">":
      return value > filter.value
    case ">=":
      return value >= filter.value
    case "=":
    default:
      return value === filter.value
  }
}

export const filterTasks = (tasks: Task[], query: QueryFilters): Task[] => {
  const text = normalize(query.text)
  const textTokens = text ? text.split(/\s+/).filter(Boolean) : []
  const now = new Date()
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + 7)

  return tasks.filter((task) => {
    if (textTokens.length > 0) {
      const haystack = `${task.titulo} ${task.descripcion ?? ""}`.toLowerCase()
      const matches = textTokens.every((token) => haystack.includes(token))
      if (!matches) return false
    }

    if (query.tags.length > 0) {
      const taskTags = task.tags.map(normalize)
      const hasAll = query.tags.every((tag) => taskTags.includes(tag))
      if (!hasAll) return false
    }

    if (query.prioridad && task.prioridad !== query.prioridad) {
      return false
    }

    if (query.due) {
      if (!task.fechaLimite) return false
      const dueDate = new Date(task.fechaLimite)
      if (query.due === "overdue" && dueDate >= now) return false
      if (query.due === "week" && (dueDate < now || dueDate > endOfWeek)) {
        return false
      }
    }

    if (query.est && !compareEst(task.estimacionMin, query.est)) {
      return false
    }

    return true
  })
}
