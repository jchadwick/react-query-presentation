import { Card, Skeleton, Stack, Text } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import * as api from "../lib/api";
import { Project } from "../types/types";
import { useTasks } from "../hooks/useTasks";

interface ProjectListProps {
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

function ProjectList({ selectedProject, onSelectProject }: ProjectListProps) {
  useTasks(); // prefetch tasks
  
  return (
    <Suspense
      fallback={
        <Stack>
          <Skeleton height={100} radius="md" />
          <Skeleton height={100} radius="md" />
          <Skeleton height={100} radius="md" />
        </Stack>
      }
    >
      <ProjectListLoader
        selectedProject={selectedProject}
        onSelectProject={onSelectProject}
      />
    </Suspense>
  );
}

function ProjectListLoader({
  selectedProject,
  onSelectProject,
}: ProjectListProps) {
  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(),
  });

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
