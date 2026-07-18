# Della E-commerce Platform
Authors:
Md Nushad Jaman Raj
Juhayer Al Tausif

A full-stack e-commerce application built with React, Node.js, Express, and Supabase.

## Features
- **Frontend**: React.js with React Bootstrap for styling (mimicking eBay design).
- **Backend**: Node.js and Express server for API.
- **Database**: Mock data for products (can be extended to MongoDB or Firebase).
- **Firebase Integration**: Ready for authentication and database.

## Prerequisites
- Node.js installed on your machine.

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Configure Firebase
Follow the instructions in `FIREBASE_GUIDE.md` to set up your Firebase project and update `src/firebase.js` with your configuration keys.

### 3. Run the Application

**Start the Backend Server:**
Open a terminal and run:
```bash
node server/index.js
```
The server will start on `http://localhost:5000`.

**Start the Frontend:**
Open a new terminal and run:
```bash
npm start
```
The application will open in your browser at `http://localhost:3000`.

## Project Structure
- `src/components`: Reusable UI components (Header, Footer, ProductCard).
- `src/pages`: Page components (Home, ProductDetails).
- `server`: Backend API server.
- `src/firebase.js`: Firebase configuration.

## API Endpoints
- `GET /api/products`: Fetch all products.
- `GET /api/products/:id`: Fetch a single product by ID.
