# 🌾 AgriMaster

A smart agriculture web platform built to help farmers detect crop diseases and connect with agricultural experts.

## 📖 About

AgriMaster is a student-built MERN stack application designed to support farmers through technology. The platform allows farmers to share crop issues, get expert advice, and access agricultural insights. Future updates will include AI-powered disease detection and predictive analytics.

## 🛠 Tech Stack

- **Frontend:** React.js with Vite
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + OTP (via Twilio/MSG91)
- **File Upload:** Multer
- **Deployment:** Local server (cloud deployment planned)

## ✨ Features

### Current Features
- **OTP-based Authentication** - Phone number login for farmers
- **Role-based Access Control** - User, Expert, and Admin roles
- **Community Posts** - Share crop issues with text, images, or videos
- **Expert Verification** - Verified responses from agricultural experts
- **Post Interactions** - Comments and engagement on community posts

### Planned Features
- **AI Disease Detection** - CNN models for crop disease identification
- **Outbreak Prediction** - LSTM models using weather and soil data
- **Farming Dashboard** - Real-time insights and weather alerts

## 🏗 Project Structure

```
agrimaster/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── README.md
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/agrimaster.git
   cd agrimaster
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agrimaster
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## 👥 User Roles

- **User** - Default role, can create posts and interact with community
- **Expert** - Can verify posts and provide expert advice
- **Admin** - Can moderate content and manage user roles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Team

Built by computer science students as a mini-project to demonstrate MERN stack development and explore agricultural technology solutions.