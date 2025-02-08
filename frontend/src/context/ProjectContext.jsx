import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getUser } from '../services/userService';
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../services/projectService';
import { useAuth } from './AuthContext';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState({});
  const [error, setError] = useState(null);
  const API_URL = 'http://localhost:5005';

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return undefined;
    
    console.log('ProjectContext - Processing avatar path:', avatarPath);
    
    if (avatarPath.startsWith('data:')) return avatarPath;
    
    // Clean up the path by removing any duplicate URL prefixes
    const cleanPath = avatarPath.replace(/^http:\/\/localhost:5005\//, '').replace(/^uploads\//, '');
    const finalUrl = `${API_URL}/uploads/${cleanPath}`;
    
    console.log('ProjectContext - Final avatar URL:', finalUrl);
    return finalUrl;
  };

  // Function to process user data
  const processUserData = (user) => {
    if (!user) return null;
    console.log('Processing user data:', user);
    const processedUser = {
      ...user,
      avatar: user.avatar ? getAvatarUrl(user.avatar) : undefined
    };
    console.log('Processed user data:', processedUser);
    return processedUser;
  };

  // Function to refresh projects
  const refreshProjects = useCallback(async () => {
    try {
      if (!authUser) {
        console.log('No authenticated user, skipping project refresh');
        setProjects([]);
        return;
      }

      console.log('Refreshing projects for user:', authUser);

      const projectsData = await getProjects();
      console.log('Raw projects data:', projectsData);
      
      if (!projectsData) {
        console.log('No projects data received');
        setProjects([]);
        return;
      }

      const projectsArray = Array.isArray(projectsData) ? projectsData : [];
      console.log('Processed projects array:', projectsArray);
      
      setProjects(projectsArray);
      setError(null);
    } catch (error) {
      console.error('Error refreshing projects:', error);
      if (error.response?.status === 401) {
        console.log('Unauthorized - clearing projects');
        setProjects([]);
      }
      setError(error);
    }
  }, [authUser]);

  // Initialize projects
  useEffect(() => {
    if (!authUser) {
      console.log('No auth user, skipping initialization');
      return;
    }

    console.log('Initializing projects for user:', authUser);
    const initializeProjects = async () => {
      try {
        await refreshProjects();

        // Get all users
        const response = await getUsers();
        console.log('Fetched users response:', response);
        
        if (response?.users) {
          const userMap = {};
          response.users.forEach(user => {
            userMap[user.id] = processUserData(user);
          });
          console.log('Created user map:', userMap);
          setUsers(userMap);
        }
      } catch (error) {
        console.error('Error initializing projects:', error);
        setError(error);
      }
    };

    initializeProjects();
  }, [authUser, refreshProjects]);

  // Fetch user data for all projects
  const fetchUser = useCallback(async (userId) => {
    if (!users[userId] && !loadingUsers[userId]) {
      try {
        setLoadingUsers(prev => ({ ...prev, [userId]: true }));
        const userData = await getUser(userId);
        setUsers(prev => ({ ...prev, [userId]: processUserData(userData) }));
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
      } finally {
        setLoadingUsers(prev => ({ ...prev, [userId]: false }));
      }
    }
  }, [users, loadingUsers]);

  // Get projects with user data
  const getProjectsWithUsers = useCallback(() => {
    console.log('Getting projects with users:', { projects, users });
    return projects.map(project => {
      console.log('Processing project:', project);
      const processedProject = {
        ...project,
        creator: users[project.created_by] || null,
        loadingUser: loadingUsers[project.created_by] || false,
        // Keep dates in ISO string format
        start_date: project.start_date || null,
        end_date: project.end_date || null
      };
      return processedProject;
    });
  }, [projects, users, loadingUsers]);

  // Get project statistics
  const getProjectStats = useCallback(() => {
    const projectsWithUsers = getProjectsWithUsers();
    const stats = {
      totalProjects: projectsWithUsers.length,
      completedProjects: projectsWithUsers.filter(p => p.status === 'completed').length,
      inProgressProjects: projectsWithUsers.filter(p => p.status === 'in_progress').length,
      userProjects: {}
    };

    // Calculate projects per user
    projectsWithUsers.forEach(project => {
      if (project.created_by) {
        if (!stats.userProjects[project.created_by]) {
          stats.userProjects[project.created_by] = {
            total: 0,
            completed: 0,
            inProgress: 0
          };
        }
        stats.userProjects[project.created_by].total++;
        if (project.status === 'completed') {
          stats.userProjects[project.created_by].completed++;
        } else if (project.status === 'in_progress') {
          stats.userProjects[project.created_by].inProgress++;
        }
      }
    });

    return stats;
  }, [getProjectsWithUsers]);

  // Get project by ID
  const getProjectById = useCallback((id) => {
    const project = projects.find(p => p.id === id);
    if (!project) return null;

    // Return project with original date strings
    return {
      ...project,
      start_date: project.start_date || null,
      end_date: project.end_date || null
    };
  }, [projects]);

  // Create new project
  const handleCreateProject = useCallback(async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      await refreshProjects(); // Refresh all projects after creation
      navigate('/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }, [navigate, refreshProjects]);

  // Update project
  const handleUpdateProject = useCallback(async (id, projectData) => {
    try {
      console.log('Updating project:', { id, projectData });
      const updatedProject = await updateProject(id, projectData);
      await refreshProjects(); // Refresh all projects after update
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }, [refreshProjects]);

  // Delete project
  const handleDeleteProject = useCallback(async (id) => {
    try {
      await deleteProject(id);
      await refreshProjects(); // Refresh all projects after deletion
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }, [refreshProjects]);

  return (
    <ProjectContext.Provider
      value={{
        projects: getProjectsWithUsers(),
        users,
        error,
        getProjectStats,
        getProjectById,
        createProject: handleCreateProject,
        updateProject: handleUpdateProject,
        deleteProject: handleDeleteProject,
        refreshProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}; 