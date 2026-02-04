export type Status = "todo" | "doing" | "done";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  tags: string[];
  estimationMin: number;
  status: Status;
  createdAt: string;
}
