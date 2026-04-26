import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Reports from '../components/Reports';
import useTaskStore from '../store/taskStore';

vi.mock('../store/taskStore');

describe('Reports', () => {
  const mockReportData = {
    globalTotalHours: 12.5,
    taskReports: [
      { taskId: '1', taskTitle: 'Task 1', status: 'Done', assigneeEmail: 'user@example.com', totalHours: 10 },
      { taskId: '2', taskTitle: 'Task 2', status: 'Todo', assigneeEmail: null, totalHours: 2.5 },
    ]
  };

  beforeEach(() => {
    useTaskStore.mockReturnValue({
      getTimeReport: vi.fn().mockResolvedValue(mockReportData)
    });
  });

  it('renders report title and global total', async () => {
    render(<Reports />);
    expect(await screen.findByText(/Time Tracking Report/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('12.50')).toBeInTheDocument();
    });
  });

  it('renders task rows correctly', async () => {
    render(<Reports />);
    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('shows unassigned when no assignee is present', async () => {
    render(<Reports />);
    await waitFor(() => {
      expect(screen.getByText(/Unassigned/i)).toBeInTheDocument();
    });
  });
});
