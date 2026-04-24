import React, { useState } from 'react';
import useTaskStore from '../store/taskStore';
import TaskTypeIcon from './TaskTypeIcon';
import WorkLog from './WorkLog';

const TaskDetailModal = ({ task, onClose, projectId }) => {
  const { addComment, users, assignTask } = useTaskStore();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment(task.id, newComment, projectId);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async (e) => {
    const userId = e.target.value;
    await assignTask(task.id, userId || null, projectId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <TaskTypeIcon type={task.type} showLabel={false} />
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {task.typeName} — {task.id.slice(0, 8)}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex">
          {/* Main Content */}
          <div className="flex-[2] p-8 border-r border-gray-100 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
              {task.title}
            </h2>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-100 dark:border-slate-800 mb-6">
              {['details', 'history', 'worklogs'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
                    activeTab === tab 
                      ? 'text-brand' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'details' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Description</h3>
                  <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-slate-950/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800/50">
                    {task.description || <span className="italic opacity-50">No description provided.</span>}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="pt-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Comments ({task.comments?.length || 0})</h3>
                  <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {task.comments?.map(comment => (
                      <div key={comment.id} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                        <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-[10px] font-black text-brand shrink-0">
                          {comment.userEmail.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{comment.userEmail}</span>
                            <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/40 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-800/50">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!task.comments || task.comments.length === 0) && (
                      <p className="text-xs text-gray-400 italic py-4 text-center">No comments yet. Start the conversation!</p>
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:translate-y-[-1px] active:translate-y-0 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:translate-y-0"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Assignment Activity</h3>
                <div className="space-y-3">
                  {task.history?.map(log => (
                    <div key={log.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-950/50 rounded-xl border border-gray-100 dark:border-slate-800/50">
                      <div className="w-2 h-2 rounded-full bg-brand mt-1.5 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-bold">{log.changedByEmail}</span> assigned this task to{' '}
                          <span className="font-bold text-brand">{log.newAssigneeEmail || 'Unassigned'}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-medium">
                          {new Date(log.changedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!task.history || task.history.length === 0) && (
                    <p className="text-xs text-gray-400 italic text-center py-8">No assignment history yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'worklogs' && (
              <div className="animate-in slide-in-from-bottom-2 duration-300">
                 <WorkLog task={task} projectId={projectId} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex-1 bg-gray-50/50 dark:bg-slate-950/20 p-8 space-y-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Status</h3>
              <div className={`
                inline-flex items-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border
                ${task.status === 'Done' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-brand/10 text-brand border-brand/20'}
              `}>
                {task.status}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Assignee</h3>
              <select 
                value={task.assigneeId || ''} 
                onChange={handleAssign}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand/20 outline-none transition-all dark:text-white"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.email}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Created By</h3>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black">
                  {task.createdByEmail.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{task.createdByEmail}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {task.subtasks?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Subtasks ({task.subtasks.length})</h3>
                <div className="space-y-2">
                  {task.subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                      <TaskTypeIcon type={sub.type} />
                      <span className="truncate">{sub.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
