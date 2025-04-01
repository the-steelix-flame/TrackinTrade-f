// Populate user details and portfolio summary
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/dashboard_summary', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();

            // Set user name and portfolio summary
            document.getElementById('user-name').textContent = data.username;
            document.getElementById('total-profit').textContent = `$${data.total_profit}`;
            document.getElementById('profit-trades').textContent = data.profit_trades;
            document.getElementById('loss-trades').textContent = data.loss_trades;
        } else {
            console.error('Failed to load dashboard data');
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
});

// Logout functionality
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('access_token'); // Clear JWT token
    window.location.href = '/login_page'; // Redirect to login page
});


document.querySelectorAll("#dashboard-actions button").forEach(button => {
    button.addEventListener("click", function() {
        window.location.href = this.getAttribute("data-url");
    });
});
