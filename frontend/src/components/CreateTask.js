import React, { useState } from 'react';
import useTaskStore from '../store/taskStore';

const CreateTask = ({ projectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [type, setType] = useState(0); // 0 = Task
  const [parentTaskId, setParentTaskId] = useState('');

  const { createTask, users, tasks } = useTaskStore();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createTask({
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assigneeId: assigneeId || null,
        projectId: projectId,
        type: parseInt(type),
        parentTaskId: parentTaskId || null
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssigneeId('');
      setType(0);
      setParentTaskId('');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-brand text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-dark hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center gap-2"
      >
        <span className="text-xl">+</span> Create New Task
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 max-w-2xl w-full transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">New Task Request</h3>
        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
          ✕
        </button>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Task Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium"
            placeholder="What needs to be done?"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Detail / Context</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 min-h-[100px] font-medium"
            placeholder="Add some details about this task..."
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Issue Type</label>
            <select
              value={type}
              onChange={e => {
                const newType = parseInt(e.target.value);
                setType(newType);
                if (newType !== 3) setParentTaskId('');
              }}
              className="w-full bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all font-medium"
              disabled={loading}
            >
              <option value="0">Task</option>
              <option value="1">Story</option>
              <option value="2">Bug</option>
              <option value="3">Subtask</option>
            </select>
          </div>
          
          {type == 3 && (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Parent Task</label>
              <select
                required={type == 3}
                value={parentTaskId}
                onChange={e => setParentTaskId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all font-medium"
                disabled={loading}
              >
                <option value="">Select Parent...</option>
                {tasks.filter(t => t.type !== 3).map(task => (
                  <option key={task.id} value={task.id}>[{task.typeName}] {task.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Target Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all font-medium"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Initial Assignee</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all font-medium"
              disabled={loading}
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand text-white font-bold py-3 rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            disabled={loading}
            className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
