import { sequelize } from '../config/database.js';
import Project from '../models/Project.js';
import { Op } from 'sequelize';

// Get project overview statistics
export const getProjectStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get total projects count by status
    const statusCount = await Project.findAll({
      where: { createdBy: userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get total projects count by priority
    const priorityCount = await Project.findAll({
      where: { createdBy: userId },
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });

    // Get total budget allocation
    const budgetStats = await Project.findAll({
      where: { createdBy: userId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('budget')), 'totalBudget'],
        [sequelize.fn('AVG', sequelize.col('budget')), 'averageBudget']
      ]
    });

    // Get projects timeline stats
    const timelineStats = await Project.findAll({
      where: { 
        createdBy: userId,
        startDate: { [Op.not]: null },
        endDate: { [Op.not]: null }
      },
      attributes: [
        [sequelize.fn('MIN', sequelize.col('startDate')), 'earliestStart'],
        [sequelize.fn('MAX', sequelize.col('endDate')), 'latestEnd'],
        [sequelize.fn('AVG', 
          sequelize.fn('EXTRACT', 'epoch', 
            sequelize.fn('AGE', sequelize.col('endDate'), sequelize.col('startDate'))
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
    const userId = req.user.userId;
    const { period = 'month', startDate, endDate } = req.query;

    let dateFormat;
    let interval;

    switch (period) {
      case 'week':
        dateFormat = 'YYYY-WW';
        interval = '1 week';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        interval = '1 month';
        break;
      case 'quarter':
        dateFormat = 'YYYY-Q';
        interval = '3 months';
        break;
      default:
        dateFormat = 'YYYY-MM';
        interval = '1 month';
    }

    const trends = await Project.findAll({
      where: {
        createdBy: userId,
        createdAt: {
          [Op.between]: [
            startDate || new Date(new Date().setMonth(new Date().getMonth() - 12)),
            endDate || new Date()
          ]
        }
      },
      attributes: [
        [sequelize.fn('date_trunc', period, sequelize.col('createdAt')), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'projectCount'],
        [sequelize.fn('SUM', sequelize.col('budget')), 'totalBudget']
      ],
      group: [sequelize.fn('date_trunc', period, sequelize.col('createdAt'))],
      order: [[sequelize.fn('date_trunc', period, sequelize.col('createdAt')), 'ASC']]
    });

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get project performance metrics
export const getProjectPerformance = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Calculate completion rate
    const totalProjects = await Project.count({
      where: { createdBy: userId }
    });

    const completedProjects = await Project.count({
      where: { 
        createdBy: userId,
        status: 'completed'
      }
    });

    // Calculate on-time completion rate
    const onTimeProjects = await Project.count({
      where: {
        createdBy: userId,
        status: 'completed',
        endDate: {
          [Op.lte]: sequelize.col('updatedAt')
        }
      }
    });

    // Get average project duration by priority
    const durationByPriority = await Project.findAll({
      where: {
        createdBy: userId,
        status: 'completed',
        startDate: { [Op.not]: null },
        endDate: { [Op.not]: null }
      },
      attributes: [
        'priority',
        [sequelize.fn('AVG',
          sequelize.fn('EXTRACT', 'epoch',
            sequelize.fn('AGE', sequelize.col('endDate'), sequelize.col('startDate'))
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
