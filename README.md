# TaskMaster

A React application for managing projects and tasks with real-time updates.

## Features

- View and select projects from a project list
- Create and manage tasks within projects
- Track recently updated tasks across all projects
- Real-time updates when tasks are created or modified
- Responsive layout with Mantine UI components

## Tech Stack

- React 
- TypeScript
- Mantine UI Framework
- Vite
- Axios for API communication

## Project Structure

The application is organized into several key components:

- `App.tsx` - Main application layout and routing
- `ProjectList` - Displays and manages project selection
- `ProjectDetails` - Shows tasks for the selected project
- `TaskForm` - Form for creating new tasks
- `TaskList` - Displays tasks for a project
- `RecentTasks` - Shows recently updated tasks across projects

## API Integration

The application communicates with a REST API endpoint for:

- Fetching projects and tasks
- Creating new tasks
- Updating existing tasks
- Deleting tasks

All API calls include simulated latency for a more realistic experience.
