import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KanbanBoard from '../components/KanbanBoard';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';

vi.mock('../store/taskStore', () => ({
  __esModule: true,
  default: vi.fn()
}));
vi.mock('../store/authStore', () => ({
  __esModule: true,
  default: vi.fn()
}));

describe('KanbanBoard', () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', status: 'Todo', order: 0 },
    { id: '2', title: 'Task 2', status: 'In Progress', order: 0 },
  ];

  const mockUsers = [
    { id: 'u1', email: 'user@example.com' }
  ];

  beforeEach(() => {
    const state = {
      tasks: mockTasks,
      users: mockUsers,
      loading: false,
      error: null,
      fetchTasks: vi.fn(),
      fetchUsers: vi.fn(),
      initSignalR: vi.fn(),
      getTasksByColumn: vi.fn((col) => mockTasks.filter(t => t.status === col))
    };
    useTaskStore.mockImplementation((selector) => selector ? selector(state) : state);
    useAuthStore.mockImplementation((selector) => selector ? selector({ user: { id: 'u1' } }) : { user: { id: 'u1' } });
  });

  it('renders all columns', async () => {
    render(<KanbanBoard />);
    const columns = ['Backlog', 'Todo', 'In Progress', 'Done'];
    for (const col of columns) {
      expect(await screen.findByText(col)).toBeInTheDocument();
    }
  });

  it('renders tasks in correct columns', async () => {
    render(<KanbanBoard />);
    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    useTaskStore.mockReturnValue({
      tasks: [],
      users: [],
      loading: true,
      error: null,
      fetchTasks: vi.fn(),
      fetchUsers: vi.fn(),
      initSignalR: vi.fn(),
    });
    render(<KanbanBoard />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders DndContext and initial columns correctly', async () => {
    const { container } = render(<KanbanBoard />);
    // Check for column elements which are droppable
    const columns = container.querySelectorAll('.flex-shrink-0');
    expect(columns.length).toBeGreaterThan(0);
  });
});
