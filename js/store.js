// Mock Database using LocalStorage
class Store {
    constructor() {
        this.init();
    }

    init() {
        // Version check — if data is from an older build, reset it
        const DATA_VERSION = '3';
        if (localStorage.getItem('hrms_data_version') !== DATA_VERSION) {
            localStorage.removeItem('hrms_users');
            localStorage.removeItem('hrms_attendance');
            localStorage.removeItem('hrms_leaves');
            localStorage.removeItem('hrms_current_user');
            localStorage.setItem('hrms_data_version', DATA_VERSION);
        }
        
        if (!localStorage.getItem('hrms_users')) {
            // Default users for testing
            localStorage.setItem('hrms_users', JSON.stringify([
                {
                    id: 'EMP-000',
                    name: 'System Admin',
                    email: 'admin@meow.com',
                    password: 'admin',
                    role: 'Admin',
                    department: 'HR',
                    phone: '+91 98765 43210',
                    address: 'Mumbai, Maharashtra, India',
                    salary: '₹9,60,000',
                    joinDate: '2024-01-15'
                },
                {
                    id: 'EMP-001',
                    name: 'Priya Sharma',
                    email: 'priya@meow.com',
                    password: 'priya123',
                    role: 'Employee',
                    department: 'Engineering',
                    phone: '+91 87654 32109',
                    address: 'Bangalore, Karnataka, India',
                    salary: '₹7,20,000',
                    joinDate: '2024-06-01'
                },
                {
                    id: 'EMP-002',
                    name: 'Rahul Patel',
                    email: 'rahul@meow.com',
                    password: 'rahul123',
                    role: 'Employee',
                    department: 'Marketing',
                    phone: '+91 76543 21098',
                    address: 'Delhi, India',
                    salary: '₹6,00,000',
                    joinDate: '2025-01-10'
                }
            ]));
        }
        if (!localStorage.getItem('hrms_attendance')) {
            // Seed some demo attendance data
            const demoAttendance = [];
            const users = JSON.parse(localStorage.getItem('hrms_users'));
            const today = new Date();
            
            users.forEach(u => {
                for (let i = 1; i <= 5; i++) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
                    
                    const hour = 8 + Math.floor(Math.random() * 2);
                    const min = Math.floor(Math.random() * 60);
                    const outHour = 17 + Math.floor(Math.random() * 2);
                    const outMin = Math.floor(Math.random() * 60);
                    
                    demoAttendance.push({
                        userEmail: u.email,
                        userName: u.name,
                        date: d.toISOString().split('T')[0],
                        timeIn: `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`,
                        timeOut: `${String(outHour).padStart(2,'0')}:${String(outMin).padStart(2,'0')}`,
                        status: 'Present',
                        totalHours: outHour - hour
                    });
                }
            });
            
            localStorage.setItem('hrms_attendance', JSON.stringify(demoAttendance));
        }
        if (!localStorage.getItem('hrms_leaves')) {
            // Seed demo leave requests
            localStorage.setItem('hrms_leaves', JSON.stringify([
                {
                    id: 'L-demo001',
                    userEmail: 'priya@meow.com',
                    userName: 'Priya Sharma',
                    type: 'Sick',
                    start: '2026-07-07',
                    end: '2026-07-08',
                    remarks: 'Not feeling well, need to visit a doctor.',
                    status: 'Pending',
                    comment: '',
                    appliedOn: '2026-07-03'
                }
            ]));
        }
    }

    // User Operations
    getUsers() {
        return JSON.parse(localStorage.getItem('hrms_users')) || [];
    }
    
    getUserByEmail(email) {
        return this.getUsers().find(u => u.email === email);
    }

    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('hrms_users', JSON.stringify(users));
    }

    updateUser(updatedUser) {
        let users = this.getUsers();
        const index = users.findIndex(u => u.email === updatedUser.email);
        if(index !== -1) {
            users[index] = { ...users[index], ...updatedUser };
            localStorage.setItem('hrms_users', JSON.stringify(users));
        }
    }

    // Session Operations
    setCurrentUser(user) {
        localStorage.setItem('hrms_current_user', JSON.stringify(user));
    }

    getCurrentUser() {
        const user = localStorage.getItem('hrms_current_user');
        return user ? JSON.parse(user) : null;
    }

    logout() {
        localStorage.removeItem('hrms_current_user');
    }

    // Attendance Operations
    getAttendance() {
        return JSON.parse(localStorage.getItem('hrms_attendance')) || [];
    }

    addAttendance(record) {
        const records = this.getAttendance();
        records.push(record);
        localStorage.setItem('hrms_attendance', JSON.stringify(records));
    }

    updateAttendance(userEmail, date, updates) {
        let records = this.getAttendance();
        const index = records.findIndex(r => r.userEmail === userEmail && r.date === date);
        if (index !== -1) {
            records[index] = { ...records[index], ...updates };
            localStorage.setItem('hrms_attendance', JSON.stringify(records));
        }
    }

    getAttendanceByUser(email) {
        return this.getAttendance().filter(a => a.userEmail === email);
    }

    getTodayAttendance(email) {
        const today = new Date().toISOString().split('T')[0];
        return this.getAttendanceByUser(email).find(a => a.date === today);
    }

    // Leave Operations
    getLeaves() {
        return JSON.parse(localStorage.getItem('hrms_leaves')) || [];
    }

    addLeave(leave) {
        const leaves = this.getLeaves();
        leaves.push(leave);
        localStorage.setItem('hrms_leaves', JSON.stringify(leaves));
    }

    updateLeaveStatus(id, status, comment) {
        let leaves = this.getLeaves();
        const index = leaves.findIndex(l => l.id === id);
        if(index !== -1) {
            leaves[index].status = status;
            leaves[index].comment = comment;
            localStorage.setItem('hrms_leaves', JSON.stringify(leaves));
        }
    }

    getLeavesByUser(email) {
        return this.getLeaves().filter(l => l.userEmail === email);
    }
}

// Toast notification system
function showToast(type, title, message, duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Global store instance
const store = new Store();
