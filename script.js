/* ============================================
   RakhtSeva - Blood Donation Website
   Enhanced JavaScript with Full Features
   - Certificate download only after donation date
   - Blood request system
   - Available donors list
   - Contact functionality
   ============================================ */

// ========== GLOBAL VARIABLES ==========
const STORAGE_KEYS = {
    USER: 'rakhtsevaUser',
    CURRENT_SESSION: 'rakhtsevaSession',
    DONATIONS: 'rakhtsevaDonations',
    REMEMBER_ME: 'rakhtsevaRemember',
    BLOOD_REQUESTS: 'rakhtsevaBloodRequests',
    ALL_USERS: 'rakhtsevaAllUsers',
    THEME: 'rakhtsevaTheme',
    EMERGENCY_ALERTS: 'rakhtsevaEmergencyAlerts',
    REMINDER_DISMISSED: 'rakhtsevaReminderDismissed'
};

// ========== DUMMY DATA FOR TESTING ==========
function initDummyData() {
    let existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');

    // ── Always ensure special accounts exist ──────────────────────────────────

    const ensure = (user) => {
        if (!existingUsers.find(u => u.email === user.email)) {
            existingUsers.push(user);
        }
    };

    ensure({
        id: 2001, name: 'Kavya Parmar', email: 'kavya@gmail.com',
        password: 'Ka!12345', bloodGroup: 'B+', age: 22,
        phone: '9876501234', address: '12, Shyamal Cross Road, Satellite, Ahmedabad, Gujarat',
        registeredAt: '2025-06-01T09:00:00.000Z', isAvailableToDonate: true
    });
    ensure({
        id: 2002, name: 'Nirav Mistry', email: 'nirav@gmail.com',
        password: 'Nr@98765', bloodGroup: 'A+', age: 23,
        phone: '9876502345', address: '45, Bodakdev, Ahmedabad, Gujarat',
        registeredAt: '2025-06-05T10:00:00.000Z', isAvailableToDonate: true
    });
    ensure({
        id: 2003, name: 'Asha Odedra', email: 'asha@gmail.com',
        password: 'As#56789', bloodGroup: 'O+', age: 22,
        phone: '9876503456', address: '78, Gota, Ahmedabad, Gujarat',
        registeredAt: '2025-06-10T11:00:00.000Z', isAvailableToDonate: true
    });

    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(existingUsers));

    // ── Seed all data if not already seeded ──────────────────────────────────
    if (localStorage.getItem('rakhtseva_seeded')) {
        // Patch: ensure kavya@gmail.com donations exist even if seeded before
        const _allDon = JSON.parse(localStorage.getItem('rakhtsevaDonations') || '[]');
        if (!_allDon.some(d => d.email === 'kavya@gmail.com')) {
            const _d = (n) => { const dt = new Date(); dt.setDate(dt.getDate()-n); return dt; };
            const _fmt = (dt) => dt.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
            const _kavyaDon = [
                { email:'kavya@gmail.com', name:'Kavya Parmar', bloodGroup:'B+', rawDate:_d(180).toISOString().split('T')[0], date:_fmt(_d(180)), location:'Civil Hospital Blood Bank, Ahmedabad',  units:'1', certificateId:'RS-2025-KP001', createdAt:_d(180).toISOString() },
                { email:'kavya@gmail.com', name:'Kavya Parmar', bloodGroup:'B+', rawDate:_d(120).toISOString().split('T')[0], date:_fmt(_d(120)), location:'Red Cross Society, Ahmedabad',          units:'1', certificateId:'RS-2025-KP002', createdAt:_d(120).toISOString() },
                { email:'kavya@gmail.com', name:'Kavya Parmar', bloodGroup:'B+', rawDate:_d(60).toISOString().split('T')[0],  date:_fmt(_d(60)),  location:'Sterling Hospital Blood Drive',         units:'1', certificateId:'RS-2025-KP003', createdAt:_d(60).toISOString()  },
                { email:'kavya@gmail.com', name:'Kavya Parmar', bloodGroup:'B+', rawDate:_d(10).toISOString().split('T')[0],  date:_fmt(_d(10)),  location:'Community Health Center, Satellite',    units:'1', certificateId:'RS-2025-KP004', createdAt:_d(10).toISOString()  },
            ];
            localStorage.setItem('rakhtsevaDonations', JSON.stringify(_allDon.concat(_kavyaDon)));
            console.log('✅ Patched kavya@gmail.com donations');
        }
        return;
    }

    console.log('🔧 Seeding dummy data...');

    const d = (daysAgo) => {
        const dt = new Date();
        dt.setDate(dt.getDate() - daysAgo);
        return dt;
    };
    const fmt = (dt) => dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const iso = (dt) => dt.toISOString();
    const raw = (dt) => dt.toISOString().split('T')[0];

    // ── ALL USERS (dummy + the 3 gmail accounts already added above) ─────────
    const dummyUsers = [
        { id: 1001, name: 'Rahul Sharma',   email: 'rahul@example.com',  password: 'Test@123', bloodGroup: 'O+',  age: 28, phone: '9876543210', address: '123, MG Road, Ahmedabad, Gujarat',          registeredAt: '2024-01-15T10:30:00.000Z', isAvailableToDonate: true },
        { id: 1002, name: 'Priya Patel',    email: 'priya@example.com',  password: 'Test@123', bloodGroup: 'A+',  age: 25, phone: '9876543211', address: '456, SG Highway, Ahmedabad, Gujarat',       registeredAt: '2024-01-20T14:45:00.000Z', isAvailableToDonate: true },
        { id: 1003, name: 'Amit Kumar',     email: 'amit@example.com',   password: 'Test@123', bloodGroup: 'B+',  age: 32, phone: '9876543212', address: '789, CG Road, Ahmedabad, Gujarat',          registeredAt: '2024-02-05T09:15:00.000Z', isAvailableToDonate: true },
        { id: 1004, name: 'Sneha Desai',    email: 'sneha@example.com',  password: 'Test@123', bloodGroup: 'AB+', age: 27, phone: '9876543213', address: '321, Law Garden, Ahmedabad, Gujarat',       registeredAt: '2024-02-10T16:20:00.000Z', isAvailableToDonate: true },
        { id: 1005, name: 'Vikram Singh',   email: 'vikram@example.com', password: 'Test@123', bloodGroup: 'O-',  age: 35, phone: '9876543214', address: '654, Satellite, Ahmedabad, Gujarat',        registeredAt: '2024-02-15T11:00:00.000Z', isAvailableToDonate: true },
        { id: 1006, name: 'Neha Joshi',     email: 'neha@example.com',   password: 'Test@123', bloodGroup: 'A-',  age: 29, phone: '9876543215', address: '987, Vastrapur, Ahmedabad, Gujarat',        registeredAt: '2024-02-20T13:30:00.000Z', isAvailableToDonate: true },
        { id: 1007, name: 'Ravi Mehta',     email: 'ravi@example.com',   password: 'Test@123', bloodGroup: 'B-',  age: 31, phone: '9876543216', address: '147, Paldi, Ahmedabad, Gujarat',            registeredAt: '2024-03-01T08:45:00.000Z', isAvailableToDonate: true },
        { id: 1008, name: 'Ananya Shah',    email: 'ananya@example.com', password: 'Test@123', bloodGroup: 'AB-', age: 26, phone: '9876543220', address: '55, Navrangpura, Ahmedabad, Gujarat',       registeredAt: '2024-04-10T12:00:00.000Z', isAvailableToDonate: true },
        { id: 1009, name: 'Manish Trivedi', email: 'manish@example.com', password: 'Test@123', bloodGroup: 'O+',  age: 33, phone: '9876543221', address: '88, Maninagar, Ahmedabad, Gujarat',         registeredAt: '2024-04-15T09:30:00.000Z', isAvailableToDonate: true },
        { id: 1010, name: 'Pooja Rana',     email: 'pooja@example.com',  password: 'Test@123', bloodGroup: 'A-',  age: 24, phone: '9876543222', address: '22, Chandkheda, Ahmedabad, Gujarat',        registeredAt: '2024-05-01T15:00:00.000Z', isAvailableToDonate: true },
        { id: 1011, name: 'Deepak Nair',    email: 'deepak@example.com', password: 'Test@123', bloodGroup: 'B+',  age: 30, phone: '9876543223', address: '66, Bopal, Ahmedabad, Gujarat',             registeredAt: '2024-05-10T08:00:00.000Z', isAvailableToDonate: true },
        { id: 1012, name: 'Seema Gupta',    email: 'seema@example.com',  password: 'Test@123', bloodGroup: 'O-',  age: 28, phone: '9876543224', address: '33, Thaltej, Ahmedabad, Gujarat',           registeredAt: '2024-05-20T10:00:00.000Z', isAvailableToDonate: true }
    ];

    // Merge: only add example.com users not already present
    dummyUsers.forEach(u => ensure(u));
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(existingUsers));

    // ── DONATIONS ─────────────────────────────────────────────────────────────
    const makeDonation = (email, name, bg, daysAgo, location, certId) => ({
        email, name, bloodGroup: bg,
        rawDate: raw(d(daysAgo)),
        date: fmt(d(daysAgo)),
        location, units: '1',
        certificateId: certId,
        createdAt: iso(d(daysAgo))
    });

    const donations = [
        // Rahul — 12 donations (Gold)
        ...Array.from({length:12}, (_,i) => makeDonation('rahul@example.com','Rahul Sharma','O+', 365-(i*28), 'City Hospital Blood Bank', `RS-2023-${10001+i}`)),
        // Priya — 7 donations (Silver)
        ...Array.from({length:7},  (_,i) => makeDonation('priya@example.com', 'Priya Patel',  'A+', 420-(i*55), 'Red Cross Center', `RS-2023-${20001+i}`)),
        // Vikram — 6 donations (Silver)
        ...Array.from({length:6},  (_,i) => makeDonation('vikram@example.com','Vikram Singh', 'O-', 500-(i*70), 'University Medical Center', `RS-2023-${50001+i}`)),
        // Amit — 4 donations (Bronze)
        ...Array.from({length:4},  (_,i) => makeDonation('amit@example.com',  'Amit Kumar',   'B+', 300-(i*90), 'Community Health Center', `RS-2024-${30001+i}`)),
        // Nirav (example) — 5 donations (Silver)
        ...Array.from({length:5},  (_,i) => makeDonation('nirav@example.com', 'Nirav Mistry', 'A+', 400-(i*75), 'L.J University Blood Drive', `RS-2024-${70001+i}`)),
        // Asha (example) — 3 donations (Bronze)
        ...Array.from({length:3},  (_,i) => makeDonation('asha@example.com',  'Asha Odedra',  'B+', 270-(i*90), 'Community Health Center', `RS-2024-${80001+i}`)),
        // Sneha — 2 donations (New Hero)
        makeDonation('sneha@example.com', 'Sneha Desai', 'AB+', 60, 'Mobile Blood Drive', 'RS-2024-40001'),
        makeDonation('sneha@example.com', 'Sneha Desai', 'AB+', 30, 'City Hospital Blood Bank', 'RS-2024-40002'),
        // Ananya — 8 donations (Gold)
        ...Array.from({length:8},  (_,i) => makeDonation('ananya@example.com','Ananya Shah',  'AB-',360-(i*40), 'Sterling Hospital', `RS-2024-${90001+i}`)),
        // Manish — 4 donations (Bronze)
        ...Array.from({length:4},  (_,i) => makeDonation('manish@example.com','Manish Trivedi','O+',280-(i*90), 'Zydus Hospital Blood Bank', `RS-2024-${91001+i}`)),
        // Pooja — 2 donations (New Hero)
        makeDonation('pooja@example.com', 'Pooja Rana', 'A-', 45, 'Apollo Hospital', 'RS-2024-92001'),
        makeDonation('pooja@example.com', 'Pooja Rana', 'A-', 15, 'Red Cross Center', 'RS-2024-92002'),
        // Deepak — 5 donations (Silver)
        ...Array.from({length:5},  (_,i) => makeDonation('deepak@example.com','Deepak Nair',  'B+',310-(i*60), 'Civil Hospital Blood Bank', `RS-2024-${93001+i}`)),
        // Seema — 11 donations (Gold)
        ...Array.from({length:11}, (_,i) => makeDonation('seema@example.com', 'Seema Gupta',  'O-',400-(i*35), 'Red Cross Society', `RS-2024-${94001+i}`)),
        // nirav@gmail.com — 3 donations (Bronze)
        makeDonation('nirav@gmail.com', 'Nirav Mistry', 'A+', 120, 'Civil Hospital Blood Bank, Ahmedabad', 'RS-2025-NM001'),
        makeDonation('nirav@gmail.com', 'Nirav Mistry', 'A+',  60, 'Red Cross Society, Ahmedabad',         'RS-2025-NM002'),
        makeDonation('nirav@gmail.com', 'Nirav Mistry', 'A+',  10, 'Sterling Hospital Blood Drive',        'RS-2025-NM003'),
        // asha@gmail.com — 2 donations (New Hero)
        makeDonation('asha@gmail.com', 'Asha Odedra', 'O+', 90, 'Zydus Hospital Blood Bank, Ahmedabad', 'RS-2025-AO001'),
        makeDonation('asha@gmail.com', 'Asha Odedra', 'O+', 20, 'Community Health Center, Gota',        'RS-2025-AO002'),
    ];

    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

    // ── BLOOD REQUESTS ────────────────────────────────────────────────────────
    const requests = [
        { id: 2001, patientName: 'Rajesh Verma',   bloodGroup: 'O-',  units: '3', urgency: 'critical', hospital: 'Civil Hospital',    city: 'Ahmedabad',  contactName: 'Suresh Verma',   contactPhone: '9898989898', notes: 'Accident case, needs blood urgently for surgery',     status: 'active', createdAt: new Date().toISOString() },
        { id: 2002, patientName: 'Meera Shah',     bloodGroup: 'AB+', units: '2', urgency: 'urgent',   hospital: 'Sterling Hospital', city: 'Ahmedabad',  contactName: 'Kiran Shah',     contactPhone: '9797979797', notes: 'Scheduled surgery tomorrow',                         status: 'active', createdAt: new Date(Date.now()-3600000).toISOString() },
        { id: 2003, patientName: 'Arjun Patel',    bloodGroup: 'B-',  units: '1', urgency: 'planned',  hospital: 'Apollo Hospital',   city: 'Gandhinagar',contactName: 'Bharat Patel',   contactPhone: '9696969696', notes: 'Thalassemia patient, regular transfusion needed',     status: 'active', createdAt: new Date(Date.now()-7200000).toISOString() },
        { id: 2004, patientName: 'Anita Deshmukh', bloodGroup: 'A+',  units: '2', urgency: 'urgent',   hospital: 'Zydus Hospital',    city: 'Ahmedabad',  contactName: 'Vinod Deshmukh', contactPhone: '9595959595', notes: 'Post-delivery complications',                        status: 'active', createdAt: new Date(Date.now()-1800000).toISOString() },
        { id: 2005, patientName: 'Rohan Mehta',    bloodGroup: 'B+',  units: '2', urgency: 'urgent',   hospital: 'SAL Hospital',      city: 'Ahmedabad',  contactName: 'Sanjay Mehta',   contactPhone: '9484848484', notes: 'Pre-operative blood requirement',                    status: 'active', createdAt: new Date(Date.now()-5400000).toISOString() },
        { id: 2006, patientName: 'Lata Bhat',      bloodGroup: 'O+',  units: '4', urgency: 'critical', hospital: 'CIMS Hospital',     city: 'Ahmedabad',  contactName: 'Ramesh Bhat',    contactPhone: '9373737373', notes: 'Severe anemia, urgent transfusion required',         status: 'active', createdAt: new Date(Date.now()-900000).toISOString()  },
    ];
    localStorage.setItem(STORAGE_KEYS.BLOOD_REQUESTS, JSON.stringify(requests));

    // ── EMERGENCY ALERTS ──────────────────────────────────────────────────────
    const emergencies = [
        { id: 3001, patientName: 'Emergency Patient 1', bloodGroup: 'O-', hospital: 'Civil Hospital ICU',  phone: '9898989898', hours: 2, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now()+2*3600000).toISOString(), status: 'active' },
        { id: 3002, patientName: 'Critical Case - Child', bloodGroup: 'B+', hospital: 'Children Hospital', phone: '9797979797', hours: 6, createdAt: new Date(Date.now()-3600000).toISOString(), expiresAt: new Date(Date.now()+5*3600000).toISOString(), status: 'active' },
    ];
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_ALERTS, JSON.stringify(emergencies));

    localStorage.setItem('rakhtseva_seeded', '1');

    console.log('✅ Dummy data seeded!');
    console.log('📋 Accounts:');
    console.log('   kavya@gmail.com  | Ka!12345  (new account, 0 donations)');
    console.log('   nirav@gmail.com  | Nr@98765  (Bronze - 3 donations)');
    console.log('   asha@gmail.com   | As#56789  (New Hero - 2 donations)');
}

// ========== DOM READY EVENT ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('RakhtSeva Website Loaded Successfully!');
    
    // Initialize dummy data for testing
    initDummyData();
    
    // Initialize theme first to prevent flash
    initTheme();
    
    // Initialize all components
    initNavigation();
    initFAQ();
    initAuthForms();
    initDonationForm();
    initBloodRequestForm();
    initStatCounter();
    initDashboard();
    initTabs();
    initModals();
    checkLoginStatus();
    loadAvailableDonors();
    
    // New features
    initEmergencyAlert();
    initHealthTips();
    initEligibilityCalculator();
    checkDonationReminder();
    
    // Animated Landing Page
    initTypingAnimation();
    initParallaxEffect();
    initTestimonialsCarousel();
    initScrollAnimations();
});

/* ========== VALIDATION UTILITIES ========== */
const Validators = {
    email: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        
        if (!email || email.trim() === '') {
            return { valid: false, message: 'Email is required' };
        }
        
        if (!email.includes('@')) {
            return { valid: false, message: 'Email must contain @ symbol' };
        }
        
        if (!email.includes('.')) {
            return { valid: false, message: 'Email must contain a valid domain (e.g., .com, .in)' };
        }
        
        const parts = email.split('@');
        if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
            return { valid: false, message: 'Invalid email format' };
        }
        
        const domainParts = parts[1].split('.');
        if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
            return { valid: false, message: 'Email must have a valid domain extension' };
        }
        
        if (!emailRegex.test(email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        
        return { valid: true, message: '' };
    },
    
    password: function(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        if (!password || password.trim() === '') {
            return { valid: false, message: 'Password is required', requirements };
        }
        
        if (password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters long', requirements };
        }
        
        if (!requirements.uppercase) {
            return { valid: false, message: 'Password must contain at least one uppercase letter', requirements };
        }
        
        if (!requirements.lowercase) {
            return { valid: false, message: 'Password must contain at least one lowercase letter', requirements };
        }
        
        if (!requirements.number) {
            return { valid: false, message: 'Password must contain at least one number', requirements };
        }
        
        if (!requirements.special) {
            return { valid: false, message: 'Password must contain at least one special character', requirements };
        }
        
        return { valid: true, message: '', requirements };
    },
    
    name: function(name) {
        if (!name || name.trim() === '') {
            return { valid: false, message: 'Name is required' };
        }
        
        if (name.trim().length < 3) {
            return { valid: false, message: 'Name must be at least 3 characters long' };
        }
        
        if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
            return { valid: false, message: 'Name can only contain letters and spaces' };
        }
        
        return { valid: true, message: '' };
    },
    
    phone: function(phone) {
        const cleanPhone = phone.replace(/[\s\-()]/g, '');
        
        if (!phone || phone.trim() === '') {
            return { valid: false, message: 'Phone number is required' };
        }
        
        if (!/^\d+$/.test(cleanPhone)) {
            return { valid: false, message: 'Phone number can only contain digits' };
        }
        
        if (cleanPhone.length !== 10) {
            return { valid: false, message: 'Phone number must be exactly 10 digits' };
        }
        
        if (!/^[6-9]/.test(cleanPhone)) {
            return { valid: false, message: 'Phone number must start with 6, 7, 8, or 9' };
        }
        
        return { valid: true, message: '' };
    },
    
    age: function(age) {
        const ageNum = parseInt(age);
        
        if (!age || age === '') {
            return { valid: false, message: 'Age is required' };
        }
        
        if (isNaN(ageNum)) {
            return { valid: false, message: 'Age must be a valid number' };
        }
        
        if (ageNum < 18) {
            return { valid: false, message: 'You must be at least 18 years old to donate blood' };
        }
        
        if (ageNum > 65) {
            return { valid: false, message: 'Maximum age for blood donation is 65 years' };
        }
        
        return { valid: true, message: '' };
    },
    
    bloodGroup: function(bloodGroup) {
        const validGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
        
        if (!bloodGroup || bloodGroup === '') {
            return { valid: false, message: 'Please select your blood group' };
        }
        
        if (!validGroups.includes(bloodGroup)) {
            return { valid: false, message: 'Please select a valid blood group' };
        }
        
        return { valid: true, message: '' };
    },
    
    address: function(address) {
        if (!address || address.trim() === '') {
            return { valid: false, message: 'Address is required' };
        }
        
        if (address.trim().length < 10) {
            return { valid: false, message: 'Please enter a complete address (at least 10 characters)' };
        }
        
        return { valid: true, message: '' };
    },
    
    date: function(date) {
        if (!date || date === '') {
            return { valid: false, message: 'Date is required' };
        }
        
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        // Allow dates up to today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        // For donation registration, allow future dates (scheduled donations)
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        
        if (selectedDate > oneMonthLater) {
            return { valid: false, message: 'Date cannot be more than 1 month in the future' };
        }
        
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        if (selectedDate < oneYearAgo) {
            return { valid: false, message: 'Date cannot be more than 1 year old' };
        }
        
        return { valid: true, message: '' };
    },
    
    required: function(value, fieldName) {
        if (!value || value.trim() === '') {
            return { valid: false, message: `${fieldName} is required` };
        }
        return { valid: true, message: '' };
    }
};

/* ========== DARK MODE / THEME FUNCTIONALITY ========== */
function initTheme() {
    // Prevent flash of wrong theme
    document.body.classList.add('no-transition');
    
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply saved theme or system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    } else {
        document.body.classList.remove('dark-mode');
        updateThemeIcon(false);
    }
    
    // Remove no-transition class after a brief delay
    setTimeout(() => {
        document.body.classList.remove('no-transition');
    }, 100);
    
    // Initialize toggle button
    initThemeToggle();
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleTheme();
        });
        
        // Add keyboard accessibility
        themeToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
        
        // Make it focusable
        themeToggle.setAttribute('tabindex', '0');
        themeToggle.setAttribute('role', 'button');
        themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // Save preference
    localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
    
    // Update icon with animation
    updateThemeIcon(isDarkMode);
    
    // Show toast notification
    showToast(isDarkMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'success');
    
    // Update charts if they exist (for better visibility)
    if (typeof Chart !== 'undefined') {
        updateChartsForTheme(isDarkMode);
    }
}

function updateThemeIcon(isDarkMode) {
    const themeIcon = document.getElementById('themeIcon');
    
    if (themeIcon) {
        if (isDarkMode) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeIcon.style.animation = 'rotateSun 0.5s ease';
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeIcon.style.animation = 'rotateMoon 0.5s ease';
        }
        
        // Reset animation after it completes
        setTimeout(() => {
            themeIcon.style.animation = '';
        }, 500);
    }
}

function updateChartsForTheme(isDarkMode) {
    const textColor = isDarkMode ? '#f5f5f5' : '#212121';
    const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    
    // Update all Chart.js instances
    Chart.helpers.each(Chart.instances, function(instance) {
        // Update legend color
        if (instance.options.plugins && instance.options.plugins.legend) {
            instance.options.plugins.legend.labels.color = textColor;
        }
        
        // Update scales color
        if (instance.options.scales) {
            if (instance.options.scales.x) {
                instance.options.scales.x.ticks = instance.options.scales.x.ticks || {};
                instance.options.scales.x.ticks.color = textColor;
                instance.options.scales.x.grid = instance.options.scales.x.grid || {};
                instance.options.scales.x.grid.color = gridColor;
            }
            if (instance.options.scales.y) {
                instance.options.scales.y.ticks = instance.options.scales.y.ticks || {};
                instance.options.scales.y.ticks.color = textColor;
                instance.options.scales.y.grid = instance.options.scales.y.grid || {};
                instance.options.scales.y.grid.color = gridColor;
            }
        }
        
        instance.update();
    });
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    // Only auto-switch if user hasn't set a preference
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
        if (e.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        updateThemeIcon(e.matches);
    }
});

/* ========== NAVIGATION FUNCTIONALITY ========== */
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        const links = navLinks.querySelectorAll('.nav-link');
        links.forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
    
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            } else {
                navbar.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
            }
        }
    });
}

/* ========== CHECK LOGIN STATUS ========== */
function checkLoginStatus() {
    const currentSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    const loginNavItem = document.getElementById('loginNavItem');
    const signupNavItem = document.getElementById('signupNavItem');
    const userNavItem = document.getElementById('userNavItem');
    const navUserName = document.getElementById('navUserName');
    
    if (currentSession) {
        const user = JSON.parse(currentSession);
        
        if (loginNavItem) loginNavItem.style.display = 'none';
        if (signupNavItem) signupNavItem.style.display = 'none';
        if (userNavItem) {
            userNavItem.style.display = 'block';
            if (navUserName) {
                navUserName.innerHTML = `<i class="fas fa-user-circle"></i> ${user.name.split(' ')[0]}`;
            }
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
}

function handleLogout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    showToast('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

/* ========== FAQ ACCORDION FUNCTIONALITY ========== */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length === 0) return;
    
    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(function(otherItem) {
                otherItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* ========== AUTHENTICATION FORMS ========== */
function initAuthForms() {
    initLoginForm();
    initSignupForm();
}

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const rememberMe = document.getElementById('rememberMe');
    
    const rememberedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberMe) rememberMe.checked = true;
    }
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, togglePassword);
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateField('email', emailInput.value, 'emailError', Validators.email);
        });
        
        emailInput.addEventListener('input', function() {
            clearError('emailError');
            emailInput.classList.remove('input-error', 'input-success');
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            if (passwordInput.value.length < 6) {
                showError('passwordError', 'Password must be at least 6 characters');
                passwordInput.classList.add('input-error');
            } else {
                hideError('passwordError');
                passwordInput.classList.remove('input-error');
                passwordInput.classList.add('input-success');
            }
        });
    }
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        let isValid = true;
        
        const emailValidation = Validators.email(email);
        if (!emailValidation.valid) {
            showError('emailError', emailValidation.message);
            emailInput.classList.add('input-error');
            isValid = false;
        } else {
            hideError('emailError');
            emailInput.classList.remove('input-error');
        }
        
        if (password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
            passwordInput.classList.add('input-error');
            isValid = false;
        } else {
            hideError('passwordError');
            passwordInput.classList.remove('input-error');
        }
        
        if (!isValid) return;
        
        // Check all registered users
        const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        
        // Also check single user storage for backward compatibility
        let user = allUsers.find(u => u.email === email && u.password === password);
        
        if (!user && storedUser) {
            const singleUser = JSON.parse(storedUser);
            if (singleUser.email === email && singleUser.password === password) {
                user = singleUser;
            }
        }
        
        if (user) {
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, email);
            } else {
                localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
            }
            
            localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(user));
            
            showToast('Login successful! Welcome back, ' + user.name + '!', 'success');
            
            setTimeout(() => {
                window.location.href = 'donate.html';
            }, 1500);
        } else {
            showToast('Invalid email or password!', 'error');
            showError('passwordError', 'Invalid email or password');
        }
    });
}

function initSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;
    
    const fields = {
        fullName: document.getElementById('fullName'),
        email: document.getElementById('email'),
        bloodGroup: document.getElementById('bloodGroup'),
        age: document.getElementById('age'),
        phone: document.getElementById('phone'),
        address: document.getElementById('address'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        terms: document.getElementById('terms')
    };
    
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    
    if (togglePassword && fields.password) {
        togglePassword.addEventListener('click', function() {
            togglePasswordVisibility(fields.password, togglePassword);
        });
    }
    
    if (toggleConfirmPassword && fields.confirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            togglePasswordVisibility(fields.confirmPassword, toggleConfirmPassword);
        });
    }
    
    if (fields.fullName) {
        fields.fullName.addEventListener('blur', function() {
            validateField('fullName', this.value, 'nameError', Validators.name);
        });
    }
    
    if (fields.email) {
        fields.email.addEventListener('blur', function() {
            validateField('email', this.value, 'emailError', Validators.email);
        });
    }
    
    if (fields.age) {
        fields.age.addEventListener('blur', function() {
            validateField('age', this.value, 'ageError', Validators.age);
        });
    }
    
    if (fields.phone) {
        fields.phone.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });
        
        fields.phone.addEventListener('blur', function() {
            validateField('phone', this.value, 'phoneError', Validators.phone);
        });
    }
    
    if (fields.address) {
        fields.address.addEventListener('blur', function() {
            validateField('address', this.value, 'addressError', Validators.address);
        });
    }
    
    if (fields.bloodGroup) {
        fields.bloodGroup.addEventListener('change', function() {
            validateField('bloodGroup', this.value, 'bloodError', Validators.bloodGroup);
        });
    }
    
    if (fields.password) {
        fields.password.addEventListener('input', function() {
            updatePasswordStrength(this.value);
            updatePasswordRequirements(this.value);
            
            if (fields.confirmPassword && fields.confirmPassword.value) {
                checkPasswordMatch(this.value, fields.confirmPassword.value);
            }
        });
        
        fields.password.addEventListener('blur', function() {
            const validation = Validators.password(this.value);
            if (!validation.valid) {
                showError('passwordError', validation.message);
                this.classList.add('input-error');
            } else {
                hideError('passwordError');
                this.classList.remove('input-error');
                this.classList.add('input-success');
            }
        });
    }
    
    if (fields.confirmPassword) {
        fields.confirmPassword.addEventListener('input', function() {
            checkPasswordMatch(fields.password.value, this.value);
        });
    }
    
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        let isValid = true;
        
        const nameValidation = Validators.name(fields.fullName.value);
        if (!nameValidation.valid) {
            showError('nameError', nameValidation.message);
            fields.fullName.classList.add('input-error');
            isValid = false;
        } else {
            hideError('nameError');
            fields.fullName.classList.remove('input-error');
        }
        
        const emailValidation = Validators.email(fields.email.value);
        if (!emailValidation.valid) {
            showError('emailError', emailValidation.message);
            fields.email.classList.add('input-error');
            isValid = false;
        } else {
            hideError('emailError');
            fields.email.classList.remove('input-error');
        }
        
        const bloodValidation = Validators.bloodGroup(fields.bloodGroup.value);
        if (!bloodValidation.valid) {
            showError('bloodError', bloodValidation.message);
            fields.bloodGroup.classList.add('input-error');
            isValid = false;
        } else {
            hideError('bloodError');
            fields.bloodGroup.classList.remove('input-error');
        }
        
        const ageValidation = Validators.age(fields.age.value);
        if (!ageValidation.valid) {
            showError('ageError', ageValidation.message);
            fields.age.classList.add('input-error');
            isValid = false;
        } else {
            hideError('ageError');
            fields.age.classList.remove('input-error');
        }
        
        const phoneValidation = Validators.phone(fields.phone.value);
        if (!phoneValidation.valid) {
            showError('phoneError', phoneValidation.message);
            fields.phone.classList.add('input-error');
            isValid = false;
        } else {
            hideError('phoneError');
            fields.phone.classList.remove('input-error');
        }
        
        const addressValidation = Validators.address(fields.address.value);
        if (!addressValidation.valid) {
            showError('addressError', addressValidation.message);
            fields.address.classList.add('input-error');
            isValid = false;
        } else {
            hideError('addressError');
            fields.address.classList.remove('input-error');
        }
        
        const passwordValidation = Validators.password(fields.password.value);
        if (!passwordValidation.valid) {
            showError('passwordError', passwordValidation.message);
            fields.password.classList.add('input-error');
            isValid = false;
        } else {
            hideError('passwordError');
            fields.password.classList.remove('input-error');
        }
        
        if (fields.password.value !== fields.confirmPassword.value) {
            showError('confirmPasswordError', 'Passwords do not match');
            fields.confirmPassword.classList.add('input-error');
            isValid = false;
        } else {
            hideError('confirmPasswordError');
            fields.confirmPassword.classList.remove('input-error');
        }
        
        if (!fields.terms.checked) {
            showError('termsError', 'You must agree to the terms and conditions');
            isValid = false;
        } else {
            hideError('termsError');
        }
        
        // Check if email already exists
        const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');
        if (allUsers.find(u => u.email === fields.email.value.trim())) {
            showError('emailError', 'An account with this email already exists');
            showToast('Email already registered! Please login.', 'error');
            isValid = false;
        }
        
        if (!isValid) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }
        
        const user = {
            id: Date.now(),
            name: fields.fullName.value.trim(),
            email: fields.email.value.trim(),
            bloodGroup: fields.bloodGroup.value,
            age: fields.age.value,
            phone: fields.phone.value.trim(),
            address: fields.address.value.trim(),
            password: fields.password.value,
            registeredAt: new Date().toISOString(),
            isAvailableToDonate: true
        };
        
        // Store in all users array
        allUsers.push(user);
        localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
        
        // Also store as single user for backward compatibility
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
        showToast('Registration successful! Redirecting to login...', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
}

function validateField(fieldName, value, errorId, validator) {
    const validation = validator(value);
    const input = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    
    if (!validation.valid) {
        showError(errorId, validation.message);
        if (input) input.classList.add('input-error');
        return false;
    } else {
        hideError(errorId);
        if (input) {
            input.classList.remove('input-error');
            input.classList.add('input-success');
        }
        return true;
    }
}

function updatePasswordRequirements(password) {
    const requirements = {
        'req-length': password.length >= 8,
        'req-upper': /[A-Z]/.test(password),
        'req-lower': /[a-z]/.test(password),
        'req-number': /[0-9]/.test(password),
        'req-special': /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    Object.keys(requirements).forEach(reqId => {
        const element = document.getElementById(reqId);
        if (element) {
            if (requirements[reqId]) {
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
            }
        }
    });
}

function checkPasswordMatch(password, confirmPassword) {
    const matchElement = document.getElementById('passwordMatch');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (!matchElement || !confirmPassword) return;
    
    if (confirmPassword === '') {
        matchElement.textContent = '';
        matchElement.className = 'password-match';
        return;
    }
    
    if (password === confirmPassword) {
        matchElement.textContent = '✓ Passwords match';
        matchElement.className = 'password-match match';
        if (confirmInput) {
            confirmInput.classList.remove('input-error');
            confirmInput.classList.add('input-success');
        }
    } else {
        matchElement.textContent = '✗ Passwords do not match';
        matchElement.className = 'password-match no-match';
        if (confirmInput) {
            confirmInput.classList.add('input-error');
            confirmInput.classList.remove('input-success');
        }
    }
}

function togglePasswordVisibility(input, button) {
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let text = '';
    let color = '';
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const percentage = (strength / 6) * 100;
    
    if (strength <= 2) {
        text = 'Weak';
        color = '#F44336';
    } else if (strength <= 4) {
        text = 'Medium';
        color = '#FF9800';
    } else {
        text = 'Strong';
        color = '#4CAF50';
    }
    
    strengthBar.style.width = percentage + '%';
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = password.length > 0 ? text : '';
    strengthText.style.color = color;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

function clearError(elementId) {
    hideError(elementId);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) {
        alert(message);
        return;
    }
    
    toastMessage.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* ========== DASHBOARD FUNCTIONALITY ========== */
function initDashboard() {
    const dashboardSection = document.getElementById('dashboardSection');
    const donateSection = document.getElementById('donateSection');
    const loginCta = document.getElementById('loginCta');
    const welcomeActions = document.getElementById('welcomeActions');
    
    if (!dashboardSection) return;
    
    const currentSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    
    if (currentSession) {
        const user = JSON.parse(currentSession);
        
        // User is logged in
        if (donateSection) donateSection.style.display = 'block';
        if (loginCta) loginCta.style.display = 'none';
        if (welcomeActions) welcomeActions.style.display = 'none';
        
        const welcomeUserName = document.getElementById('welcomeUserName');
        if (welcomeUserName) {
            welcomeUserName.textContent = user.name.split(' ')[0];
        }
        
        loadDonationHistory();
    } else {
        if (donateSection) donateSection.style.display = 'none';
        if (loginCta) loginCta.style.display = 'block';
    }
    
    initCharts();
}

function loadDonationHistory() {
    const historyListFull = document.getElementById('historyListFull');
    if (!historyListFull) return;
    
    const donations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
    const currentSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    
    if (!currentSession) return;
    
    const user = JSON.parse(currentSession);
    const userDonations = donations.filter(d => d.email === user.email);
    
    if (userDonations.length === 0) {
        historyListFull.innerHTML = '<p class="no-history">No donations recorded yet. Register your first donation!</p>';
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    historyListFull.innerHTML = userDonations.map(donation => {
        const donationDate = new Date(donation.rawDate);
        const isAvailable = donationDate <= today;
        
        return `
            <div class="history-card">
                <div class="history-card-info">
                    <h4>
                        ${donation.name}
                        <span class="blood-badge-small">${donation.bloodGroup}</span>
                    </h4>
                    <div class="history-card-details">
                        <span><i class="fas fa-calendar"></i> ${donation.date}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${donation.location}</span>
                        <span><i class="fas fa-flask"></i> ${donation.units} Unit(s)</span>
                    </div>
                </div>
                <div class="history-card-actions">
                    <span class="cert-status ${isAvailable ? 'available' : 'pending'}">
                        <i class="fas ${isAvailable ? 'fa-check-circle' : 'fa-clock'}"></i>
                        ${isAvailable ? 'Certificate Available' : 'Available after ' + donation.date}
                    </span>
                    <button class="btn ${isAvailable ? 'btn-download-cert' : 'btn-secondary'}" 
                            onclick="viewCertificate('${donation.certificateId}')"
                            ${!isAvailable ? 'disabled' : ''}>
                        <i class="fas fa-${isAvailable ? 'download' : 'lock'}"></i> 
                        ${isAvailable ? 'View Certificate' : 'Locked'}
                    </button>
                </div>
            </div>
        `;
    }).reverse().join('');
}

/* ========== TAB FUNCTIONALITY ========== */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabBtns.length === 0) return;
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked button and corresponding content
            this.classList.add('active');
            const content = document.getElementById('tab-' + tabId);
            if (content) {
                content.classList.add('active');
            }
            
            // Load data for specific tabs
            if (tabId === 'history') {
                loadDonationHistory();
            } else if (tabId === 'available') {
                loadAvailableDonors();
            } else if (tabId === 'leaderboard') {
                loadDashboardLeaderboard();
            }
        });
    });
}

/* ========== MODALS ========== */
function initModals() {
    // Certificate Modal
    const certificateModal = document.getElementById('certificateModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const closeCertModal = document.getElementById('closeCertModal');
    const downloadCert = document.getElementById('downloadCert');
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeCertificateModal);
    }
    if (modalClose) {
        modalClose.addEventListener('click', closeCertificateModal);
    }
    if (closeCertModal) {
        closeCertModal.addEventListener('click', closeCertificateModal);
    }
    if (downloadCert) {
        downloadCert.addEventListener('click', function() {
            showToast('Opening print dialog...', 'success');
            setTimeout(() => window.print(), 500);
        });
    }
    
    // Contact Donor Modal
    const contactDonorModal = document.getElementById('contactDonorModal');
    const contactModalOverlay = document.getElementById('contactModalOverlay');
    const contactModalClose = document.getElementById('contactModalClose');
    
    if (contactModalOverlay) {
        contactModalOverlay.addEventListener('click', closeContactModal);
    }
    if (contactModalClose) {
        contactModalClose.addEventListener('click', closeContactModal);
    }
    
    // Close modals on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCertificateModal();
            closeContactModal();
        }
    });
}

function closeCertificateModal() {
    const modal = document.getElementById('certificateModal');
    if (modal) modal.classList.remove('show');
}

function closeContactModal() {
    const modal = document.getElementById('contactDonorModal');
    if (modal) modal.classList.remove('show');
}

// View Certificate Function (called from history cards)
window.viewCertificate = function(certificateId) {
    const donations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
    const donation = donations.find(d => d.certificateId === certificateId);
    
    if (!donation) {
        showToast('Certificate not found!', 'error');
        return;
    }
    
    // Check if date has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const donationDate = new Date(donation.rawDate);
    
    if (donationDate > today) {
        showToast('Certificate will be available after ' + donation.date, 'error');
        return;
    }
    
    // Update certificate content
    document.getElementById('certDonorName').textContent = donation.name;
    document.getElementById('certBloodGroup').textContent = donation.bloodGroup;
    document.getElementById('certDate').textContent = donation.date;
    document.getElementById('certLocation').textContent = donation.location;
    document.getElementById('certUnits').textContent = donation.units + ' Unit' + (donation.units > 1 ? 's' : '');
    document.getElementById('certId').textContent = donation.certificateId;
    
    // Show modal
    const modal = document.getElementById('certificateModal');
    if (modal) modal.classList.add('show');
};

// Contact Donor Function
window.contactDonor = function(donorId) {
    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');
    const donor = allUsers.find(u => u.id == donorId);
    
    if (!donor) {
        showToast('Donor information not found!', 'error');
        return;
    }
    
    document.getElementById('contactDonorName').textContent = donor.name;
    document.getElementById('contactDonorBlood').textContent = donor.bloodGroup;
    document.getElementById('contactDonorPhone').textContent = donor.phone;
    document.getElementById('contactDonorEmail').textContent = donor.email;
    
    const callBtn = document.getElementById('callDonorBtn');
    const emailBtn = document.getElementById('emailDonorBtn');
    
    if (callBtn) {
        callBtn.removeAttribute('href');
        callBtn.onclick = function(e) {
            e.preventDefault();
            alert('Ringing....');
        };
    }
    if (emailBtn) emailBtn.href = 'mailto:' + donor.email + '?subject=Blood Donation Request - RakhtSeva';
    
    const modal = document.getElementById('contactDonorModal');
    if (modal) modal.classList.add('show');
};

/* ========== BLOOD REQUEST FUNCTIONALITY ========== */
function initBloodRequestForm() {
    const requestForm = document.getElementById('bloodRequestFormPublic');
    if (!requestForm) return;
    
    // Phone validation
    const phoneInput = document.getElementById('reqContactPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });
    }
    
    requestForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Validate all fields
        let isValid = true;
        
        const patientName = document.getElementById('reqPatientName').value.trim();
        const bloodGroup = document.getElementById('reqBloodGroup').value;
        const units = document.getElementById('reqUnits').value;
        const urgency = document.getElementById('reqUrgency').value;
        const hospital = document.getElementById('reqHospital').value.trim();
        const city = document.getElementById('reqCity').value.trim();
        const contactName = document.getElementById('reqContactName').value.trim();
        const contactPhone = document.getElementById('reqContactPhone').value.trim();
        const notes = document.getElementById('reqNotes').value.trim();
        
        // Validate each field
        if (!patientName || patientName.length < 3) {
            showError('reqPatientNameError', 'Please enter a valid patient name');
            isValid = false;
        } else {
            hideError('reqPatientNameError');
        }
        
        if (!bloodGroup) {
            showError('reqBloodGroupError', 'Please select blood group');
            isValid = false;
        } else {
            hideError('reqBloodGroupError');
        }
        
        if (!units) {
            showError('reqUnitsError', 'Please select units required');
            isValid = false;
        } else {
            hideError('reqUnitsError');
        }
        
        if (!urgency) {
            showError('reqUrgencyError', 'Please select urgency level');
            isValid = false;
        } else {
            hideError('reqUrgencyError');
        }
        
        if (!hospital || hospital.length < 3) {
            showError('reqHospitalError', 'Please enter hospital name');
            isValid = false;
        } else {
            hideError('reqHospitalError');
        }
        
        if (!city || city.length < 2) {
            showError('reqCityError', 'Please enter city name');
            isValid = false;
        } else {
            hideError('reqCityError');
        }
        
        if (!contactName || contactName.length < 3) {
            showError('reqContactNameError', 'Please enter contact person name');
            isValid = false;
        } else {
            hideError('reqContactNameError');
        }
        
        const phoneValidation = Validators.phone(contactPhone);
        if (!phoneValidation.valid) {
            showError('reqContactPhoneError', phoneValidation.message);
            isValid = false;
        } else {
            hideError('reqContactPhoneError');
        }
        
        if (!isValid) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }
        
        // Create blood request
        const request = {
            id: Date.now(),
            patientName,
            bloodGroup,
            units,
            urgency,
            hospital,
            city,
            contactName,
            contactPhone,
            notes,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        // Save to local storage
        const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOOD_REQUESTS) || '[]');
        requests.push(request);
        localStorage.setItem(STORAGE_KEYS.BLOOD_REQUESTS, JSON.stringify(requests));
        
        // Reset form
        requestForm.reset();
        
        showToast('Blood request submitted successfully! Donors will contact you soon.', 'success');
        
        // Reload requests
    });
}

window.markRequestFulfilled = function(requestId) {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOOD_REQUESTS) || '[]');
    const index = requests.findIndex(r => r.id === requestId);
    
    if (index !== -1) {
        requests[index].status = 'fulfilled';
        localStorage.setItem(STORAGE_KEYS.BLOOD_REQUESTS, JSON.stringify(requests));
        showToast('Request marked as fulfilled!', 'success');
    }
};

/* ========== AVAILABLE DONORS ========== */
function loadAvailableDonors() {
    const donorsGrid = document.getElementById('availableDonorsGrid');
    if (!donorsGrid) return;
    
    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');
    const filterSelect = document.getElementById('filterBloodGroup');
    const filterValue = filterSelect ? filterSelect.value : 'all';
    
    let donors = allUsers.filter(u => u.isAvailableToDonate !== false);
    
    if (filterValue !== 'all') {
        donors = donors.filter(u => u.bloodGroup === filterValue);
    }
    
    if (donors.length === 0) {
        donorsGrid.innerHTML = `
            <div class="no-donors">
                <i class="fas fa-users"></i>
                <p>No donors found ${filterValue !== 'all' ? 'with blood group ' + filterValue : ''}. Be the first to donate!</p>
            </div>
        `;
        return;
    }
    
    donorsGrid.innerHTML = donors.map(donor => `
        <div class="donor-card">
            <div class="donor-header">
                <div class="donor-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="donor-name">
                    <h4>${donor.name}</h4>
                    <span><i class="fas fa-tint"></i> ${donor.bloodGroup}</span>
                </div>
            </div>
            <div class="donor-body">
                <div class="donor-info">
                    <div class="donor-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${donor.address ? donor.address.substring(0, 30) + '...' : 'Location not specified'}</span>
                    </div>
                    <div class="donor-info-item">
                        <i class="fas fa-birthday-cake"></i>
                        <span>Age: ${donor.age} years</span>
                    </div>
                    <div class="donor-info-item">
                        <i class="fas fa-clock"></i>
                        <span>Registered: ${formatDateShort(donor.registeredAt)}</span>
                    </div>
                </div>
            </div>
            <div class="donor-footer">
                <button class="btn btn-primary" onclick="contactDonor(${donor.id})">
                    <i class="fas fa-phone-alt"></i> Contact Donor
                </button>
            </div>
        </div>
    `).join('');
    
    // Add filter event listener
    if (filterSelect) {
        filterSelect.removeEventListener('change', loadAvailableDonors);
        filterSelect.addEventListener('change', loadAvailableDonors);
    }
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/* ========== CHARTS FUNCTIONALITY ========== */
function initCharts() {
    if (typeof Chart === 'undefined') return;
    
    const bloodGroupCtx = document.getElementById('bloodGroupChart');
    if (bloodGroupCtx) {
        new Chart(bloodGroupCtx, {
            type: 'doughnut',
            data: {
                labels: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'],
                datasets: [{
                    data: [37, 22, 21, 8, 5, 4, 2, 1],
                    backgroundColor: [
                        '#D32F2F', '#E53935', '#F44336', '#EF5350',
                        '#00897B', '#26A69A', '#4DB6AC', '#80CBC4'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { padding: 15, font: { family: "'Poppins', sans-serif", size: 11 } }
                    }
                }
            }
        });
    }
    
    const monthlyCtx = document.getElementById('monthlyDonationsChart');
    if (monthlyCtx) {
        new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Donations',
                    data: [1200, 1350, 1100, 1450, 1600, 1400, 1550, 1700, 1500, 1650, 1800, 1900],
                    backgroundColor: 'rgba(211, 47, 47, 0.7)',
                    borderColor: '#D32F2F',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
    
    const demandSupplyCtx = document.getElementById('demandSupplyChart');
    if (demandSupplyCtx) {
        new Chart(demandSupplyCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Demand',
                    data: [2000, 2200, 2100, 2400, 2300, 2500],
                    borderColor: '#D32F2F',
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Supply',
                    data: [1800, 1900, 1850, 2100, 2000, 2200],
                    borderColor: '#00897B',
                    backgroundColor: 'rgba(0, 137, 123, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                    y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
    
    const ageGroupCtx = document.getElementById('ageGroupChart');
    if (ageGroupCtx) {
        new Chart(ageGroupCtx, {
            type: 'polarArea',
            data: {
                labels: ['18-25', '26-35', '36-45', '46-55', '56-65'],
                datasets: [{
                    data: [35, 30, 20, 10, 5],
                    backgroundColor: [
                        'rgba(211, 47, 47, 0.8)', 'rgba(229, 57, 53, 0.7)',
                        'rgba(244, 67, 54, 0.6)', 'rgba(239, 83, 80, 0.5)',
                        'rgba(255, 205, 210, 0.6)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });
    }
}

/* ========== DONATION FORM & CERTIFICATE ========== */
function initDonationForm() {
    const donationForm = document.getElementById('donationForm');
    if (!donationForm) return;
    
    const currentSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!currentSession) return;
    
    const user = JSON.parse(currentSession);
    
    const donorNameInput = document.getElementById('donorName');
    const bloodGroupSelect = document.getElementById('donorBloodGroup');
    
    if (donorNameInput && user.name) {
        donorNameInput.value = user.name;
    }
    
    if (bloodGroupSelect && user.bloodGroup) {
        bloodGroupSelect.value = user.bloodGroup;
    }
    
    const locationSelect = document.getElementById('donationLocation');
    const customLocationGroup = document.getElementById('customLocationGroup');
    
    if (locationSelect && customLocationGroup) {
        locationSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                customLocationGroup.style.display = 'block';
                document.getElementById('customLocation').required = true;
            } else {
                customLocationGroup.style.display = 'none';
                document.getElementById('customLocation').required = false;
            }
        });
    }
    
    const dateInput = document.getElementById('donationDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        
        // Allow future dates for scheduled donations
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 1);
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Allow past dates up to 1 year
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 1);
        dateInput.min = minDate.toISOString().split('T')[0];
    }
    
    donationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const donorName = document.getElementById('donorName').value.trim();
        const bloodGroup = document.getElementById('donorBloodGroup').value;
        const donationDate = document.getElementById('donationDate').value;
        let donationLocation = document.getElementById('donationLocation').value;
        const unitsDonated = document.getElementById('unitsDonated').value;
        
        let isValid = true;
        
        const nameValidation = Validators.name(donorName);
        if (!nameValidation.valid) {
            showError('donorNameError', nameValidation.message);
            isValid = false;
        } else {
            hideError('donorNameError');
        }
        
        const bloodValidation = Validators.bloodGroup(bloodGroup);
        if (!bloodValidation.valid) {
            showError('donorBloodGroupError', bloodValidation.message);
            isValid = false;
        } else {
            hideError('donorBloodGroupError');
        }
        
        const dateValidation = Validators.date(donationDate);
        if (!dateValidation.valid) {
            showError('donationDateError', dateValidation.message);
            isValid = false;
        } else {
            hideError('donationDateError');
        }
        
        if (!donationLocation) {
            showError('donationLocationError', 'Please select a donation location');
            isValid = false;
        } else {
            hideError('donationLocationError');
        }
        
        if (donationLocation === 'Other') {
            const customLocation = document.getElementById('customLocation').value.trim();
            if (!customLocation || customLocation.length < 3) {
                showError('customLocationError', 'Please enter a valid location');
                isValid = false;
            } else {
                hideError('customLocationError');
                donationLocation = customLocation;
            }
        }
        
        if (!unitsDonated) {
            showError('unitsDonatedError', 'Please select units donated');
            isValid = false;
        } else {
            hideError('unitsDonatedError');
        }
        
        if (!isValid) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }
        
        // Save donation
        const donation = {
            email: user.email,
            name: donorName,
            bloodGroup: bloodGroup,
            rawDate: donationDate,
            date: formatDate(donationDate),
            location: donationLocation,
            units: unitsDonated,
            certificateId: generateCertificateId(),
            createdAt: new Date().toISOString()
        };
        
        const donations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
        donations.push(donation);
        localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
        
        // Check if certificate is available now
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const donDate = new Date(donationDate);
        const isAvailableNow = donDate <= today;
        
        // Reset form
        donationForm.reset();
        if (donorNameInput && user.name) donorNameInput.value = user.name;
        if (bloodGroupSelect && user.bloodGroup) bloodGroupSelect.value = user.bloodGroup;
        
        // Update stats
        
        // Switch to history tab and show message
        const historyTab = document.querySelector('[data-tab="history"]');
        if (historyTab) historyTab.click();
        
        if (isAvailableNow) {
            showToast('Donation registered! Your certificate is ready for download.', 'success');
        } else {
            showToast(`Donation registered! Certificate will be available on ${formatDate(donationDate)}`, 'success');
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function generateCertificateId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `RS-${year}-${random}`;
}

/* ========== STATISTICS COUNTER ANIMATION ========== */
function initStatCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length === 0) return;
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-target'));
                
                if (target) {
                    animateNumber(element, target);
                }
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(function(number) {
        if (number.getAttribute('data-target')) {
            observer.observe(number);
        }
    });
}

function animateNumber(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    
    const timer = setInterval(function() {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        element.textContent = formatNumber(Math.floor(current));
    }, stepTime);
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* ========== SMOOTH SCROLL ========== */
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            e.preventDefault();
            
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/* ========== BLOOD COMPATIBILITY CHART ========== */
function initBloodCompatibilityChart() {
    // Blood compatibility data - medically accurate
    const bloodCompatibility = {
        'O-': {
            canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            canReceiveFrom: ['O-'],
            description: 'Universal Donor - Can donate to all blood types!'
        },
        'O+': {
            canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
            canReceiveFrom: ['O-', 'O+'],
            description: 'Most common blood type - Can donate to all positive types'
        },
        'A-': {
            canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
            canReceiveFrom: ['O-', 'A-'],
            description: 'Can donate to A and AB types'
        },
        'A+': {
            canDonateTo: ['A+', 'AB+'],
            canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
            description: 'Second most common blood type'
        },
        'B-': {
            canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
            canReceiveFrom: ['O-', 'B-'],
            description: 'Can donate to B and AB types'
        },
        'B+': {
            canDonateTo: ['B+', 'AB+'],
            canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
            description: 'Can receive from B and O types'
        },
        'AB-': {
            canDonateTo: ['AB-', 'AB+'],
            canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
            description: 'Universal Plasma Donor'
        },
        'AB+': {
            canDonateTo: ['AB+'],
            canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            description: 'Universal Recipient - Can receive from all blood types!'
        }
    };
    
    // Initialize for donate.html page
    initCompatibilityForPage('', bloodCompatibility);
    
    // Initialize for index.html page (Home suffix)
    initCompatibilityForPage('Home', bloodCompatibility);
}

function initCompatibilityForPage(suffix, bloodCompatibility) {
    const container = document.querySelector(suffix ? '.compatibility-section-home' : '.compatibility-section');
    if (!container) return;
    
    const bloodTypeButtons = container.querySelectorAll('.blood-type-btn');
    if (bloodTypeButtons.length === 0) return;
    
    // Update compatibility display
    function updateCompatibilityDisplay(bloodType) {
        const compatibility = bloodCompatibility[bloodType];
        if (!compatibility) return;
        
        const selectedDisplay = document.getElementById('selectedBloodType' + suffix);
        const canDonateToContainer = document.getElementById('canDonateTo' + suffix);
        const canReceiveFromContainer = document.getElementById('canReceiveFrom' + suffix);
        
        if (selectedDisplay) {
            selectedDisplay.textContent = bloodType;
            // Add animation
            selectedDisplay.style.transform = 'scale(1.2)';
            setTimeout(() => {
                selectedDisplay.style.transform = 'scale(1)';
            }, 200);
        }
        
        if (canDonateToContainer) {
            canDonateToContainer.innerHTML = compatibility.canDonateTo
                .map((type, index) => `<span class="compat-badge" style="animation-delay: ${index * 0.05}s">${type}</span>`)
                .join('');
        }
        
        if (canReceiveFromContainer) {
            canReceiveFromContainer.innerHTML = compatibility.canReceiveFrom
                .map((type, index) => `<span class="compat-badge" style="animation-delay: ${index * 0.05}s">${type}</span>`)
                .join('');
        }
        
        // Highlight table cells (only on donate page)
        if (!suffix) {
            highlightTableCells(bloodType);
        }
    }
    
    // Highlight corresponding cells in the matrix table
    function highlightTableCells(bloodType) {
        const table = document.querySelector('.matrix-table');
        if (!table) return;
        
        // Remove all previous highlights
        table.querySelectorAll('td, th').forEach(cell => {
            cell.classList.remove('highlighted-row', 'highlighted-col');
        });
        
        // Find the row and column for this blood type
        const headers = table.querySelectorAll('thead th');
        const rows = table.querySelectorAll('tbody tr');
        
        let colIndex = -1;
        headers.forEach((th, index) => {
            if (th.textContent.trim() === bloodType) {
                colIndex = index;
                th.classList.add('highlighted-col');
            }
        });
        
        rows.forEach(row => {
            const rowHeader = row.querySelector('.row-header');
            if (rowHeader && rowHeader.textContent.trim() === bloodType) {
                row.classList.add('highlighted-row');
                row.querySelectorAll('td').forEach(td => td.classList.add('highlighted-row'));
            }
            
            if (colIndex > 0) {
                const cells = row.querySelectorAll('td');
                if (cells[colIndex]) {
                    cells[colIndex].classList.add('highlighted-col');
                }
            }
        });
    }
    
    // Add click handlers to blood type buttons
    bloodTypeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons in this container
            bloodTypeButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update display
            const bloodType = this.getAttribute('data-type');
            updateCompatibilityDisplay(bloodType);
        });
    });
    
    // Initialize with A+ selected
    updateCompatibilityDisplay('A+');
}

// Initialize blood compatibility chart when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initBloodCompatibilityChart();
    initLeaderboard();
});

/* ========== DONOR LEADERBOARD ========== */
function initLeaderboard() {
    loadLeaderboard();
    updateYourRank();
}

function loadLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (!leaderboardBody) return;
    
    // Get all donations and calculate totals per user
    const donations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');
    const currentSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    const currentUser = currentSession ? JSON.parse(currentSession) : null;
    
    // Calculate donation count per user
    const donorStats = {};
    
    donations.forEach(donation => {
        const email = donation.email;
        if (!donorStats[email]) {
            donorStats[email] = {
                email: email,
                name: donation.name,
                bloodGroup: donation.bloodGroup,
                count: 0,
                location: ''
            };
        }
        donorStats[email].count++;
        donorStats[email].location = donation.location;
    });
    
    // Also add users who haven't donated yet (with 0 count, but don't show them)
    // Convert to array and sort by donation count
    const leaderboardData = Object.values(donorStats)
        .filter(donor => donor.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10
    
    if (leaderboardData.length === 0) {
        leaderboardBody.innerHTML = `
            <div class="leaderboard-empty">
                <i class="fas fa-users"></i>
                <p>Be the first to join our leaderboard!</p>
                <a href="signup.html" class="btn btn-primary">
                    <i class="fas fa-user-plus"></i> Sign Up Now
                </a>
            </div>
        `;
        return;
    }
    
    leaderboardBody.innerHTML = leaderboardData.map((donor, index) => {
        const rank = index + 1;
        const badge = getDonorBadge(donor.count);
        const isCurrentUser = currentUser && currentUser.email === donor.email;
        
        let rankClass = '';
        if (rank === 1) rankClass = 'top-1';
        else if (rank === 2) rankClass = 'top-2';
        else if (rank === 3) rankClass = 'top-3';
        
        return `
            <div class="leaderboard-entry ${rankClass} ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank-display">
                    <span class="rank-number ${rank <= 3 ? 'rank-' + rank : ''}">${rank}</span>
                </div>
                <div class="donor-info-lb">
                    <div class="donor-avatar-lb">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="donor-name-lb">${donor.name} ${isCurrentUser ? '(You)' : ''}</div>
                        <div class="donor-location-lb">
                            <i class="fas fa-map-marker-alt"></i> ${donor.location || 'Unknown'}
                        </div>
                    </div>
                </div>
                <div class="blood-type-lb">${donor.bloodGroup}</div>
                <div class="donation-count-lb">${donor.count}</div>
                <div class="lives-saved-lb">${donor.count * 3}</div>
                <div class="donor-badge-lb ${badge.class}">
                    <i class="fas ${badge.icon}"></i>
                    <span>${badge.name}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getDonorBadge(donationCount) {
    if (donationCount >= 10) {
        return { name: 'Gold', class: 'gold', icon: 'fa-crown' };
    } else if (donationCount >= 5) {
        return { name: 'Silver', class: 'silver', icon: 'fa-medal' };
    } else if (donationCount >= 3) {
        return { name: 'Bronze', class: 'bronze', icon: 'fa-award' };
    } else {
        return { name: 'New Hero', class: 'starter', icon: 'fa-heart' };
    }
}

function updateYourRank() {
    const yourRankSection = document.getElementById('yourRankSection');
    if (!yourRankSection) return;
    
    const currentSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!currentSession) {
        yourRankSection.style.display = 'none';
        return;
    }
    
    const currentUser = JSON.parse(currentSession);
    const donations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
    
    // Calculate all donor stats
    const donorStats = {};
    donations.forEach(donation => {
        if (!donorStats[donation.email]) {
            donorStats[donation.email] = 0;
        }
        donorStats[donation.email]++;
    });
    
    // Sort and find rank
    const sortedDonors = Object.entries(donorStats)
        .sort((a, b) => b[1] - a[1]);
    
    const userDonations = donorStats[currentUser.email] || 0;
    let userRank = sortedDonors.findIndex(([email]) => email === currentUser.email) + 1;
    
    if (userRank === 0) {
        userRank = sortedDonors.length + 1;
    }
    
    const badge = getDonorBadge(userDonations);
    
    // Update UI
    yourRankSection.style.display = 'block';
    
    const yourRankNumber = document.getElementById('yourRankNumber');
    const yourDonationCount = document.getElementById('yourDonationCount');
    const yourRankBadge = document.getElementById('yourRankBadge');
    
    if (yourRankNumber) yourRankNumber.textContent = '#' + userRank;
    if (yourDonationCount) yourDonationCount.textContent = userDonations;
    if (yourRankBadge) {
        yourRankBadge.innerHTML = `
            <i class="fas ${badge.icon}" style="color: ${getBadgeColor(badge.class)}"></i>
            <span>${badge.name}</span>
        `;
    }
}

function getBadgeColor(badgeClass) {
    switch(badgeClass) {
        case 'gold': return '#FFD700';
        case 'silver': return '#C0C0C0';
        case 'bronze': return '#CD7F32';
        default: return '#D32F2F';
    }
}

// Load Dashboard Leaderboard (for logged-in users)
function loadDashboardLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBodyDash');
    if (!leaderboardBody) return;
    
    const donations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
    const currentSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    const currentUser = currentSession ? JSON.parse(currentSession) : null;
    
    // Calculate donation count per user
    const donorStats = {};
    donations.forEach(donation => {
        const email = donation.email;
        if (!donorStats[email]) {
            donorStats[email] = {
                email: email,
                name: donation.name,
                bloodGroup: donation.bloodGroup,
                count: 0
            };
        }
        donorStats[email].count++;
    });
    
    // Convert to array and sort
    const leaderboardData = Object.values(donorStats)
        .filter(donor => donor.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    if (leaderboardData.length === 0) {
        leaderboardBody.innerHTML = `
            <div class="leaderboard-empty-dash">
                <i class="fas fa-trophy"></i>
                <p>Be the first on the leaderboard! Register a donation to get started.</p>
            </div>
        `;
        return;
    }
    
    leaderboardBody.innerHTML = leaderboardData.map((donor, index) => {
        const rank = index + 1;
        const badge = getDonorBadge(donor.count);
        const isCurrentUser = currentUser && currentUser.email === donor.email;
        
        let rankClass = '';
        if (rank === 1) rankClass = 'top-1';
        else if (rank === 2) rankClass = 'top-2';
        else if (rank === 3) rankClass = 'top-3';
        
        return `
            <div class="leaderboard-entry-dash ${rankClass} ${isCurrentUser ? 'current-user' : ''}">
                <div>
                    <span class="rank-number-dash ${rank <= 3 ? 'rank-' + rank : ''}">${rank}</span>
                </div>
                <div class="donor-info-dash">
                    <div class="donor-avatar-dash">
                        <i class="fas fa-user"></i>
                    </div>
                    <span class="donor-name-dash">
                        ${donor.name}
                        ${isCurrentUser ? '<span class="you-tag">YOU</span>' : ''}
                    </span>
                </div>
                <div>
                    <span class="blood-type-dash">${donor.bloodGroup}</span>
                </div>
                <div class="donation-count-dash">${donor.count}</div>
                <div class="lives-saved-dash">${donor.count * 3}</div>
                <div class="donor-badge-dash ${badge.class}">
                    <i class="fas ${badge.icon}"></i>
                    <span>${badge.name}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Update user's rank info
    updateDashboardRank(donorStats, currentUser);
}

function updateDashboardRank(donorStats, currentUser) {
    if (!currentUser) return;
    
    const yourRankDash = document.getElementById('yourRankDash');
    const yourDonationsDash = document.getElementById('yourDonationsDash');
    const yourBadgeIconDash = document.getElementById('yourBadgeIconDash');
    const nextBadgeInfo = document.getElementById('nextBadgeInfo');
    const progressBarLb = document.getElementById('progressBarLb');
    
    // Sort donors
    const sortedDonors = Object.values(donorStats)
        .filter(d => d.count > 0)
        .sort((a, b) => b.count - a.count);
    
    const userDonations = donorStats[currentUser.email]?.count || 0;
    let userRank = sortedDonors.findIndex(d => d.email === currentUser.email) + 1;
    if (userRank === 0) userRank = sortedDonors.length + 1;
    
    const badge = getDonorBadge(userDonations);
    
    // Update UI
    if (yourRankDash) yourRankDash.textContent = '#' + userRank;
    if (yourDonationsDash) yourDonationsDash.textContent = userDonations;
    
    if (yourBadgeIconDash) {
        yourBadgeIconDash.className = 'your-rank-badge-icon ' + badge.class;
        yourBadgeIconDash.innerHTML = `<i class="fas ${badge.icon}"></i>`;
    }
    
    // Calculate next badge
    let donationsToNext = 0;
    let nextBadgeName = '';
    let progress = 0;
    
    if (userDonations < 3) {
        donationsToNext = 3 - userDonations;
        nextBadgeName = 'Bronze';
        progress = (userDonations / 3) * 100;
    } else if (userDonations < 5) {
        donationsToNext = 5 - userDonations;
        nextBadgeName = 'Silver';
        progress = ((userDonations - 3) / 2) * 100;
    } else if (userDonations < 10) {
        donationsToNext = 10 - userDonations;
        nextBadgeName = 'Gold';
        progress = ((userDonations - 5) / 5) * 100;
    } else {
        donationsToNext = 0;
        nextBadgeName = 'Max Level!';
        progress = 100;
    }
    
    if (nextBadgeInfo) {
        if (donationsToNext > 0) {
            nextBadgeInfo.innerHTML = `
                <span>${nextBadgeName} badge in</span>
                <strong>${donationsToNext} more donation${donationsToNext > 1 ? 's' : ''}</strong>
            `;
        } else {
            nextBadgeInfo.innerHTML = `
                <span>Congratulations!</span>
                <strong>🏆 Gold Donor</strong>
            `;
        }
    }
    
    if (progressBarLb) {
        progressBarLb.style.width = progress + '%';
    }
}

/* ========== EMERGENCY BLOOD ALERT SYSTEM ========== */
function initEmergencyAlert() {
    const emergencyFloatBtn = document.getElementById('emergencyFloatBtn');
    const emergencyModal = document.getElementById('emergencyModal');
    const emergencyModalOverlay = document.getElementById('emergencyModalOverlay');
    const emergencyModalClose = document.getElementById('emergencyModalClose');
    const emergencyForm = document.getElementById('emergencyForm');
    
    if (!emergencyFloatBtn) return;
    
    // Open emergency modal
    emergencyFloatBtn.addEventListener('click', function() {
        if (emergencyModal) {
            emergencyModal.classList.add('show');
            loadEmergencyAlerts();
        }
    });
    
    // Close modal
    if (emergencyModalOverlay) {
        emergencyModalOverlay.addEventListener('click', closeEmergencyModal);
    }
    if (emergencyModalClose) {
        emergencyModalClose.addEventListener('click', closeEmergencyModal);
    }
    
    // Time selector buttons
    const timeBtns = document.querySelectorAll('.time-btn');
    timeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            timeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Emergency form submission
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const patientName = document.getElementById('emergencyPatientName').value.trim();
            const bloodGroup = document.getElementById('emergencyBloodGroup').value;
            const hospital = document.getElementById('emergencyHospital').value.trim();
            const phone = document.getElementById('emergencyPhone').value.trim();
            const activeTimeBtn = document.querySelector('.time-btn.active');
            const hours = activeTimeBtn ? parseInt(activeTimeBtn.dataset.hours) : 2;
            
            // Validate
            if (!patientName || !bloodGroup || !hospital || !phone) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            
            if (!/^\d{10}$/.test(phone)) {
                showToast('Please enter a valid 10-digit phone number', 'error');
                return;
            }
            
            // Create emergency alert
            const alert = {
                id: Date.now(),
                patientName,
                bloodGroup,
                hospital,
                phone,
                hours,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
                status: 'active'
            };
            
            // Save to storage
            const alerts = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMERGENCY_ALERTS) || '[]');
            alerts.push(alert);
            localStorage.setItem(STORAGE_KEYS.EMERGENCY_ALERTS, JSON.stringify(alerts));
            
            // Reset form
            emergencyForm.reset();
            document.querySelector('.time-btn[data-hours="2"]').classList.add('active');
            
            // Show success
            showToast('🚨 Emergency alert sent! Compatible donors will be notified.', 'success');
            
            // Reload alerts
            loadEmergencyAlerts();
            
            // Notify compatible donors (simulated)
            notifyCompatibleDonors(bloodGroup);
        });
    }
    
    // Start timer update interval
    setInterval(updateEmergencyTimers, 1000);
}

function closeEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    if (modal) modal.classList.remove('show');
}

function loadEmergencyAlerts() {
    const emergencyList = document.getElementById('emergencyList');
    if (!emergencyList) return;
    
    const alerts = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMERGENCY_ALERTS) || '[]');
    const activeAlerts = alerts.filter(a => {
        const expiresAt = new Date(a.expiresAt);
        return expiresAt > new Date() && a.status === 'active';
    });
    
    if (activeAlerts.length === 0) {
        emergencyList.innerHTML = `
            <div class="no-emergencies">
                <i class="fas fa-check-circle"></i>
                <p>No active emergency alerts. All requests have been fulfilled!</p>
            </div>
        `;
        return;
    }
    
    emergencyList.innerHTML = activeAlerts.map(alert => {
        const expiresAt = new Date(alert.expiresAt);
        const now = new Date();
        const remainingMs = expiresAt - now;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        
        return `
            <div class="emergency-alert-card" data-id="${alert.id}">
                <div class="emergency-alert-info">
                    <h4>
                        ${alert.patientName}
                        <span class="emergency-blood-badge">${alert.bloodGroup}</span>
                    </h4>
                    <p><i class="fas fa-hospital"></i> ${alert.hospital}</p>
                    <p><i class="fas fa-phone"></i> ${alert.phone}</p>
                </div>
                <div class="emergency-timer" data-expires="${alert.expiresAt}">
                    <span class="timer-value">${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</span>
                    <span class="timer-label">Time Left</span>
                </div>
                <div class="emergency-actions">
                    <a href="tel:${alert.phone}" class="btn btn-primary">
                        <i class="fas fa-phone"></i> Call
                    </a>
                    <button class="btn btn-secondary" onclick="resolveEmergency(${alert.id})">
                        <i class="fas fa-check"></i> Resolved
                    </button>
                </div>
            </div>
        `;
    }).reverse().join('');
}

function updateEmergencyTimers() {
    const timers = document.querySelectorAll('.emergency-timer');
    
    timers.forEach(timer => {
        const expiresAt = new Date(timer.dataset.expires);
        const now = new Date();
        const remainingMs = expiresAt - now;
        
        if (remainingMs <= 0) {
            timer.classList.add('expired');
            timer.querySelector('.timer-value').textContent = 'EXPIRED';
            return;
        }
        
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        
        timer.querySelector('.timer-value').textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    });
}

window.resolveEmergency = function(alertId) {
    const alerts = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMERGENCY_ALERTS) || '[]');
    const index = alerts.findIndex(a => a.id === alertId);
    
    if (index !== -1) {
        alerts[index].status = 'resolved';
        localStorage.setItem(STORAGE_KEYS.EMERGENCY_ALERTS, JSON.stringify(alerts));
        showToast('Emergency resolved! Thank you for helping save a life! ❤️', 'success');
        loadEmergencyAlerts();
    }
};

function notifyCompatibleDonors(bloodGroup) {
    // Blood compatibility for receiving
    const compatibility = {
        'A+': ['A+', 'A-', 'O+', 'O-'],
        'A-': ['A-', 'O-'],
        'B+': ['B+', 'B-', 'O+', 'O-'],
        'B-': ['B-', 'O-'],
        'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        'AB-': ['A-', 'B-', 'AB-', 'O-'],
        'O+': ['O+', 'O-'],
        'O-': ['O-']
    };
    
    const compatibleTypes = compatibility[bloodGroup] || [];
    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');
    const compatibleDonors = allUsers.filter(u => compatibleTypes.includes(u.bloodGroup));
    
    console.log(`🚨 Emergency Alert: ${compatibleDonors.length} compatible donors notified for ${bloodGroup} blood`);
    
    // In a real app, this would send push notifications/SMS/emails
    // For now, we just log it
}

/* ========== HEALTH TIPS FUNCTIONALITY ========== */
function initHealthTips() {
    const tipsTabs = document.querySelectorAll('.tips-tab-btn');
    const tipsContents = document.querySelectorAll('.tips-content');
    
    if (tipsTabs.length === 0) return;
    
    tipsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTips = this.dataset.tips;
            
            // Remove active from all tabs and contents
            tipsTabs.forEach(t => t.classList.remove('active'));
            tipsContents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked tab and corresponding content
            this.classList.add('active');
            const content = document.getElementById('tips-' + targetTips);
            if (content) {
                content.classList.add('active');
                
                // Re-trigger animations
                const cards = content.querySelectorAll('.tip-card');
                cards.forEach(card => {
                    card.style.animation = 'none';
                    card.offsetHeight; // Trigger reflow
                    card.style.animation = null;
                });
            }
        });
    });
}

/* ========== ELIGIBILITY CALCULATOR ========== */
function initEligibilityCalculator() {
    const calcBtn = document.getElementById('calcEligibility');
    
    if (!calcBtn) return;
    
    calcBtn.addEventListener('click', function() {
        const lastDonationInput = document.getElementById('lastDonationCalc');
        const genderSelect = document.getElementById('genderCalc');
        const resultDiv = document.getElementById('calcResult');
        
        if (!lastDonationInput.value) {
            showToast('Please select your last donation date', 'error');
            return;
        }
        
        const lastDonation = new Date(lastDonationInput.value);
        const gender = genderSelect.value;
        const today = new Date();
        
        // Calculate next eligible date
        // Men: 3 months (90 days), Women: 4 months (120 days)
        const waitDays = gender === 'male' ? 90 : 120;
        const nextEligible = new Date(lastDonation);
        nextEligible.setDate(nextEligible.getDate() + waitDays);
        
        const resultIcon = resultDiv.querySelector('.result-icon');
        const statusEl = document.getElementById('eligibilityStatus');
        const dateEl = document.getElementById('eligibilityDate');
        
        resultDiv.style.display = 'flex';
        
        if (nextEligible <= today) {
            // Eligible now
            resultIcon.className = 'result-icon eligible';
            resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            statusEl.textContent = '✅ Great news! You can donate now!';
            statusEl.style.color = '#4CAF50';
            
            const daysSince = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
            dateEl.innerHTML = `Your body has fully recovered. It's been <strong>${daysSince} days</strong> since your last donation.`;
        } else {
            // Not eligible yet
            const daysRemaining = Math.ceil((nextEligible - today) / (1000 * 60 * 60 * 24));
            
            resultIcon.className = 'result-icon not-eligible';
            resultIcon.innerHTML = '<i class="fas fa-clock"></i>';
            statusEl.textContent = '⏳ Please wait a bit longer';
            statusEl.style.color = '#FF9800';
            dateEl.innerHTML = `Your next eligible date is: <strong>${formatDateLong(nextEligible)}</strong> (${daysRemaining} days remaining)`;
        }
    });
}

function formatDateLong(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/* ========== DONATION REMINDER SYSTEM ========== */
function checkDonationReminder() {
    const currentSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!currentSession) return;
    
    const user = JSON.parse(currentSession);
    const donations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]');
    const userDonations = donations.filter(d => d.email === user.email);
    
    if (userDonations.length === 0) return;
    
    // Check if reminder was dismissed today
    const dismissedData = localStorage.getItem(STORAGE_KEYS.REMINDER_DISMISSED);
    if (dismissedData) {
        const dismissed = JSON.parse(dismissedData);
        const dismissedDate = new Date(dismissed.date);
        const today = new Date();
        
        // If dismissed today, don't show again
        if (dismissedDate.toDateString() === today.toDateString()) {
            return;
        }
    }
    
    // Sort donations by date (most recent first)
    const sortedDonations = userDonations.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
    const lastDonation = sortedDonations[0];
    const lastDonationDate = new Date(lastDonation.rawDate);
    const today = new Date();
    
    // Calculate days since last donation
    const daysSince = Math.floor((today - lastDonationDate) / (1000 * 60 * 60 * 24));
    
    // Assume male (90 days = 3 months) for simplicity
    // In real app, would get gender from user profile
    const waitDays = 90;
    
    // Show reminder if eligible (90+ days since last donation)
    if (daysSince >= waitDays) {
        showDonationReminder(lastDonationDate, daysSince);
    }
}

function showDonationReminder(lastDonationDate, daysSince) {
    const reminderPopup = document.getElementById('reminderPopup');
    const lastDonationDateEl = document.getElementById('lastDonationDate');
    const daysSinceDonationEl = document.getElementById('daysSinceDonation');
    const reminderClose = document.getElementById('reminderClose');
    const remindLater = document.getElementById('remindLater');
    
    if (!reminderPopup) return;
    
    // Set data
    if (lastDonationDateEl) {
        lastDonationDateEl.textContent = formatDateShort(lastDonationDate.toISOString());
    }
    if (daysSinceDonationEl) {
        daysSinceDonationEl.textContent = daysSince + ' days';
    }
    
    // Show popup with delay
    setTimeout(() => {
        reminderPopup.classList.add('show');
    }, 2000);
    
    // Close handlers
    if (reminderClose) {
        reminderClose.addEventListener('click', function() {
            dismissReminder();
        });
    }
    
    if (remindLater) {
        remindLater.addEventListener('click', function() {
            dismissReminder();
            showToast('We\'ll remind you later! 💪', 'success');
        });
    }
}

function dismissReminder() {
    const reminderPopup = document.getElementById('reminderPopup');
    if (reminderPopup) {
        reminderPopup.classList.remove('show');
    }
    
    // Save dismissal
    localStorage.setItem(STORAGE_KEYS.REMINDER_DISMISSED, JSON.stringify({
        date: new Date().toISOString()
    }));
}

/* ========== TYPING ANIMATION ========== */
function initTypingAnimation() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;
    
    const phrases = [
        'Donate Blood Today',
        'Be Someone\'s Hero',
        'Give the Gift of Life',
        'Every Drop Counts',
        'Save 3 Lives Today'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pause at end of phrase
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start typing after a delay
    setTimeout(type, 1000);
}

/* ========== PARALLAX EFFECT ========== */
function initParallaxEffect() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    
    const parallaxElements = hero.querySelectorAll('.parallax-circle, .parallax-heart');
    const heroContent = hero.querySelector('.hero-content');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        // Only apply parallax when hero is visible
        if (scrolled < heroHeight) {
            // Parallax for background elements
            parallaxElements.forEach((el, index) => {
                const speed = 0.2 + (index * 0.1);
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            // Slight parallax for hero content
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / heroHeight);
            }
        }
    });
    
    // Mouse move parallax effect
    hero.addEventListener('mousemove', function(e) {
        const x = (e.clientX - window.innerWidth / 2) / 50;
        const y = (e.clientY - window.innerHeight / 2) / 50;
        
        parallaxElements.forEach((el, index) => {
            const speed = 1 + (index * 0.5);
            el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
}

/* ========== TESTIMONIALS CAROUSEL ========== */
function initTestimonialsCarousel() {
    const carousel = document.getElementById('testimonialsCarousel');
    if (!carousel) return;
    
    const cards = carousel.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    const progressBar = document.getElementById('carouselProgress');
    
    let currentIndex = 0;
    let autoSlideInterval;
    let progressInterval;
    const totalCards = cards.length;
    const autoSlideDelay = 5000; // 5 seconds
    
    function updateCarousel() {
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            
            if (index === currentIndex) {
                card.classList.add('active');
            } else if (index === (currentIndex - 1 + totalCards) % totalCards) {
                card.classList.add('prev');
            } else if (index === (currentIndex + 1) % totalCards) {
                card.classList.add('next');
            }
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
        
        // Reset progress bar
        resetProgress();
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalCards;
        updateCarousel();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateCarousel();
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }
    
    function resetProgress() {
        if (progressBar) {
            progressBar.style.animation = 'none';
            progressBar.offsetHeight; // Trigger reflow
            progressBar.style.animation = `progressFill ${autoSlideDelay}ms linear`;
        }
    }
    
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, autoSlideDelay);
        resetProgress();
    }
    
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            prevSlide();
            startAutoSlide(); // Reset auto-slide timer
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            nextSlide();
            startAutoSlide(); // Reset auto-slide timer
        });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            goToSlide(index);
            startAutoSlide(); // Reset auto-slide timer
        });
    });
    
    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);
    
    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });
    
    carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (diff > swipeThreshold) {
            nextSlide();
        } else if (diff < -swipeThreshold) {
            prevSlide();
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Only if testimonials section is in view
        const section = document.getElementById('testimonials');
        if (!section) return;
        
        const rect = section.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInView) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                startAutoSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                startAutoSlide();
            }
        }
    });
    
    // Initialize
    updateCarousel();
    startAutoSlide();
}

/* ========== SCROLL ANIMATIONS ========== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.stat-card, .about-card, .feature-card, .fact-card, .faq-item');
    
    if (animatedElements.length === 0) return;
    
    // Add scroll-animate class
    animatedElements.forEach(el => {
        el.classList.add('scroll-animate');
    });
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add delay for stagger effect
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Parallax on scroll for sections
    const sections = document.querySelectorAll('.stats-section, .about-section, .testimonials-section');
    
    window.addEventListener('scroll', function() {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            
            if (scrollPercent > 0 && scrollPercent < 1) {
                const bg = section.querySelector('.section-header');
                if (bg) {
                    bg.style.transform = `translateY(${scrollPercent * 20}px)`;
                }
            }
        });
    });
}

/* ========== SMOOTH REVEAL ON SCROLL ========== */
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const revealTop = el.getBoundingClientRect().top;
        const revealPoint = 150;
        
        if (revealTop < windowHeight - revealPoint) {
            el.classList.add('revealed');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

/* ========== CONSOLE EASTER EGG ========== */
console.log(`
%c ❤️ RakhtSeva - Blood Donation Platform ❤️ 
%c Every Drop Counts. Save Lives Today!

%c ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
%c 🎓 ACADEMIC PROJECT
%c ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
%c 🏛️  University: L.J University, Ahmedabad
%c 📚  Subject: FSD-1 (Full Stack Development)
%c 👨‍🏫  Mentor: Prof. Mayur Prajapati
%c 📅  Year: 2024
%c ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

%c 👥 PROJECT TEAM
%c • Parmar Kavya Ashishkumar
%c • Mistry Nirav Maheshbhai
%c • Odedra Asha Kandhaji
%c ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

%c 🛠️ TECH STACK
%c • HTML5 - Semantic Markup & Accessibility
%c • CSS3 - Flexbox, Grid, Animations
%c • JavaScript - DOM, Events, Local Storage

%c ✨ KEY FEATURES
%c • User Authentication (Login/Signup)
%c • Blood Donation Registration
%c • Certificate Generation (PDF Ready)
%c • Blood Request System
%c • Emergency Alert System
%c • Donor Leaderboard with Badges
%c • Blood Compatibility Chart
%c • Interactive India Map
%c • Dark Mode Support
%c • Testimonials Carousel
%c • Health Tips Section
%c • Social Media Sharing
`, 
'color: #D32F2F; font-size: 24px; font-weight: bold;',
'color: #00897B; font-size: 14px;',
'color: #FFD700; font-size: 12px;',
'color: #FFD700; font-size: 14px; font-weight: bold;',
'color: #FFD700; font-size: 12px;',
'color: #E0E0E0; font-size: 12px;',
'color: #E0E0E0; font-size: 12px;',
'color: #E0E0E0; font-size: 12px;',
'color: #E0E0E0; font-size: 12px;',
'color: #FFD700; font-size: 12px;',
'color: #4DB6AC; font-size: 13px; font-weight: bold;',
'color: #80CBC4; font-size: 12px;',
'color: #80CBC4; font-size: 12px;',
'color: #80CBC4; font-size: 12px;',
'color: #FFD700; font-size: 12px;',
'color: #4CAF50; font-size: 13px; font-weight: bold;',
'color: #81C784; font-size: 11px;',
'color: #81C784; font-size: 11px;',
'color: #81C784; font-size: 11px;',
'color: #2196F3; font-size: 13px; font-weight: bold;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;',
'color: #64B5F6; font-size: 11px;'
);

// Additional Easter Egg with Team Names
console.log('%c🩸 Made with ❤️ by Kavya, Nirav & Asha | Mentor: Prof. Mayur Prajapati | L.J University', 'background: linear-gradient(90deg, #D32F2F, #B71C1C); color: white; padding: 10px 20px; border-radius: 5px; font-size: 12px;');

/* ========== UTILITY FUNCTION TO RESET DUMMY DATA ========== */
window.resetDummyData = function() {
    // Clear all data
    localStorage.removeItem(STORAGE_KEYS.ALL_USERS);
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.BLOOD_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY_ALERTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    console.log('🗑️ All data cleared!');
    console.log('🔄 Reloading page to reinitialize dummy data...');
    
    // Reload page to reinitialize dummy data
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};

// Log helpful message for developers
console.log('%c🔧 Developer Tools:', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
console.log('%c   • resetDummyData() - Clear all data and reload with fresh dummy data', 'color: #81C784; font-size: 12px;');
console.log('%c   • localStorage.clear() - Clear everything including theme preference', 'color: #81C784; font-size: 12px;');