import { useState, useEffect } from "react";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("devfocus_tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [taskInput, setTaskInput] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    localStorage.setItem("devfocus_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskInput.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setTaskInput("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === "active") return !t.completed;
    if (taskFilter === "completed") return t.completed;
    return true;
  });

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const efficiency = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return {
    tasks,
    taskInput,
    setTaskInput,
    taskFilter,
    setTaskFilter,
    addTask,
    toggleTask,
    deleteTask,
    filteredTasks,
    completedTasksCount,
    totalTasksCount,
    efficiency,
  };
}
