<!-- 1.========================== Project Description -->

Student Management System

The Student Management System is a web-based application developed to efficiently manage student information and administrative tasks. The system includes secure login and registration functionality where users can authenticate using their credentials. After login, users are redirected to a dashboard that provides an overview of important statistics such as the total number of students, active and inactive students, and the male-to-female student ratio. The dashboard also includes visual analytics like class-wise pie charts to better understand student distribution.

The application provides a student list section where administrators can view and manage all student records. The system supports importing and exporting student data, allowing administrators to easily upload bulk student details or download records for reporting purposes. In addition, administrators can manually add new students to the system.

Role-based access control is implemented so that only administrators have permission to create, update, and delete student records. The system also includes an activity log feature that records actions performed by users, such as creating, updating, or deleting student records, along with descriptions for auditing and tracking purposes.

Overall, the system helps streamline student data management while providing analytics, data import/export capabilities, and secure user management.


<!-- 2 .==================================== Setup instructions ==================================== -->
================================================================
Prerequisites — Installd These Softwares
================================================================

1. Node.js   → https://nodejs.org (LTS version)
2. PostgreSQL → https://www.postgresql.org/download/windows
3. VS Code   → https://code.visualstudio.com

================================================================
STEP 1 —  Project Folders
================================================================

Open terminal in VS Code and run:

    mkdir student-management-system
    cd student-management-system
    mkdir backend
    cd backend
    npm init -y
    mkdir -p src/config src/controllers src/middleware src/models src/routes src/seeders src/uploads

================================================================
STEP 2 — Installed Backend Packages
================================================================

    npm install express cors dotenv bcryptjs jsonwebtoken express-validator sequelize pg pg-hstore multer exceljs uuid
    npm install -D nodemon

================================================================
STEP 3 —  Frontend Setup
================================================================

    cd ..
    npm create vite@latest frontend -- --template react
    cd frontend
    npm install
    npm install @reduxjs/toolkit react-redux @tanstack/react-query @tanstack/react-query-devtools axios react-router-dom react-hot-toast recharts react-hook-form date-fns bootstrap bootstrap-icons @popperjs/core
    mkdir -p src/components/layout src/pages src/services src/store

================================================================
STEP 4 — Fix PostgreSQL Password (One Time Only)
================================================================
Installed Postgresql Software 

and opend this url then added below cmd code for create databse 
   --- cd "C:\Program Files\PostgreSQL\18\bin"
   --- psql -U postgres
    --- CREATE DATABSE student_management

================================================================
STEP 5 — backend/.env created for add db configuration and jwt secret key added 
================================================================

PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_management
DB_USER=postgres
DB_PASSWORD=9578

JWT_SECRET=supersecretjwtkey123
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=5242880

NOTE: DB_PASSWORD must match your actual PostgreSQL password

================================================================
STEP 6 — Backend File Structure
================================================================

backend/
├── .env
├── package.json
└── src/
    ├── server.js
    ├── config/
    │   └── database.js
    ├── models/
    │   ├── User.js
    │   ├── Student.js
    │   ├── AuditLog.js
    │   └── index.js
    ├── middleware/
    │   ├── auth.js
    │   └── upload.js
    ├── controllers/
    │   ├── authController.js
    │   ├── studentController.js
    │   ├── dashboardController.js
    │   ├── excelController.js
    │   └── auditController.js
    ├── routes/
    │   ├── auth.js
    │   ├── students.js
    │   └── audit.js
    └── seeders/
        └── seed.js

================================================================
STEP 7 — Frontend File Structure
================================================================

frontend/
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── store/
    │   ├── index.js
    │   └── authSlice.js
    ├── services/
    │   └── api.js
    ├── components/
    │   └── layout/
    │       └── Layout.jsx
    └── pages/
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── DashboardPage.jsx
        ├── StudentsPage.jsx
        ├── StudentFormPage.jsx
        ├── StudentDetailPage.jsx
        └── AuditLogsPage.jsx

================================================================
STEP 8 — Run The App
================================================================

--- Terminal 1: Backend ---

    cd backend
    npm run seed
    npm run dev

You should see:
     Database connected
     Database tables synced
     Server running at http://localhost:5000

--- Terminal 2: Frontend ---

    cd frontend
    npm run dev

You should see:
    VITE ready at http://localhost:5173

================================================================
STEP 9 — Open in Browser
================================================================

    http://localhost:5173


For localhost Every time you want to run the project:

Terminal 1:
    cd backend
    npm run dev

Terminal 2:
    cd frontend
    npm run dev


================================================================
LOGIN CREDENTIALS
================================================================
Terminal 3:
    cd backend
    npm run seed

Run this seed For Access This Login Credentials 

Role      Email                    Password
-------   ----------------------   ----------
Admin     admin@school.com         admin123
Teacher   teacher@school.com       teacher123



NOTE: npm run seed is only needed ONCE (first time setup)
      Do NOT run seed again or it will reset all your data

================================================================

<!-- 2.1 ===================== For Your System Setup ===================== -->

Git pull the code by below cmd code:
1. git init
2. git checkout -b main
3. git remote add origin https://github.com/Arunkumar262004/Student_Management_system.git
4. git pull origin main

after this open the vscode Editor 
do this 
--------- cd/frontend
          |-- npm run dev 
---------- cd/backend
          |--- npm run dev
          |-- npm run deed (Login Creation)


<!-- 3 List of Implented Modules  -->
Student Management System – Modules

1. Authentication Module
   This module handles user authentication and security. It includes login and registration functionality where users can access the system using their credentials. Authentication ensures that only authorized users can access the application.

2. Dashboard Module
   The dashboard provides an overview of student data using statistics and visual analytics. It displays total students, active students, inactive students, male and female ratios, and class-wise distribution through pie charts.

3. Student Management Module
   This module allows administrators to manage student records. Admin users can create new student entries, update student information, and delete student records when necessary.

4. Student List Module
   The student list section displays all student details in a structured format. Users can search, view, and manage students easily from this page.

5. Import and Export Module
   This module allows administrators to import student data in bulk and export existing student records for reporting or backup purposes.

6. Activity Log Module
   The system maintains logs for important actions performed by users. It records who created, updated, or deleted student records along with descriptions, helping maintain transparency and audit tracking.

7. Role-Based Access Control Module
   This module ensures that only administrators have permission to perform sensitive operations like creating, updating, and deleting student records.

8.  Photo Upload — Admin can upload a profile photo for each student. Photos are stored on the server and displayed throughout the application.


<!-- 4.---------------- List of implemented features --------------------- -->


<!-- 4.1 BACKEND PACKAGES (installed in /backend) -->

- express               — Web server and API routing
- cors                  — Allow frontend to talk to backend
- dotenv                — Load environment variables from .env file
- bcryptjs              — Hash and compare passwords securely
- jsonwebtoken          — Create and verify JWT tokens for auth
- express-validator     — Validate request body fields
- sequelize             — ORM to interact with PostgreSQL using JS
- pg                    — PostgreSQL driver for Node.js
- pg-hstore             — Serialize/deserialize hstore data for pg
- multer                — Handle file uploads (photos, excel)
- exceljs               — Read and write Excel .xlsx files
- uuid                  — Generate unique IDs
- nodemon — Auto restart server on file change

<!-- 4.2 FRONTEND PACKAGES (installed in /frontend) -->

- @reduxjs/toolkit      — Global state management (auth, user)
- react-redux           — Connect Redux store to React components
- @tanstack/react-query           — Fetch, cache, sync server data
- @tanstack/react-query-devtools  — Debug React Query in browser
--- Routing ---
- react-router-dom      — Client side routing and navigation
--- Api ---
- axios                 — Make HTTP requests to backend API
--- Forms ---
- react-hook-form       — Form state, validation, submission
- bootstrap             — CSS framework for layout and components
- bootstrap-icons       — Icon library for Bootstrap
- @popperjs/core        — Tooltip and dropdown positioning (Bootstrap needs this)
- recharts              — Bar chart and Pie chart on dashboard
- react-hot-toast       — Toast popup notifications (success/error)
- date-fns              — Format dates like "March 12, 2026"

--- Build Tool ---
- vite (built-in)       — Fast development server and bundler
- @vitejs/plugin-react  — Vite plugin to support React and