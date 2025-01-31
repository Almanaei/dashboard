import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  ButtonGroup,
  InputBase,
  CircularProgress,
  TextField,
  TablePagination,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  Badge,
  Input,
  Snackbar,
  Alert,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  MoreHoriz as MoreIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Download as ExportIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachmentIcon,
  EmojiEmotions as EmojiIcon,
  Send as SendIcon,
  Message as MessageIcon,
  Close as CloseIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useLanguage } from '../context/LanguageContext';
import { formatLastActive } from '../utils/dateUtils';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format, parseISO, isValid, addDays, subDays, subMonths, subYears } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Add generateDateRange function before the Dashboard component
function generateDateRange(startDate, endDate, period) {
  const dates = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    
    switch (period) {
      case 'D':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'Y':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default: // 'M'
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
  }
  
  return dates;
}

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('M');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statistics, setStatistics] = useState({
    projects: 0,
    reports: 0,
    users: 0
  });
  const [chartData, setChartData] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          color: '#666666',
          font: {
            size: 10
          }
        }
      },
      y: {
        min: 0,
        max: 100,
        position: 'right',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          stepSize: 20,
          padding: 10,
          color: '#666666',
          font: {
            size: 10
          },
          callback: (value) => value.toString()
        }
      }
    },
    elements: {
      line: {
        borderCapStyle: 'round',
        borderJoinStyle: 'round'
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10
      }
    }
  });
  const { t, isRTL } = useLanguage();
  const { token, user } = useAuth();
  const API_URL = 'http://localhost:5005';
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortField, setSortField] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [socket, setSocket] = useState(null);
  const fileInputRef = useRef(null);
  const currentUser = user; // This is from the useAuth context
  const [messagesDrawerOpen, setMessagesDrawerOpen] = useState(false);
  const [allConversations, setAllConversations] = useState([]);
  const [drawerTab, setDrawerTab] = useState(0);
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Configure date adapter locale and format
  const adapterLocale = {
    formats: {
      keyboardDate: 'MMM d, yyyy',
      shortDate: 'MMM d, yyyy',
      normalDate: 'MMM d, yyyy',
      fullDate: 'MMM d, yyyy',
    }
  };

  // Updated date formatting function with better error handling and date parsing
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // First try parsing as ISO string
      let date = parseISO(dateString);
      
      // If invalid, try creating a new Date object directly
      if (!isValid(date)) {
        date = new Date(dateString);
        // If still invalid, return placeholder
        if (!isValid(date)) {
          console.error('Invalid date:', dateString);
          return '-';
        }
      }
      
      // Format the date using date-fns with a consistent format
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  // Fetch statistics and trends
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch statistics
        const statsResponse = await fetch(`${API_URL}/api/statistics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsResponse.json();
        
        if (!statsResponse.ok) {
          throw new Error(statsData.error || 'Failed to fetch statistics');
        }

        setStatistics({
          projects: statsData.projectCount || 0,
          reports: statsData.reportCount || 0,
          users: statsData.userCount || 0
        });

        // Calculate date range based on selected period
        const endDate = new Date();
        let startDate;
        let dateFormat;
        
        switch (selectedPeriod) {
          case 'D':
            startDate = subDays(endDate, 30);
            dateFormat = 'MMM dd';
            break;
          case 'Y':
            startDate = subYears(endDate, 2); // Last 2 years
            dateFormat = 'yyyy';
            break;
          default: // Monthly
            startDate = subYears(endDate, 1);
            dateFormat = 'MMM yyyy';
        }

        // Fetch trends data
        const trendsResponse = await fetch(`${API_URL}/api/statistics/projects/trends?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!trendsResponse.ok) {
          throw new Error('Failed to fetch trends');
        }
        
        const trendsData = await trendsResponse.json();

        // Process trends data
        const dates = generateDateRange(startDate, endDate, selectedPeriod);
        const projectCounts = new Array(dates.length).fill(0);
        const reportCounts = new Array(dates.length).fill(0);

        // Map the trends data to the appropriate arrays
        trendsData.forEach(trend => {
          const date = new Date(trend.date);
          const dateStr = format(date, dateFormat);
          const index = dates.findIndex(d => format(new Date(d), dateFormat) === dateStr);
          
          if (index !== -1) {
            projectCounts[index] = trend.projectCount || 0;
            reportCounts[index] = trend.reportCount || 0;
          }
        });

        // Find the maximum value for y-axis scaling
        const maxCount = Math.max(
          ...projectCounts,
          ...reportCounts
        );
        const yAxisMax = Math.ceil(maxCount / 10) * 10 || 10; // Default to 10 if no data

        // Update chart options with new max value
        setChartOptions(prev => ({
          ...prev,
          scales: {
            ...prev.scales,
            y: {
              ...prev.scales.y,
              max: yAxisMax,
              ticks: {
                ...prev.scales.y.ticks,
                stepSize: Math.ceil(yAxisMax / 5)
              }
            }
          }
        }));

        // Set chart data
        setChartData({
          labels: dates.map(date => format(new Date(date), dateFormat)),
          datasets: [
            {
              label: 'Projects',
              data: projectCounts,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Reports',
              data: reportCounts,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      }
    };

    fetchData();
  }, [API_URL, token, selectedPeriod]);

  // Fetch projects with updated date handling
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        
        // Process the dates before setting to state
        const processedProjects = data.map(project => {
          try {
            return {
              ...project,
              // Convert dates to ISO strings if they exist and are valid
              start_date: project.start_date ? new Date(project.start_date).toISOString() : null,
              end_date: project.end_date ? new Date(project.end_date).toISOString() : null
            };
          } catch (error) {
            console.error('Error processing dates for project:', project.id, error);
            return {
              ...project,
              start_date: null,
              end_date: null
            };
          }
        });
        
        console.log('Processed projects:', processedProjects);
        setUserStats(processedProjects);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [API_URL, token]);

  // Update the fetchUserStats function
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          sortField,
          sortOrder
        });
        
        const response = await fetch(
          `${API_URL}/api/statistics/users?${queryParams}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user statistics');
        }

        if (data.users && Array.isArray(data.users)) {
          setUserStats(data.users);
          setTotalUsers(data.pagination.total);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserStats();
    }
  }, [token, API_URL, page, rowsPerPage, searchQuery, sortField, sortOrder]);

  // Add pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Create metrics array from statistics
  const metrics = React.useMemo(() => [
    {
      label: t('projects'),
      value: statistics.projects,
      displayValue: statistics.projects.toLocaleString(),
      color: '#2196f3',
      dots: [
        { color: '#e0e0e0' },
        { color: '#2196f3' },
        { color: '#e0e0e0' }
      ]
    },
    {
      label: t('reports'),
      value: statistics.reports,
      displayValue: statistics.reports.toLocaleString(),
      color: '#4CAF50',
      dots: [
        { color: '#e0e0e0' },
        { color: '#4CAF50' },
        { color: '#e0e0e0' }
      ]
    },
    {
      label: t('users'),
      value: statistics.users,
      displayValue: statistics.users.toLocaleString(),
      color: '#f44336',
      dots: [
        { color: '#e0e0e0' },
        { color: '#f44336' },
        { color: '#e0e0e0' }
      ]
    }
  ], [statistics, t]);

  // Add debug logging for metrics changes
  useEffect(() => {
    console.log('Metrics updated:', metrics);
  }, [metrics]);

  const timelineEvents = [
    { date: '2 May, 23', icon: '📊' },
    { date: 'Jan 17, 24', icon: '📈', active: true },
    { date: 'Today, Nov 6, 24', icon: '•' },
    { date: 'Est. 15 Mar, 25', icon: '🔒' }
  ];

  function formatDateLabel(date) {
    const d = new Date(date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[d.getDay()];
    const monthName = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${dayName} ${monthName} ${day} ${year} ${hours}:${minutes}:00 (Arabian Standard Time)`;
  }

  function generateDateLabels(start, end, points) {
    const dates = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const step = (endDate - startDate) / (points - 1);
    
    for (let i = 0; i < points; i++) {
      const date = new Date(startDate.getTime() + (step * i));
      dates.push(formatDateLabel(date));
    }
    
    return dates;
  }

  const deals = [
    {
      id: '01',
      name: 'Acme',
      contact: { name: 'Tyra Dhillon', email: 'tyradhillon@acme.com', avatar: '/avatars/1.jpg' },
      value: 3912,
      source: 'Social Networks',
      sourceColor: '#2563eb',
    },
    {
      id: '02',
      name: 'Academic Project',
      contact: { name: 'Brittn Lando', email: 'lando@academicproject.com', avatar: '/avatars/2.jpg' },
      value: 2345,
      source: 'Outreach',
      sourceColor: '#6366f1',
    },
    {
      id: '03',
      name: 'Aimbus',
      contact: { name: 'Kevin Chen', email: 'chen@aimbus.com', avatar: '/avatars/3.jpg' },
      value: 13864,
      source: 'Referrals',
      sourceColor: '#22c55e',
    },
    {
      id: '04',
      name: 'Big Bang Production',
      contact: { name: 'Josh Ryan', email: 'joshryan@gmail.com', avatar: '/avatars/4.jpg' },
      value: 6314,
      source: 'Word-of-mouth',
      sourceColor: '#f59e0b',
    },
    {
      id: '05',
      name: 'Book Launch',
      contact: { name: 'Chieko Chute', email: 'chieko67@booklaunch.com', avatar: '/avatars/5.jpg' },
      value: 5982,
      source: 'Outreach',
      sourceColor: '#6366f1',
    },
  ];

  // Handle date changes
  const handleStartDateChange = (newDate) => {
    if (newDate) {
      const formattedDate = format(newDate, 'MMM dd, yyyy');
      console.log('Formatted start date:', formattedDate);
    }
    setStartDate(newDate);
    // If end date is before new start date, update it
    if (endDate && newDate && endDate < newDate) {
      setEndDate(newDate);
    }
  };

  const handleEndDateChange = (newDate) => {
    if (newDate) {
      const formattedDate = format(newDate, 'MMM dd, yyyy');
      console.log('Formatted end date:', formattedDate);
    }
    setEndDate(newDate);
  };

  // Add filter and sort handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    handleSortClose();
  };

  // Add export function
  const exportToCSV = () => {
    const headers = ['Username', 'Email', 'Projects Created', 'Reports Created', 'Last Active'];
    const data = userStats.map(user => [
      user.username,
      user.email,
      user.projectCount,
      user.reportCount,
      formatLastActive(user.last_login)
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user_statistics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add socket initialization in useEffect
  useEffect(() => {
    if (token) {
      const newSocket = io(API_URL, {
        path: '/socket.io/',
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      newSocket.on('new_message', (message) => {
        if (selectedUser && (message.sender_id === selectedUser.id || message.recipient_id === selectedUser.id)) {
          setConversation(prev => [...prev, message]);
        }
      });

      newSocket.on('message_edited', (message) => {
        if (selectedUser && (message.sender_id === selectedUser.id || message.recipient_id === selectedUser.id)) {
          setConversation(prev => prev.map(m => m.id === message.id ? message : m));
        }
      });

      newSocket.on('message_deleted', ({ message_id }) => {
        if (selectedUser) {
          setConversation(prev => prev.filter(m => m.id !== message_id));
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, API_URL, selectedUser]);

  // Update handleSendMessage to use socket
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: selectedUser.id,
          content: messageInput.trim()
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setConversation(prev => [...prev, newMessage]);
        setMessageInput('');
        // Refresh conversations list to show the new message
        fetchAllConversations();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNotification({
        open: true,
        message: 'Failed to send message',
        severity: 'error'
      });
    }
  };

  // Handle message edit
  const handleEditMessage = async (messageId, newContent) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      });

      if (!response.ok) {
        throw new Error('Failed to edit message');
      }

      setNotification({
        open: true,
        message: 'Message edited successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error editing message:', error);
      setNotification({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  // Handle message delete
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setNotification({
        open: true,
        message: 'Message deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      setNotification({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  // Handle message reaction
  const handleReaction = async (messageId, reaction) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${messageId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction })
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      setNotification({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  // Handle close message dialog
  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
    setSelectedUser(null);
    setMessageInput('');
    setConversation([]);
  };

  // Add these effect hooks after the existing ones
  useEffect(() => {
    if (selectedUser) {
      fetchConversation();
    }
  }, [selectedUser]);

  // Add these functions before the return statement
  const fetchConversation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/conversation/${selectedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  // Add this helper function to check messaging privileges
  const canMessageUser = (currentUser, targetUser) => {
    // Admins can message everyone
    if (currentUser.role === 'admin') return true;
    // Regular users can only message admins
    return targetUser.role === 'admin';
  };

  const handleUserClick = (targetUser) => {
    // Check messaging privileges
    if (canMessageUser(currentUser, targetUser)) {
      setSelectedUser(targetUser);
      setMessageDialogOpen(true);
    } else {
      setNotification({
        open: true,
        message: 'You can only send messages to administrators',
        severity: 'info'
      });
    }
  };

  // Add loading and error states to the table
  if (error) {
    console.error('Error in Dashboard:', error);
  }

  // Update the fetchAllConversations function
  const fetchAllConversations = async () => {
    try {
      if (user.role === 'admin') {
        // Admin flow remains the same
        const usersResponse = await fetch(`${API_URL}/api/statistics/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }

        const usersData = await usersResponse.json();
        const users = usersData.users || [];

        // Filter out current user
        const relevantUsers = users.filter(u => u.id !== user.id);

        // Fetch conversations for all users
        const conversationsWithMessages = await Promise.all(
          relevantUsers.map(async (otherUser) => {
            try {
              const messagesResponse = await fetch(
                `${API_URL}/api/messages/conversation/${otherUser.id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );

              if (messagesResponse.ok) {
                const messages = await messagesResponse.json();
                if (messages && messages.length > 0) {
                  return {
                    id: `${user.id}-${otherUser.id}`,
                    sender: user,
                    recipient: otherUser,
                    sender_id: user.id,
                    recipient_id: otherUser.id,
                    lastMessage: messages[messages.length - 1],
                    messages,
                    unreadCount: messages.filter(m => !m.read_at && m.recipient_id === user.id).length
                  };
                }
              }
              return null;
            } catch (error) {
              console.error('Error fetching messages for user:', error);
              return null;
            }
          })
        );

        // Filter out null values and sort by most recent message
        const sortedConversations = conversationsWithMessages
          .filter(conv => conv !== null && conv.lastMessage)
          .sort((a, b) => {
            const dateA = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at) : new Date(0);
            const dateB = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at) : new Date(0);
            return dateB - dateA;
          });

        setAllConversations(sortedConversations);
      } else {
        // Regular user flow - fetch messages with admins
        const messagesResponse = await fetch(
          `${API_URL}/api/messages/list`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!messagesResponse.ok) {
          throw new Error('Failed to fetch messages');
        }

        const messages = await messagesResponse.json();
        
        // Group messages by conversation and only keep admin conversations
        const conversationMap = new Map();
        
        messages.forEach(message => {
          const otherUser = message.sender_id === user.id ? message.recipient : message.sender;
          
          // Only process conversations with admin users
          if (otherUser.role === 'admin') {
            if (!conversationMap.has(otherUser.id)) {
              conversationMap.set(otherUser.id, {
                id: `${user.id}-${otherUser.id}`,
                sender: user,
                recipient: otherUser,
                sender_id: user.id,
                recipient_id: otherUser.id,
                messages: [],
                unreadCount: 0
              });
            }
            
            const conversation = conversationMap.get(otherUser.id);
            conversation.messages.push(message);
            if (!message.read_at && message.recipient_id === user.id) {
              conversation.unreadCount++;
            }
          }
        });

        // Convert map to array and add last message
        const conversations = Array.from(conversationMap.values()).map(conv => ({
          ...conv,
          lastMessage: conv.messages[conv.messages.length - 1]
        }));

        // Sort conversations by most recent message
        const sortedConversations = conversations
          .filter(conv => conv.lastMessage)
          .sort((a, b) => {
            const dateA = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at) : new Date(0);
            const dateB = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at) : new Date(0);
            return dateB - dateA;
          });

        setAllConversations(sortedConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setNotification({
        open: true,
        message: 'Failed to load conversations',
        severity: 'error'
      });
    }
  };

  // Add this effect to refresh conversations periodically
  useEffect(() => {
    if (messagesDrawerOpen) {
      fetchAllConversations();
      const refreshInterval = setInterval(fetchAllConversations, 30000);
      return () => clearInterval(refreshInterval);
    }
  }, [messagesDrawerOpen]);

  // Add this effect to scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 4,
        bgcolor: '#f8f9fa',
        borderRadius: 1,
        py: 1.5,
        px: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#e7f0fe',
              color: '#2196f3'
            }}
          >
            <CheckIcon sx={{ fontSize: 18 }} />
          </Avatar>
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  lineHeight: 1
                }}
              >
                {user?.username || t('loading')}
              </Typography>
              <Chip
                label={t('certified')}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  bgcolor: '#e7f0fe',
                  color: '#2196f3',
                  fontWeight: 500,
                  '& .MuiChip-label': {
                    px: 1,
                    py: 0.25
                  }
                }}
              />
              <Tooltip title={user?.role === 'admin' ? "View All Messages" : "View Messages"}>
                <IconButton
                  size="small"
                  onClick={() => setMessagesDrawerOpen(true)}
                  sx={{
                    color: '#2196f3',
                    '&:hover': {
                      bgcolor: 'rgba(33, 150, 243, 0.08)'
                    }
                  }}
                >
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={conversation.length === 0}
                  >
                    <MessageIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
            
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#666666',
                mt: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: '0.75rem',
                  color: '#666666',
                  fontWeight: 500
                }}
              >
                {user?.initials || 'JP'}
              </Typography>
              • {user?.name || t('jessica_parker')} • {formatLastActive(user?.last_login, isRTL) || t('never')}
            </Typography>
          </Box>
        </Box>

        {/* Metrics Section */}
        <Box sx={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {metrics.map((metric, index) => (
            <Box key={index} sx={{ textAlign: 'center', position: 'relative', minWidth: 70 }}>
              <Box sx={{ 
                position: 'absolute', 
                left: -12, 
                top: '50%', 
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75
              }}>
                {metric.dots.map((dot, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: dot.color
                    }}
                  />
                ))}
              </Box>
               
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: '#666666',
                  mb: 0.5
                }}
              >
                {metric.label}
              </Typography>
               
              <Typography
                sx={{
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  color: '#1a1a1a'
                }}
              >
                {metric.displayValue}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Date Range Selector */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <LocalizationProvider 
          dateAdapter={AdapterDateFns}
          localeText={{
            formatDate: (date) => format(date, 'MMM dd, yyyy')
          }}
        >
          <DatePicker
            label={t('start_date')}
            value={startDate}
            onChange={handleStartDateChange}
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 200 },
                inputProps: {
                  placeholder: 'MMM dd, yyyy'
                }
              }
            }}
            format="MMM dd, yyyy"
            views={['year', 'month', 'day']}
          />
          <DatePicker
            label={t('end_date')}
            value={endDate}
            onChange={handleEndDateChange}
            minDate={startDate}
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 200 },
                inputProps: {
                  placeholder: 'MMM dd, yyyy'
                }
              }
            }}
            format="MMM dd, yyyy"
            views={['year', 'month', 'day']}
          />
        </LocalizationProvider>
      </Box>

      {/* Chart Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="div">
            {t('Monitor')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ButtonGroup size="small">
              <Button
                variant={selectedPeriod === 'D' ? 'contained' : 'outlined'}
                onClick={() => setSelectedPeriod('D')}
              >
                D
              </Button>
              <Button
                variant={selectedPeriod === 'M' ? 'contained' : 'outlined'}
                onClick={() => setSelectedPeriod('M')}
              >
                M
              </Button>
              <Button
                variant={selectedPeriod === 'Y' ? 'contained' : 'outlined'}
                onClick={() => setSelectedPeriod('Y')}
              >
                Y
              </Button>
            </ButtonGroup>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 2, bgcolor: '#2196f3' }} />
            <Typography variant="body2" color="text.secondary">
              {t('projects')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 2, bgcolor: '#4CAF50' }} />
            <Typography variant="body2" color="text.secondary">
              {t('reports')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: 300 }}>
          {chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Paper>

      {/* User Statistics Table */}
      <Paper sx={{ p: 2, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="div">
            {t('User Statistics')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search Box */}
            <TextField
              size="small"
              placeholder={t('Search users...')}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 200 }}
            />

            {/* Sort Button */}
            <Tooltip title={t('Sort')}>
              <IconButton onClick={handleSortClick}>
                <SortIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem onClick={() => handleSort('username')}>
                {t('Username')} {sortField === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
              </MenuItem>
              <MenuItem onClick={() => handleSort('projectCount')}>
                {t('Projects')} {sortField === 'projectCount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </MenuItem>
              <MenuItem onClick={() => handleSort('reportCount')}>
                {t('Reports')} {sortField === 'reportCount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </MenuItem>
              <MenuItem onClick={() => handleSort('lastActive')}>
                {t('Last Active')} {sortField === 'lastActive' && (sortOrder === 'asc' ? '↑' : '↓')}
              </MenuItem>
            </Menu>

            {/* Export Button */}
            <Tooltip title={t('Export')}>
              <IconButton onClick={exportToCSV}>
                <ExportIcon />
              </IconButton>
            </Tooltip>

            {loading && <CircularProgress size={20} />}
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('User')}</TableCell>
                <TableCell align="center">{t('Projects Created')}</TableCell>
                <TableCell align="center">{t('Reports Created')}</TableCell>
                <TableCell align="center">{t('Last Active')}</TableCell>
                <TableCell align="center">{t('Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : userStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    {t('No users found')}
                  </TableCell>
                </TableRow>
              ) : (
                userStats.map((user) => (
                  <TableRow key={user?.id || 'unknown'}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {user?.initials || (user?.username && user.username.charAt(0).toUpperCase()) || '?'}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              cursor: 'default'
                            }}
                          >
                            {user?.username}
                            {user.role === 'admin' && (
                              <Chip
                                size="small"
                                label="Admin"
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1">
                        {typeof user?.projectCount === 'number' ? user.projectCount : 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1">
                        {typeof user?.reportCount === 'number' ? user.reportCount : 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {formatLastActive(user?.last_login)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title={t('Send Email')}>
                          <IconButton size="small" onClick={() => window.location.href = `mailto:${user.email}`}>
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ mt: 2 }}
        />
      </Paper>

      {/* Message Dialog */}
      <Dialog 
        open={messageDialogOpen} 
        onClose={handleCloseMessageDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: 600,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          px: 2, 
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              {selectedUser?.initials || selectedUser?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedUser?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedUser?.role === 'admin' ? 'Administrator' : 'User'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleCloseMessageDialog}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box
            ref={messagesEndRef}
            sx={{
              height: 400,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mb: 2
            }}
          >
            {conversation.map((message, index) => {
              const isCurrentUser = message.sender_id === user.id;
              const showAvatar = index === 0 || 
                conversation[index - 1]?.sender_id !== message.sender_id;
              
              return (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 1,
                    ml: isCurrentUser ? 'auto' : 0,
                    mr: isCurrentUser ? 0 : 'auto',
                    maxWidth: '80%'
                  }}
                >
                  {!isCurrentUser && showAvatar && (
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem'
                      }}
                    >
                      {selectedUser?.initials || selectedUser?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Box>
                    <Box
                      sx={{
                        backgroundColor: isCurrentUser ? 'primary.main' : 'grey.100',
                        color: isCurrentUser ? 'white' : 'text.primary',
                        borderRadius: 2,
                        p: 1.5,
                        position: 'relative'
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {message.content}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        textAlign: isCurrentUser ? 'right' : 'left',
                        mt: 0.5,
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}
                    >
                      {formatDate(message.created_at)}
                      {message.read_at && isCurrentUser && (
                        <DoneAllIcon 
                          sx={{ 
                            ml: 0.5, 
                            fontSize: '0.875rem',
                            verticalAlign: 'middle',
                            color: 'primary.main'
                          }} 
                        />
                      )}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              multiline
              maxRows={4}
              size="small"
              InputProps={{
                sx: {
                  borderRadius: 2,
                  backgroundColor: 'grey.50'
                }
              }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                '&.Mui-disabled': {
                  bgcolor: 'grey.300',
                  color: 'grey.500'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Messages Drawer */}
      <Drawer
        anchor="right"
        open={messagesDrawerOpen}
        onClose={() => setMessagesDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Messages</Typography>
            <IconButton onClick={() => setMessagesDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={drawerSearchQuery}
            onChange={(e) => setDrawerSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Tabs
            value={drawerTab}
            onChange={(e, newValue) => setDrawerTab(newValue)}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Conversations" />
            <Tab label="Users" />
          </Tabs>

          {drawerTab === 0 ? (
            // Conversations Tab
            <List sx={{ width: '100%' }}>
              {allConversations.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No conversations yet</Typography>
                </Box>
              ) : (
                allConversations
                  .filter(conv => {
                    const otherUser = conv.sender_id === user.id ? conv.recipient : conv.sender;
                    return otherUser?.username?.toLowerCase().includes(drawerSearchQuery.toLowerCase()) ||
                           otherUser?.email?.toLowerCase().includes(drawerSearchQuery.toLowerCase());
                  })
                  .map((conv) => {
                    const otherUser = conv.sender_id === user.id ? conv.recipient : conv.sender;
                    const lastMessage = conv.lastMessage || {};
                    const messageTime = lastMessage.created_at ? formatDate(lastMessage.created_at) : '';
                    
                    return (
                      <ListItem
                        key={conv.id}
                        button
                        onClick={() => {
                          setSelectedUser(otherUser);
                          setMessageDialogOpen(true);
                          setMessagesDrawerOpen(false);
                        }}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'rgba(33, 150, 243, 0.08)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {otherUser?.initials || otherUser?.username?.charAt(0).toUpperCase() || '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2">
                                {otherUser?.username}
                              </Typography>
                              {otherUser?.role === 'admin' && (
                                <Chip
                                  size="small"
                                  label="Admin"
                                  color="primary"
                                  sx={{ height: 20 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '200px'
                                }}
                              >
                                {lastMessage.content || 'No messages yet'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {messageTime}
                              </Typography>
                            </Box>
                          }
                        />
                        {conv.unreadCount > 0 && (
                          <Badge
                            badgeContent={conv.unreadCount}
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </ListItem>
                    );
                  })
              )}
            </List>
          ) : (
            // Users Tab
            <List sx={{ width: '100%' }}>
              {user.role === 'admin' ? (
                // Admin view remains the same
                userStats
                  .filter(u => {
                    const matchesSearch = u.username?.toLowerCase().includes(drawerSearchQuery.toLowerCase()) ||
                                        u.email?.toLowerCase().includes(drawerSearchQuery.toLowerCase());
                    return u.id !== user.id && matchesSearch;
                  })
                  .map((u) => (
                    <ListItem
                      key={u.id}
                      button
                      onClick={() => {
                        setSelectedUser(u);
                        setMessageDialogOpen(true);
                        setMessagesDrawerOpen(false);
                      }}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'rgba(33, 150, 243, 0.08)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {u?.initials || u?.username?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              {u?.username}
                            </Typography>
                            {u?.role === 'admin' && (
                              <Chip
                                size="small"
                                label="Admin"
                                color="primary"
                                sx={{ height: 20 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={u?.email}
                      />
                    </ListItem>
                  ))
              ) : (
                // Regular user view - show admins from the public endpoint
                <Box>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    allConversations
                      .filter(conv => {
                        const admin = conv.sender_id === user.id ? conv.recipient : conv.sender;
                        return admin.username?.toLowerCase().includes(drawerSearchQuery.toLowerCase()) ||
                               admin.email?.toLowerCase().includes(drawerSearchQuery.toLowerCase());
                      })
                      .map(conv => {
                        const admin = conv.sender_id === user.id ? conv.recipient : conv.sender;
                        return (
                          <ListItem
                            key={admin.id}
                            button
                            onClick={() => {
                              setSelectedUser(admin);
                              setMessageDialogOpen(true);
                              setMessagesDrawerOpen(false);
                            }}
                            sx={{
                              borderRadius: 1,
                              mb: 1,
                              '&:hover': {
                                bgcolor: 'rgba(33, 150, 243, 0.08)'
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {admin?.initials || admin?.username?.charAt(0).toUpperCase() || '?'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle2">
                                    {admin?.username}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label="Admin"
                                    color="primary"
                                    sx={{ height: 20 }}
                                  />
                                </Box>
                              }
                              secondary={admin?.email}
                            />
                          </ListItem>
                        );
                      })
                  )}
                </Box>
              )}
            </List>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Dashboard;
