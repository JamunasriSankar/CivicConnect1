// ============================================================
//  CivicConnect — Frontend JavaScript
//  Handles: form submit, fetch complaints, filters, modal,
//           stats, delete, status update, toast, search
// ============================================================

const API = 'http://localhost:3000/api';

// ─── DOM References ──────────────────────────────────────────
const form          = document.getElementById('complaintForm');
const submitBtn     = document.getElementById('submitBtn');
const formMsg       = document.getElementById('form-msg');
const grid          = document.getElementById('complaintsGrid');
const noResults     = document.getElementById('noResults');
const toast         = document.getElementById('toast');
const modalOverlay  = document.getElementById('modalOverlay');
const modalBody     = document.getElementById('modalBody');
const modalClose    = document.getElementById('modalClose');

// Filters
const filterCategory = document.getElementById('filterCategory');
const filterStatus   = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const searchBox      = document.getElementById('searchBox');

// Stats
const statTotal     = document.getElementById('stat-total');
const statOpen      = document.getElementById('stat-open');
const statProgress  = document.getElementById('stat-progress');
const statResolved  = document.getElementById('stat-resolved');
const statCritical  = document.getElementById('stat-critical');
const heroCount     = document.getElementById('hero-count');

// ─── State ───────────────────────────────────────────────────
let allComplaints = [];
let currentId     = null;

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadComplaints();
  setupFilters();
});

// ─── Load all complaints from API ────────────────────────────
async function loadComplaints() {
  try {
    grid.innerHTML = '<div class="loading-state">Loading complaints...</div>';
    const res  = await fetch(`${API}/complaints`);
    const data = await res.json();
    allComplaints = data.complaints || [];
    renderComplaints(allComplaints);
    updateStats(allComplaints);
  } catch (err) {
    grid.innerHTML = '<div class="loading-state">Could not connect to server. Make sure Node.js backend is running on port 3000.</div>';
    console.error('Load error:', err);
  }
}

// ─── Render complaint cards ───────────────────────────────────
function renderComplaints(list) {
  if (list.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';

  // Sort: newest first
  const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  grid.innerHTML = sorted.map((c, i) => `
    <div class="complaint-card" onclick="openModal('${c.id}')"
         style="animation-delay: ${i * 0.04}s">
      <div class="card-id">#${c.id}</div>
      <div class="card-top">
        <span class="card-category">${c.category}</span>
        <span class="card-priority priority-${c.priority}">${c.priority}</span>
      </div>
      <div class="card-title">${escHtml(c.title)}</div>
      <div class="card-location">${escHtml(c.location)}</div>
      <div class="card-desc">${escHtml(c.description)}</div>
      <div class="card-bottom">
        <span class="card-status status-${c.status.replace(' ', '-')}">${c.status}</span>
        <span class="card-meta">${timeAgo(c.createdAt)}</span>
      </div>
    </div>
  `).join('');
}

// ─── Update stats ─────────────────────────────────────────────
function updateStats(list) {
  const total    = list.length;
  const open     = list.filter(c => c.status === 'Open').length;
  const progress = list.filter(c => c.status === 'In Progress').length;
  const resolved = list.filter(c => c.status === 'Resolved').length;
  const critical = list.filter(c => c.priority === 'Critical').length;

  animateCount(statTotal,    total);
  animateCount(statOpen,     open);
  animateCount(statProgress, progress);
  animateCount(statResolved, resolved);
  animateCount(statCritical, critical);
  animateCount(heroCount,    total);
}

function animateCount(el, target) {
  let current = 0;
  const step  = Math.max(1, Math.ceil(target / 30));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 30);
}

// ─── Open modal ───────────────────────────────────────────────
function openModal(id) {
  const c = allComplaints.find(x => x.id === id);
  if (!c) return;
  currentId = id;

  modalBody.innerHTML = `
    <div class="modal-category">${c.category}</div>
    <div class="modal-title">${escHtml(c.title)}</div>

    <div class="modal-detail">
      <div class="detail-row">
        <span class="detail-key">ID</span>
        <span class="detail-val" style="font-family:monospace;font-size:0.82rem;color:var(--muted)">#${c.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">Reporter</span>
        <span class="detail-val">${escHtml(c.name)} &bull; ${escHtml(c.phone)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">Location</span>
        <span class="detail-val">${escHtml(c.location)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">Status</span>
        <span class="card-status status-${c.status.replace(' ', '-')}">${c.status}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">Priority</span>
        <span class="card-priority priority-${c.priority}">${c.priority}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">Filed</span>
        <span class="detail-val">${formatDate(c.createdAt)}</span>
      </div>
    </div>

    <div class="modal-desc">${escHtml(c.description)}</div>

    <div class="modal-actions">
      <button class="btn-status" onclick="updateStatus('${c.id}', 'Open')">Open</button>
      <button class="btn-status" onclick="updateStatus('${c.id}', 'In Progress')">In Progress</button>
      <button class="btn-status" onclick="updateStatus('${c.id}', 'Resolved')">Resolved</button>
      <button class="btn-delete" onclick="deleteComplaint('${c.id}')">Delete</button>
    </div>
  `;

  modalOverlay.classList.add('active');
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

function closeModal() {
  modalOverlay.classList.remove('active');
  currentId = null;
}

// ─── Update complaint status ──────────────────────────────────
async function updateStatus(id, status) {
  try {
    const res = await fetch(`${API}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Update failed');
    showToast(`Status updated to "${status}"`, 'success');
    closeModal();
    await loadComplaints();
    applyFilters();
  } catch (err) {
    showToast('Could not update status', 'error');
  }
}

// ─── Delete complaint ─────────────────────────────────────────
async function deleteComplaint(id) {
  if (!confirm('Are you sure you want to delete this complaint?')) return;
  try {
    const res = await fetch(`${API}/complaints/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showToast('Complaint deleted', 'success');
    closeModal();
    await loadComplaints();
    applyFilters();
  } catch (err) {
    showToast('Could not delete complaint', 'error');
  }
}

// ─── Form submission ──────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name:        document.getElementById('name').value.trim(),
    phone:       document.getElementById('phone').value.trim(),
    category:    document.getElementById('category').value,
    priority:    document.getElementById('priority').value,
    location:    document.getElementById('location').value.trim(),
    title:       document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim()
  };

  // Basic validation
  if (!payload.name || !payload.phone || !payload.category ||
      !payload.priority || !payload.location || !payload.title || !payload.description) {
    showFormMsg('Please fill in all fields.', true);
    return;
  }

  if (payload.phone.length < 10) {
    showFormMsg('Enter a valid phone number.', true);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').textContent = 'Submitting...';

  try {
    const res = await fetch(`${API}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Submission failed');
    }

    const data = await res.json();
    showFormMsg(`Complaint filed! Your ID: #${data.complaint.id}`, false);
    showToast('Complaint submitted successfully!', 'success');
    form.reset();
    await loadComplaints();
    applyFilters();

    // Scroll to complaints
    setTimeout(() => {
      document.getElementById('complaints').scrollIntoView({ behavior: 'smooth' });
    }, 1200);

  } catch (err) {
    showFormMsg(err.message || 'Submission failed. Is the server running?', true);
    showToast('Error submitting complaint', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Submit Complaint';
  }
});

function showFormMsg(msg, isError = false) {
  formMsg.textContent = msg;
  formMsg.className   = 'form-msg' + (isError ? ' error' : '');
  setTimeout(() => { formMsg.textContent = ''; }, 6000);
}

// ─── Filters & Search ─────────────────────────────────────────
function setupFilters() {
  [filterCategory, filterStatus, filterPriority].forEach(el => {
    el.addEventListener('change', applyFilters);
  });
  searchBox.addEventListener('input', applyFilters);
}

function applyFilters() {
  const cat    = filterCategory.value;
  const status = filterStatus.value;
  const prio   = filterPriority.value;
  const query  = searchBox.value.toLowerCase();

  const filtered = allComplaints.filter(c => {
    if (cat    && c.category !== cat)      return false;
    if (status && c.status   !== status)   return false;
    if (prio   && c.priority !== prio)     return false;
    if (query  && !c.title.toLowerCase().includes(query)
                && !c.location.toLowerCase().includes(query)
                && !c.description.toLowerCase().includes(query)) return false;
    return true;
  });

  renderComplaints(filtered);
}

// ─── Toast notification ───────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ─── Utility functions ────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
