import React, { useState, useEffect, useMemo } from 'react';
import useTaskStore from '../store/taskStore';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  const { getTimeReport } = useTaskStore();

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTimeReport();
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const filteredTaskReports = useMemo(() => {
    if (!report) return [];
    return report.taskReports.filter(tr => {
      const matchName = tr.taskTitle.toLowerCase().includes(filterName.toLowerCase());
      const matchStatus = !filterStatus || tr.status === filterStatus;
      const matchAssignee = !filterAssignee || (tr.assigneeEmail && tr.assigneeEmail.toLowerCase().includes(filterAssignee.toLowerCase()));
      return matchName && matchStatus && matchAssignee;
    });
  }, [report, filterName, filterStatus, filterAssignee]);

  const exportToExcel = () => {
    if (!filteredTaskReports.length) return;

    // CSV header
    const headers = ['Task ID', 'Task Title', 'Status', 'Assignee', 'Total Hours'];
    const rows = filteredTaskReports.map(tr => [
      tr.taskId,
      `"${tr.taskTitle.replace(/"/g, '""')}"`,
      tr.status,
      tr.assigneeEmail || 'Unassigned',
      tr.totalHours.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `VibeFlow_TimeReport_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    'Backlog', 'Todo', 'In Progress', 'In Review', 'QA', 'Blocked', 'Ready For Release', 'Done'
  ];

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <p className="text-red-700 dark:text-red-300">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Time Tracking Report</h1>
            <p className="text-gray-500 dark:text-gray-400">Summary of logged work across filtered project tasks.</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-4 rounded-xl shadow-lg shadow-emerald-900/10 transition-all flex items-center gap-2"
            >
              📊 Export to Excel
            </button>
            
            <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-xl shadow-sm border border-brand/10 dark:border-brand/30 flex flex-col items-center md:items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Global Project Total</span>
              <span className="text-4xl font-black text-brand">
                {report?.globalTotalHours.toFixed(2)} <span className="text-sm font-bold text-gray-400 uppercase">hrs</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm mb-6 flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Task Name</label>
            <input 
              type="text"
              placeholder="Search task..."
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              className="w-full text-xs bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
            />
          </div>

          <div className="w-48">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Status</label>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
            >
              <option value="">All Statuses</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="w-48">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Assignee</label>
            <input 
              type="text"
              placeholder="User email..."
              value={filterAssignee}
              onChange={e => setFilterAssignee(e.target.value)}
              className="w-full text-xs bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
            />
          </div>

          {(filterName || filterStatus || filterAssignee) && (
            <button 
              onClick={() => { setFilterName(''); setFilterStatus(''); setFilterAssignee(''); }}
              className="text-xs font-bold text-brand hover:text-brand-dark uppercase tracking-widest pb-3 px-2"
            >
              Clear
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50">
                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Task Details ({filteredTaskReports.length})</th>
                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assignee</th>
                <th scope="col" className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredTaskReports.map(taskReport => (
                <tr key={taskReport.taskId} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{taskReport.taskTitle}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{taskReport.taskId.substring(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700">
                      {taskReport.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {taskReport.assigneeEmail || <span className="text-gray-400 dark:text-gray-500 italic">Unassigned</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-base font-bold text-gray-900 dark:text-gray-100">{taskReport.totalHours.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">hours</div>
                  </td>
                </tr>
              ))}
              
              {filteredTaskReports.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 italic">
                    No records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchReport}
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-slate-700 shadow-sm text-sm font-bold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all"
          >
            <span className="mr-2">🔄</span> Refresh Report Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
