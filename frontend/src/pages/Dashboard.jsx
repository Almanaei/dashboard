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
  ListItemIcon
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
  Description as ReportIcon,
  Assignment as ProjectIcon,
  DeleteSweep as DeleteSweepIcon,
  MoreVert as MoreVertIcon
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
import { getReportById } from '../services/reportService';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  clearConversation,
  markAsRead,
  addReaction
} from '../services/messageService';

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
      case 'M':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'Y':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }
  
  return dates;
}

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('M');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    switch (selectedPeriod) {
      case 'D':
        return subDays(date, 30);
      case 'M':
        return subMonths(date, 12);
      case 'Y':
        return subYears(date, 2);
      default:
        return subMonths(date, 12);
    }
  });
  const [endDate, setEndDate] = useState(new Date());
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
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          boxHeight: 6,
          padding: 20,
          color: '#666666',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1a1a1a',
        bodyColor: '#666666',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return ` ${context.dataset.label}: ${context.parsed.y}`;
          }
        }
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
        beginAtZero: true,
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
          }
        }
      }
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.4,
        borderCapStyle: 'round',
        borderJoinStyle: 'round'
      },
      point: {
        radius: 0,
        hitRadius: 8,
        hoverRadius: 4
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
  const [mentionedItem, setMentionedItem] = useState(null);
  const [mentionDialogOpen, setMentionDialogOpen] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState('');
  const mentionAnchorRef = useRef(null);
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

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
        setLoading(true);
        setError(null);

        // Calculate date range based on selected period
        let periodStartDate = startDate;
        if (!startDate) {
          const now = new Date();
          switch (selectedPeriod) {
            case 'D':
              periodStartDate = subDays(now, 30);
              break;
            case 'M':
              periodStartDate = subMonths(now, 12);
              break;
            case 'Y':
              periodStartDate = subYears(now, 2);
              break;
            default:
              periodStartDate = subMonths(now, 12);
          }
          setStartDate(periodStartDate);
        }

        // Fetch statistics
        const statsResponse = await fetch(`${API_URL}/api/statistics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const statsData = await statsResponse.json();
        setStatistics({
          projects: statsData.projectCount || 0,
          reports: statsData.reportCount || 0,
          users: statsData.userCount || 0
        });

        // Fetch trends data with date range
        const trendsResponse = await fetch(
          `${API_URL}/api/statistics/projects/trends?` + new URLSearchParams({
            period: selectedPeriod,
            start_date: format(periodStartDate, 'yyyy-MM-dd'),
            end_date: format(endDate || new Date(), 'yyyy-MM-dd')
          }), {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!trendsResponse.ok) {
          throw new Error('Failed to fetch trends');
        }

        const trendsData = await trendsResponse.json();

        // Generate date labels based on period
        const dateFormat = selectedPeriod === 'D' ? 'MMM dd' : selectedPeriod === 'M' ? 'MMM yyyy' : 'yyyy';
        const dates = generateDateRange(periodStartDate, endDate || new Date(), selectedPeriod);
        const labels = dates.map(date => format(date, dateFormat));

        // Initialize data arrays with zeros
        const projectData = new Array(labels.length).fill(0);
        const reportData = new Array(labels.length).fill(0);

        // Fill in the actual data
        trendsData.forEach(item => {
          const itemDate = new Date(item.date);
          const formattedDate = format(itemDate, dateFormat);
          const index = labels.findIndex(label => label === formattedDate);
          
          if (index !== -1) {
            projectData[index] = item.projectCount || 0;
            reportData[index] = item.reportCount || 0;
          }
        });

        // Find max value for y-axis
        const maxValue = Math.max(
          ...projectData,
          ...reportData,
          1  // Ensure we always have a non-zero max value
        );

        // Calculate appropriate step size and max value
        const stepSize = Math.max(1, Math.ceil(maxValue / 5));
        const maxAxisValue = Math.ceil(maxValue / stepSize) * stepSize;

        // Update chart options with new max value and step size
        setChartOptions(prev => ({
          ...prev,
          scales: {
            ...prev.scales,
            y: {
              ...prev.scales.y,
              beginAtZero: true,
              max: maxAxisValue,
              ticks: {
                ...prev.scales.y.ticks,
                stepSize: stepSize
              }
            }
          }
        }));

        // Set chart data
        setChartData({
          labels,
          datasets: [
            {
              label: 'Projects',
              data: projectData,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Reports',
              data: reportData,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, token, selectedPeriod, startDate, endDate]);

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
          // If the message is for the current user and the conversation is open, mark it as read
          if (message.recipient_id === user.id) {
            markMessagesAsRead([message]);
          }
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

  // Add this function to mark messages as read
  const markMessagesAsRead = async (messages) => {
    try {
      const unreadMessages = messages.filter(m => 
        !m.read_at && m.recipient_id === user.id
      );

      await Promise.all(unreadMessages.map(message =>
        fetch(`${API_URL}/api/messages/${message.id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ));

      // Update local conversation state to mark messages as read
      setConversation(prev => prev.map(m => ({
        ...m,
        read_at: m.recipient_id === user.id ? new Date().toISOString() : m.read_at
      })));

      // Update conversations list to reflect read status
      setAllConversations(prev => prev.map(conv => {
        if (conv.recipient_id === selectedUser?.id || conv.sender_id === selectedUser?.id) {
          return {
            ...conv,
            unreadCount: 0
          };
        }
        return conv;
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Update the fetchConversation function to mark messages as read
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
        // Mark messages as read after fetching conversation
        markMessagesAsRead(data);
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

  // Add this function to parse and format message content with mentions
  const formatMessageContent = (content) => {
    // Match @report-{id} or @project-{id}
    const mentionRegex = /@(report|project)-([a-zA-Z0-9-]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      // Add the mention component
      const [fullMatch, type, id] = match;
      parts.push(
        <Button
          key={match.index}
          size="small"
          onClick={() => handleMentionClick(type, id)}
          sx={{
            p: 0,
            minWidth: 'auto',
            textTransform: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            '&:hover': {
              textDecoration: 'underline',
              background: 'none'
            }
          }}
        >
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            {type === 'report' ? <ReportIcon fontSize="small" /> : <ProjectIcon fontSize="small" />}
            {`@${type}-${id}`}
          </Box>
        </Button>
      );

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  // Update the handleMentionClick function
  const handleMentionClick = async (type, id) => {
    try {
      let data;
      if (type === 'report') {
        data = await getReportById(id);
      } else if (type === 'project') {
        const response = await fetch(`${API_URL}/api/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to load project');
        }
        data = await response.json();
      }

      const transformedData = {
        type,
        data: {
          id: data.id,
          title: type === 'report' ? data.title : data.name,
          description: type === 'report' ? data.content : data.description,
          created_at: data.created_at,
          updated_at: data.updated_at,
          status: data.status,
          owner: data.user || data.owner,
          metrics: data.metrics || {},
          attachments: data.attachments || [],
          // Additional fields for reports
          date: type === 'report' ? data.date : null,
          time: type === 'report' ? data.time : null,
          address: type === 'report' ? data.address : null,
          // Additional fields for projects
          start_date: type === 'project' ? data.start_date : null,
          end_date: type === 'project' ? data.end_date : null,
          progress: type === 'project' ? data.progress : null,
          category: type === 'project' ? data.category : null,
          tags: type === 'project' ? data.tags : []
        }
      };

      setMentionedItem(transformedData);
      setMentionDialogOpen(true);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setNotification({
        open: true,
        message: error.message || `Failed to load ${type}. Please try again later.`,
        severity: 'error'
      });
    }
  };

  // Add this function to fetch suggestions
  const fetchMentionSuggestions = async (query) => {
    try {
      const [projectsResponse, reportsResponse] = await Promise.all([
        fetch(`${API_URL}/api/projects?search=${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/reports?search=${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [projects, reports] = await Promise.all([
        projectsResponse.json(),
        reportsResponse.json()
      ]);

      return [
        ...projects.map(p => ({ id: p.id, title: p.name, type: 'project' })),
        ...reports.map(r => ({ id: r.id, title: r.title, type: 'report' }))
      ];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  // Add function to handle message input changes with mention support
  const handleMessageInputChange = async (e) => {
    const value = e.target.value;
    setMessageInput(value);

    // Check for @ symbol
    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1 && lastAtSymbol === value.length - 1) {
      // Show suggestions when @ is typed
      setShowMentionSuggestions(true);
      setMentionSearchQuery('');
      const suggestions = await fetchMentionSuggestions('');
      setMentionSuggestions(suggestions);
      mentionAnchorRef.current = e.target;
    } else if (lastAtSymbol !== -1) {
      // Update suggestions based on what's typed after @
      const query = value.slice(lastAtSymbol + 1);
      setMentionSearchQuery(query);
      const suggestions = await fetchMentionSuggestions(query);
      setMentionSuggestions(suggestions);
      setShowMentionSuggestions(true);
      mentionAnchorRef.current = e.target;
    } else {
      setShowMentionSuggestions(false);
    }
  };

  // Add function to handle mention selection
  const handleMentionSelect = (item) => {
    const lastAtSymbol = messageInput.lastIndexOf('@');
    const newValue = messageInput.slice(0, lastAtSymbol) + `@${item.type}-${item.id} `;
    setMessageInput(newValue);
    setShowMentionSuggestions(false);
  };

  // Add these handlers before the return statement
  const handleMessageMenuOpen = (event, message) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Opening menu for message:', message); // Debug log
    setSelectedMessage(message);
    setMessageMenuAnchor(event.currentTarget);
  };

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
  };

  const handleEditClick = () => {
    console.log('Edit clicked, selected message:', selectedMessage); // Debug log
    if (selectedMessage) {
      setEditMessageContent(selectedMessage.content);
      setEditDialogOpen(true);
      handleMessageMenuClose();
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedMessage) return;
    
    try {
      console.log('Editing message:', selectedMessage.id, editMessageContent); // Debug log
      await editMessage(selectedMessage.id, editMessageContent);
      setConversation(prev => prev.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, content: editMessageContent, edited_at: new Date().toISOString() }
          : msg
      ));
      setEditDialogOpen(false);
      setSelectedMessage(null);
      setEditMessageContent('');
      setNotification({
        open: true,
        message: 'Message edited successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error editing message:', error); // Debug log
      setNotification({
        open: true,
        message: error.message || 'Failed to edit message',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = () => {
    if (selectedMessage) {
      setDeleteConfirmOpen(true);
      handleMessageMenuClose();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMessage) return;

    try {
      await deleteMessage(selectedMessage.id);
      setConversation(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      setDeleteConfirmOpen(false);
      setNotification({
        open: true,
        message: 'Message deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to delete message',
        severity: 'error'
      });
    }
  };

  const handleClearClick = () => {
    setClearConfirmOpen(true);
  };

  const handleClearConfirm = async () => {
    try {
      await clearConversation(selectedUser.id);
      setConversation([]);
      setClearConfirmOpen(false);
      setNotification({
        open: true,
        message: 'Conversation cleared successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, mt: 2 }}>
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
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">
            {selectedUser?.username}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleClearClick}
              size="small"
              title="Clear conversation"
            >
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleCloseMessageDialog}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
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
                    alignItems: 'flex-start',
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
                        fontSize: '0.875rem'
                      }}
                    >
                      {selectedUser?.initials || selectedUser?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      className="message-container"
                      sx={{
                        backgroundColor: isCurrentUser ? 'primary.main' : 'grey.100',
                        color: isCurrentUser ? 'white' : 'text.primary',
                        borderRadius: 2,
                        p: 1.5,
                        position: 'relative',
                        '&:hover .message-menu': {
                          opacity: 1
                        }
                      }}
                    >
                      {isCurrentUser && (
                        <IconButton
                          className="message-menu"
                          size="small"
                          onClick={(e) => handleMessageMenuOpen(e, message)}
                          sx={{
                            position: 'absolute',
                            right: -32,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            color: 'text.secondary',
                            backgroundColor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': {
                              backgroundColor: 'background.paper',
                              color: 'primary.main'
                            }
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {formatMessageContent(message.content)}
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
                      {message.edited_at && ' (edited)'}
                      {message.read_at && isCurrentUser && (
                        <DoneAllIcon 
                          sx={{ 
                            ml: 0.5, 
                            fontSize: '0.875rem',
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
          <TextField
            fullWidth
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
            sx={{ mt: 2 }}
          />
        </DialogContent>

        {/* Message Menu */}
        <Menu
          anchorEl={messageMenuAnchor}
          open={Boolean(messageMenuAnchor)}
          onClose={handleMessageMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiPaper-root': {
              minWidth: 150,
              boxShadow: 2
            }
          }}
        >
          <MenuItem 
            onClick={handleEditClick}
            sx={{
              gap: 1,
              py: 1
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Edit Message</Typography>
          </MenuItem>
          <MenuItem 
            onClick={handleDeleteClick} 
            sx={{ 
              color: 'error.main',
              gap: 1,
              py: 1
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <Typography variant="body2">Delete Message</Typography>
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => {
            setEditDialogOpen(false);
            setEditMessageContent('');
            setSelectedMessage(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Message</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editMessageContent}
              onChange={(e) => setEditMessageContent(e.target.value)}
              sx={{ mt: 2 }}
              autoFocus
              placeholder="Edit your message..."
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setEditDialogOpen(false);
                setEditMessageContent('');
                setSelectedMessage(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              variant="contained"
              disabled={!editMessageContent.trim()}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteConfirmOpen} 
          onClose={() => setDeleteConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Delete Message</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this message? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clear Conversation Dialog */}
        <Dialog open={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)}>
          <DialogTitle>Clear Conversation</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to clear this entire conversation? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleClearConfirm} color="error">Clear</Button>
          </DialogActions>
        </Dialog>
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

      {/* Mention Dialog */}
      <Dialog
        open={mentionDialogOpen}
        onClose={() => setMentionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {mentionedItem?.type === 'report' ? <ReportIcon /> : <ProjectIcon />}
            <Typography>
              {mentionedItem?.type === 'report' ? 'Report Details' : 'Project Details'}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setMentionDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {mentionedItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {mentionedItem.data.title}
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={mentionedItem.data.status || 'Active'} 
                  color={mentionedItem.data.status === 'completed' ? 'success' : 'primary'} 
                  size="small" 
                />
                {mentionedItem.data.owner && (
                  <Typography variant="body2" color="text.secondary">
                    Owner: {mentionedItem.data.owner.username}
                  </Typography>
                )}
              </Box>

              <Typography variant="body1" paragraph>
                {mentionedItem.data.description || 'No description available.'}
              </Typography>

              {mentionedItem.data.metrics && Object.keys(mentionedItem.data.metrics).length > 0 && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(mentionedItem.data.metrics).map(([key, value]) => (
                      <Grid item xs={6} key={key}>
                        <Paper sx={{ p: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {key}
                          </Typography>
                          <Typography variant="body2">
                            {value}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {mentionedItem.data.attachments && mentionedItem.data.attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attachments
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {mentionedItem.data.attachments.map((attachment, index) => (
                      <Chip
                        key={index}
                        icon={<AttachmentIcon />}
                        label={attachment.name}
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Created: {formatDate(mentionedItem.data.created_at)}
                </Typography>
                {mentionedItem.data.updated_at && (
                  <Typography variant="body2" color="text.secondary">
                    Updated: {formatDate(mentionedItem.data.updated_at)}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMentionDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setMentionDialogOpen(false);
              navigate(`/statistics/${mentionedItem.type}s/${mentionedItem.data.id}`);
            }}
            startIcon={mentionedItem?.type === 'report' ? <ReportIcon /> : <ProjectIcon />}
          >
            View Full Details
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
