import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from '../components/TaskCard';
import useTaskStore from '../store/taskStore';

vi.mock('../store/taskStore', () => ({
  __esModule: true,
  default: vi.fn()
}));

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'Todo',
    description: 'Test Description',
    assigneeId: null,
    workLogs: [],
    history: []
  };

  const mockUsers = [
    { id: 'u1', email: 'user1@example.com' },
    { id: 'u2', email: 'user2@example.com' }
  ];

  beforeEach(() => {
    const state = {
      users: mockUsers,
      assignTask: vi.fn()
    };
    useTaskStore.mockImplementation((selector) => selector ? selector(state) : state);
  });

  it('toggles details visibility', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.queryByText(/Test Description/)).not.toBeInTheDocument();
    
    // Clicking View Details opens the modal
    const detailsBtn = screen.getByText('View Details');
    fireEvent.click(detailsBtn);
    
    // Now description should be visible (inside modal)
    expect(screen.getByText(/Test Description/)).toBeInTheDocument();
  });

  it('calls assignTask when assignee is changed', () => {
    const assignTaskMock = vi.fn();
    const state = {
      users: mockUsers,
      assignTask: assignTaskMock
    };
    useTaskStore.mockImplementation((selector) => selector ? selector(state) : state);

    render(<TaskCard task={mockTask} />);
    const select = screen.getByRole('combobox');
    
    fireEvent.change(select, { target: { value: 'u1' } });
    
    expect(assignTaskMock).toHaveBeenCalledWith('1', 'u1');
  });

  it('switches between History and Work Logs tabs in modal', () => {
    render(<TaskCard task={mockTask} />);
    fireEvent.click(screen.getByText('View Details'));
    
    const logsTab = screen.getByText(/Work Logs/);
    fireEvent.click(logsTab);
    
    expect(screen.getByText('No time logged yet.')).toBeInTheDocument();
  });
});
