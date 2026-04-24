import React, { useState } from 'react';
import useTaskStore from '../store/taskStore';

const WorkLog = ({ task, projectId, onClose }) => {
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { addWorkLog } = useTaskStore();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!hours || parseFloat(hours) <= 0) {
      setError('Required: Enter a positive number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addWorkLog(task.id, parseFloat(hours), description, projectId);
      setHours('');
      setDescription('');
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to log time');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Work Log Entry Form */}
      <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-inner">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">⏱️</span>
          <h4 className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight text-xs">Log New Activity</h4>
        </div>
        
        {error && <div className="mb-3 text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">{error}</div>}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Hours</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={hours}
              onChange={e => setHours(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm font-medium"
              placeholder="0.00"
              disabled={loading}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Comment</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm font-medium"
              placeholder="What did you do?"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand text-white font-black py-2.5 rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 disabled:opacity-50 text-[10px] uppercase tracking-widest h-[42px]"
          >
            {loading ? '...' : 'Log Time'}
          </button>
        </form>
      </div>

      {/* Work Log History List */}
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Activity History</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {task.workLogs?.map(log => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800/50 hover:border-gray-200 transition-all group">
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:text-brand transition-colors">
                  {log.userEmail.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{log.description || <span className="italic opacity-50">Log entry</span>}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">By {log.userEmail} — {new Date(log.loggedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-brand bg-brand/5 px-2.5 py-1 rounded-full border border-brand/10">
                  {log.hours}h
                </div>
              </div>
            </div>
          ))}
          {(!task.workLogs || task.workLogs.length === 0) && (
            <div className="text-center py-12 bg-gray-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              <span className="text-2xl mb-2 block">📭</span>
              <p className="text-xs text-gray-400 italic">No work logged yet for this task.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkLog;
