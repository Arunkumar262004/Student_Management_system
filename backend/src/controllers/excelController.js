const ExcelJS = require('exceljs');
const fs = require('fs');

const { Student, AuditLog } = require('../models');

// Helper: Save audit log
const saveAuditLog = async (req, action, changes) => {
  try {
    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: action,
      entityType: 'Student',
      entityId: null,
      entityName: null,
      changes: changes,
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

// GET /api/students/export
const exportStudents = async (req, res) => {
  try {
    const allStudents = await Student.findAll({
      order: [['createdAt', 'DESC']],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    // Define columns
    worksheet.columns = [
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Class', key: 'className', width: 12 },
      { header: 'Roll Number', key: 'rollNumber', width: 14 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Parent Name', key: 'parentName', width: 20 },
      { header: 'Parent Phone', key: 'parentPhone', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };

    // Add data rows
    allStudents.forEach((student) => {
      worksheet.addRow({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        className: student.className,
        rollNumber: student.rollNumber,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        status: student.status,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Export failed.', error: error.message });
  }
};

// POST /api/students/import
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No Excel file uploaded.' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);

    // ── 1. Check required columns from header row ─────────────────────────────
    const headerRow = worksheet.getRow(1);
    const requiredColumns = [
      { index: 1, name: 'First Name' },
      { index: 2, name: 'Last Name' },
      { index: 3, name: 'Email' },
      { index: 5, name: 'Gender' },
      { index: 6, name: 'Class' },
    ];

    const missingColumns = requiredColumns.filter(
      (col) => !headerRow.getCell(col.index).value?.toString()?.trim()
    );

    if (missingColumns.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        errorType: 'MISSING_COLUMNS',
        message: `Import blocked. Missing required column(s): ${missingColumns.map((c) => `"${c.name}"`).join(', ')}. Please fix your file and try again.`,
        missingColumns: missingColumns.map((c) => c.name),
      });
    }

    // ── 2. Validate & collect rows ────────────────────────────────────────────
    const validRows = [];
    const rowErrors = [];
    const skippedEmails = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const firstName = row.getCell(1).value?.toString()?.trim();
      const lastName = row.getCell(2).value?.toString()?.trim();
      const email = row.getCell(3).value?.toString()?.trim();
      const phone = row.getCell(4).value?.toString()?.trim();
      const gender = row.getCell(5).value?.toString()?.toLowerCase()?.trim();
      const className = row.getCell(6).value?.toString()?.trim();
      const rollNumber = row.getCell(7).value?.toString()?.trim();
      const dateOfBirth = row.getCell(8).value;
      const address = row.getCell(9).value?.toString()?.trim();
      const parentName = row.getCell(10).value?.toString()?.trim();
      const parentPhone = row.getCell(11).value?.toString()?.trim();
      const status = row.getCell(12).value?.toString()?.toLowerCase()?.trim() || 'active';

      const missingFields = [];
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!email) missingFields.push('email');
      if (!gender) missingFields.push('gender');
      if (!className) missingFields.push('className');

      if (missingFields.length) {
        rowErrors.push({ row: rowNumber, message: `Missing fields: ${missingFields.join(', ')}` });
        return;
      }

      if (!['male', 'female', 'other'].includes(gender)) {
        rowErrors.push({ row: rowNumber, message: `Invalid gender: "${gender}"` });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        rowErrors.push({ row: rowNumber, message: `Invalid email: "${email}"` });
        return;
      }

      validRows.push({ firstName, lastName, email, phone, gender, className, rollNumber, dateOfBirth, address, parentName, parentPhone, status });
    });

    // ── 3. Block entire import if any row has errors ──────────────────────────
    if (rowErrors.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        errorType: 'ROW_ERRORS',
        message: `Import blocked. ${rowErrors.length} row(s) contain errors. Fix them and re-upload.`,
        rowErrors,
      });
    }

    // ── 4. Insert valid rows ──────────────────────────────────────────────────
    let createdCount = 0;

    for (const studentData of validRows) {
      const alreadyExists = await Student.findOne({ where: { email: studentData.email } });
      if (alreadyExists) { skippedEmails.push(studentData.email); continue; }
      await Student.create(studentData);
      createdCount++;
    }

    fs.unlinkSync(req.file.path);

    await saveAuditLog(req, 'IMPORT', {
      created: createdCount,
      skipped: skippedEmails.length,
      errors: rowErrors.length,
    });

    return res.json({
      success: true,
      message: `Import complete: ${createdCount} created, ${skippedEmails.length} skipped (duplicate email).`,
      created: createdCount,
      skippedEmails,
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed.', error: error.message });
  }
};

module.exports = { exportStudents, importStudents };