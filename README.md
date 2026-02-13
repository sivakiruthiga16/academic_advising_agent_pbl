# Academic Advising Agent

A full-stack MERN application for managing academic advising records.

## Features
- **Authentication**: Email-based role-based access control (Admin, Advisor, Student).
- **Intelligent Dashboard**: Tailored views with performance analytics and AI-driven suggestions.
- **Academic Management**: Comprehensive tracking of grades, CGPA, and advisor remarks.
- **Appointment System**: Slot booking and approval workflow for academic consultations.
- **Premium UI**: Modern design system built with Tailwind CSS and Lucide Icons.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Chart.js, Axios, React Router, Lucide Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Security**: JWT Authentication, RBAC Middleware, Bcrypt hashing

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or URI)

## Setup Instructions

### 1. Clone/Download
Open the project directory.

### 2. Backend Setup
Navigate to the server directory:
```bash
cd server
npm install
```
Create a `.env` file (already provided) with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/academic_advising_agent
JWT_SECRET=supersecretkey123
```
Run the server:
```bash
npm run dev
```
(Server usually runs on port 5000)

### 3. Frontend Setup
Navigate to the client directory:
```bash
cd client
npm install
```
Run the development server:
```bash
npm run dev
```
(Frontend usually runs on port 5173)

## Fresh Start & Usage

### 1. Clean Slate
This project has been reset for a fresh start. The database is empty.
To clear the database manually again in the future:
```bash
node server/scripts/dbCleanup.js
```

### 2. Create Users (Manual Registration)
Since the database is empty, you must register the initial users via the frontend.

1. **Start the App**:
   ```bash
   # Terminal 1
   cd server && npm run dev
   # Terminal 2
   cd client && npm run dev
   ```
2. **Access Registration**: Go to [http://localhost:5173/register](http://localhost:5173/register)
3. **Create Admin**:
   - Name: Admin User
   - Email: `admin@agent.com`
   - Role: **Admin**
   - Password: (Your Choice)
4. **Create Advisor**:
   - Name: Advisor User
   - Email: `advisor@agent.com`
   - Role: **Advisor**
5. **Create Student**:
   - Name: Student User
   - Email: `student@agent.com`
   - Role: **Student**

### 3. Login
Access [http://localhost:5173/login](http://localhost:5173/login) and use the credentials you just created.

## Deployment
- **Backend (Render)**: Set up a new Web Service linked to the repo, set Root Directory to `server`. Add Build Command `npm install` and Start Command `node server.js`. Add Env variables.
- **Frontend (Vercel)**: Import project, set Root Directory to `client`. Framework Preset: Vite. Deploy.
