"use client";
import { Task, Status } from "../types";

type Props = {
  task: Task;
  onMoveTask: (id: string, status: Status) => void;
};

export default function TaskCard({ task, onMoveTask }: Props) {
  const color =
    task.priority === "low"
      ? "green"
      : task.priority === "medium"
      ? "orange"
      : "red";

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 8,
        marginBottom: 8,
        borderRadius: 4,
        backgroundColor: "white",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>{task.title}</h3>
        <span
          style={{
            backgroundColor: color,
            color: "white",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {task.priority}
        </span>
      </div>

      {task.description && <p>{task.description}</p>}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginTop: 4,
        }}
      >
        <span>Tags: {task.tags.join(", ")}</span>
        <span>Est: {task.estimationMin} min</span>
      </div>

      {/* ===== Botones para mover tarea entre columnas ===== */}
      <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
        {task.status !== "todo" && (
          <button
            onClick={() => onMoveTask(task.id, "todo")}
            style={{
              fontSize: 10,
              padding: "2px 4px",
              borderRadius: 4,
              backgroundColor: "#ddd",
            }}
          >
            ← Todo
          </button>
        )}

        {task.status !== "doing" && (
          <button
            onClick={() => onMoveTask(task.id, "doing")}
            style={{
              fontSize: 10,
              padding: "2px 4px",
              borderRadius: 4,
              backgroundColor: "#90cdf4", // azul claro
            }}
          >
            → Doing
          </button>
        )}

        {task.status !== "done" && (
          <button
            onClick={() => onMoveTask(task.id, "done")}
            style={{
              fontSize: 10,
              padding: "2px 4px",
              borderRadius: 4,
              backgroundColor: "#48bb78", // verde
              color: "white",
            }}
          >
            ✓ Done
          </button>
        )}
      </div>
    </div>
  );
}
