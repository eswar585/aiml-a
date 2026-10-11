import React, { useState, useEffect } from 'react';
import { StudyTask } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CheckSquare, Square, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'aiml_hub_study_tasks';

const INITIAL_TASKS: StudyTask[] = [
  { id: '1', title: 'Revise Artificial Intelligence A* heuristic proofs', completed: true, subject_slug: 'ai' },
  { id: '2', title: 'Complete DBMS Lab Exercise: Triggers & PL/SQL', completed: false, subject_slug: 'dbms' },
  { id: '3', title: 'Practice Data Structures AVL tree rotations (LL, RR, LR, RL)', completed: false, subject_slug: 'data-structures' },
  { id: '4', title: 'Review DMS Propositional Logic & Truth Table deductions', completed: false, subject_slug: 'dms' },
];

export const StudyPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('general');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: StudyTask = {
      id: 'task-' + Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
      subject_slug: selectedSubject,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-6 shadow-sm">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Exam Study & Revision Planner
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Personal Checklist
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your semester preparation tasks and unit goals. Saved privately to your browser.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {completedCount} / {tasks.length} Completed
            </div>
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2 mb-6">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add revision task (e.g. 'Solve DMS Unit 2 recurrence equations')..."
          className="flex-1"
        />

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="general">General</option>
          <option value="def">DEF</option>
          <option value="data-structures">Data Structures</option>
          <option value="dms">DMS</option>
          <option value="sfcds">SFCDS</option>
          <option value="dbms">DBMS</option>
          <option value="oops">OOPS</option>
          <option value="ai">AI</option>
        </select>

        <Button type="submit" size="md" leftIcon={<Plus className="w-4 h-4" />}>
          Add
        </Button>
      </form>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-center text-slate-400 py-6">
            No study tasks added yet. Add one above to begin planning!
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                task.completed
                  ? 'border-slate-200/50 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850/60 hover:border-indigo-400 dark:hover:border-indigo-600/50 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  className="shrink-0 text-indigo-600 dark:text-indigo-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                >
                  {task.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <span
                  className={`text-xs sm:text-sm truncate ${
                    task.completed ? 'line-through' : 'font-medium'
                  }`}
                >
                  {task.title}
                </span>
                {task.subject_slug && task.subject_slug !== 'general' && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                    {task.subject_slug}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
