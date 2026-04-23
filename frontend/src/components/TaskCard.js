import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTaskStore from '../store/taskStore';
import WorkLog from './WorkLog';

const TaskCard = ({ task }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showWorkLog, setShowWorkLog] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'logs'
  const users = useTaskStore(state => state.users);
  const assignTask = useTaskStore(state => state.assignTask);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAssign = async e => {
    const newAssigneeId = e.target.value === '' ? null : e.target.value;
    await assignTask(task.id, newAssigneeId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalTimeSpent = task.workLogs?.reduce((sum, log) => sum + log.hours, 0) || 0;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700 hover:border-brand/30 hover:shadow-md transition-all cursor-default group ${isDragging ? 'ring-2 ring-brand shadow-lg' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 leading-snug group-hover:text-brand transition-colors">{task.title}</h4>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {task.dueDate && (
            <span className="inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
              📅 {formatDate(task.dueDate)}
            </span>
          )}
          <span className="inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-600">
            👤 {task.createdByEmail?.split('@')[0]}
          </span>
          {totalTimeSpent > 0 && (
            <span className="inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
              ⏱️ {totalTimeSpent}h
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Assignee</label>
        <select 
          value={task.assigneeId || ''} 
          onChange={handleAssign} 
          className="w-full text-xs bg-gray-50 dark:bg-slate-900 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded p-1.5 focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all"
        >
          <option value="">Unassigned</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.email}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mt-4">
        <button 
          onClick={() => setShowDetails(!showDetails)} 
          className="flex-1 text-[11px] font-bold py-2 rounded border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
        <button 
          onClick={() => setShowWorkLog(!showWorkLog)} 
          className="flex-1 text-[11px] font-bold py-2 rounded bg-brand text-white hover:bg-brand-dark transition-colors shadow-sm shadow-brand/20"
        >
          {showWorkLog ? 'Cancel' : 'Log Time'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-slate-700 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description</label>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-slate-900 p-2 rounded italic">
              {task.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex border-b border-gray-100 dark:border-slate-700">
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-4 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'history' ? 'border-b-2 border-brand text-brand' : 'text-gray-400'}`}
            >
              History
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`pb-2 px-4 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'logs' ? 'border-b-2 border-brand text-brand' : 'text-gray-400'}`}
            >
              Work Logs ({task.workLogs?.length || 0})
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {activeTab === 'history' ? (
              <>
                {task.history && task.history.length > 0 ? (
                  task.history.map(h => (
                    <div key={h.id} className="text-[10px] bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded p-2 shadow-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-brand">{h.changedByEmail?.split('@')[0]}</span>
                        <span className="text-gray-400">{formatDateTime(h.changedAt)}</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Reassigned to <span className="font-semibold text-gray-700 dark:text-gray-300">{h.newAssigneeEmail?.split('@')[0]}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 italic py-2">No assignment history.</p>
                )}
              </>
            ) : (
              <>
                {task.workLogs && task.workLogs.length > 0 ? (
                  task.workLogs.map(log => (
                    <div key={log.id} className="text-[10px] bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded p-2 shadow-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{log.userEmail?.split('@')[0]}</span>
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">{log.hours}h</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-gray-600 dark:text-gray-400 italic">"{log.description || 'No comment'}"</p>
                        <span className="text-[9px] text-gray-400">{formatDateTime(log.loggedAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 italic py-2">No work logged yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showWorkLog && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <WorkLog taskId={task.id} onClose={() => setShowWorkLog(false)} />
        </div>
      )}
    </div>
  );
};

export default TaskCard;
