import React, { useState } from 'react';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import { format } from 'date-fns';

const TaskDetailsModal = ({ task, onClose }) => {
  const { addWorkLog, addComment, users, assignTask, updateTask } = useTaskStore();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('comments');
  const [commentContent, setCommentContent] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline edit state
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [editedDueDate, setEditedDueDate] = useState(
    task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  );
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment(task.id, commentContent);
      setCommentContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddWorkLog = async (e) => {
    e.preventDefault();
    if (!workHours || !workDescription.trim()) return;
    setIsSubmitting(true);
    try {
      await addWorkLog(task.id, parseFloat(workHours), workDescription);
      setWorkHours('');
      setWorkDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDescription = async () => {
    if (editedDescription === task.description) {
      setEditingDescription(false);
      return;
    }
    setIsSavingEdit(true);
    try {
      await updateTask(task.id, {
        title: task.title,
        description: editedDescription,
        dueDate: task.dueDate || null,
        status: task.status,
        order: task.order,
      });
      setEditingDescription(false);
    } catch (err) {
      console.error('Failed to save description:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSaveDueDate = async () => {
    setIsSavingEdit(true);
    try {
      const newDueDate = editedDueDate ? new Date(editedDueDate).toISOString() : null;
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        dueDate: newDueDate,
        status: task.status,
        order: task.order,
      });
      setEditingDueDate(false);
    } catch (err) {
      console.error('Failed to save due date:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getUserInitials = (email) => {
    if (!email) return '?';
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const totalTime = task.workLogs?.reduce((sum, log) => sum + log.hours, 0) || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                ${task.status === 'Done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                  task.status === 'Blocked' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand'}`}>
                {task.status}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-xs text-mono">{task.id.substring(0, 8)}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            
            {/* Description — Inline Editable */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</h3>
                {!editingDescription && (
                  <button
                    onClick={() => { setEditedDescription(task.description || ''); setEditingDescription(true); }}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand hover:text-brand/80 uppercase tracking-wider transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>
              {editingDescription ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    autoFocus
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-brand/40 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:border-brand focus:ring-0 transition-all resize-none"
                    placeholder="Add a description..."
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingDescription(false)}
                      className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDescription}
                      disabled={isSavingEdit}
                      className="px-4 py-2 bg-brand text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-brand/20 disabled:opacity-50 transition-all"
                    >
                      {isSavingEdit ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => { setEditedDescription(task.description || ''); setEditingDescription(true); }}
                  className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[80px] leading-relaxed cursor-pointer hover:border-brand/30 hover:bg-brand/5 dark:hover:bg-brand/5 transition-all group"
                >
                  {task.description || <span className="italic text-slate-400 group-hover:text-slate-500">Click to add description...</span>}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 mb-6">
              {['comments', 'worklogs', 'history'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold capitalize transition-all relative ${
                    activeTab === tab 
                      ? 'text-brand' 
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                  }`}
                >
                  {tab === 'worklogs' ? `Work Logs (${task.workLogs?.length || 0})` : 
                   tab === 'comments' ? `Comments (${task.comments?.length || 0})` : 
                   'History'}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-full"></div>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="pb-8">
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  {/* Comment Form */}
                  <form onSubmit={handleAddComment} className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-brand/20">
                      {getUserInitials(currentUser?.email)}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:border-brand focus:ring-0 transition-all resize-none min-h-[100px]"
                      />
                      <div className="flex justify-end">
                        <button 
                          disabled={isSubmitting || !commentContent.trim()}
                          className="bg-brand text-white px-6 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-brand/20 disabled:opacity-50 transition-all disabled:pointer-events-none"
                        >
                          {isSubmitting ? 'Posting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {task.comments?.map(comment => (
                      <div key={comment.id} className="flex gap-4 group">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-sm">
                          {getUserInitials(comment.userEmail)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{comment.userEmail}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">{format(new Date(comment.createdAt), 'MMM d, HH:mm')}</span>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-2xl rounded-tl-none border border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-800">
                             {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!task.comments?.length && (
                      <div className="text-center py-10">
                        <div className="inline-flex p-4 rounded-full bg-slate-50 dark:bg-slate-800/50 mb-3 text-slate-300">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-400">No comments yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'worklogs' && (
                <div className="space-y-6">
                  {/* Work Log Form */}
                  <form onSubmit={handleAddWorkLog} className="bg-brand/5 dark:bg-brand/10 p-6 rounded-3xl border border-brand/10">
                    <h4 className="text-sm font-bold text-brand uppercase tracking-wider mb-4">Log New Activity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Hours</label>
                        <input
                          type="number"
                          step="0.1"
                          value={workHours}
                          onChange={(e) => setWorkHours(e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand focus:ring-0 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">What did you do?</label>
                        <input
                          type="text"
                          value={workDescription}
                          onChange={(e) => setWorkDescription(e.target.value)}
                          placeholder="Deep work session..."
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand focus:ring-0 transition-all"
                        />
                      </div>
                      <button 
                        disabled={isSubmitting || !workHours || !workDescription.trim()}
                        className="bg-brand text-white h-[46px] rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-brand/20 disabled:opacity-50 transition-all disabled:pointer-events-none"
                      >
                        Log Time
                      </button>
                    </div>
                  </form>

                  {/* Work Logs List */}
                  <div className="space-y-2">
                     {task.workLogs?.map(log => (
                       <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-brand/20 transition-all">
                          <div className="flex items-center gap-3">
                             <div className="text-brand font-bold bg-brand/10 px-3 py-1 rounded-lg text-sm">{log.hours}h</div>
                             <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{log.description}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">Logged by {log.userEmail} on {format(new Date(log.loggedAt), 'MMM d')}</p>
                             </div>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                             {getUserInitials(log.userEmail)}
                          </div>
                       </div>
                     ))}
                     {!task.workLogs?.length && (
                       <div className="text-center py-10 text-slate-400 italic text-sm">No time logged yet.</div>
                     )}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  {task.history?.map((h, i) => (
                    <div key={h.id} className="relative flex flex-col gap-1">
                      <div className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 
                        ${i === 0 ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-sm text-slate-900 dark:text-white">{h.changedByEmail}</span>
                         <span className="text-slate-400 text-[10px] uppercase font-mono">{format(new Date(h.changedAt), 'MMM d, HH:mm')}</span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                         <span>Changed assignee from</span>
                         <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-bold">{h.oldAssigneeEmail || 'Unassigned'}</code>
                         <span>to</span>
                         <code className="bg-brand/10 text-brand px-1.5 py-0.5 rounded text-[11px] font-bold">{h.newAssigneeEmail || 'Unassigned'}</code>
                      </div>
                    </div>
                  ))}
                  <div className="relative flex flex-col gap-1">
                    <div className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700"></div>
                     <div className="flex items-center gap-2">
                         <span className="font-bold text-sm text-slate-900 dark:text-white uppercase">System</span>
                         <span className="text-slate-400 text-[10px] uppercase font-mono">{format(new Date(task.createdAt), 'MMM d, HH:mm')}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Task created by <span className="font-medium text-slate-900 dark:text-white">{task.createdByEmail}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[280px] border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-col gap-8 overflow-y-auto">
            
            {/* Stats Summary */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
               <div className="flex flex-col items-center text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Time Logged</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{totalTime}h</div>
                  
                  {/* Due Date — Inline Editable */}
                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 w-full text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</div>
                      {!editingDueDate && (
                        <button
                          onClick={() => setEditingDueDate(true)}
                          className="text-[9px] font-bold text-brand hover:text-brand/80 uppercase tracking-wider transition-colors"
                        >
                          {task.dueDate ? 'Edit' : 'Set'}
                        </button>
                      )}
                    </div>
                    {editingDueDate ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="date"
                          autoFocus
                          value={editedDueDate}
                          onChange={(e) => setEditedDueDate(e.target.value)}
                          className="w-full text-xs bg-white dark:bg-slate-900 border-2 border-brand/40 rounded-lg px-2 py-1.5 text-slate-900 dark:text-slate-100 focus:border-brand focus:ring-0 transition-all"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingDueDate(false)}
                            className="flex-1 text-[10px] py-1 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveDueDate}
                            disabled={isSavingEdit}
                            className="flex-1 text-[10px] py-1 bg-brand text-white font-bold rounded-lg disabled:opacity-50 transition-all"
                          >
                            {isSavingEdit ? '...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setEditingDueDate(true)}
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-brand transition-colors"
                      >
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : (
                          <span className="italic text-slate-400 font-normal">Not set — click to add</span>
                        )}
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* People */}
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Assignee</h4>
                <select 
                  value={task.assigneeId || ''} 
                  onChange={(e) => assignTask(task.id, e.target.value || null)}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:border-brand focus:ring-0 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Created By</h4>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500">
                    {getUserInitials(task.createdByEmail)}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{task.createdByEmail}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                 <button 
                  onClick={() => { if(window.confirm('Delete this task?')) useTaskStore.getState().deleteTask(task.id); onClose(); }}
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                   Delete Task
                 </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
