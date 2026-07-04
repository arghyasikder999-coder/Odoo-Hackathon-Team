window.renderAttendanceView = function(container) {
    const user = store.getCurrentUser();
    const todayRecord = store.getTodayAttendance(user.email);
    const records = store.getAttendanceByUser(user.email).reverse();
    
    let html = `
        <div class="section-header">
            <div class="section-title">
                <h2>Attendance Tracker</h2>
                <p>View your daily check-in and check-out logs</p>
            </div>
            <div style="display: flex; gap: 0.75rem;">
    `;
    
    if (!todayRecord) {
        html += `<button id="att-checkin-btn" class="btn btn-success btn-sm">Check In ⏱️</button>`;
    } else if (!todayRecord.timeOut) {
        html += `<button id="att-checkout-btn" class="btn btn-danger btn-sm">Check Out</button>`;
    } else {
        html += `<span class="badge present" style="padding: 0.5rem 1rem;">✅ Day Complete</span>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    // Today's status card
    if (todayRecord) {
        html += `
            <div class="checkin-banner">
                <div class="checkin-info">
                    <div>
                        <div class="checkin-label">Today's Session</div>
                        <div class="checkin-time">${todayRecord.timeIn} ${todayRecord.timeOut ? '→ ' + todayRecord.timeOut : '(in progress)'}</div>
                    </div>
                </div>
                <span class="badge present">${todayRecord.status}</span>
            </div>
        `;
    }
    
    // Table
    html += `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    if (records.length === 0) {
        html += `<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📋</div><h3>No attendance records</h3><p>Check in to start tracking your attendance.</p></div></td></tr>`;
    } else {
        records.forEach(r => {
            const statusClass = r.status.toLowerCase().replace(' ', '-');
            html += `
                <tr>
                    <td><strong>${formatDate(r.date)}</strong></td>
                    <td>${r.timeIn}</td>
                    <td>${r.timeOut || '<span style="color: var(--color-warning);">—</span>'}</td>
                    <td><span class="badge ${statusClass}">${r.status}</span></td>
                </tr>
            `;
        });
    }
    
    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Bind buttons
    const checkInBtn = document.getElementById('att-checkin-btn');
    if (checkInBtn) {
        checkInBtn.addEventListener('click', () => {
            performCheckIn(user);
            renderView('attendance');
        });
    }
    const checkOutBtn = document.getElementById('att-checkout-btn');
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', () => {
            performCheckOut(user);
            renderView('attendance');
        });
    }
}

// Admin Employees View
window.renderAdminEmployeesView = function(container) {
    const users = store.getUsers();
    const today = new Date().toISOString().split('T')[0];
    
    let html = `
        <div class="section-header">
            <div class="section-title">
                <h2>Employee Directory</h2>
                <p>${users.length} employees registered</p>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Today's Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    users.forEach(u => {
        const todayAtt = store.getAttendance().find(a => a.userEmail === u.email && a.date === today);
        const statusBadge = todayAtt 
            ? `<span class="badge present">Present</span>` 
            : `<span class="badge absent">Not Checked In</span>`;
        
        html += `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="avatar" style="width: 36px; height: 36px; font-size: 0.85rem; border-radius: 10px;">${u.name.charAt(0)}</div>
                        <div>
                            <strong>${u.name}</strong>
                            <div style="font-size: 0.75rem; color: var(--color-text-muted);">${u.email}</div>
                        </div>
                    </div>
                </td>
                <td>${u.department || '—'}</td>
                <td>${u.role}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="viewEmployeeAttendance('${u.email}')">View Log →</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

window.viewEmployeeAttendance = function(email) {
    const user = store.getUserByEmail(email);
    const records = store.getAttendanceByUser(email).reverse();
    const container = document.getElementById('view-container');
    
    let html = `
        <div class="section-header">
            <div class="section-title">
                <h2>${user.name}'s Attendance</h2>
                <p>${user.department || 'No Department'} · ${user.email}</p>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="renderView('admin-employees')">← Back</button>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    if (records.length === 0) {
        html += `<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📋</div><h3>No records found</h3></div></td></tr>`;
    } else {
        records.forEach(r => {
            const statusClass = r.status.toLowerCase().replace(' ', '-');
            html += `
                <tr>
                    <td><strong>${formatDate(r.date)}</strong></td>
                    <td>${r.timeIn}</td>
                    <td>${r.timeOut || '—'}</td>
                    <td><span class="badge ${statusClass}">${r.status}</span></td>
                </tr>
            `;
        });
    }
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Helper
function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
