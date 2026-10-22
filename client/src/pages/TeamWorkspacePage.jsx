import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  Kanban,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Github,
  MessageSquare,
  Users,
  MoreVertical,
  Trash2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import Modal from '../components/Modal.jsx';

export default function TeamWorkspacePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // New task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskStatus, setTaskStatus] = useState('todo');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamRes, taskRes] = await Promise.all([
        apiClient.get(`/teams/${id}`),
        apiClient.get(`/tasks/team/${id}`),
      ]);

      if (teamRes.data?.success) setTeam(teamRes.data.team);
      if (taskRes.data?.success) setTasks(taskRes.data.tasks || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const res = await apiClient.post(`/tasks/team/${id}`, {
        title: taskTitle.trim(),
        description: taskDescription,
        priority: taskPriority,
        assignedTo: taskAssignee || undefined,
        status: taskStatus,
      });

      if (res.data?.success) {
        toast.success('Task created!');
        setTasks(prev => [res.data.task, ...prev]);
        setTaskModalOpen(false);
        setTaskTitle('');
        setTaskDescription('');
      }
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, nextStatus) => {
    try {
      const res = await apiClient.put(`/tasks/${taskId}`, { status: nextStatus });
      if (res.data?.success) {
        setTasks(prev =>
          prev.map(t => (t._id === taskId ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (err) {
      toast.error('Failed to move task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await apiClient.delete(`/tasks/${taskId}`);
      if (res.data?.success) {
        toast.success('Task removed');
        setTasks(prev => prev.filter(t => t._id !== taskId));
      }
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-32 rounded-3xl bg-gray-200 dark:bg-dark-card" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-dark-card" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Team Workspace Unavailable</h2>
        <Link to="/teams" className="text-brand-600 hover:underline mt-2 inline-block">
          Return to Teams Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Workspace Header Bar */}
      <div className="p-6 rounded-3xl glass-card border border-gray-200 dark:border-dark-border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
            <Link to="/teams" className="hover:underline">Teams</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/teams/${team._id}`} className="hover:underline">{team.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-600 dark:text-brand-400 font-bold">Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
            <span>{team.name} Sprint Hub</span>
            <Kanban className="w-6 h-6 text-brand-500" />
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {team.hackathon?.title} • {team.members?.length || 1}/{team.desiredSize} Active Members
          </p>
        </div>

        {/* Shortcuts: Repo, Meeting & Chat */}
        <div className="flex flex-wrap items-center gap-2.5">
          {team.meetingLink && (
            <a
              href={team.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Join Meeting</span>
            </a>
          )}
          {team.repoUrl && (
            <a
              href={team.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:bg-gray-200 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Repository</span>
            </a>
          )}
          <Link
            to="/chat"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-royal transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Team Chat</span>
          </Link>
          <button
            onClick={() => setTaskModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-900 bg-beige-100 hover:bg-beige-200 border border-beige-300 dark:bg-brand-950/70 dark:text-brand-200 dark:border-brand-800/80 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-brand-700 dark:text-brand-300" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board (Section 11) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: To Do */}
        <div className="p-4 rounded-2xl glass-card flex flex-col h-[650px] border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                To Do ({todoTasks.length})
              </h3>
            </div>
            <button
              onClick={() => {
                setTaskStatus('todo');
                setTaskModalOpen(true);
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-dark-surface"
              title="Add task to To Do"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {todoTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onMove={(next) => handleUpdateTaskStatus(task._id, next)}
                onDelete={() => handleDeleteTask(task._id)}
                nextOptions={[{ label: 'Start Progress →', status: 'in_progress' }]}
              />
            ))}
            {todoTasks.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8 italic">
                No pending tasks
              </p>
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="p-4 rounded-2xl glass-card flex flex-col h-[650px] border-t-4 border-t-brand-500">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                In Progress ({inProgressTasks.length})
              </h3>
            </div>
            <button
              onClick={() => {
                setTaskStatus('in_progress');
                setTaskModalOpen(true);
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-dark-surface"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onMove={(next) => handleUpdateTaskStatus(task._id, next)}
                onDelete={() => handleDeleteTask(task._id)}
                nextOptions={[
                  { label: '← Move to To Do', status: 'todo' },
                  { label: 'Mark Complete ✓', status: 'done' },
                ]}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8 italic">
                No tasks currently in progress
              </p>
            )}
          </div>
        </div>

        {/* Column 3: Done */}
        <div className="p-4 rounded-2xl glass-card flex flex-col h-[650px] border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Completed ({doneTasks.length})
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {doneTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onMove={(next) => handleUpdateTaskStatus(task._id, next)}
                onDelete={() => handleDeleteTask(task._id)}
                nextOptions={[{ label: '← Reopen Task', status: 'in_progress' }]}
              />
            ))}
            {doneTasks.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8 italic">
                No completed tasks yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {taskModalOpen && (
        <Modal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          title="Create Kanban Task"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Implement Docker sandbox or Write pitch slides"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Details, technical acceptance criteria, or links..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Assign To
                </label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-xs"
                >
                  <option value="">Unassigned</option>
                  {team.members?.map((m) => (
                    <option key={m.user?._id} value={m.user?._id}>
                      {m.user?.fullName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-glow"
              >
                Create Task
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Kanban Task Card Component
function TaskCard({ task, onMove, onDelete, nextOptions = [] }) {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-gray-400',
    medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    high: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    urgent: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  };

  return (
    <div className="p-3.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              priorityColors[task.priority] || priorityColors.medium
            }`}
          >
            {task.priority}
          </span>
          <button
            onClick={onDelete}
            className="p-1 rounded text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1 leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-[11px]">
        {task.assignedTo ? (
          <div className="flex items-center space-x-1.5">
            <img
              src={task.assignedTo.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
              alt={task.assignedTo.fullName}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="text-gray-600 dark:text-gray-300 text-[10px] truncate max-w-[80px]">
              {task.assignedTo.fullName.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 text-[10px]">Unassigned</span>
        )}

        <div className="flex items-center space-x-1">
          {nextOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => onMove(opt.status)}
              className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
