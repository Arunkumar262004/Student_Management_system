const { Op } = require('sequelize');
const fs     = require('fs');
const path   = require('path');

const { Student, AuditLog } = require('../models');

// Helper: Save an audit log entry
const saveAuditLog = async (req, action, student, changes) => {
  try {
    await AuditLog.create({
      userId:     req.user.id,
      userName:   req.user.name,
      userRole:   req.user.role,
      action:     action,
      entityType: 'Student',
      entityId:   student?.id   || null,
      entityName: student ? `${student.firstName} ${student.lastName}` : null,
      changes:    changes,
      ipAddress:  req.ip,
    });
  } catch (err) {
    console.error('Audit log save failed:', err.message);
  }
};

// GET /api/students — list with search, filter, pagination
const getStudents = async (req, res) => {
  try {
    const page      = parseInt(req.query.page)   || 1;
    const limit     = parseInt(req.query.limit)  || 10;
    const search    = req.query.search    || '';
    const className = req.query.className || '';
    const gender    = req.query.gender    || '';
    const status    = req.query.status    || '';

    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { firstName:  { [Op.iLike]: `%${search}%` } },
        { lastName:   { [Op.iLike]: `%${search}%` } },
        { email:      { [Op.iLike]: `%${search}%` } },
        { rollNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (className) whereConditions.className = className;
    if (gender)    whereConditions.gender    = gender;
    if (status)    whereConditions.status    = status;

    const { count, rows } = await Student.findAndCountAll({
      where:  whereConditions,
      limit:  limit,
      offset: offset,
      order:  [['createdAt', 'DESC']],
    });

    return res.json({
      students: rows,
      pagination: {
        total:      count,
        page:       page,
        limit:      limit,
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Failed to fetch students.', error: error.message });
  }
};

// GET /api/students/:id — single student
const getStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.json(student);

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student.', error: error.message });
  }
};

// POST /api/students — create new student
const createStudent = async (req, res) => {
  try {
    const existingStudent = await Student.findOne({ where: { email: req.body.email } });
    if (existingStudent) {
      return res.status(400).json({ message: 'A student with this email already exists.' });
    }

    const studentData = { ...req.body };

    if (req.file) {
      studentData.photo = `/uploads/${req.file.filename}`;
    }

    const newStudent = await Student.create(studentData);

    await saveAuditLog(req, 'CREATE', newStudent, { created: studentData });

    return res.status(201).json(newStudent);

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Failed to create student.', error: error.message });
  }
};

// PUT /api/students/:id — update student
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const oldData    = student.toJSON();
    const updateData = { ...req.body };

    // If new photo uploaded, delete old photo file
    if (req.file) {
      if (student.photo) {
        const oldPhotoPath = path.join(__dirname, '../', student.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    await student.update(updateData);

    await saveAuditLog(req, 'UPDATE', student, {
      before: oldData,
      after:  updateData,
    });

    return res.json(student);

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Failed to update student.', error: error.message });
  }
};

// DELETE /api/students/:id — delete student
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const deletedData = student.toJSON();

    // Delete photo file if exists
    if (student.photo) {
      const photoPath = path.join(__dirname, '../', student.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await student.destroy();

    await saveAuditLog(
      req,
      'DELETE',
      { id: req.params.id, firstName: deletedData.firstName, lastName: deletedData.lastName },
      { deleted: deletedData }
    );

    return res.json({ message: 'Student deleted successfully.' });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Failed to delete student.', error: error.message });
  }
};

// GET /api/students/classes — unique class names list
const getClasses = async (req, res) => {
  try {
    const classes = await Student.findAll({
      attributes: ['className'],
      group:      ['className'],
      order:      [['className', 'ASC']],
    });

    return res.json(classes.map((c) => c.className));

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch classes.', error: error.message });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getClasses,
};