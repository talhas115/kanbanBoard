import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTaskStore from '../store/taskStore';
import TaskTypeIcon from './TaskTypeIcon';
import TaskDetailModal from './TaskDetailModal';

const TaskCard = ({ task, projectId, isOverlay }) => {
  const [showModal, setShowModal] = useState(false);
  const { deleteTask } = useTaskStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    disabled: isOverlay,
    data: {
      type: 'Task',
      task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isOverlay ? 'grabbing' : 'pointer'
  };

  const content = (
    <div
      ref={isOverlay ? null : setNodeRef}
      style={isOverlay ? {} : style}
      onClick={() => !isOverlay && setShowModal(true)}
      className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700 hover:border-brand/30 hover:shadow-md transition-all group ${isDragging && !isOverlay ? 'opacity-30' : ''} ${isOverlay ? 'shadow-2xl ring-2 ring-brand/50 scale-105 rotate-2' : ''}`}
    >
      <div {...(!isOverlay ? attributes : {})} {...(!isOverlay ? listeners : {})} className={isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}>
        <div className="flex justify-between items-start mb-1.5">
          <TaskTypeIcon type={task.type} showLabel={true} />
          {task.parentTaskId && (
            <span className="text-[9px] font-bold text-gray-400 bg-gray-50 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-700 max-w-[100px] truncate">
              {task.parentTaskTitle}
            </span>
          )}
        </div>
        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 leading-snug group-hover:text-brand transition-colors">{task.title}</h4>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-gray-500">
            {task.assigneeEmail ? task.assigneeEmail.slice(0, 2).toUpperCase() : '?'}
          </div>
          <span className="text-[10px] font-medium text-gray-500 truncate max-w-[100px]">
            {task.assigneeEmail || 'Unassigned'}
          </span>
        </div>
        
        {!isOverlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete this task?')) deleteTask(task.id);
            }}
            className="text-gray-300 hover:text-red-500 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {content}
      {showModal && !isOverlay && (
        <TaskDetailModal 
          task={task} 
          projectId={projectId} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
};

export default TaskCard;
