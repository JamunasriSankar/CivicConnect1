// ============================================================
//  CivicConnect — Backend Server (Node.js + Express)
//  File: server.js
//
//  Routes:
//    GET    /api/complaints          → get all complaints
//    GET    /api/complaints/:id      → get single complaint
//    POST   /api/complaints          → create new complaint
//    PATCH  /api/complaints/:id/status → update status
//    DELETE /api/complaints/:id      → delete complaint
//    GET    /api/stats               → summary statistics
//
//  Database: data.json (flat file, JSON array)
// ============================================================

const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const cors     = require('cors');

const app  = express();
const PORT = 3000;
const DB   = path.join(__dirname, 'data.json');

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());                          // allow frontend requests
app.use(express.json());                  // parse JSON body
app.use(express.static(path.join(__dirname, 'public'))); // serve frontend

// ─── Database Helpers ─────────────────────────────────────────

/**
 * readDB() — Read all complaints from data.json
 * Returns an array of complaint objects.
 */
function readDB() {
  if (!fs.existsSync(DB)) {
    fs.writeFileSync(DB, JSON.stringify({ complaints: [] }, null, 2));
  }
  const raw = fs.readFileSync(DB, 'utf-8');
  return JSON.parse(raw);
}

/**
 * writeDB(data) — Write updated data back to data.json
 */
function writeDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

/**
 * generateId() — Create a short unique complaint ID
 * Format: CC-XXXX (e.g. CC-4F2A)
 */
function generateId() {
  return 'CC-' + Math.random().toString(36).toUpperCase().slice(2, 6);
}

// ─── Validation Helper ────────────────────────────────────────
const REQUIRED_FIELDS    = ['name','phone','category','priority','location','title','description'];
const VALID_CATEGORIES   = ['Road Damage','Garbage','Water Supply','Street Light','Drainage','Other'];
const VALID_PRIORITIES   = ['Low','Medium','High','Critical'];
const VALID_STATUSES     = ['Open','In Progress','Resolved'];

function validateComplaint(body) {
  const errors = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || String(body[field]).trim() === '') {
      errors.push(`"${field}" is required`);
    }
  }

  // Validate category
  if (body.category && !VALID_CATEGORIES.includes(body.category)) {
    errors.push(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate priority
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  // Validate phone (10–13 digits)
  if (body.phone && !/^\d{10,13}$/.test(body.phone.trim())) {
    errors.push('"phone" must be 10–13 digits');
  }

  // Validate description length
  if (body.description && body.description.trim().length < 10) {
    errors.push('"description" must be at least 10 characters');
  }

  return errors;
}

// ─── Routes ───────────────────────────────────────────────────

// [GET] /api/complaints — Return all complaints (sorted newest first)
app.get('/api/complaints', (req, res) => {
  try {
    const db = readDB();
    const sorted = db.complaints.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json({ success: true, count: sorted.length, complaints: sorted });
  } catch (err) {
    console.error('GET /complaints error:', err);
    res.status(500).json({ success: false, message: 'Failed to read database' });
  }
});

// [GET] /api/complaints/:id — Return single complaint
app.get('/api/complaints/:id', (req, res) => {
  try {
    const db         = readDB();
    const complaint  = db.complaints.find(c => c.id === req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: `Complaint #${req.params.id} not found` });
    }
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// [POST] /api/complaints — Create new complaint
app.post('/api/complaints', (req, res) => {
  try {
    const errors = validateComplaint(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const db = readDB();

    // Build new complaint object
    const newComplaint = {
      id:          generateId(),
      name:        req.body.name.trim(),
      phone:       req.body.phone.trim(),
      category:    req.body.category,
      priority:    req.body.priority,
      location:    req.body.location.trim(),
      title:       req.body.title.trim(),
      description: req.body.description.trim(),
      status:      'Open',                         // default status
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString()
    };

    db.complaints.push(newComplaint);
    writeDB(db);

    console.log(`[NEW] Complaint ${newComplaint.id} — ${newComplaint.category} — ${newComplaint.location}`);

    res.status(201).json({ success: true, message: 'Complaint filed successfully', complaint: newComplaint });
  } catch (err) {
    console.error('POST /complaints error:', err);
    res.status(500).json({ success: false, message: 'Server error while saving complaint' });
  }
});

// [PATCH] /api/complaints/:id/status — Update complaint status
app.patch('/api/complaints/:id/status', (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const db    = readDB();
    const index = db.complaints.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Complaint #${req.params.id} not found` });
    }

    const oldStatus = db.complaints[index].status;
    db.complaints[index].status    = status;
    db.complaints[index].updatedAt = new Date().toISOString();
    writeDB(db);

    console.log(`[UPDATE] Complaint ${req.params.id} — "${oldStatus}" → "${status}"`);

    res.json({ success: true, message: `Status updated to "${status}"`, complaint: db.complaints[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// [DELETE] /api/complaints/:id — Delete a complaint
app.delete('/api/complaints/:id', (req, res) => {
  try {
    const db     = readDB();
    const before = db.complaints.length;
    db.complaints = db.complaints.filter(c => c.id !== req.params.id);

    if (db.complaints.length === before) {
      return res.status(404).json({ success: false, message: `Complaint #${req.params.id} not found` });
    }

    writeDB(db);
    console.log(`[DELETE] Complaint ${req.params.id} removed`);
    res.json({ success: true, message: `Complaint #${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// [GET] /api/stats — Summary statistics
app.get('/api/stats', (req, res) => {
  try {
    const db   = readDB();
    const list = db.complaints;

    const stats = {
      total:    list.length,
      byStatus: {
        open:       list.filter(c => c.status === 'Open').length,
        inProgress: list.filter(c => c.status === 'In Progress').length,
        resolved:   list.filter(c => c.status === 'Resolved').length
      },
      byPriority: {
        low:      list.filter(c => c.priority === 'Low').length,
        medium:   list.filter(c => c.priority === 'Medium').length,
        high:     list.filter(c => c.priority === 'High').length,
        critical: list.filter(c => c.priority === 'Critical').length
      },
      byCategory: VALID_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = list.filter(c => c.category === cat).length;
        return acc;
      }, {})
    };

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════╗');
  console.log('  ║   CivicConnect Server Running    ║');
  console.log(`  ║   http://localhost:${PORT}           ║`);
  console.log('  ╠══════════════════════════════════╣');
  console.log('  ║  Routes:                         ║');
  console.log('  ║  GET    /api/complaints           ║');
  console.log('  ║  GET    /api/complaints/:id       ║');
  console.log('  ║  POST   /api/complaints           ║');
  console.log('  ║  PATCH  /api/complaints/:id/status║');
  console.log('  ║  DELETE /api/complaints/:id       ║');
  console.log('  ║  GET    /api/stats                ║');
  console.log('  ╚══════════════════════════════════╝');
  console.log('');
});
