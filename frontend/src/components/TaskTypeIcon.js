import React from 'react';

const TaskTypeIcon = ({ type, showLabel = false }) => {
  const types = {
    0: { label: 'Task', icon: '✅', color: 'bg-blue-500', textColor: 'text-blue-500' },
    1: { label: 'Story', icon: '📗', color: 'bg-green-500', textColor: 'text-green-500' },
    2: { label: 'Bug', icon: '🐞', color: 'bg-red-500', textColor: 'text-red-500' },
    3: { label: 'Subtask', icon: '📄', color: 'bg-orange-400', textColor: 'text-orange-400' }
  };

  const config = types[type] || types[0];

  return (
    <div className="flex items-center gap-1.5">
      <span title={config.label} className="text-xs">
        {config.icon}
      </span>
      {showLabel && (
        <span className={`text-[10px] font-black uppercase tracking-widest ${config.textColor}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

export default TaskTypeIcon;
