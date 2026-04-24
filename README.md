# TaskFlow — Real-Time Task Management System 

TaskFlow is a premium, full-stack task management application built with the MERN stack. It features real-time WebSocket updates, a strict role-based permission system, and a remarkably clean, "Fintech Corporate" Light Mode UI architecture.

---

## Technologies Used

### Frontend
- **React.js 19**: Modern component-based UI engineering.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS 3**: Utility-first CSS framework for rapid styling. We implemented a single-source-of-truth MVC-style theming system in `index.css`.
- **Framer Motion**: Smooth, spring-based micro-animations for card reveals and pop-ups.
- **Socket.io-client**: Persistent connection listener for real-time synchronization.

### Backend
- **Node.js & Express.js**: High-performance HTTP server foundation.
- **Socket.io**: WebSockets for pushing live payloads to isolated user rooms.
- **MongoDB & Mongoose**: Selected for its highly flexible schema capabilities, allowing seamless horizontal scaling and easy `$populate` referencing between `Users` and `Tasks`.
- **JWT (JSON Web Tokens)**: Secure, stateless, and encrypted session management.

---

## Core Logics & Architecture

### 1. The Real-Time "User Room" WebSocket Logic
Rather than forcing users to manually refresh their browser, we implemented **Socket.IO** attached directly to the Express server.
Custom logic dictates that when a user logs in, they silently join an isolated socket "room" registered exclusively to their `user.id`. Whenever a task is created, updated, or deleted, the server explicitly broadcasts the mutated task *only* to the Creator and the Assignee's specific rooms. This prevents data leakage while keeping the UI perfectly synchronized.

### 2. Password Encryption
Security is handled natively at the database level. Before a new User model is saved to MongoDB, a **Mongoose pre-save hook** intercepts the password and encrypts it using **bcryptjs** (with salt rounds). The raw password is never stored or visible in the database. During login, `bcrypt.compare` verifies the hashed signature.

### 3. Role-Based Permissions
Our Task system relies on a rigid, secure authorization gate built directly into the Controllers:
- **Personal Tasks**: Creators have full modification access.
- **Assigned Tasks**: The Creator (Assigner) can only modify the *Due Date*. The Assignee can only modify the *Status*. Everything else is strictly frozen to prevent miscommunication.

### 4. Custom Component Primitives & Skeleton Loading
Instead of relying on heavy third-party UI libraries, we built custom, highly responsive UI hooks from scratch:
- **Skeleton Dashboard**: Instead of jarring layout shifts and spinning circles during data fetching, we integrated a full-screen `SkeletonDashboard` that mirrors the exact geometric footprint of the final data layout.
- **ConfirmModals & Alerts**: Native browser `alert()` prompts were replaced with completely localized Framer Motion integrated dialogs matching the "Fintech Light" aesthetics perfectly.

---

## How to Start the Project

### Prerequisites
Make sure you have **Node.js** installed along with either **npm** or **yarn**. You will also need a MongoDB instance running either locally or via MongoDB Atlas.

### 1. Clone the Repository
```bash
git clone https://github.com/VishwakarmaVaibhav/TaskFlow.git
cd TaskFlow
```

### 2. Install Dependencies
You need to install dependencies for both the frontend client and the backend server.
```bash
# Terminal 1 — Backend
cd server
npm install

# Terminal 2 — Frontend
cd client
npm install
```

### 3. Configure Environment Variables
You need to create a `.env` file in both directories to securely connect your layers.

**`server/.env`**
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/taskflow   # <--- Replace this with your ONLINE Atlas link if deploying globally
JWT_SECRET=your_super_secret_key_here
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5001/api       # <--- Replace this with your ONLINE backend deployed link (e.g., Render, Vercel)
```

### 4. Run the Development Servers
```bash
# Terminal 1 — Start the Backend
cd server
npm run dev

# Terminal 2 — Start the Frontend
cd client
npm run dev
```

Open your browser to: **`http://localhost:5173`**
