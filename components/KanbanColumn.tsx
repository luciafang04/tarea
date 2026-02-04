"use client";
import { useState } from "react";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import { Task, Status } from "../types";

type Props = {
  status: Status;
  title: string;
  tasks: Task[];
  onAddTask: (task: Task) => void;
};

export default function KanbanColumn({ status, title, tasks, onAddTask }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div
      data-status={status} // <--- muy importante para drag&drop
      style={{
        width: "33%",
        padding: 8,
        backgroundColor: "#eee",
        borderRadius: 4,
        minHeight: "80vh",
      }}
    >
      <h2>{title}</h2>
      <button onClick={() => setModalOpen(true)}>+ Nueva Tarea</button>
      {modalOpen && <TaskModal onSubmit={onAddTask} onClose={() => setModalOpen(false)} />}
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
