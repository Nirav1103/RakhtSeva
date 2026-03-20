/* ============================================
   RakhtSeva Admin Dashboard
   JavaScript Functionality
   ============================================ */

// ========== ADMIN STORAGE KEYS ==========
const ADMIN_KEYS = {
    ADMIN_SESSION: 'rakhtsevaAdminSession',
    ADMIN_CREDENTIALS: 'rakhtsevaAdminCredentials',
};

// ========== DEFAULT ADMIN CREDENTIALS ==========
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
    name: 'Administrator'
};

// ========== INITIALIZE ADMIN ==========
document.addEventListener('DOMContentLoaded', function() {
    initAdminCredentials();
    initAdminLogin();
    initAdminDashboard();
    // Theme is handled by script.js
});

// Initialize default admin credentials
function initAdminCredentials() {
    const savedCredentials = localStorage.getItem(ADMIN_KEYS.ADMIN_CREDENTIALS);
    if (!savedCredentials) {
        localStorage.setItem(ADMIN_KEYS.ADMIN_CREDENTIALS, JSON.stringify(DEFAULT_ADMIN));
    }
}

// ========== ADMIN LOGIN ==========
function initAdminLogin() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminSession = localStorage.getItem(ADMIN_KEYS.ADMIN_SESSION);
    
    // Check if already logged in
    if (adminSession) {
        showAdminDashboard();
        return;
    }
    
    if (!adminLoginForm) return;
    
    // Toggle password visibility
    const toggleAdminPassword = document.getElementById('toggleAdminPassword');
    const adminPasswordInput = document.getElementById('adminPassword');
    
    if (toggleAdminPassword && adminPasswordInput) {
        toggleAdminPassword.addEventListener('click', function() {
            const type = adminPasswordInput.type === 'password' ? 'text' : 'password';
            adminPasswordInput.type = type;
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
    
    // Handle login form submission
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        
        // Get stored credentials
        const credentials = JSON.parse(localStorage.getItem(ADMIN_KEYS.ADMIN_CREDENTIALS));
        
        if (username === credentials.username && password === credentials.password) {
            // Save session
            localStorage.setItem(ADMIN_KEYS.ADMIN_SESSION, JSON.stringify({
                username: username,
                loginTime: new Date().toISOString()
            }));
            
            showToast('Login successful! Welcome, Admin.', 'success');
            
            setTimeout(() => {
                showAdminDashboard();
            }, 1000);
        } else {
            showToast('Invalid credentials! Please try again.', 'error');
            document.getElementById('adminPasswordError').textContent = 'Invalid username or password';
            document.getElementById('adminPasswordError').classList.add('show');
        }
    });
}

// Show admin dashboard
function showAdminDashboard() {
    const loginSection = document.getElementById('adminLoginSection');
    const dashboard = document.getElementById('adminDashboard');
    
    if (loginSection) loginSection.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
    
    // Initialize dashboard components
    initSidebar();
    loadOverviewStats();
    loadRecentActivity();
    initOverviewCharts();
    loadUsersTable();
    initUserFilters();
    loadDonationsTable();
    loadBloodRequests();
    initRequestFilters();
    loadEmergencies();
}

// ========== SIDEBAR NAVIGATION ==========
function initSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    
    // Sidebar link navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
            
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Toggle sidebar on mobile
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem(ADMIN_KEYS.ADMIN_SESSION);
            showToast('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    }
    
    // Refresh data button
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.querySelector('i').classList.add('fa-spin');
            loadOverviewStats();
            loadUsersTable();
            loadDonationsTable();
            loadBloodRequests();
            loadEmergencies();
            
            setTimeout(() => {
                this.querySelector('i').classList.remove('fa-spin');
                showToast('Data refreshed!', 'success');
            }, 1000);
        });
    }
    
    // Update badge counts
    updateBadgeCounts();
}

// Show section
function showSection(sectionName) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById('section-' + sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        

    }
}

// Update badge counts
function updateBadgeCounts() {
    const users = JSON.parse(localStorage.getItem('rakhtsevaAllUsers') || '[]');
    const donations = JSON.parse(localStorage.getItem('rakhtsevaDonations') || '[]');
    const requests = JSON.parse(localStorage.getItem('rakhtsevaBloodRequests') || '[]');
    const emergencies = JSON.parse(localStorage.getItem('rakhtsevaEmergencyAlerts') || '[]');
    
    document.getElementById('userCount').textContent = users.length;
    document.getElementById('donationCount').textContent = donations.length;
    document.getElementById('requestCount').textContent = requests.filter(r => r.status === 'active').length;
    document.getElementById('emergencyCount').textContent = emergencies.filter(e => e.status === 'active').length;
}

// ========== OVERVIEW STATS ==========
function loadOverviewStats() {
    const users = JSON.parse(localStorage.getItem('rakhtsevaAllUsers') || '[]');
    const donations = JSON.parse(localStorage.getItem('rakhtsevaDonations') || '[]');
    const requests = JSON.parse(localStorage.getItem('rakhtsevaBloodRequests') || '[]');
    
    document.getElementById('statTotalUsers').textContent = users.length;
    document.getElementById('statTotalDonations').textContent = donations.length;
    document.getElementById('statLivesSaved').textContent = donations.length * 3;
    document.getElementById('statActiveRequests').textContent = requests.filter(r => r.status === 'active').length;
    
    // Update sidebar badges
    updateBadgeCounts();
}

// ========== RECENT ACTIVITY ==========
function loadRecentActivity() {
    const activityList = document.getElementById('recentActivityList');
    if (!activityList) return;
    
    const users = JSON.parse(localStorage.getItem('rakhtsevaAllUsers') || '[]');
    const donations = JSON.parse(localStorage.getItem('rakhtsevaDonations') || '[]');
    const requests = JSON.parse(localStorage.getItem('rakhtsevaBloodRequests') || '[]');
    
    const activities = [];
    
    // Add user registrations
    users.slice(-5).forEach(user => {
        activities.push({
            type: 'user',
            icon: 'fa-user-plus',
            color: 'blue',
            text: `${user.name} registered as a donor`,
            time: user.registeredAt
        });
    });
    
    // Add donations
    donations.slice(-5).forEach(donation => {
        activities.push({
            type: 'donation',
            icon: 'fa-tint',
            color: 'red',
            text: `${donation.name} donated ${donation.units} unit(s) of ${donation.bloodGroup}`,
            time: donation.createdAt
        });
    });
    
    // Add blood requests
    requests.slice(-3).forEach(request => {
        activities.push({
            type: 'request',
            icon: 'fa-ambulance',
            color: 'orange',
            text: `Blood request for ${request.bloodGroup} at ${request.hospital}`,
            time: request.createdAt
        });
    });
    
    // Sort by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    activityList.innerHTML = activities.slice(0, 8).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.color}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <p>${activity.text}</p>
                <span class="activity-time">${formatTimeAgo(activity.time)}</span>
            </div>
        </div>
    `).join('');
}

// Format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    
    return date.toLocaleDateString();
}

// ========== OVERVIEW CHARTS ==========
function initOverviewCharts() {
    // Weekly Donations Chart
    const weeklyCtx = document.getElementById('weeklyDonationsChart');
    if (weeklyCtx) {
        new Chart(weeklyCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Donations',
                    data: [12, 19, 15, 25, 22, 30, 18],
                    borderColor: '#D32F2F',
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
    
    // Blood Group Pie Chart
    const pieCtx = document.getElementById('bloodGroupPieChart');
    if (pieCtx) {
        const donations = JSON.parse(localStorage.getItem('rakhtsevaDonations') || '[]');
        const bloodGroups = {};
        donations.forEach(d => {
            bloodGroups[d.bloodGroup] = (bloodGroups[d.bloodGroup] || 0) + 1;
        });
        
        new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(bloodGroups).length > 0 ? Object.keys(bloodGroups) : ['A+', 'B+', 'O+', 'AB+'],
                datasets: [{
                    data: Object.keys(bloodGroups).length > 0 ? Object.values(bloodGroups) : [30, 25, 35, 10],
                    backgroundColor: ['#D32F2F', '#E53935', '#F44336', '#EF5350', '#00897B', '#26A69A', '#4DB6AC', '#80CBC4']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// ========== USERS TABLE ==========

// Attach filter/search/sort event listeners once sidebar is ready
function initUserFilters() {
    const filterBlood  = document.getElementById('filterUserBlood');
    const filterStatus = document.getElementById('filterUserStatus');
    const sortUsers    = document.getElementById('sortUsers');
    const adminSearch  = document.getElementById('adminSearch');

    if (filterBlood)  filterBlood.addEventListener('change', loadUsersTable);
    if (filterStatus) filterStatus.addEventListener('change', loadUsersTable);
    if (sortUsers)    sortUsers.addEventListener('change', loadUsersTable);
    if (adminSearch)  adminSearch.addEventListener('input', loadUsersTable);
}

function loadUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    let users     = JSON.parse(localStorage.getItem('rakhtsevaAllUsers') || '[]');
    const donations = JSON.parse(localStorage.getItem('rakhtsevaDonations') || '[]');

    // ── Read current filter values ────────────────────────────────────────────
    const filterBlood  = (document.getElementById('filterUserBlood')?.value  || 'all').trim();
    const filterStatus = (document.getElementById('filterUserStatus')?.value || 'all').trim();
    const sortBy       = document.getElementById('sortUsers')?.value || 'newest';
    const searchTerm   = (document.getElementById('adminSearch')?.value || '').toLowerCase().trim();

    const totalAll = users.length;

    // ── Apply blood group filter ──────────────────────────────────────────────
    if (filterBlood !== 'all') {
        users = users.filter(u => u.bloodGroup === filterBlood);
    }

    // ── Apply status filter (all users are "active" in this system) ───────────
    // (status filter kept for UI completeness; extend if you add inactive logic)

    // ── Apply search (name, email, phone, blood group) ────────────────────────
    if (searchTerm) {
        users = users.filter(u =>
            (u.name  || '').toLowerCase().includes(searchTerm) ||
            (u.email || '').toLowerCase().includes(searchTerm) ||
            (u.phone || '').toLowerCase().includes(searchTerm) ||
            (u.bloodGroup || '').toLowerCase().includes(searchTerm)
        );
    }

    // ── Apply sort ────────────────────────────────────────────────────────────
    if (sortBy === 'oldest') {
        users.sort((a, b) => new Date(a.registeredAt) - new Date(b.registeredAt));
    } else if (sortBy === 'name') {
        users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'donations') {
        users.sort((a, b) => {
            const aC = donations.filter(d => d.email === a.email).length;
            const bC = donations.filter(d => d.email === b.email).length;
            return bC - aC;
        });
    } else {
        // newest first (default)
        users.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
    }

    // ── Render ────────────────────────────────────────────────────────────────
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="no-data">
                    <i class="fas fa-users"></i>
                    <p>No users match the selected filters</p>
                </td>
            </tr>
        `;
        document.getElementById('showingUsers').textContent = 0;
        document.getElementById('totalUsersCount').textContent = totalAll;
        return;
    }

    tableBody.innerHTML = users.map(user => {
        const userDonations = donations.filter(d => d.email === user.email).length;

        return `
            <tr>
                <td><input type="checkbox" class="user-checkbox" data-id="${user.id}"></td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${user.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <strong>${user.name}</strong>
                            ${userDonations >= 10 ? '<span class="badge gold">Gold</span>' :
                              userDonations >= 5  ? '<span class="badge silver">Silver</span>' :
                              userDonations >= 3  ? '<span class="badge bronze">Bronze</span>' : ''}
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="blood-badge">${user.bloodGroup}</span></td>
                <td>${user.phone || 'N/A'}</td>
                <td><strong>${userDonations}</strong> donations</td>
                <td><span class="status-badge active">Active</span></td>
                <td>${formatDate(user.registeredAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editUser(${user.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="confirmDeleteUser(${user.id}, '${user.name}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Update counts
    document.getElementById('showingUsers').textContent = users.length;
    document.getElementById('totalUsersCount').textContent = totalAll;
}

// Get donor badge
function getDonorBadge(count) {
    if (count >= 10) return { name: 'Gold', class: 'gold' };
    if (count >= 5) return { name: 'Silver', class: 'silver' };
    if (count >= 3) return { name: 'Bronze', class: 'bronze' };
    return { name: 'New', class: 'new' };
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Edit user
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('rakhtsevaAllUsers') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showToast('User not found!', 'error');
        return;
    }
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserPhone').value = user.phone || '';
    document.getElementById('editUserBlood').value = user.bloodGroup;
    document.getElementById('editUserAge').value = user.age || '';
    document.getElementById('editUserAddress').value = user.address || '';
    
    openModal('editUserModal');
}

// Save user changes
function saveUserChanges() {
    const userId = parseInt(document.getElementById('editUserId').value);
    const users = JSON.parse(localStorage.getItem('rakhtsevaAllUsers') || '[]');
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
        showToast('User not found!', 'error');
        return;
    }
    
    users[index].name = document.getElementById('editUserName').value;
    users[index].email = document.getElementById('editUserEmail').value;
    users[index].phone = document.getElementById('editUserPhone').value;
    users[index].bloodGroup = document.getElementById('editUserBlood').value;
    users[index].age = document.getElementById('editUserAge').value;
    users[index].address = document.getElementById('editUserAddress').value;
    
    localStorage.setItem('rakhtsevaAllUsers', JSON.stringify(users));
    
    closeModal('editUserModal');
    loadUsersTable();
    showToast('User updated successfully!', 'success');
}

// Confirm delete user
function confirmDeleteUser(userId, userName) {
    document.getElementById('deleteUserName').textContent = userName;
    document.getElementById('confirmDeleteBtn').onclick = function() {
        deleteUser(userId);
    };
    openModal('confirmDeleteModal');
}

// Delete user
function deleteUser(userId) {
    let users = JSON.parse(localStorage.getItem('rakhtsevaAllUsers') || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('rakhtsevaAllUsers', JSON.stringify(users));
    
    closeModal('confirmDeleteModal');
    loadUsersTable();
    loadOverviewStats();
    showToast('User deleted successfully!', 'success');
}

// Open add user modal
function openAddUserModal() {
    document.getElementById('addUserForm').reset();
    openModal('addUserModal');
}

// Add new user
function addNewUser() {
    const name = document.getElementById('addUserName').value.trim();
    const email = document.getElementById('addUserEmail').value.trim();
    const password = document.getElementById('addUserPassword').value;
    const phone = document.getElementById('addUserPhone').value.trim();
    const bloodGroup = document.getElementById('addUserBlood').value;
    const age = document.getElementById('addUserAge').value;
    const address = document.getElementById('addUserAddress').value.trim();
    
    if (!name || !email || !password || !bloodGroup) {
        showToast('Please fill all required fields!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('rakhtsevaAllUsers') || '[]');
    
    // Check if email exists
    if (users.find(u => u.email === email)) {
        showToast('Email already registered!', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        phone,
        bloodGroup,
        age,
        address,
        registeredAt: new Date().toISOString(),
        isAvailableToDonate: true
    };
    
    users.push(newUser);
    localStorage.setItem('rakhtsevaAllUsers', JSON.stringify(users));
    
    closeModal('addUserModal');
    loadUsersTable();
    loadOverviewStats();
    loadRecentActivity();
    showToast('User added successfully!', 'success');
}

// ========== DONATIONS TABLE ==========
function loadDonationsTable() {
    const tableBody = document.getElementById('donationsTableBody');
    if (!tableBody) return;
    
    const donations = JSON.parse(localStorage.getItem('rakhtsevaDonations') || '[]');
    
    // Calculate stats
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);
    
    let todayCount = 0, weekCount = 0, monthCount = 0, totalUnits = 0;
    
    donations.forEach(d => {
        const donationDate = new Date(d.rawDate || d.createdAt);
        if (d.rawDate === todayStr) todayCount++;
        if (donationDate >= weekAgo) weekCount++;
        if (donationDate >= monthAgo) monthCount++;
        totalUnits += parseInt(d.units) || 1;
    });
    
    document.getElementById('todayDonations').textContent = todayCount;
    document.getElementById('weekDonations').textContent = weekCount;
    document.getElementById('monthDonations').textContent = monthCount;
    document.getElementById('totalUnits').textContent = totalUnits;
    
    if (donations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <i class="fas fa-hand-holding-heart"></i>
                    <p>No donations recorded yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = donations.slice().reverse().map(donation => `
        <tr>
            <td><code>${donation.certificateId}</code></td>
            <td><strong>${donation.name}</strong></td>
            <td><span class="blood-badge">${donation.bloodGroup}</span></td>
            <td>${donation.units} unit(s)</td>
            <td>${donation.location}</td>
            <td>${donation.date}</td>
            <td>
                <span class="cert-status available">
                    <i class="fas fa-certificate"></i> Generated
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view" onclick="viewDonation('${donation.certificateId}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ========== BLOOD REQUESTS ==========

function initRequestFilters() {
    const filterStatus  = document.getElementById('filterRequestStatus');
    const filterUrgency = document.getElementById('filterRequestUrgency');
    const filterBlood   = document.getElementById('filterRequestBlood');
    if (filterStatus)  filterStatus.addEventListener('change', loadBloodRequests);
    if (filterUrgency) filterUrgency.addEventListener('change', loadBloodRequests);
    if (filterBlood)   filterBlood.addEventListener('change', loadBloodRequests);
}

function loadBloodRequests() {
    const grid = document.getElementById('requestsAdminGrid');
    if (!grid) return;

    let requests = JSON.parse(localStorage.getItem('rakhtsevaBloodRequests') || '[]');

    // ── Read filter values ────────────────────────────────────────────────────
    const filterStatus  = (document.getElementById('filterRequestStatus')?.value  || 'all');
    const filterUrgency = (document.getElementById('filterRequestUrgency')?.value || 'all');
    const filterBlood   = (document.getElementById('filterRequestBlood')?.value   || 'all');

    // ── Apply filters ─────────────────────────────────────────────────────────
    if (filterStatus !== 'all') {
        // 'pending' maps to 'active' in the data model
        const matchStatus = filterStatus === 'pending' ? 'active' : filterStatus;
        requests = requests.filter(r => r.status === matchStatus);
    }
    if (filterUrgency !== 'all') {
        requests = requests.filter(r => r.urgency === filterUrgency);
    }
    if (filterBlood !== 'all') {
        requests = requests.filter(r => r.bloodGroup === filterBlood);
    }

    if (requests.length === 0) {
        grid.innerHTML = `
            <div class="no-data-card">
                <i class="fas fa-check-circle"></i>
                <p>No blood requests match the selected filters</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = requests.slice().reverse().map(request => `
        <div class="request-admin-card ${request.urgency} ${request.status}">
            <div class="request-admin-header">
                <div class="request-blood-type">
                    <span class="blood-badge large">${request.bloodGroup}</span>
                    <span class="units">${request.units} Unit(s)</span>
                </div>
                <div class="request-status">
                    <span class="urgency-tag ${request.urgency}">
                        ${request.urgency === 'critical' ? '🔴 Critical' :
                          request.urgency === 'urgent'   ? '🟠 Urgent'   : '🟢 Planned'}
                    </span>
                    <span class="status-tag ${request.status}">${request.status}</span>
                </div>
            </div>
            <div class="request-admin-body">
                <p><i class="fas fa-user"></i> <strong>Patient:</strong> ${request.patientName}</p>
                <p><i class="fas fa-hospital"></i> <strong>Hospital:</strong> ${request.hospital}</p>
                <p><i class="fas fa-map-marker-alt"></i> <strong>City:</strong> ${request.city}</p>
                <p><i class="fas fa-phone"></i> <strong>Contact:</strong> ${request.contactPhone}</p>
                <p><i class="fas fa-clock"></i> <strong>Submitted:</strong> ${formatTimeAgo(request.createdAt)}</p>
            </div>
            <div class="request-admin-actions">
                ${request.status === 'active' ? `
                    <button class="btn btn-success btn-sm" onclick="updateRequestStatus(${request.id}, 'approved')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="updateRequestStatus(${request.id}, 'fulfilled')">
                        <i class="fas fa-check-double"></i> Fulfilled
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="updateRequestStatus(${request.id}, 'cancelled')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                ` : `
                    <span class="status-info">Status: ${request.status}</span>
                `}
            </div>
        </div>
    `).join('');
}

// Update request status
function updateRequestStatus(requestId, status) {
    let requests = JSON.parse(localStorage.getItem('rakhtsevaBloodRequests') || '[]');
    const index = requests.findIndex(r => r.id === requestId);
    
    if (index !== -1) {
        requests[index].status = status;
        localStorage.setItem('rakhtsevaBloodRequests', JSON.stringify(requests));
        loadBloodRequests();
        updateBadgeCounts();
        showToast(`Request ${status}!`, 'success');
    }
}

// ========== EMERGENCIES ==========
function loadEmergencies() {
    const list = document.getElementById('emergencyAdminList');
    if (!list) return;
    
    const emergencies = JSON.parse(localStorage.getItem('rakhtsevaEmergencyAlerts') || '[]');
    
    const active = emergencies.filter(e => e.status === 'active' && new Date(e.expiresAt) > new Date());
    const resolved = emergencies.filter(e => e.status === 'resolved');
    const expired = emergencies.filter(e => e.status === 'active' && new Date(e.expiresAt) <= new Date());
    
    document.getElementById('activeEmergencyCount').textContent = active.length;
    document.getElementById('resolvedEmergencyCount').textContent = resolved.length;
    document.getElementById('expiredEmergencyCount').textContent = expired.length;
    
    if (emergencies.length === 0) {
        list.innerHTML = `
            <div class="no-data-card">
                <i class="fas fa-check-circle"></i>
                <p>No emergency alerts</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = emergencies.map(emergency => {
        const expiresAt = new Date(emergency.expiresAt);
        const isExpired = expiresAt <= new Date();
        const isActive = emergency.status === 'active' && !isExpired;
        
        return `
            <div class="emergency-admin-card ${isActive ? 'active' : isExpired ? 'expired' : 'resolved'}">
                <div class="emergency-admin-header">
                    <span class="blood-badge large">${emergency.bloodGroup}</span>
                    <span class="emergency-status ${isActive ? 'active' : isExpired ? 'expired' : 'resolved'}">
                        ${isActive ? '🔴 ACTIVE' : isExpired ? '⚫ EXPIRED' : '✅ RESOLVED'}
                    </span>
                </div>
                <div class="emergency-admin-body">
                    <p><strong>${emergency.patientName}</strong></p>
                    <p><i class="fas fa-hospital"></i> ${emergency.hospital}</p>
                    <p><i class="fas fa-phone"></i> ${emergency.phone}</p>
                    <p><i class="fas fa-clock"></i> Created: ${formatTimeAgo(emergency.createdAt)}</p>
                </div>
                ${isActive ? `
                    <div class="emergency-admin-actions">
                        <button class="btn btn-success btn-sm" onclick="resolveEmergencyAdmin(${emergency.id})">
                            <i class="fas fa-check"></i> Mark Resolved
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).reverse().join('');
}

// Resolve emergency from admin
function resolveEmergencyAdmin(emergencyId) {
    let emergencies = JSON.parse(localStorage.getItem('rakhtsevaEmergencyAlerts') || '[]');
    const index = emergencies.findIndex(e => e.id === emergencyId);
    
    if (index !== -1) {
        emergencies[index].status = 'resolved';
        localStorage.setItem('rakhtsevaEmergencyAlerts', JSON.stringify(emergencies));
        loadEmergencies();
        updateBadgeCounts();
        showToast('Emergency marked as resolved!', 'success');
    }
}


// ========== MODAL FUNCTIONS ==========
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Close modals on overlay click
document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function() {
        this.parentElement.classList.remove('show');
    });
});

// ========== EXPORT DATA ==========
function exportData() {
    const data = {
        users: JSON.parse(localStorage.getItem('rakhtsevaAllUsers') || '[]'),
        donations: JSON.parse(localStorage.getItem('rakhtsevaDonations') || '[]'),
        requests: JSON.parse(localStorage.getItem('rakhtsevaBloodRequests') || '[]'),
        emergencies: JSON.parse(localStorage.getItem('rakhtsevaEmergencyAlerts') || '[]'),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rakhtseva-data-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    
    showToast('Data exported successfully!', 'success');
}

function exportAllData() {
    exportData();
}

function backupData() {
    exportData();
    showToast('Backup created!', 'success');
}

function confirmResetData() {
    if (confirm('⚠️ WARNING: This will delete ALL data including users, donations, and requests. This action cannot be undone. Are you sure?')) {
        localStorage.removeItem('rakhtsevaAllUsers');
        localStorage.removeItem('rakhtsevaDonations');
        localStorage.removeItem('rakhtsevaBloodRequests');
        localStorage.removeItem('rakhtsevaEmergencyAlerts');
        localStorage.removeItem(ADMIN_KEYS.ANNOUNCEMENTS);
        
        showToast('All data has been reset!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

// ========== THEME TOGGLE ==========
function initTheme() {
    const savedTheme = localStorage.getItem('rakhtsevaTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('rakhtsevaTheme', isDark ? 'dark' : 'light');
            updateThemeIcon(isDark);
        });
    }
}

function updateThemeIcon(isDark) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ========== TOAST ==========
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = 'toast ' + type + ' show';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========== ADMIN DASHBOARD INITIALIZATION ==========
function initAdminDashboard() {
    // Additional initialization if needed
}

// Console log for admin
console.log('%c🔐 RakhtSeva Admin Dashboard', 'color: #D32F2F; font-size: 20px; font-weight: bold;');
console.log('%cDefault Login: admin / admin123', 'color: #00897B; font-size: 14px;');