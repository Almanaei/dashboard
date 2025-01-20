import React, { useState } from 'react';
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
  InputBase
} from '@mui/material';
import {
  MoreHoriz as MoreIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Download as ExportIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('M');

  const metrics = [
    { 
      label: 'Sales', 
      value: 5.3, 
      color: '#2196f3',
      dots: [
        { color: '#e0e0e0' },
        { color: '#2196f3' },
        { color: '#e0e0e0' }
      ]
    },
    { 
      label: 'Profit', 
      value: 2.4, 
      color: '#f44336',
      dots: [
        { color: '#e0e0e0' },
        { color: '#f44336' },
        { color: '#e0e0e0' }
      ]
    },
    { 
      label: 'Customer', 
      value: 7.8, 
      color: '#2196f3',
      dots: [
        { color: '#e0e0e0' },
        { color: '#2196f3' },
        { color: '#e0e0e0' }
      ]
    }
  ];

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

  const chartData = {
    labels: generateDateLabels('2023-05-02', '2025-03-15', 50),
    datasets: [
      {
        label: 'Revenues',
        data: Array(50).fill().map(() => Math.random() * 5000 + 12000),
        borderColor: 'rgb(33, 150, 243)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(33, 150, 243, 0.2)');
          gradient.addColorStop(1, 'rgba(33, 150, 243, 0)');
          return gradient;
        },
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        borderWidth: 1.5
      },
      {
        label: 'Expenditures',
        data: Array(50).fill().map(() => Math.random() * 3000 + 8000),
        borderColor: 'rgb(244, 67, 54)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(244, 67, 54, 0.1)');
          gradient.addColorStop(1, 'rgba(244, 67, 54, 0)');
          return gradient;
        },
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        borderWidth: 1.5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
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
          },
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            // Only show the date part for better readability
            const match = label.match(/(Sun|Mon|Tue|Wed|Thu|Fri|Sat) ([A-Za-z]+) (\d+)/);
            return match ? `${match[1]} ${match[2]} ${match[3]}` : '';
          }
        }
      },
      y: {
        min: 0,
        max: 20000,
        position: 'right',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          stepSize: 5000,
          padding: 10,
          color: '#666666',
          font: {
            size: 10
          },
          callback: (value) => {
            return `$${value.toLocaleString()}`;
          }
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
  };

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

  return (
    <Box sx={{ p: 3 }}>
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
                House Spectrum Ltd
              </Typography>
              <Chip
                label="Certified"
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
                JP
              </Typography>
              • Jessica Parker • Edited 7 hrs ago
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 6 }}>
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
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: 0.5
                }}
              >
                {metric.value}
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.875rem',
                    color: '#666666',
                    fontWeight: 400
                  }}
                >
                  / 10
                </Typography>
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Chart Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Consolidated budget</Typography>
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
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 'auto', px: 1 }}
            >
              All
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 'auto', px: 1 }}
            >
              Custom
            </Button>
            <Typography
              variant="caption"
              sx={{ ml: 1, color: 'text.secondary' }}
            >
              $0 - $20,000
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 2, bgcolor: '#2196f3' }} />
            <Typography variant="body2" color="text.secondary">
              Revenues
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 2, bgcolor: '#f44336' }} />
            <Typography variant="body2" color="text.secondary">
              Expenditures
            </Typography>
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <Box sx={{ height: 300, mb: 4 }}>
            <Line data={chartData} options={chartOptions} />
          </Box>

          {/* Timeline indicators */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -20,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              px: 3
            }}
          >
            {timelineEvents.map((event, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: event.active ? 'primary.main' : 'text.secondary',
                    fontSize: '0.75rem'
                  }}
                >
                  {event.icon}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: event.active ? 'primary.main' : 'text.secondary',
                    fontSize: '0.75rem'
                  }}
                >
                  {event.date}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Box>
            <Typography variant="h6" color="primary">
              $13,546
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" color="success.main">
                +24.8%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +$5,413
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" color="error">
              $4,254
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="error">
                -3.4%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                -$2,768
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Deals Table */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<AddIcon />}
            sx={{ ml: 'auto' }}
          >
            Add New
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                startIcon={<FilterIcon />}
                sx={{ color: 'text.secondary' }}
              >
                Filter
              </Button>
              <Button
                size="small"
                startIcon={<SortIcon />}
                sx={{ color: 'text.secondary' }}
              >
                Sort
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  px: 1,
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase placeholder="Search..." />
              </Box>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <IconButton size="small">
                <ExportIcon />
              </IconButton>
            </Box>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <input type="checkbox" />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Deals</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id} hover>
                  <TableCell padding="checkbox">
                    <input type="checkbox" />
                  </TableCell>
                  <TableCell>{String(deal.id).padStart(2, '0')}</TableCell>
                  <TableCell>{deal.name}</TableCell>
              