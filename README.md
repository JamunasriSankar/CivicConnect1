# CivicConnect 🏙️
**Citizen Complaint Management System**

A full-stack web application built with HTML, CSS, JavaScript (frontend) and Node.js + Express (backend).

---

## 📁 Project Structure

```
civicconnect/
│
├── server.js           ← Backend server (Node.js + Express)
├── package.json        ← Project config & dependencies
├── data.json           ← JSON database (auto-created on first run)
│
└── public/             ← Frontend (served statically)
    ├── index.html      ← Main webpage
    ├── style.css       ← All styling
    └── script.js       ← Frontend JavaScript logic
```

---

## 🚀 Setup & Run

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version recommended)

### Step 2 — Install dependencies
```bash
cd civicconnect
npm install
```

### Step 3 — Start the server
```bash
node server.js
```

### Step 4 — Open in browser
```
http://localhost:3000
```

---

## 🔌 API Reference

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/complaints` | Get all complaints |
| GET | `/api/complaints/:id` | Get one complaint by ID |
| POST | `/api/complaints` | Create new complaint |
| PATCH | `/api/complaints/:id/status` | Update complaint status |
| DELETE | `/api/complaints/:id` | Delete a complaint |
| GET | `/api/stats` | Get summary statistics |

### POST /api/complaints — Request Body
```json
{
  "name": "Ravi Kumar",
  "phone": "9876543210",
  "category": "Road Damage",
  "priority": "High",
  "location": "Anna Nagar, Chennai",
  "title": "Pothole near school",
  "description": "Large pothole causing accidents..."
}
```

### PATCH /api/complaints/:id/status — Request Body
```json
{ "status": "In Progress" }
```

---

## ✅ Features

- Submit complaints with name, phone, category, priority, location, title, description
- Each complaint gets a unique ID (e.g. CC-A1B2)
- View all complaints with category, priority, status badges
- Filter by category, status, priority
- Search by title, location, description
- Click any card to open a detail modal
- Update status (Open / In Progress / Resolved) from the modal
- Delete complaints
- Live stats dashboard (total, open, in progress, resolved, critical)
- Data persisted in data.json (no external database needed)

---

## 🔮 Future Enhancements (mention in viva)
- MongoDB database instead of JSON file
- User login & authentication (JWT)
- Admin dashboard with charts
- GPS/map integration to pin exact location
- Photo upload for complaints
- Email/SMS notifications
- Mobile app (React Native)

---

Built with: **Node.js · Express · HTML · CSS · JavaScript**
