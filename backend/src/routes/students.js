const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');

const { authenticate, authorize } = require('../middleware/auth');
const uploadPhoto                 = require('../middleware/upload');

const studentController   = require('../controllers/studentController');
const dashboardController = require('../controllers/dashboardController');
const excelController     = require('../controllers/excelController');

const router = express.Router();

// ── Excel upload config (temp folder for .xlsx files) ────────────────────────
const tempUploadDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempUploadDir),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}.xlsx`),
});

const excelFileFilter = (req, file, cb) => {
  const isExcel = /xlsx|xls/.test(path.extname(file.originalname).toLowerCase());
  if (isExcel) cb(null, true);
  else cb(new Error('Only Excel files are allowed.'));
};

const uploadExcel = multer({ storage: excelStorage, fileFilter: excelFileFilter });
// ─────────────────────────────────────────────────────────────────────────────

// All routes require login
router.use(authenticate);

// Dashboard stats
router.get('/dashboard', dashboardController.getDashboard);

// Class list (dropdown)
router.get('/classes', studentController.getClasses);

// Export all students to Excel (any role)
router.get('/export', excelController.exportStudents);

// Import students from Excel (admin only)
router.post('/import', authorize('admin'), uploadExcel.single('file'), excelController.importStudents);

// List students with filters + pagination (any role)
router.get('/', studentController.getStudents);

// View single student (any role)
router.get('/:id', studentController.getStudent);

// Create student (admin only)
router.post('/', authorize('admin'), uploadPhoto.single('photo'), studentController.createStudent);

// Update student (admin only)
router.put('/:id', authorize('admin'), uploadPhoto.single('photo'), studentController.updateStudent);

// Delete student (admin only)
router.delete('/:id', authorize('admin'), studentController.deleteStudent);

module.exports = router;