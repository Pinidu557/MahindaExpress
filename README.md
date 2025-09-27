# Mahinda Express - Staff Management System

A comprehensive staff management system for Mahinda Express bus company, built with React frontend and Node.js backend.

## 🚀 Features

### Staff Management
- ✅ Create, read, update, and delete staff members
- ✅ Staff profile management with detailed information
- ✅ Role-based staff categorization (Driver, Conductor, Admin, etc.)
- ✅ Bus assignment functionality

### Attendance Tracking
- ✅ Mark attendance (Present/Absent) for staff members
- ✅ View attendance history and records
- ✅ Real-time attendance tracking

### Payroll Management
- ✅ Calculate salaries based on attendance
- ✅ Automatic deduction calculations
- ✅ Monthly payroll reports
- ✅ Salary management per staff member

### Reports & Analytics
- ✅ Comprehensive staff reports
- ✅ Attendance analytics
- ✅ Performance metrics
- ✅ Export functionality (PDF, Excel)

### Dashboard
- ✅ Real-time statistics
- ✅ Staff overview
- ✅ Quick actions and navigation

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MahindaExpress-main
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
# Create .env file in backend directory
touch .env
```

Add the following content to `.env`:
```env
# Database Configuration - MongoDB Atlas
MONGO_URI=mongodb+srv://mahindaexpress:mahindaexpress123@cluster0.i06s51c.mongodb.net/MahindaExpress

# Server Configuration
PORT=4000

# JWT Secret (for future authentication)
JWT_SECRET=your_jwt_secret_key_here

# Environment
NODE_ENV=development
```

Start the backend server:
```bash
# Development mode with auto-restart
npm run server

# Or production mode
npm start
```

The backend will be running on `http://localhost:4000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
# Create .env file in frontend directory
touch .env
```

Add the following content to `.env`:
```env
VITE_API_URL=http://localhost:4000
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## 🗄️ Database Setup

### MongoDB Installation

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 📱 Usage

### 1. Access the Application
Open your browser and navigate to `http://localhost:5173`

### 2. Dashboard
- View real-time statistics
- Quick access to all features
- Staff overview and management

### 3. Staff Management
- **Add Staff**: Click "Create Staff" to add new team members
- **View Staff**: Browse all staff members in the staff list
- **Edit Staff**: Click on staff members to view/edit details
- **Assign Buses**: Assign buses to staff members

### 4. Attendance
- **Mark Attendance**: Select staff member and mark present/absent
- **View Records**: See recent attendance records
- **Track History**: View detailed attendance history

### 5. Payroll
- **View Payroll**: See calculated salaries and deductions
- **Monthly Reports**: Filter by month and view payroll details
- **Export Data**: Export payroll information

### 6. Reports
- **Staff Reports**: Comprehensive staff performance reports
- **Filter Data**: Filter by role, bus, or other criteria
- **Export Reports**: Export to PDF or Excel

## 🔧 API Endpoints

### Staff Management
- `GET /staff` - Get all staff members
- `POST /staff` - Create new staff member
- `GET /staff/:id` - Get staff member by ID
- `PUT /staff/:id` - Update staff member
- `DELETE /staff/:id` - Delete staff member

### Attendance
- `PUT /staff/attendance/:id` - Mark attendance for staff member

### Bus Assignment
- `PUT /staff/assign/:id` - Assign bus to staff member

### Reports
- `GET /staff/report/all` - Get comprehensive staff reports

## 🎨 UI Components

### Design System
- **Premium Glass Effect**: Modern glassmorphism design
- **Gradient Backgrounds**: Beautiful gradient color schemes
- **Responsive Design**: Mobile-first responsive layout
- **Smooth Animations**: CSS transitions and animations
- **Custom Components**: Reusable UI components

### Color Palette
- **Primary**: Ocean blue tones
- **Accent**: Purple/violet tones
- **Success**: Green tones
- **Warning**: Orange tones
- **Error**: Red tones

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use cloud MongoDB service
2. Update `MONGO_URI` in environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Set `NODE_ENV=production`

### Frontend Deployment
1. Build the production version:
   ```bash
   npm run build
   ```
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages
3. Update `VITE_API_URL` to point to your deployed backend

## 🔒 Security Features

- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and logging
- **Environment Variables**: Secure configuration management

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify MongoDB service status

2. **CORS Errors**
   - Check backend CORS configuration
   - Verify frontend API URL
   - Ensure both servers are running

3. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing processes using the port
   - Use different ports for frontend/backend

4. **Dependencies Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Check Node.js version compatibility

## 📝 Development

### Project Structure
```
MahindaExpress-main/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── Routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── page/
│   │   ├── lib/
│   │   └── styles/
│   └── public/
└── README.md
```

### Adding New Features
1. Create new components in `frontend/src/components/`
2. Add new routes in `backend/Routes/`
3. Create controllers in `backend/controllers/`
4. Update models in `backend/models/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Mahinda Express Staff Management System** - Streamlining bus company operations with modern technology.
