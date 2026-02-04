"use client";
import { Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = { task: Task };

export default function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #ccc",
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: "white",
    cursor: "grab",
  };

  const color =
    task.priority === "low"
      ? "green"
      : task.priority === "medium"
      ? "orange"
      : "red";

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span>Tags: {task.tags.join(", ")}</span>
        <span>Est: {task.estimationMin} min</span>
      </div>
    </div>
  );
}
