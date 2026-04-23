import React, { useState } from 'react';
import useTaskStore from '../store/taskStore';

const WorkLog = ({ taskId, onClose }) => {
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
      await addWorkLog(taskId, parseFloat(hours), description);
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
    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-inner transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⏱️</span>
        <h4 className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight text-sm">Log Activity</h4>
      </div>
      
      {error && <div className="mb-3 text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Hours Spent *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={hours}
            onChange={e => setHours(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm font-medium"
            placeholder="e.g. 2.5"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Comment</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm font-medium min-h-[60px]"
            placeholder="What were you working on?"
            disabled={loading}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand text-white font-bold py-2 rounded-lg hover:bg-brand-dark transition-all shadow-md shadow-brand/10 disabled:opacity-50 text-[11px] uppercase tracking-wider"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-bold py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700 text-[11px] uppercase tracking-wider"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WorkLog;
