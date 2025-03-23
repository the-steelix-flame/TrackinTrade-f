document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Script loaded successfully!");


    // =======================
    // 🔹 SIGNUP FUNCTIONALITY
    // =======================
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent page reload
            console.log("🔹 Signup button clicked! Processing...");

            // Get input values
            const fullName = document.getElementById("full-name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // Basic validation
            if (!fullName || !email || !password) {
                alert("⚠️ Please fill in all fields.");
                return;
            }

            // Save user details (example: localStorage)
            localStorage.setItem("username", fullName);
            localStorage.setItem("email", email);

            alert(`🎉 Welcome, ${fullName}! Your account has been created.`);

            // Redirect to dashboard
            window.location.href = "dashboard.html";
        });
    }


    // =======================
    // 🔹 LOGIN FUNCTIONALITY
    // =======================
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent page refresh
            console.log("🔹 Login button clicked! Redirecting...");

            // Example: Save username (replace with actual auth logic)
            const usernameInput = document.querySelector("input[type='email']");
            if (usernameInput) {
                localStorage.setItem("username", usernameInput.value);
            }

            // Redirect to dashboard
            window.location.href = "dashboard.html";
        });
    } else {
        console.warn("⚠️ Login form not found!");
    }

    // =======================
    // 🔹 DASHBOARD FUNCTIONALITY
    // =======================
    const userNameSpan = document.getElementById('user-name');
    if (userNameSpan) {
        const username = localStorage.getItem('username') || 'Guest';
        userNameSpan.textContent = username;
    }

    // Buttons on dashboard
    const journalBtn = document.getElementById('journal-btn');
    const aiAnalysisBtn = document.getElementById('ai-analysis-btn');
    const notesBtn = document.getElementById('notes-btn');

    if (journalBtn) {
        journalBtn.addEventListener('click', () => {
            console.log("📖 Redirecting to Journal...");
            window.location.href = 'journal.html';
        });
    }

    if (aiAnalysisBtn) {
        aiAnalysisBtn.addEventListener('click', () => {
            alert('⚡ AI analysis feature coming soon!');
        });
    }

    if (notesBtn) {
        notesBtn.addEventListener('click', () => {
            console.log("📝 Redirecting to Notes...");
            window.location.href = 'notes.html';
        });
    }

    // =======================
    // 🔹 JOURNAL FUNCTIONALITY
    // =======================
    const addTradeBtn = document.getElementById('add-trade-btn');
    const tradeForm = document.getElementById('trade-form');

    if (addTradeBtn && tradeForm) {
        addTradeBtn.addEventListener('click', () => {
            tradeForm.classList.toggle('hidden');
        });
    }

    // =======================
    // 🔹 NOTES FUNCTIONALITY
    // =======================
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteForm = document.getElementById('note-form');

    if (addNoteBtn && noteForm) {
        addNoteBtn.addEventListener('click', () => {
            noteForm.classList.toggle('hidden');
        });
    }

    // =======================
    // 🔹 LOGOUT FUNCTIONALITY
    // =======================
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log("🔹 Logging out...");
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });
    }

    // =======================
    // 🔹 THEME SWITCHER
    // =======================
    const themeButton = document.getElementById("themeButton");
    const themeIcon = document.getElementById("themeIcon");
    let isDarkMode = false;

    if (themeButton && themeIcon) {
        themeButton.addEventListener("click", () => {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle("dark-theme", isDarkMode);

            // Change icon
            themeIcon.src = isDarkMode ? "sun.svg" : "moon.svg";
        });
    } else {
        console.warn("⚠️ Theme button or icon not found!");
    }

    // Theme toggle button (if exists)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
        });
    }
});
