import { useState, useEffect } from 'preact/hooks';
import { Card } from '../components/ui/Card';
import { Columns, Column } from '../components/ui/Columns';
import { Text } from '../components/ui/Text';

interface Task {
  id: number;
  projectId: number;
  name: string;
  description: string;
  type: string;
  status: string;
}

interface TaskListProps {
  projectId: number;
}

export function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tasks?projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  if (loading) return <Text muted>Loading tasks...</Text>;
  if (tasks.length === 0) return <Text muted>No tasks found.</Text>;

  return (
    <Columns vertical>
      {tasks.map((task) => (
        <Column key={task.id}>
          <Card title={task.name}>
            <Text>{task.description}</Text>
            <Text small muted>
              {task.type} — {task.status}
            </Text>
          </Card>
        </Column>
      ))}
    </Columns>
  );
}
