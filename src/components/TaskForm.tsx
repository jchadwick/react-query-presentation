import { useState } from 'react';
import { Button, Group, Select, TextInput, Textarea, Collapse, Paper } from '@mantine/core';
import { Task, TaskPriority } from '../types/types';

interface TaskFormProps {
  projectId: string;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  show: boolean;
}

function TaskForm({ projectId, onCreateTask, onCancel, show }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTask({
      projectId,
      title,
      description,
      priority,
      status: 'pending',
    });
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <Collapse in={show}>
      <Paper withBorder p="md" mb="lg">
        <form onSubmit={handleSubmit}>
          <Group grow>
            <TextInput
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Select
              value={priority}
              onChange={(value) => setPriority(value as TaskPriority)}
              data={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
              ]}
              required
            />
          </Group>
          <Textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={2}
            mt="sm"
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </Group>
        </form>
      </Paper>
    </Collapse>
  );
}

export default TaskForm; 