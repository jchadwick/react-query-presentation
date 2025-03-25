import { Card, Skeleton, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import * as api from "../api";
import { Project } from "../types";

interface ProjectListProps {
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

function ProjectList({ selectedProject, onSelectProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const projects = await api.getProjects();
        setProjects(projects);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching projects:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

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
    <ProjectListView
      projects={projects}
      selectedProject={selectedProject}
      onProjectSelected={onSelectProject}
    />
  );
}
interface ProjectListViewProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelected: (project: Project) => void;
}

function ProjectListView({
  projects,
  selectedProject,
  onProjectSelected,
}: ProjectListViewProps) {
  return (
    <Stack>
      {projects.length === 0 && (
        <Text c="dimmed" ta="center">
          No projects found
        </Text>
      )}
      {projects.map((project) => (
        <Card
          key={project.id}
          padding="md"
          radius="md"
          withBorder
          style={{
            cursor: "pointer",
            backgroundColor:
              project.id === selectedProject?.id ? "#f0f0f0" : "white",
          }}
          onClick={() => onProjectSelected(project)}
        >
          <Text size="lg" fw={500}>
            {project.name}
          </Text>
          <Text size="sm" c="dimmed">
            {project.description}
          </Text>
        </Card>
      ))}
    </Stack>
  );
}

export default ProjectList;
