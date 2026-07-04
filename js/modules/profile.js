window.renderProfileView = function(container) {
    const user = store.getCurrentUser();
    
    container.innerHTML = `
        <div class="card" style="max-width: 640px; margin: 0 auto;">
            <div class="profile-header">
                <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <div class="profile-meta">
                    <h2>${user.name}</h2>
                    <div class="profile-id">${user.id} · ${user.department || 'No Department'} · <span class="badge" style="background: rgba(113,75,103,0.15); color: var(--color-primary-light);">${user.role}</span></div>
                </div>
            </div>
            
            <form id="profile-form">
                <div class="form-grid">
                    <div class="input-group">
                        <label>Employee ID</label>
                        <input type="text" value="${user.id}" disabled>
                    </div>
                    <div class="input-group">
                        <label>Email Address</label>
                        <input type="email" value="${user.email}" disabled>
                    </div>
                    <div class="input-group">
                        <label>Full Name</label>
                        <input type="text" id="prof-name" value="${user.name}" required>
                    </div>
                    <div class="input-group">
                        <label>Department</label>
                        <select id="prof-department">
                            ${['Engineering','Marketing','Sales','Finance','HR','Operations'].map(d => 
                                `<option value="${d}" ${user.department === d ? 'selected' : ''}>${d}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Phone Number</label>
                        <input type="text" id="prof-phone" value="${user.phone || ''}" placeholder="+91 98765 43210">
                    </div>
                    <div class="input-group">
                        <label>Join Date</label>
                        <input type="date" value="${user.joinDate || ''}" disabled>
                    </div>
                    <div class="input-group" style="grid-column: span 2;">
                        <label>Address</label>
                        <textarea id="prof-address" rows="3" placeholder="Enter your address...">${user.address || ''}</textarea>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedInfo = {
            email: user.email,
            name: document.getElementById('prof-name').value,
            department: document.getElementById('prof-department').value,
            phone: document.getElementById('prof-phone').value,
            address: document.getElementById('prof-address').value,
        };
        
        store.updateUser(updatedInfo);
        
        const updatedUser = store.getUserByEmail(user.email);
        store.setCurrentUser(updatedUser);
        
        document.getElementById('sidebar-name').textContent = updatedUser.name;
        
        showToast('success', 'Profile Updated', 'Your changes have been saved.');
    });
}
