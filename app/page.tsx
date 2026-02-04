"use client";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import KanbanColumn from "../components/KanbanColumn";
import { Task, Status } from "../types";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: uuid(),
      title: "Comprar manzanas",
      description: "2kg",
      priority: "high",
      tags: ["fruta"],
      estimationMin: 30,
      createdAt: new Date().toISOString(),
      status: "todo",
    },
    {
      id: uuid(),
      title: "Hacer informe",
      priority: "medium",
      tags: ["trabajo"],
      estimationMin: 60,
      createdAt: new Date().toISOString(),
      status: "doing",
    },
    {
      id: uuid(),
      title: "Enviar emails",
      priority: "low",
      tags: ["trabajo"],
      estimationMin: 20,
      createdAt: new Date().toISOString(),
      status: "done",
    },
  ]);

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  // ✅ PASO 2: mover tareas entre columnas
  const moveTask = (id: string, status: Status) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  };

  return (
    <div style={{ display: "flex", gap: 8, minHeight: "100vh", padding: 16 }}>
      <KanbanColumn
        title="Todo"
        tasks={tasks.filter((t) => t.status === "todo")}
        onAddTask={addTask}
        onMoveTask={moveTask}
      />
      <KanbanColumn
        title="Doing"
        tasks={tasks.filter((t) => t.status === "doing")}
        onAddTask={addTask}
        onMoveTask={moveTask}
      />
      <KanbanColumn
        title="Done"
        tasks={tasks.filter((t) => t.status === "done")}
        onAddTask={addTask}
        onMoveTask={moveTask}
      />
    </div>
  );
}
