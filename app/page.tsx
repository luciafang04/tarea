"use client";
import { useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanColumn from "../components/KanbanColumn";
import { Task, Status } from "../types";

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Comprar manzanas",
    description: "2kg",
    priority: "high",
    tags: ["fruta"],
    estimationMin: 30,
    createdAt: new Date().toISOString(),
    status: "todo",
  },
  {
    id: "2",
    title: "Hacer informe",
    priority: "medium",
    tags: ["trabajo"],
    estimationMin: 60,
    createdAt: new Date().toISOString(),
    status: "doing",
  },
  {
    id: "3",
    title: "Enviar emails",
    priority: "low",
    tags: ["trabajo"],
    estimationMin: 20,
    createdAt: new Date().toISOString(),
    status: "done",
  },
];

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (task: Task) => setTasks((prev) => [...prev, task]);

  const moveTask = (id: string, newStatus: Status) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // ✅ Usamos over.id para identificar la tarjeta sobre la que soltamos
    const targetTask = tasks.find((t) => t.id === over.id);
    if (!targetTask) return;

    moveTask(active.id as string, targetTask.status);
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: 8, minHeight: "100vh", padding: 16 }}>
        <SortableContext items={todoTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <KanbanColumn status="todo" title="Todo" tasks={todoTasks} onAddTask={addTask} />
        </SortableContext>

        <SortableContext items={doingTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <KanbanColumn status="doing" title="Doing" tasks={doingTasks} onAddTask={addTask} />
        </SortableContext>

        <SortableContext items={doneTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <KanbanColumn status="done" title="Done" tasks={doneTasks} onAddTask={addTask} />
        </SortableContext>
      </div>
    </DndContext>
  );
}
