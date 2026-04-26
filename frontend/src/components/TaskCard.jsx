import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTaskStore from '../store/taskStore';
import TaskDetailsModal from './TaskDetailsModal';

const TaskCard = ({ task, isOverlay }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const users = useTaskStore(state => state.users);
  const assignTask = useTaskStore(state => state.assignTask);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, disabled: isOverlay || isModalOpen });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    zIndex: isOverlay ? 999 : 'auto',
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
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700 hover:border-brand/30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${isDragging && !isOverlay ? 'opacity-30' : ''} ${isOverlay ? 'ring-2 ring-brand shadow-lg' : ''}`}
    >
      <div>
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

      <div 
        className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700"
        onPointerDown={e => e.stopPropagation()} // Prevent drag when clicking select
      >
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Assignee</label>
        <select 
          value={task.assigneeId || ''} 
          onChange={handleAssign} 
          className="w-full text-xs bg-gray-50 dark:bg-slate-900 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded p-1.5 focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all cursor-default"
        >
          <option value="">Unassigned</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.email}</option>
          ))}
        </select>
      </div>

      {!isOverlay && (
        <div className="flex gap-2 mt-4" onPointerDown={e => e.stopPropagation()}>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 text-[11px] font-bold py-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-default"
          >
             View Details
          </button>
        </div>
      )}

      {isModalOpen && <TaskDetailsModal task={task} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default TaskCard;
