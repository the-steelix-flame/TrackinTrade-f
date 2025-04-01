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


document.addEventListener("DOMContentLoaded", function () {
    const userId = 1; // TODO: Replace this with the logged-in user's ID
    fetch(`/get-journal-entries?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error:", data.error);
                return;
            }

            const table = document.getElementById("trade-table");
            const tradeHeaderRow = document.getElementById("trade-header");

            data.forEach((trade, index) => {
                // ✅ Add Column Header
                const tradeHeaderCell = document.createElement("th");
                tradeHeaderCell.textContent = `${trade.trade_date} / Trade ${index + 1}`;
                tradeHeaderRow.appendChild(tradeHeaderCell);

                // ✅ Populate Data in Each Row
                const rows = table.querySelectorAll("tbody tr");
                rows.forEach(row => {
                    if (row.querySelector("th") !== null) return;
                    const cells = row.querySelectorAll("td");

                    // ✅ Find matching field & insert value
                    const fieldMapping = {
                        "Timeframe": trade.timeframe,
                        "Stock": trade.stock,
                        "Position Size": trade.position_size,
                        "Direction (Long/Short)": trade.direction,
                        "Entry Price": trade.entry_price,
                        "Entry Time": trade.entry_time,
                        "Reason for Entry (Setup/Signal)": trade.entry_reason,
                        "Exit Price": trade.exit_price,
                        "Exit Time": trade.exit_time,
                        "Reason for Exit (Target/Stop Loss/Emotion)": trade.exit_reason,
                        "Stop Loss Price": trade.stop_loss_price,
                        "Target Price": trade.target_price,
                        "Risk-Reward Ratio": trade.risk_reward_ratio,
                        "Profit/Loss": trade.profit_loss,
                        "Percentage Return": trade.percentage_return,
                        "Overall Market Trend (Bullish/Bearish/Sideways)": trade.overall_market_trend,
                        "News/Events Impacting Trade": trade.news_impact,
                        "Mistakes": trade.mistakes,
                        "What Went Well": trade.what_went_well,
                        "Emotions During Trade": trade.emotions_during_trade
                    };

                    const rowTitle = row.querySelector("td").textContent.trim();
                    if (fieldMapping[rowTitle] !== undefined) {
                        cells[1].querySelector("input").value = fieldMapping[rowTitle];
                    }
                });
            });
        })
        .catch(error => console.error("Error fetching data:", error));
});

// Utility Functions
const API_BASE = 'http://localhost:5000';

async function fetchWithAuth(url, options = {}) {
    options.credentials = 'include'; // Send cookies with JWT
    const response = await fetch(url, options);
    if (response.status === 401) handleLogout();
    return response;
}

// 🔄 Load Journal Entries on Page Load
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetchWithAuth(`${API_BASE}/get-journal-entries?user_id=${getJwtUserId()}`);
        const entries = await response.json();
        
        entries.forEach(entry => {
            createTradeColumn(entry.id, entry); // Populate existing entries
        });
    } catch (error) {
        showErrorToast('Failed to load journal entries');
    }
});

// ➕ Save New Trade
async function saveTradeEntry(entryData) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/add-journal-entry`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(entryData)
        });
        return await response.json();
    } catch (error) {
        showErrorToast('Failed to save trade');
    }
}

// ✏️ Auto-Save on Input Change
document.querySelectorAll('#trade-table input').forEach(input => {
    input.addEventListener('blur', async (e) => {
        const entryId = e.target.closest('td').dataset.entryId;
        await fetchWithAuth(`${API_BASE}/update-journal-entry/${entryId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({[e.target.name]: e.target.value})
        });
    });
});

// 🗑️ Delete Trade
async function deleteTrade(entryId) {
    if (confirm('Delete this trade permanently?')) {
        await fetchWithAuth(`${API_BASE}/delete-journal-entry/${entryId}`, {
            method: 'DELETE'
        });
        document.querySelector(`td[data-entry-id="${entryId}"]`).remove();
    }
}
