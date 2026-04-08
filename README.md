# 🚗 DriveLuxe — Car Rental System

A full-stack car rental platform with user authentication, admin dashboard, booking system, reviews, and analytics.

---

## 📁 Folder Structure

```
car-rental/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile
│   │   ├── carController.js      # Car CRUD + analytics
│   │   ├── bookingController.js  # Booking management
│   │   ├── reviewController.js   # Reviews & ratings
│   │   └── userController.js     # Admin user management
│   ├── middleware/
│   │   ├── auth.js               # JWT protect + authorize
│   │   └── upload.js             # Multer image upload
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Car.js                # Car schema
│   │   ├── Booking.js            # Booking schema
│   │   └── Review.js             # Review schema
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── cars.js               # Car routes
│   │   ├── bookings.js           # Booking routes
│   │   ├── reviews.js            # Review routes
│   │   └── users.js              # User admin routes
│   ├── uploads/                  # Car image storage
│   ├── server.js                 # Express entry point
│   ├── seeder.js                 # Sample data seeder
│   ├── .env                      # Environment variables
│   └── package.json
│
└── frontend/
    ├── css/
    │   └── style.css             # Global styles
    ├── js/
    │   └── main.js               # API client + shared utils
    ├── pages/
    │   ├── login.html            # Login page
    │   ├── register.html         # Register page
    │   ├── cars.html             # Browse & filter cars
    │   ├── car-detail.html       # Car detail + booking
    │   ├── dashboard.html        # User dashboard
    │   └── admin.html            # Admin panel
    └── index.html                # Home page
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18+ — https://nodejs.org
- **MongoDB** v6+ — https://www.mongodb.com/try/download/community
  - Or use **MongoDB Atlas** (free cloud): https://cloud.mongodb.com

---

### Step 1 — Clone / Extract the Project

```bash
# Navigate to the project directory
cd car-rental
```

---

### Step 2 — Configure Environment Variables

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/car_rental_db
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
MAX_FILE_SIZE=5242880
FRONTEND_URL=http://localhost:3000
```

> ⚠️ Change `JWT_SECRET` to a long random string in production!

For **MongoDB Atlas**, replace `MONGODB_URI` with your connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car_rental_db
```

---

### Step 3 — Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Step 4 — Seed the Database (Recommended)

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin account: `admin@carrental.com` / `admin123`
- 2 User accounts: `john@example.com` / `user123`
- 8 sample cars across different types
- 2 sample bookings

---

### Step 5 — Start the Backend Server

```bash
# Development (auto-restart on changes)
npm run dev

# Or production
npm start
```

You should see:
```
🚗 Car Rental Server running on http://localhost:5000
✅ MongoDB Connected: localhost
```

---

### Step 6 — Serve the Frontend

**Option A: VS Code Live Server** (Recommended)
1. Open the `car-rental` folder in VS Code
2. Install the "Live Server" extension
3. Right-click `frontend/index.html` → "Open with Live Server"

**Option B: Python HTTP Server**
```bash
cd frontend
python3 -m http.server 3000
# Open: http://localhost:3000
```

**Option C: Node http-server**
```bash
npm install -g http-server
cd frontend
http-server -p 3000
# Open: http://localhost:3000
```

---

## 🔑 Test Credentials

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@carrental.com      | admin123  |
| User  | john@example.com         | user123   |
| User  | jane@example.com         | user123   |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint           | Description          | Auth    |
|--------|--------------------|----------------------|---------|
| POST   | /api/auth/register | Register new user    | Public  |
| POST   | /api/auth/login    | Login, get JWT       | Public  |
| GET    | /api/auth/me       | Get current user     | User    |
| PUT    | /api/auth/profile  | Update profile       | User    |
| PUT    | /api/auth/password | Change password      | User    |

### Cars
| Method | Endpoint                    | Description             | Auth    |
|--------|-----------------------------|-------------------------|---------|
| GET    | /api/cars                   | List / search / filter  | Public  |
| GET    | /api/cars/:id               | Get car details         | Public  |
| GET    | /api/cars/:id/availability  | Get booked dates        | Public  |
| GET    | /api/cars/analytics         | Admin analytics         | Admin   |
| POST   | /api/cars                   | Create car              | Admin   |
| PUT    | /api/cars/:id               | Update car              | Admin   |
| DELETE | /api/cars/:id               | Delete car              | Admin   |

### Bookings
| Method | Endpoint               | Description            | Auth    |
|--------|------------------------|------------------------|---------|
| POST   | /api/bookings          | Create booking         | User    |
| GET    | /api/bookings/my       | My bookings            | User    |
| GET    | /api/bookings          | All bookings           | Admin   |
| GET    | /api/bookings/:id      | Get booking details    | User    |
| PUT    | /api/bookings/:id/cancel | Cancel booking       | User    |
| PUT    | /api/bookings/:id/status | Update status        | Admin   |

### Reviews
| Method | Endpoint                  | Description        | Auth    |
|--------|---------------------------|--------------------|---------|
| POST   | /api/reviews              | Add review         | User    |
| GET    | /api/reviews/car/:carId   | Get car reviews    | Public  |
| DELETE | /api/reviews/:id          | Delete review      | User    |

### Users (Admin)
| Method | Endpoint                       | Description          | Auth  |
|--------|--------------------------------|----------------------|-------|
| GET    | /api/users                     | List all users       | Admin |
| GET    | /api/users/:id                 | Get user details     | Admin |
| PUT    | /api/users/:id/toggle-status   | Activate/deactivate  | Admin |

---

## 🗃️ Database Schemas

### User
```js
{ name, email, password(hashed), phone, role(user|admin),
  avatar, address, drivingLicense, isActive, createdAt }
```

### Car
```js
{ name, brand, model, year, type, transmission, fuelType,
  seats, pricePerDay, images[], description, features[],
  location, isAvailable, mileage, rating, numReviews,
  totalBookings, addedBy(User), createdAt }
```

### Booking
```js
{ user(User), car(Car), startDate, endDate, totalDays,
  pricePerDay, totalAmount, status, paymentStatus,
  paymentMethod, transactionId, pickupLocation,
  dropoffLocation, driverLicense, cancellationReason,
  cancelledAt, createdAt }
```

### Review
```js
{ user(User), car(Car), booking(Booking),
  rating(1-5), comment, createdAt }
```

---

## ✨ Features

- ✅ JWT Authentication (Register / Login / Logout)
- ✅ Role-based Access (Admin / User)
- ✅ Car CRUD with image upload (Admin)
- ✅ Search & filter by type, price, fuel, transmission, location
- ✅ Booking system with date validation & conflict detection
- ✅ Cost calculator (days × price/day)
- ✅ Dummy payment integration with transaction IDs
- ✅ User dashboard with booking history
- ✅ Admin analytics dashboard (revenue, bookings, top cars, charts)
- ✅ Car availability calendar
- ✅ Ratings & reviews system
- ✅ Responsive dark luxury UI
- ✅ Toast notifications
- ✅ MVC architecture
- ✅ RESTful API design
- ✅ Error handling & validation

---

## 🛠️ Troubleshooting

**CORS Error?**
→ Make sure backend is running on port 5000

**MongoDB connection failed?**
→ Ensure MongoDB is running: `sudo systemctl start mongod`

**Images not loading?**
→ The backend serves uploads at `http://localhost:5000/uploads/`

**Login not working?**
→ Run the seeder: `npm run seed` to create test accounts

---

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Change `JWT_SECRET` to a strong random string
3. Use a cloud MongoDB (Atlas)
4. Serve frontend via Nginx or Vercel
5. Deploy backend to Railway, Render, or AWS

---

Built with ❤️ — DriveLuxe Car Rental System
