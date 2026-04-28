import React, { useEffect, useState, useMemo } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Column from './Column';
import TaskCard from './TaskCard'; // Added for DragOverlay
import CreateTask from './CreateTask';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';

const KanbanBoard = () => {
  const { fetchTasks, fetchUsers, loading, error, moveTask, tasks, users, initSignalR, isSignalRConnected } = useTaskStore();
  const { user: currentUser } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    initSignalR();
  }, [fetchTasks, fetchUsers, initSignalR]);

  const columns = [
    'Backlog', 'Todo', 'In Progress', 'In Review', 'QA', 'Blocked', 'Ready For Release', 'Done'
  ];

  // Apply filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchUser = !filterUser || task.assigneeId === filterUser;
      const matchDate = !filterDate || (task.dueDate && task.dueDate.split('T')[0] === filterDate);
      const matchMine = !showOnlyMine || task.assigneeId === currentUser?.id;
      
      return matchSearch && matchUser && matchDate && matchMine;
    });
  }, [tasks, searchQuery, filterUser, filterDate, showOnlyMine, currentUser]);

  const getFilteredTasksByColumn = (column) => {
    return filteredTasks
      .filter(task => task.status === column)
      .sort((a, b) => a.order - b.order);
  };

  const getUserInitials = (email) => {
    if (!email) return '?';
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async event => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const taskId = active.id;
    const activeTask = tasks.find(t => t.id === taskId);
    if (!activeTask) return;

    let newStatus = activeTask.status;
    let newOrder = activeTask.order;

    if (over.id !== active.id) {
      if (columns.includes(over.id)) {
        newStatus = over.id;
        const tasksInColumn = getFilteredTasksByColumn(newStatus);
        newOrder = tasksInColumn.length;
      } else {
        const overTask = tasks.find(t => t.id === over.id);
        if (overTask) {
          newStatus = overTask.status;
          const tasksInColumn = getFilteredTasksByColumn(newStatus);
          const overIndex = tasksInColumn.findIndex(t => t.id === over.id);
          if (overIndex >= 0) {
            newOrder = overIndex;
          }
        }
      }
    }

    if (newStatus !== activeTask.status || newOrder !== activeTask.order) {
      await moveTask(taskId, newOrder, newStatus);
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-12 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col mb-8 gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Project Board</h1>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className={`h-2 w-2 rounded-full ${isSignalRConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isSignalRConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
            <CreateTask />
          </div>

          {/* Jira-Style Filter Bar */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search board"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md text-sm outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand dark:text-white transition-all w-64 shadow-sm"
              />
            </div>

            {/* User Avatars Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Filter by Assignee:</span>
              <div className="flex items-center -space-x-2 overflow-hidden px-1">
                {[...users].sort((a,b) => a.email.localeCompare(b.email)).slice(0, 10).map(u => (
                  <button
                    key={u.id}
                    onClick={() => setFilterUser(filterUser === u.id ? '' : u.id)}
                    title={u.email}
                    className={`relative inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 text-[10px] font-bold transition-all hover:scale-110 z-10 ${filterUser === u.id ? 'bg-brand text-white' : 'bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400'}`}
                  >
                    {getUserInitials(u.email)}
                  </button>
                ))}
                {users.length > 10 && (
                   <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-800 text-[10px] font-bold text-gray-500 ring-2 ring-white dark:ring-slate-900">
                     +{users.length - 10}
                   </span>
                )}
              </div>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1"></div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowOnlyMine(!showOnlyMine)}
                className={`px-3 py-1.5 rounded text-sm font-semibold transition-all ${showOnlyMine ? 'bg-brand/10 text-brand ring-1 ring-brand/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
              >
                Only my issues
              </button>
              
              <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                <input 
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-gray-600 dark:text-gray-400 outline-none cursor-pointer"
                />
              </div>

              {(searchQuery || filterUser || filterDate || showOnlyMine) && (
                <button 
                  onClick={() => { setSearchQuery(''); setFilterUser(''); setFilterDate(''); setShowOnlyMine(false); }}
                  className="text-sm text-gray-400 hover:text-brand font-medium ml-2"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar items-start">
            {columns.map(column => (
              <Column 
                key={column} 
                title={column} 
                tasks={getFilteredTasksByColumn(column)}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeId ? (
              <div className="rotate-1 scale-105 shadow-2xl opacity-90 transition-transform duration-200">
                <TaskCard task={tasks.find(t => t.id === activeId)} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
