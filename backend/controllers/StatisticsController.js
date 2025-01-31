import { sequelize } from '../config/database.js';
import { Project, User, Report } from '../models/index.js';
import { Op } from 'sequelize';
import { format } from 'date-fns';

// Get project overview statistics
export const getProjectStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total projects count by status
    const statusCount = await Project.findAll({
      where: { created_by: userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get total projects count by priority
    const priorityCount = await Project.findAll({
      where: { created_by: userId },
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });

    // Get total budget allocation
    const budgetStats = await Project.findAll({
      where: { created_by: userId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('budget')), 'totalBudget'],
        [sequelize.fn('AVG', sequelize.col('budget')), 'averageBudget']
      ]
    });

    // Get projects timeline stats
    const timelineStats = await Project.findAll({
      where: { 
        created_by: userId,
        start_date: { [Op.not]: null },
        end_date: { [Op.not]: null }
      },
      attributes: [
        [sequelize.fn('MIN', sequelize.col('start_date')), 'earliestStart'],
        [sequelize.fn('MAX', sequelize.col('end_date')), 'latestEnd'],
        [sequelize.fn('AVG', 
          sequelize.fn('EXTRACT', 'epoch', 
            sequelize.fn('AGE', sequelize.col('end_date'), sequelize.col('start_date'))
          )
        ), 'averageDuration']
      ]
    });

    res.json({
      overview: {
        byStatus: statusCount,
        byPriority: priorityCount
      },
      budget: {
        total: parseFloat(budgetStats[0].dataValues.totalBudget) || 0,
        average: parseFloat(budgetStats[0].dataValues.averageBudget) || 0
      },
      timeline: {
        earliestStart: timelineStats[0].dataValues.earliestStart,
        latestEnd: timelineStats[0].dataValues.latestEnd,
        averageDurationDays: Math.round(timelineStats[0].dataValues.averageDuration / (24 * 3600)) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get project trends
export const getProjectTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'M', start_date, end_date } = req.query;
    const endDate = end_date ? new Date(end_date) : new Date();
    let startDate = start_date ? new Date(start_date) : new Date(endDate);
    let truncPeriod;

    // Set truncation based on period
    switch (period) {
      case 'D':
        truncPeriod = 'day';
        break;
      case 'Y':
        truncPeriod = 'month';
        break;
      default: // 'M'
        truncPeriod = 'month';
    }

    // Get project trends
    const projectTrends = await Project.findAll({
      where: {
        created_by: userId,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn('date_trunc', truncPeriod, sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'projectCount']
      ],
      group: [sequelize.fn('date_trunc', truncPeriod, sequelize.col('created_at'))],
      order: [[sequelize.fn('date_trunc', truncPeriod, sequelize.col('created_at')), 'ASC']]
    });

    // Get report trends
    const reportTrends = await Report.findAll({
      where: {
        user_id: userId,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn('date_trunc', truncPeriod, sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'reportCount']
      ],
      group: [sequelize.fn('date_trunc', truncPeriod, sequelize.col('created_at'))],
      order: [[sequelize.fn('date_trunc', truncPeriod, sequelize.col('created_at')), 'ASC']]
    });

    // Generate all dates in the range
    const allDates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate));
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

    // Create a map for all dates with zero counts
    const trendsMap = new Map();
    allDates.forEach(date => {
      const formattedDate = format(date, period === 'D' ? 'yyyy-MM-dd' : period === 'M' ? 'yyyy-MM' : 'yyyy');
      trendsMap.set(formattedDate, {
        date: date.toISOString(),
        projectCount: 0,
        reportCount: 0
      });
    });

    // Add project counts
    projectTrends.forEach(trend => {
      const date = trend.getDataValue('date');
      const formattedDate = format(date, period === 'D' ? 'yyyy-MM-dd' : period === 'M' ? 'yyyy-MM' : 'yyyy');
      const count = parseInt(trend.getDataValue('projectCount'), 10) || 0;
      if (trendsMap.has(formattedDate)) {
        trendsMap.get(formattedDate).projectCount = count;
      }
    });

    // Add report counts
    reportTrends.forEach(trend => {
      const date = trend.getDataValue('date');
      const formattedDate = format(date, period === 'D' ? 'yyyy-MM-dd' : period === 'M' ? 'yyyy-MM' : 'yyyy');
      const count = parseInt(trend.getDataValue('reportCount'), 10) || 0;
      if (trendsMap.has(formattedDate)) {
        trendsMap.get(formattedDate).reportCount = count;
      }
    });

    // Convert map to array and sort by date
    const formattedTrends = Array.from(trendsMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(formattedTrends);
  } catch (error) {
    console.error('Error getting project trends:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get project performance metrics
export const getProjectPerformance = async (req, res) => {
  try {
    const userId = req.user.id;

    // Calculate completion rate
    const totalProjects = await Project.count({
      where: { created_by: userId }
    });

    const completedProjects = await Project.count({
      where: { 
        created_by: userId,
        status: 'completed'
      }
    });

    // Calculate on-time completion rate
    const onTimeProjects = await Project.count({
      where: {
        created_by: userId,
        status: 'completed',
        end_date: {
          [Op.lte]: sequelize.col('updatedAt')
        }
      }
    });

    // Get average project duration by priority
    const durationByPriority = await Project.findAll({
      where: {
        created_by: userId,
        status: 'completed',
        start_date: { [Op.not]: null },
        end_date: { [Op.not]: null }
      },
      attributes: [
        'priority',
        [sequelize.fn('AVG',
          sequelize.fn('EXTRACT', 'epoch',
            sequelize.fn('AGE', sequelize.col('end_date'), sequelize.col('start_date'))
          )
        ), 'averageDuration']
      ],
      group: ['priority']
    });

    res.json({
      completion: {
        total: totalProjects,
        completed: completedProjects,
        completionRate: totalProjects ? (completedProjects / totalProjects) * 100 : 0,
        onTimeCompletionRate: completedProjects ? (onTimeProjects / completedProjects) * 100 : 0
      },
      duration: {
        byPriority: durationByPriority.map(item => ({
          priority: item.priority,
          averageDurationDays: Math.round(item.dataValues.averageDuration / (24 * 3600))
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error('No user found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    console.log('Getting stats for user:', { userId, isAdmin });

    // Get projects count
    const projectCount = await Project.count({
      where: isAdmin ? {} : { created_by: userId }
    });

    // Get reports count
    const reportCount = await Report.count({
      where: isAdmin ? {} : { user_id: userId }
    });

    // Get users count (only for admin)
    const userCount = isAdmin ? await User.count() : 0;

    console.log('Dashboard stats:', { projectCount, reportCount, userCount });

    res.json({
      projectCount,
      reportCount,
      userCount
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    console.log('Fetching user statistics...');
    
    // Check if user is authenticated and is admin
    if (!req.user || !req.user.id) {
      console.error('No user found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortField = req.query.sortField || 'username';
    const sortOrder = req.query.sortOrder || 'asc';

    // Build where clause
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count of filtered users
    const totalUsers = await User.count({ where: whereClause });

    // Get users with pagination and sorting
    const users = await User.findAll({
      attributes: [
        'id',
        'username',
        'email',
        'initials',
        'last_login'
      ],
      where: whereClause,
      order: [
        [
          sortField === 'lastActive' ? 'last_login' : sortField,
          sortOrder.toUpperCase()
        ]
      ],
      limit,
      offset
    });

    // Get project counts for filtered users
    const projectCounts = await Project.findAll({
      attributes: [
        'created_by',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_by: users.map(user => user.id)
      },
      group: ['created_by']
    });

    // Get report counts for filtered users
    const reportCounts = await Report.findAll({
      attributes: [
        'user_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        user_id: users.map(user => user.id)
      },
      group: ['user_id']
    });

    // Create maps for quick lookup
    const projectCountMap = new Map(
      projectCounts.map(p => [p.created_by, parseInt(p.get('count'))])
    );
    const reportCountMap = new Map(
      reportCounts.map(r => [r.user_id, parseInt(r.get('count'))])
    );

    // Combine the data
    const formattedStats = users.map(user => {
      const plainUser = user.get({ plain: true });
      return {
        id: plainUser.id,
        username: plainUser.username,
        email: plainUser.email,
        initials: plainUser.initials,
        last_login: plainUser.last_login,
        projectCount: projectCountMap.get(plainUser.id) || 0,
        reportCount: reportCountMap.get(plainUser.id) || 0
      };
    });

    // Sort by counts if needed
    if (sortField === 'projectCount' || sortField === 'reportCount') {
      formattedStats.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    console.log(`Found ${formattedStats.length} users with statistics`);

    // Return pagination metadata along with the data
    res.json({
      users: formattedStats,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Error getting user statistics:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: error.message });
  }
};
