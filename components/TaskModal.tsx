"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Task, Priority } from "../types";
import { v4 as uuid } from "uuid";

type Props = { onSubmit: (task: Task) => void; onClose: () => void };

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  priority: z.enum(["low","medium","high"]),
  tags: z.string().optional(),
  estimationMin: z.number().min(1),
});

export default function TaskModal({ onSubmit, onClose }: Props) {
  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) });

  const submit = (data: any) => {
    const task: Task = {
      id: uuid(),
      title: data.title,
      description: data.description,
      priority: data.priority as Priority,
      tags: data.tags ? data.tags.split(",").map((t:string)=>t.trim()) : [],
      estimationMin: Number(data.estimationMin),
      createdAt: new Date().toISOString(),
      status: "todo",
    };
    onSubmit(task);
    reset();
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)" }}>
      <div style={{ backgroundColor:"white", maxWidth:400, margin:"100px auto", padding:16, borderRadius:8 }}>
        <h2>Nueva Tarea</h2>
        <form onSubmit={handleSubmit(submit)} style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <input placeholder="Título" {...register("title")}/>
          <input placeholder="Descripción" {...register("description")}/>
          <select {...register("priority")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input placeholder="Tags (separadas por ,)" {...register("tags")}/>
          <input type="number" placeholder="Estimación (min)" {...register("estimationMin",{valueAsNumber:true})}/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}
