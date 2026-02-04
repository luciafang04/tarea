export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  tags: string[];
  estimationMin: number;
  createdAt: string;
  dueDate?: string;
  status: "todo" | "doing" | "done";
};
