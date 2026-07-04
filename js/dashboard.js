document.addEventListener('DOMContentLoaded', () => {
    const currentUser = store.getCurrentUser();
    
    // Auth Check
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Setup Sidebar Info
    document.getElementById('sidebar-name').textContent = currentUser.name;
    document.getElementById('sidebar-role').textContent = currentUser.role;
    document.getElementById('sidebar-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

    // Setup Date
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', dateOptions);

    // Show Admin UI if Admin
    if (currentUser.role === 'Admin') {
        document.getElementById('admin-nav').classList.remove('hidden');
    }

    // Navigation & Routing
    const navItems = document.querySelectorAll('.nav-item');
    const viewContainer = document.getElementById('view-container');
    const pageTitle = document.getElementById('page-title');
    let currentView = 'overview';

    window.renderView = function(viewName) {
        currentView = viewName;
        viewContainer.style.opacity = '0';
        viewContainer.style.transform = 'translateY(8px)';
        
        setTimeout(() => {
            viewContainer.innerHTML = '';
            
            switch(viewName) {
                case 'overview':
                    pageTitle.textContent = 'Dashboard';
                    renderOverviewView(viewContainer);
                    break;
                case 'profile':
                    pageTitle.textContent = 'My Profile';
                    renderProfileView(viewContainer);
                    break;
                case 'attendance':
                    pageTitle.textContent = 'Attendance';
                    renderAttendanceView(viewContainer);
                    break;
                case 'leave':
                    pageTitle.textContent = 'Leave Management';
                    renderLeaveView(viewContainer);
                    break;
                case 'payroll':
                    pageTitle.textContent = 'Payroll';
                    renderPayrollView(viewContainer);
                    break;
                case 'admin-employees':
                    pageTitle.textContent = 'Employee Directory';
                    renderAdminEmployeesView(viewContainer);
                    break;
                case 'admin-approvals':
                    pageTitle.textContent = 'Leave Approvals';
                    renderAdminApprovalsView(viewContainer);
                    break;
                default:
                    viewContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>View not found</h3></div>';
            }

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
            if (activeNav) activeNav.classList.add('active');
            
            viewContainer.style.opacity = '1';
            viewContainer.style.transform = 'translateY(0)';
        }, 150);
    }

    viewContainer.style.transition = 'opacity 0.15s ease, transform 0.15s ease';

    // Handle Clicks
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            renderView(view);
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        store.logout();
        window.location.href = 'index.html';
    });

    // Initial Render
    renderView('overview');
});

// Overview Renderer
window.renderOverviewView = function(container) {
    const user = store.getCurrentUser();
    const todayRecord = store.getTodayAttendance(user.email);
    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    let html = '';

    if (user.role === 'Admin') {
        const totalEmployees = store.getUsers().length;
        const pendingLeaves = store.getLeaves().filter(l => l.status === 'Pending').length;
        const todayPresent = store.getAttendance().filter(a => a.date === now.toISOString().split('T')[0]).length;
        const approvedLeaves = store.getLeaves().filter(l => l.status === 'Approved').length;
        
        html = `
            <div class="card" style="margin-bottom: 1.25rem; background: linear-gradient(135deg, rgba(113, 75, 103, 0.2), rgba(1, 126, 132, 0.1)); border-color: rgba(113, 75, 103, 0.2);">
                <h2 style="font-size: 1.35rem;">${greeting}, ${user.name.split(' ')[0]} 👋</h2>
                <p style="color: var(--color-text-muted); margin-top: 0.25rem;">Here's what's happening in your organization today.</p>
            </div>
            
            <div class="dashboard-grid">
                <div class="card stat-card">
                    <div class="stat-icon purple">👥</div>
                    <div class="stat-info">
                        <h3>Total Employees</h3>
                        <div class="value">${totalEmployees}</div>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon green">✅</div>
                    <div class="stat-info">
                        <h3>Present Today</h3>
                        <div class="value">${todayPresent}</div>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon orange">🔔</div>
                    <div class="stat-info">
                        <h3>Pending Approvals</h3>
                        <div class="value">${pendingLeaves}</div>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon teal">🏖️</div>
                    <div class="stat-info">
                        <h3>Leaves Approved</h3>
                        <div class="value">${approvedLeaves}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 1.25rem;">
                <h3 style="margin-bottom: 1rem; font-size: 1rem;">Recent Leave Requests</h3>
                ${renderRecentLeaves()}
            </div>
        `;
    } else {
        const myAttendance = store.getAttendanceByUser(user.email);
        const myLeaves = store.getLeavesByUser(user.email);
        const pendingLeaves = myLeaves.filter(l => l.status === 'Pending').length;
        const presentDays = myAttendance.filter(a => a.status === 'Present').length;
        
        html = `
            <div class="card" style="margin-bottom: 1.25rem; background: linear-gradient(135deg, rgba(113, 75, 103, 0.2), rgba(1, 126, 132, 0.1)); border-color: rgba(113, 75, 103, 0.2);">
                <h2 style="font-size: 1.35rem;">${greeting}, ${user.name.split(' ')[0]} 👋</h2>
                <p style="color: var(--color-text-muted); margin-top: 0.25rem;">Track your work, manage leave, and view your payroll — all in one place.</p>
            </div>
            
            ${renderCheckinBanner(todayRecord, user)}
            
            <div class="dashboard-grid">
                <div class="card stat-card">
                    <div class="stat-icon green">⏰</div>
                    <div class="stat-info">
                        <h3>Days Present</h3>
                        <div class="value">${presentDays}</div>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon teal">🏖️</div>
                    <div class="stat-info">
                        <h3>Leave Requests</h3>
                        <div class="value">${myLeaves.length}</div>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon orange">⏳</div>
                    <div class="stat-info">
                        <h3>Pending</h3>
                        <div class="value">${pendingLeaves}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Bind check-in/out buttons if present
    const checkInBtn = document.getElementById('overview-checkin-btn');
    if (checkInBtn) {
        checkInBtn.addEventListener('click', () => {
            performCheckIn(user);
            renderView('overview');
        });
    }
    const checkOutBtn = document.getElementById('overview-checkout-btn');
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', () => {
            performCheckOut(user);
            renderView('overview');
        });
    }
}

function renderCheckinBanner(todayRecord, user) {
    if (!todayRecord) {
        return `
            <div class="checkin-banner">
                <div class="checkin-info">
                    <div>
                        <div class="checkin-label">You haven't checked in yet today</div>
                        <div class="checkin-time" style="font-size: 1.25rem; color: var(--color-text-muted);">Start your day!</div>
                    </div>
                </div>
                <button id="overview-checkin-btn" class="btn btn-success">Check In ⏱️</button>
            </div>
        `;
    } else if (!todayRecord.timeOut) {
        return `
            <div class="checkin-banner">
                <div class="checkin-info">
                    <div>
                        <div class="checkin-label">Checked in at</div>
                        <div class="checkin-time">${todayRecord.timeIn}</div>
                    </div>
                </div>
                <button id="overview-checkout-btn" class="btn btn-danger btn-sm">Check Out</button>
            </div>
        `;
    } else {
        return `
            <div class="checkin-banner">
                <div class="checkin-info">
                    <div>
                        <div class="checkin-label">Today's session completed</div>
                        <div class="checkin-time" style="font-size: 1.1rem;">${todayRecord.timeIn} → ${todayRecord.timeOut}</div>
                    </div>
                </div>
                <span class="badge present" style="font-size: 0.85rem;">✅ Done</span>
            </div>
        `;
    }
}

function renderRecentLeaves() {
    const leaves = store.getLeaves().slice(-5).reverse();
    if (leaves.length === 0) {
        return '<div class="card"><div class="empty-state"><div class="empty-icon">🏖️</div><h3>No leave requests yet</h3></div></div>';
    }
    
    let html = '<div class="table-container"><table><thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Status</th></tr></thead><tbody>';
    leaves.forEach(l => {
        const statusClass = l.status.toLowerCase();
        html += `<tr>
            <td><strong>${l.userName}</strong></td>
            <td>${l.type}</td>
            <td style="font-size: 0.85rem;">${l.start} → ${l.end}</td>
            <td><span class="badge ${statusClass}">${l.status}</span></td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    return html;
}

// Check-in / Check-out helpers
window.performCheckIn = function(user) {
    const today = new Date().toISOString().split('T')[0];
    const existing = store.getTodayAttendance(user.email);
    
    if (existing) {
        showToast('warning', 'Already Checked In', 'You have already checked in today.');
        return;
    }

    const timeIn = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    store.addAttendance({
        userEmail: user.email,
        userName: user.name,
        date: today,
        timeIn: timeIn,
        timeOut: null,
        status: 'Present',
        totalHours: 0
    });
    
    showToast('success', 'Checked In!', `Your day started at ${timeIn}`);
}

window.performCheckOut = function(user) {
    const today = new Date().toISOString().split('T')[0];
    const timeOut = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    store.updateAttendance(user.email, today, { timeOut: timeOut });
    showToast('success', 'Checked Out!', `Your day ended at ${timeOut}. Great work!`);
}
