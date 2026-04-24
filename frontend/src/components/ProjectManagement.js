import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';

const ProjectManagement = () => {
  const { projects, fetchProjects, createProject, loading, error } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject(name, key, description);
      setShowCreateModal(false);
      setName('');
      setKey('');
      setDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.id}/board`);
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Projects</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team's workspace and boards</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-dark hover:-translate-y-0.5 transition-all"
          >
            Create Project
          </button>
        </div>

        {loading && projects.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div 
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 bg-brand/10 text-brand rounded-lg flex items-center justify-center text-xl font-black">
                    {project.key.substring(0, 2)}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">
                    {project.key}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand transition-colors">
                  {project.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                  {project.description || 'No description provided.'}
                </p>
                <div className="pt-4 border-t border-gray-50 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    {project.taskCount} tasks
                  </span>
                  <span className="text-brand font-bold text-xs flex items-center">
                    View Board <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {projects.length === 0 && !loading && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
            <div className="text-4xl mb-4">📂</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">No projects yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Get started by creating your first project workspace.</p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-slate-800">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">New Project</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Project Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => {
                        setName(e.target.value);
                        if (!key && e.target.value.length >= 3) {
                            setKey(e.target.value.substring(0, 3).toUpperCase());
                        }
                    }}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all dark:text-white"
                    placeholder="E.g. Marketing Dashboard"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Key</label>
                  <input
                    required
                    maxLength={10}
                    type="text"
                    value={key}
                    onChange={e => setKey(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all dark:text-white"
                    placeholder="E.g. MD"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all dark:text-white"
                    placeholder="What is this project about?"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;
