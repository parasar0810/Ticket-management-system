// API Base URL
const API_URL = 'http://localhost:5000';

// Initialize Lucide Icons
if (window.lucide) {
    lucide.createIcons();
}

// Helper: Get Auth Data
function getAuth() {
    return {
        username: sessionStorage.getItem('username'),
        role: sessionStorage.getItem('role')
    };
}

// Helper: Redirect if not logged in
function checkAuth() {
    const auth = getAuth();
    const path = window.location.pathname.toLowerCase();
    
    console.log("Current path:", path);
    console.log("Logged in user:", auth.username);

    // If on an auth page
    const isLoginPage = path.includes('index.html') || path === '/' || path.endsWith('/');
    const isSignupPage = path.includes('signup.html');

    if (!auth.username) {
        // Not logged in. Only allow index.html and signup.html
        if (!isLoginPage && !isSignupPage) {
            console.log("Not logged in and on restricted page. Redirecting to index.");
            window.location.href = 'index.html';
        }
    } else {
        // Already logged in. Don't show login or signup pages
        if (isLoginPage || isSignupPage) {
            console.log("Already logged in. Redirecting to dashboard.");
            if (auth.role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    }
}

// Check auth on load
// checkAuth(); // Temporarily disabled to prevent redirection issues during setup
console.log("Navigation protection temporarily disabled for testing.");

// Login Logic
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('loginMessage');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('username', data.username);
            sessionStorage.setItem('role', data.role);
            if (data.role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            msg.innerText = data.message || 'Invalid username or password';
        }
    } catch (error) {
        console.error('Error:', error);
        msg.innerText = 'Server error. Please try again.';
    }
});

// Signup Logic
document.getElementById('signupForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const msg = document.getElementById('signupMessage');

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.text();

        if (response.ok) {
            alert('Signup successful! Please login.');
            window.location.href = 'index.html';
        } else {
            msg.innerText = data || 'Signup failed';
        }
    } catch (error) {
        msg.innerText = 'Server error. Please try again.';
    }
});

// Logout
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Display Username on Dashboard
if (document.getElementById('displayUsername')) {
    document.getElementById('displayUsername').innerText = getAuth().username || 'User';
}

// Load User Tickets
async function loadUserTickets() {
    const list = document.getElementById('userTicketsList');
    if (!list) return;

    const auth = getAuth();
    try {
        const response = await fetch(`${API_URL}/tickets?username=${auth.username}&role=${auth.role}`);
        const tickets = await response.json();
        
        // Update stats
        const counts = { total: tickets.length, open: 0, pending: 0, closed: 0 };
        
        list.innerHTML = '';
        if (tickets.length === 0) {
            list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No tickets raised yet. Click "New Ticket" to start.</div>';
        }

        tickets.forEach(t => {
            if (t.status === 'Open') counts.open++;
            else if (t.status === 'In Progress') counts.pending++;
            else counts.closed++;

            const statusClass = t.status.toLowerCase().replace(' ', '-');
            const card = document.createElement('div');
            card.className = 'ticket-card';
            card.innerHTML = `
                <div class="ticket-header">
                    <span class="badge badge-${statusClass}">${t.status}</span>
                    <span class="ticket-id">#${t.id}</span>
                </div>
                <h4 class="ticket-subject">${t.subject}</h4>
                <p class="ticket-desc">${t.description}</p>
                <div class="ticket-footer">
                    <span><i data-lucide="tag" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></i>${t.category}</span>
                    <span>${new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                ${t.admin_reply ? `<div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #ccc; font-size: 0.875rem;"><strong>Admin Reply:</strong> ${t.admin_reply}</div>` : ''}
            `;
            list.appendChild(card);
        });

        // Update stat values if elements exist
        if (document.getElementById('stat-total')) {
            document.getElementById('stat-total').innerText = counts.total;
            document.getElementById('stat-open').innerText = counts.open;
            document.getElementById('stat-pending').innerText = counts.pending;
            document.getElementById('stat-closed').innerText = counts.closed;
        }
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// Load Admin Tickets
async function loadAdminTickets() {
    const list = document.getElementById('adminTicketsList');
    if (!list) return;

    const auth = getAuth();
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';

    try {
        const response = await fetch(`${API_URL}/tickets?username=${auth.username}&role=${auth.role}`);
        const tickets = await response.json();
        
        list.innerHTML = '';
        
        // Filter tickets based on status dropdown
        const filteredTickets = statusFilter === 'all' 
            ? tickets 
            : tickets.filter(t => t.status === statusFilter);

        if (filteredTickets.length === 0) {
            list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-secondary); background: white; border-radius: 8px;">No tickets found matching this filter. Good job!</div>';
        }

        filteredTickets.forEach(t => {
            const statusClass = t.status.toLowerCase().replace(' ', '-');
            const card = document.createElement('div');
            card.className = 'ticket-card';
            card.innerHTML = `
                <div class="ticket-header">
                    <span class="badge badge-${statusClass}">${t.status}</span>
                    <span class="ticket-id">#${t.id}</span>
                </div>
                <h4 class="ticket-subject">${t.subject}</h4>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px; display: flex; gap: 12px;">
                    <span><i data-lucide="user" style="width: 12px; height: 12px;"></i> ${t.username}</span>
                    <span><i data-lucide="mail" style="width: 12px; height: 12px;"></i> ${t.contactEmail}</span>
                </div>
                <p class="ticket-desc">${t.description}</p>
                <div class="admin-actions">
                    ${t.status !== 'Closed' ? `
                        <button onclick="replyToTicket(${t.id})" class="btn-primary btn-sm"><i data-lucide="check-square" style="width: 14px; height: 14px; vertical-align: middle;"></i> Reply & Resolve</button>
                        ${t.status === 'Open' ? `<button onclick="updateStatus(${t.id}, 'In Progress')" class="btn-outline btn-sm">Take Assignment</button>` : ''}
                    ` : `
                        <div style="background: #f8fafc; padding: 12px; border-radius: 6px; width: 100%;">
                            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Resolved:</p>
                            <p style="font-size: 0.8125rem; color: var(--text-secondary); font-style: italic;">"${t.admin_reply || 'No reply provided'}"</p>
                        </div>
                    `}
                </div>
            `;
            list.appendChild(card);
        });

        // Update Admin Stats (Total, Active, Resolved)
        const counts = { 
            total: tickets.length, 
            active: tickets.filter(t => t.status !== 'Closed').length, 
            resolved: tickets.filter(t => t.status === 'Closed').length 
        };
        
        if (document.getElementById('admin-stat-total')) {
            document.getElementById('admin-stat-total').innerText = counts.total;
            document.getElementById('admin-stat-active').innerText = counts.active;
            document.getElementById('admin-stat-resolved').innerText = counts.resolved;
        }

        lucide.createIcons();
    } catch (error) {
        console.error('Error loading admin tickets:', error);
    }
}

// Add event listener for status filter
document.getElementById('statusFilter')?.addEventListener('change', loadAdminTickets);

// Admin Action: Update Status
async function updateStatus(id, status) {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (response.ok) {
            loadAdminTickets();
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Admin Action: Reply
async function replyToTicket(id) {
    const reply = prompt("Enter your reply to resolve and close this ticket:");
    if (!reply) return;

    try {
        const response = await fetch(`${API_URL}/tickets/${id}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply })
        });
        if (response.ok) {
            alert('Reply sent and ticket closed.');
            loadAdminTickets();
        }
    } catch (error) {
        console.error('Error replying:', error);
    }
}

// Ticket Form Submission
document.getElementById('ticketForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    formData.append('username', getAuth().username);

    try {
        const response = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            body: formData
        });
        const data = await response.text();
        if (response.ok) {
            alert('Ticket raised successfully!');
            window.location.href = 'dashboard.html';
        } else {
            alert('Error: ' + data);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit ticket. Is the server running?');
    }
});

// Initial data load based on page
if (document.getElementById('userTicketsList')) {
    loadUserTickets();
}
if (document.getElementById('adminTicketsList')) {
    loadAdminTickets();
}