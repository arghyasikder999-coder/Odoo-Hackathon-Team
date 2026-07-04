document.addEventListener('DOMContentLoaded', () => {
    // If user is already logged in, redirect to dashboard
    if (store.getCurrentUser()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');

    // Toggle Forms
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signupForm.classList.add('active');
        loginError.textContent = '';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.remove('active');
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        loginForm.classList.add('active');
        signupError.textContent = '';
    });

    // Handle Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginError.textContent = '';
        
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        const user = store.getUserByEmail(email);

        if (user && user.password === password) {
            store.setCurrentUser(user);
            showToast('success', 'Welcome back!', `Signed in as ${user.name}`);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 600);
        } else {
            loginError.textContent = 'Invalid email or password. Please try again.';
        }
    });

    // Handle Signup
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        signupError.textContent = '';
        
        const id = document.getElementById('signup-empid').value.trim();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        const password = document.getElementById('signup-password').value;
        const department = document.getElementById('signup-department').value;
        const role = document.getElementById('signup-role').value;

        // Validation
        if (password.length < 6) {
            signupError.textContent = 'Password must be at least 6 characters.';
            return;
        }
        
        if (store.getUserByEmail(email)) {
            signupError.textContent = 'This email is already registered.';
            return;
        }

        const newUser = {
            id,
            name,
            email,
            password,
            role,
            department,
            phone: '',
            address: '',
            salary: 'Pending Configuration',
            joinDate: new Date().toISOString().split('T')[0]
        };

        store.addUser(newUser);
        store.setCurrentUser(newUser);
        
        showToast('success', 'Account created!', `Welcome to Meow HRMS, ${name}`);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 600);
    });
});
