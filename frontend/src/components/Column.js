import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const Column = ({ title, tasks, projectId }) => {
  const { setNodeRef } = useDroppable({ id: title });

  return (
    <div 
      ref={setNodeRef} 
      className="flex-shrink-0 w-80 bg-gray-100/80 dark:bg-slate-900 rounded-xl p-4 flex flex-col max-h-[calc(100vh-200px)] shadow-sm border border-gray-200/50 dark:border-slate-800 transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">
          {title} 
        </h3>
        <span className="bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full border border-gray-200 dark:border-slate-700">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[100px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm">
            No tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
