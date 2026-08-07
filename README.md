# 🚑 DSRS-VANET
### Disaster Smart Rescue System using VANET

A smart disaster response and emergency rescue management system that leverages **Vehicular Ad-hoc Networks (VANET)**, **AI-assisted decision support**, and **offline synchronization** to improve emergency response time by intelligently dispatching ambulances and recommending hospitals.

---

## 📌 Project Overview

DSRS-VANET is designed to support emergency management authorities by:

- Detecting and managing emergency incidents.
- Selecting the nearest available ambulance.
- Recommending the most suitable hospital.
- Managing rescue missions in real time.
- Working even during network failures using offline synchronization.
- Providing a real-time dashboard for monitoring operations.

---

# ✨ Features

## 🔐 Authentication
- User Registration
- User Login
- JWT Authentication
- Password Hashing (Passlib + bcrypt)
- Protected APIs

---

## 🚨 Emergency Management
- Create Emergency
- View Emergencies
- Update Emergency
- Delete Emergency

---

## 🚑 Ambulance Management
- Add Ambulance
- Update Status
- Track Ambulances
- Delete Ambulance

---

## 🏥 Hospital Management
- Add Hospital
- Update Hospital
- Hospital Availability
- Delete Hospital

---

## 📋 Mission Management
- Mission Creation
- Mission Assignment
- Mission Tracking
- Mission Completion

---

## 🤖 AI Decision Engine

The AI module provides:

- Emergency Priority Assessment
- Nearest Ambulance Recommendation
- Best Hospital Recommendation
- Estimated Time of Arrival (ETA)
- Rescue Recommendation

Distance calculation uses the **Haversine Formula**.

---

## 🌐 Offline Synchronization

If internet connectivity is lost:

- Store operations locally
- Queue pending requests
- Detect network restoration
- Automatically synchronize with the database

---

## 📡 Real-Time Communication

- WebSocket Support
- Live Dashboard Updates
- Live Ambulance Status
- Live Mission Updates

---

## 📊 Reports

Generate operational reports including:

- Total Emergencies
- Active Emergencies
- Mission Statistics
- Average Response Time
- CSV Export

---

## 🗺 Digital Twin Dashboard

- Live Emergency Tracking
- Ambulance Monitoring
- Hospital Monitoring
- Mission Status Visualization

---

# 🏗 System Architecture

```
Frontend (React + TypeScript)
          │
          │ REST API / WebSocket
          ▼
FastAPI Backend
          │
          ▼
AI Decision Engine
          │
          ▼
Supabase PostgreSQL
          │
          ▼
Offline Synchronization Engine
```

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Leaflet
- WebSocket

---

## Backend

- FastAPI
- Python
- Uvicorn
- Pydantic
- JWT Authentication
- Passlib + bcrypt
- WebSocket
- Supabase Python SDK

---

## Database

- Supabase
- PostgreSQL

---

## AI

- Rule-Based Decision Engine
- Haversine Formula
- Priority Scoring
- ETA Calculation

---

## Hardware (Planned Integration)

- ESP32
- LoRa Module
- GPS Module
- VANET Communication

---

# 📂 Project Structure

```
DSRS-VANET
│
├── backend
│   ├── app
│   ├── routers
│   ├── services
│   ├── schemas
│   ├── middleware
│   ├── config
│   ├── utils
│   ├── offline
│   └── requirements.txt
│
├── frontend
│   ├── client
│   ├── server
│   ├── shared
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# 🚀 Installation

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn app.main:app --reload
```

Swagger:

```
http://127.0.0.1:8000/docs
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
SUPABASE_URL=YOUR_SUPABASE_URL

SUPABASE_KEY=YOUR_SUPABASE_KEY

SECRET_KEY=YOUR_SECRET_KEY

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

# 📡 API Documentation

Swagger UI

```
http://127.0.0.1:8000/docs
```

ReDoc

```
http://127.0.0.1:8000/redoc
```

---

# 🔄 Workflow

```
Emergency Created
        │
        ▼
AI Priority Assessment
        │
        ▼
Nearest Ambulance Selection
        │
        ▼
Best Hospital Recommendation
        │
        ▼
Mission Created
        │
        ▼
Real-Time Tracking
        │
        ▼
Offline Sync (if required)
        │
        ▼
Mission Completed
        │
        ▼
Reports Generated
```

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Input Validation
- Protected Routes
- Secure API Responses

---

# 📈 Future Enhancements

- Live Traffic Integration
- Real-Time Hospital Bed Availability
- Machine Learning Based Prediction
- Mobile Application
- Cloud Deployment
- Role-Based Access Control
- IoT Device Integration

---

# 👨‍💻 Contributors

Developed as part of the **MSME Hackathon Project**.

---

# 📄 License

This project is developed for educational and research purposes.
