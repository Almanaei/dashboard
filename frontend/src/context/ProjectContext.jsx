import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getUser } from '../services/userService';

const ProjectContext = createContext();

function ProjectProvider({ children }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState({});

  // Initialize with real users
  useEffect(() => {
    const initializeProjects = async () => {
      try {
        // Get all users first
        const allUsers = await getUsers();
        const userMap = {};
        allUsers.forEach(user => {
          userMap[user.id] = user;
        });
        setUsers(userMap);

        // Set initial projects with real user IDs
        const initialProjects = [
          {
            id: 1,
            name: 'E-commerce Platform',
            description: 'Building a modern e-commerce platform with React and Node.js',
            status: 'in_progress',
            priority: 'high',
            startDate: '2024-01-01',
            endDate: '2024-06-30',
            progress: 45,
            userId: allUsers[0]?.id || 1
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
            userId: allUsers[1]?.id || 2
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
            userId: allUsers[2]?.id || 3
          }
        ];
        setProjects(initialProjects);
      } catch (error) {
        console.error('Error initializing projects:', error);
      }
    };

    initializeProjects();
  }, []);

  // Fetch user data for all projects
  const fetchUserData = useCallback(async (userId) => {
    if (!users[userId] && !loadingUsers[userId]) {
      try {
        setLoadingUsers(prev => ({ ...prev, [userId]: true }));
        const userData = await getUser(userId);
        setUsers(prev => ({
          ...prev,
          [userId]: userData
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingUsers(prev => ({ ...prev, [userId]: false }));
      }
    }
  }, [users, loadingUsers]);

  const createProject = useCallback((newProject) => {
    const projectWithId = {
      ...newProject,
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      progress: 0,
      userId: newProject.userId || 1
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

  // Update user data when it changes
  const updateUserData = useCallback((userId, userData) => {
    setUsers(prev => ({
      ...prev,
      [userId]: userData
    }));
  }, []);

  const getProjectStats = useCallback(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
    const userProjects = projects.reduce((acc, project) => {
      if (!acc[project.userId]) {
        acc[project.userId] = 0;
      }
      acc[project.userId]++;
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

  // Get project with user data
  const getProjectsWithUsers = useCallback(() => {
    return projects.map(project => {
      const user = users[project.userId];
      return {
        ...project,
        user: user || {
          id: project.userId,
          name: loadingUsers[project.userId] ? 'Loading...' : 'User not found',
          avatar: ''
        }
      };
    });
  }, [projects, users, loadingUsers]);

  const value = {
    projects: getProjectsWithUsers(),
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    updateProjectProgress,
    getProjectStats,
    updateUserData
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
