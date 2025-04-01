// auth.js - Modern Error Handling & Dashboard Redirection

// UI Elements
const errorToast = document.createElement('div');
errorToast.className = 'error-toast hidden';
document.body.appendChild(errorToast);

// Utility Functions
const showError = (message, duration = 5000) => {
    errorToast.textContent = message;
    errorToast.classList.remove('hidden');
    setTimeout(() => errorToast.classList.add('hidden'), duration);
};

const handleAuthSuccess = (token) => {
    localStorage.setItem('access_token', token);
};

// Signup Form Handling
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value
    };

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData)
        });

        const data = await response.json();

        if (response.ok) {
            handleAuthSuccess(data.access_token);
            alert("Signup successful!");
            window.location.href = "/dashboard"; // Redirect to dashboard
        } else {
            if (response.status === 409) {
                showError('User already exists. Please login instead.');
                setTimeout(() => window.location.href = '/login_page', 2000);
            } else {
                showError(data.error || 'Registration failed. Please try again.');
            }
        }
    } catch (error) {
        showError('Network error. Please check your connection.');
    }
});

// Login Form Handling
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                email: form.email.value,
                password: form.password.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            handleAuthSuccess(data.access_token);
        } else {
            if (response.status === 401) {
                showError('Invalid credentials. Please try again.');
            } else {
                showError(data.error || 'Login failed. Please try again.');
            }
        }
    } catch (error) {
        showError('Network error. Please check your connection.');
    }
});

// Add this CSS for modern error toasts
const style = document.createElement('style');
style.textContent = `
.error-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: #ff4444;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1000;
    transform: translateX(150%);
    transition: transform 0.3s ease-out;
}
.error-toast.visible {
    transform: translateX(0);
}
`;
document.head.appendChild(style);
