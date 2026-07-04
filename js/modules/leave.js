window.renderLeaveView = function(container) {
    const user = store.getCurrentUser();
    const leaves = store.getLeavesByUser(user.email).reverse();
    
    // Count leave stats
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    
    let html = `
        <div class="section-header">
            <div class="section-title">
                <h2>Leave Management</h2>
                <p>Apply for leave and track your requests</p>
            </div>
        </div>
        
        <div class="dashboard-grid" style="margin-bottom: 1.25rem;">
            <div class="card stat-card">
                <div class="stat-icon green">✅</div>
                <div class="stat-info">
                    <h3>Approved</h3>
                    <div class="value">${approved}</div>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-icon orange">⏳</div>
                <div class="stat-info">
                    <h3>Pending</h3>
                    <div class="value">${pending}</div>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-icon red">❌</div>
                <div class="stat-info">
                    <h3>Rejected</h3>
                    <div class="value">${rejected}</div>
                </div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="card">
                <h3 style="margin-bottom: 1.25rem;">Apply for Leave</h3>
                <form id="leave-form">
                    <div class="input-group">
                        <label>Leave Type</label>
                        <select id="leave-type" required>
                            <option value="Paid">Paid Leave</option>
                            <option value="Sick">Sick Leave</option>
                            <option value="Casual">Casual Leave</option>
                            <option value="Unpaid">Unpaid Leave</option>
                        </select>
                    </div>
                    <div class="form-grid">
                        <div class="input-group">
                            <label>Start Date</label>
                            <input type="date" id="leave-start" required>
                        </div>
                        <div class="input-group">
                            <label>End Date</label>
                            <input type="date" id="leave-end" required>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Reason</label>
                        <textarea id="leave-remarks" rows="3" required placeholder="Briefly describe the reason..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Submit Request</button>
                </form>
            </div>
            
            <div class="card" style="display: flex; flex-direction: column;">
                <h3 style="margin-bottom: 1rem;">Leave History</h3>
                <div class="table-container" style="flex: 1; overflow-y: auto; box-shadow: none; border: 1px solid var(--color-border); margin-top: 0;">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Dates</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    if (leaves.length === 0) {
        html += `<tr><td colspan="3"><div class="empty-state" style="padding: 2rem;"><div class="empty-icon">🏖️</div><h3>No leave requests</h3></div></td></tr>`;
    } else {
        leaves.forEach(l => {
            const statusClass = l.status.toLowerCase();
            html += `
                <tr>
                    <td><strong>${l.type}</strong></td>
                    <td style="font-size: 0.82rem;">${l.start} → ${l.end}</td>
                    <td><span class="badge ${statusClass}">${l.status}</span></td>
                </tr>
            `;
        });
    }
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('leave-start').min = today;
    document.getElementById('leave-end').min = today;

    // Handle form submit
    document.getElementById('leave-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const start = document.getElementById('leave-start').value;
        const end = document.getElementById('leave-end').value;
        
        if (end < start) {
            showToast('error', 'Invalid Dates', 'End date must be on or after start date.');
            return;
        }
        
        const newLeave = {
            id: 'L-' + Math.random().toString(36).substr(2, 9),
            userEmail: user.email,
            userName: user.name,
            type: document.getElementById('leave-type').value,
            start,
            end,
            remarks: document.getElementById('leave-remarks').value,
            status: 'Pending',
            comment: '',
            appliedOn: today
        };
        
        store.addLeave(newLeave);
        showToast('success', 'Leave Submitted', 'Your request has been sent for approval.');
        renderView('leave');
    });
}

// Admin Approvals View
window.renderAdminApprovalsView = function(container) {
    const leaves = store.getLeaves().reverse();
    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    
    let html = `
        <div class="section-header">
            <div class="section-title">
                <h2>Leave Approvals</h2>
                <p>${pendingCount} request${pendingCount !== 1 ? 's' : ''} awaiting your review</p>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    if (leaves.length === 0) {
        html += `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">✅</div><h3>All caught up!</h3><p>No leave requests to review.</p></div></td></tr>`;
    } else {
        leaves.forEach(l => {
            const statusClass = l.status.toLowerCase();
            html += `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="avatar" style="width: 32px; height: 32px; font-size: 0.8rem; border-radius: 8px;">${l.userName.charAt(0)}</div>
                            <div>
                                <strong>${l.userName}</strong>
                                <div style="font-size: 0.72rem; color: var(--color-text-muted);">${l.userEmail}</div>
                            </div>
                        </div>
                    </td>
                    <td>${l.type}</td>
                    <td style="font-size: 0.82rem;">${l.start} → ${l.end}</td>
                    <td style="max-width: 180px; font-size: 0.82rem; color: var(--color-text-muted);" title="${l.remarks}">${l.remarks || '—'}</td>
                    <td><span class="badge ${statusClass}">${l.status}</span></td>
                    <td>
                        ${l.status === 'Pending' ? `
                            <div style="display: flex; gap: 0.4rem;">
                                <button class="btn btn-success btn-sm" onclick="processLeave('${l.id}', 'Approved')">Approve</button>
                                <button class="btn btn-danger btn-sm" onclick="processLeave('${l.id}', 'Rejected')">Reject</button>
                            </div>
                        ` : `<span style="font-size: 0.8rem; color: var(--color-text-muted);">${l.comment || '—'}</span>`}
                    </td>
                </tr>
            `;
        });
    }
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

window.processLeave = function(id, status) {
    // Create a modal instead of using prompt()
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <h3>${status === 'Approved' ? '✅ Approve' : '❌ Reject'} Leave Request</h3>
            <div class="input-group">
                <label>Comment (optional)</label>
                <textarea id="modal-comment" rows="3" placeholder="Add a note for the employee..."></textarea>
            </div>
            <div class="modal-actions">
                <button class="btn btn-ghost btn-sm" id="modal-cancel">Cancel</button>
                <button class="btn ${status === 'Approved' ? 'btn-success' : 'btn-danger'} btn-sm" id="modal-confirm">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('modal-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    
    document.getElementById('modal-confirm').addEventListener('click', () => {
        const comment = document.getElementById('modal-comment').value;
        store.updateLeaveStatus(id, status, comment);
        overlay.remove();
        showToast('success', `Leave ${status}`, `The request has been ${status.toLowerCase()}.`);
        renderView('admin-approvals');
    });
}
