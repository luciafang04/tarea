"use client"

import { InfoIcon, SearchIcon } from "lucide-react"

import { parseQuery } from "@/lib/query"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

type SearchAndFilterProps = {
  query: string
  onChange: (value: string) => void
}

export function SearchAndFilter({ query, onChange }: SearchAndFilterProps) {
  const parsed = parseQuery(query)

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border px-3 py-2">
            <SearchIcon className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Buscar por texto o usar operadores: tag:riesgo p:high"
              className="border-none p-0 shadow-none focus-visible:ring-0"
              aria-label="Buscar tareas"
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="ghost" aria-label="Ejemplos de búsqueda">
                  <InfoIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold">Ejemplos rápidos</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>`tag:riesgo p:high`</li>
                  <li>`due:overdue est:&lt;60`</li>
                  <li>`broker reporte`</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Guía de operadores
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Operadores soportados</p>
                <p>`tag:react` busca por tags</p>
                <p>`p:high` prioridad</p>
                <p>`due:overdue` o `due:week`</p>
                <p>`est:&lt;60` o `est:&gt;=120`</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {query && (
          <Button variant="ghost" size="sm" onClick={() => onChange("")}>
            Limpiar
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {parsed.text && (
          <Badge variant="secondary">Texto: {parsed.text}</Badge>
        )}
        {parsed.prioridad && (
          <Badge variant="secondary">Prioridad: {parsed.prioridad}</Badge>
        )}
        {parsed.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            Tag: {tag}
          </Badge>
        ))}
        {parsed.due && (
          <Badge variant="secondary">Due: {parsed.due}</Badge>
        )}
        {parsed.est && (
          <Badge variant="secondary">
            Est: {parsed.est.op}
            {parsed.est.value} min
          </Badge>
        )}
        {!query && (
          <span className="text-xs text-muted-foreground">
            Usa operadores para búsquedas avanzadas y filtros combinados.
          </span>
        )}
      </div>
    </div>
  )
}
