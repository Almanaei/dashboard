import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectContext = createContext();

const mockProjects = [
  {
    id: 1,
    name: 'E-commerce Platform',
    description: 'Building a modern e-commerce platform with React and Node.js',
    status: 'in_progress',
    priority: 'high',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    progress: 45,
    user: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://mui.com/static/images/avatar/1.jpg'
    }
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Developing a cross-platform mobile app using React Native',
    status: 'planning',
    priority: 'medium',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    progress: 15,
    user: {
      id: 2,
      name: 'Jane Smith',
      avatar: 'https://mui.com/static/images/avatar/2.jpg'
    }
  },
  {
    id: 3,
    name: 'Data Analytics Dashboard',
    description: 'Creating a real-time analytics dashboard for business insights',
    status: 'completed',
    priority: 'medium',
    startDate: '2023-11-01',
    endDate: '2024-01-15',
    progress: 100,
    user: {
      id: 3,
      name: 'Mike Johnson',
      avatar: 'https://mui.com/static/images/avatar/3.jpg'
    }
  }
];

function ProjectProvider({ children }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(mockProjects);

  const createProject = useCallback((newProject) => {
    const projectWithId = {
      ...newProject,
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      progress: 0,
      user: {
        id: 1, // Default to first user for demo
        name: 'John Doe',
        avatar: 'https://mui.com/static/images/avatar/1.jpg'
      }
    };
    setProjects(prev => [projectWithId, ...prev]);
    return projectWithId;
  }, [projects]);

  const updateProject = useCallback((updatedProject) => {
    setProjects(prev => prev.map(project => 
      project.id === updatedProject.id ? { ...project, ...updatedProject } : project
    ));
    navigate('/projects');
  }, [navigate]);

  const deleteProject = useCallback((projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  }, []);

  const getProjectById = useCallback((projectId) => {
    return projects.find(project => project.id === parseInt(projectId));
  }, [projects]);

  const updateProjectProgress = useCallback((projectId, progress) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, progress } : project
    ));
  }, []);

  const getProjectStats = useCallback(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
    const userProjects = projects.reduce((acc, project) => {
      if (!acc[project.user.id]) {
        acc[project.user.id] = 0;
      }
      acc[project.user.id]++;
      return acc;
    }, {});
    
    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      userProjects,
      completionRate: totalProjects ? (completedProjects / totalProjects) * 100 : 0
    };
  }, [projects]);

  const value = {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    updateProjectProgress,
    getProjectStats
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

export { ProjectProvider, useProjects };
