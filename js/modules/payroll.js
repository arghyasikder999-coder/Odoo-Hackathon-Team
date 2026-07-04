window.renderPayrollView = function(container) {
    const user = store.getCurrentUser();
    
    if (user.role === 'Admin') {
        renderAdminPayrollView(container);
        return;
    }

    // Employee View (Read Only)
    const attendance = store.getAttendanceByUser(user.email);
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    
    container.innerHTML = `
        <div class="section-header">
            <div class="section-title">
                <h2>My Compensation</h2>
                <p>View your salary structure and attendance summary</p>
            </div>
        </div>
        
        <div class="card" style="max-width: 600px;">
            <div style="text-align: center; padding: 2rem 0;">
                <div style="width: 72px; height: 72px; margin: 0 auto 1.25rem; border-radius: 18px; background: linear-gradient(135deg, rgba(1, 126, 132, 0.2), rgba(113, 75, 103, 0.1)); display: flex; align-items: center; justify-content: center; font-size: 2rem;">💰</div>
                <h2 style="font-size: 2.5rem; margin-bottom: 0.25rem; background: linear-gradient(135deg, var(--color-text), var(--color-secondary-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${user.salary || 'Not Set'}</h2>
                <p style="color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.75rem; font-weight: 600;">Annual Base Salary</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border);">
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${presentDays}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Days Worked</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${user.department || '—'}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Department</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${user.joinDate || '—'}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Since</div>
                </div>
            </div>
        </div>
    `;
}

// Admin Payroll Control
window.renderAdminPayrollView = function(container) {
    const users = store.getUsers();
    
    let html = `
        <div class="section-header">
            <div class="section-title">
                <h2>Payroll Management</h2>
                <p>View and update employee salary structures</p>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Current Salary</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    users.forEach(u => {
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
                <td style="font-weight: 700; color: var(--color-secondary-light);">${u.salary || 'Not Set'}</td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="updateSalary('${u.email}')">Update →</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

window.updateSalary = function(email) {
    const user = store.getUserByEmail(email);
    
    // Modal for salary update
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <h3>💰 Update Salary</h3>
            <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">${user.name} · ${user.department || 'No Department'}</p>
            <div class="input-group">
                <label>Annual Salary</label>
                <input type="text" id="modal-salary" value="${user.salary || ''}" placeholder="e.g. ₹7,20,000">
            </div>
            <div class="modal-actions">
                <button class="btn btn-ghost btn-sm" id="modal-cancel">Cancel</button>
                <button class="btn btn-primary btn-sm" id="modal-confirm">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.getElementById('modal-salary').focus();
    
    document.getElementById('modal-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    
    document.getElementById('modal-confirm').addEventListener('click', () => {
        const newSalary = document.getElementById('modal-salary').value.trim();
        if (newSalary) {
            store.updateUser({ email: email, salary: newSalary });
            overlay.remove();
            showToast('success', 'Salary Updated', `${user.name}'s salary has been updated to ${newSalary}.`);
            renderView('payroll');
        }
    });
}
