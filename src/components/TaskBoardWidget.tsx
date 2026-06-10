import { Plus, Check, Trash2, Terminal, ListTodo } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Task } from "@/hooks/useTasks";

interface TaskBoardWidgetProps {
  tasks: Task[];
  taskInput: string;
  setTaskInput: (val: string) => void;
  taskFilter: "all" | "active" | "completed";
  setTaskFilter: (val: "all" | "active" | "completed") => void;
  addTask: (e: React.FormEvent) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  filteredTasks: Task[];
  completedTasksCount: number;
  totalTasksCount: number;
}

export function TaskBoardWidget({
  taskInput,
  setTaskInput,
  addTask,
  taskFilter,
  setTaskFilter,
  filteredTasks,
  toggleTask,
  deleteTask,
  totalTasksCount,
  completedTasksCount,
}: TaskBoardWidgetProps) {
  return (
    <Card className="bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-2xl shadow-xl flex flex-col h-full justify-between">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-white flex items-center gap-2">
          <ListTodo className="size-4 text-primary" /> Task Board
        </CardTitle>
        <CardDescription>Plan and check off your workflow</CardDescription>
      </CardHeader>
      
      <CardContent className="py-4 flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Add Task input form */}
        <form onSubmit={addTask} className="flex gap-2">
          <Input
            type="text"
            placeholder="New feature to code..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            className="flex-1 bg-slate-950/40 border-white/8 text-white placeholder:text-slate-500 focus-visible:ring-primary/40 focus-visible:border-primary/50 text-xs"
          />
          <Button type="submit" size="icon" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Plus className="size-4" />
          </Button>
        </form>

        {/* Task Filter */}
        <div className="flex bg-slate-950/45 p-0.5 rounded-lg border border-white/5 justify-between">
          {(["all", "active", "completed"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTaskFilter(filter)}
              className={`cursor-pointer flex-1 py-1 rounded-md text-[10px] font-mono capitalize transition-all ${
                taskFilter === filter 
                  ? "bg-slate-800 text-white font-bold" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Task list container */}
        <div className="flex-1 overflow-y-auto max-h-60 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {filteredTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6">
              <Terminal className="size-8 opacity-20 mb-2" />
              <p className="text-xs">No tasks found</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredTasks.map((task) => (
                <li 
                  key={task.id} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    task.completed 
                      ? "bg-slate-950/20 border-white/5 opacity-55" 
                      : "bg-slate-950/40 border-white/8 hover:border-white/12"
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`cursor-pointer size-4.5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        task.completed 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "border-slate-500 hover:border-primary"
                      }`}
                    >
                      {task.completed && <Check className="size-3 stroke-[3]" />}
                    </button>
                    <span className={`text-xs text-slate-100 truncate ${task.completed ? "line-through text-slate-500" : ""}`}>
                      {task.title}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="cursor-pointer text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </CardContent>
      
      {/* Card footer summary */}
      <div className="p-3 bg-slate-950/40 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span>Total Tasks: {totalTasksCount}</span>
        <span>Completed: {completedTasksCount}</span>
      </div>
    </Card>
  );
}
