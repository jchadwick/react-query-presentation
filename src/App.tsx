import { AppShell, Container, Grid, Title } from "@mantine/core";
import { useState } from "react";
import ProjectDetails from "./components/ProjectDetails";
import ProjectList from "./components/ProjectList";
import RecentTasksList from "./components/RecentTasks/RecentTasksList";
import { RecentTasksProvider } from "./components/RecentTasks/RecentTasksProvider";
import { Project } from "./types/types";

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <RecentTasksProvider>
      <AppShell>
        <Container size="xl">
          <Title order={1} mb="lg">
            TaskMaster
          </Title>
          <Grid>
            <Grid.Col span={3}>
              <ProjectList
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              {selectedProject && (
                <ProjectDetails projectId={selectedProject.id} />
              )}
            </Grid.Col>
            <Grid.Col span={3}>
              <RecentTasksList />
            </Grid.Col>
          </Grid>
        </Container>
      </AppShell>
    </RecentTasksProvider>
  );
}

export default App;
