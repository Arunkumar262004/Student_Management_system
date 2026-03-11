const { fn, col } = require('sequelize');

const { Student } = require('../models');

// GET /api/students/dashboard
const getDashboard = async (req, res) => {
  try {
    // Total counts
    const totalStudents    = await Student.count();
    const activeStudents   = await Student.count({ where: { status: 'active'   } });
    const inactiveStudents = await Student.count({ where: { status: 'inactive' } });

    // Students per class (for bar chart)
    const byClass = await Student.findAll({
      attributes: [
        'className',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['className'],
      order: [['className', 'ASC']],
    });

    // Students per gender (for pie chart)
    const byGender = await Student.findAll({
      attributes: [
        'gender',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['gender'],
    });

    // Last 5 added students
    const recentStudents = await Student.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return res.json({
      counts: {
        total:    totalStudents,
        active:   activeStudents,
        inactive: inactiveStudents,
        classes:  byClass.length,
      },
      byClass: byClass.map((item) => ({
        class: item.className,
        count: parseInt(item.dataValues.count),
      })),
      byGender: byGender.map((item) => ({
        gender: item.gender,
        count:  parseInt(item.dataValues.count),
      })),
      recentStudents: recentStudents,
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard.', error: error.message });
  }
};

module.exports = { getDashboard };