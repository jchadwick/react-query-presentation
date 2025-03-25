import { Card, Stack, Text, Skeleton } from '@mantine/core';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  isLoading: boolean;
}

function ProjectList({ projects, selectedProject, onSelectProject, isLoading }: ProjectListProps) {
  if (isLoading) {
    return (
      <Stack>
        <Skeleton height={100} radius="md" />
        <Skeleton height={100} radius="md" />
        <Skeleton height={100} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack>
      {projects.map(project => (
        <Card
          key={project.id}
          padding="md"
          radius="md"
          withBorder
          style={{
            cursor: 'pointer',
            backgroundColor: project.id === selectedProject?.id ? '#f0f0f0' : 'white',
          }}
          onClick={() => onSelectProject(project)}
        >
          <Text size="lg" fw={500}>{project.name}</Text>
          <Text size="sm" c="dimmed">{project.description}</Text>
        </Card>
      ))}
    </Stack>
  );
}

export default ProjectList; 