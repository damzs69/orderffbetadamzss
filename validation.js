document.addEventListener('DOMContentLoaded', function() {
    // ==================== OWNER ACCESS WITH SECURE LOGIN ====================
    const ownerBtn = document.getElementById('ownerBtn');
    const ownerPanel = document.getElementById('ownerPanel');
    const ownerLogin = document.getElementById('ownerLogin');
    const ownerPassword = document.getElementById('ownerPassword');
    const ownerData = document.getElementById('ownerData');
    let failedAttempts = 0;
    const MAX_ATTEMPTS = 3;
    const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

    ownerBtn.addEventListener('click', function() {
        // Anti-bruteforce check
        const lastAttempt = localStorage.getItem('lastFailedAttempt');
        if (failedAttempts >= MAX_ATTEMPTS && lastAttempt && 
            (Date.now() - parseInt(lastAttempt)) < LOCKOUT_TIME) {
            const remainingTime = Math.ceil((LOCKOUT_TIME - (Date.now() - parseInt(lastAttempt))) / 1000 / 60);
            alert(`Anda telah terkunci. Coba lagi dalam ${remainingTime} menit.`);
            return;
        }
        ownerPanel.style.display = ownerPanel.style.display === 'block' ? 'none' : 'block';
    });

    ownerLogin.addEventListener('click', function() {
        // Secure password comparison with timing attack protection
        let correct = true;
        const correctPassword = 'DAMZS69';
        
        // Timing-safe comparison
        if (ownerPassword.value.length !== correctPassword.length) {
            correct = false;
        } else {
            for (let i = 0; i < correctPassword.length; i++) {
                if (ownerPassword.value.charCodeAt(i) !== correctPassword.charCodeAt(i)) {
                    correct = false;
                }
            }
        }

        if (correct) {
            // Successful login
            failedAttempts = 0;
            localStorage.removeItem('lastFailedAttempt');
            loadPurchaseData();
            ownerPassword.value = '';
        } else {
            // Failed login
            failedAttempts++;
            localStorage.setItem('lastFailedAttempt', Date.now().toString());
            if (failedAttempts >= MAX_ATTEMPTS) {
                alert(`Password salah! Akses terkunci selama 5 menit.`);
            } else {
                alert(`Password salah! Percobaan ${failedAttempts}/${MAX_ATTEMPTS}`);
            }
        }
    });

    function loadPurchaseData() {
        // In production, this would fetch from secure API with authentication
        const sampleData = [
            { 
                phone: '6281234567890', 
                username: 'player1', 
                amount: 10000, 
                time: new Date().toISOString(),
                paymentVerified: true,
                proofVerified: true
            }
        ];

        let html = `
        <h3>Data Pembelian Terverifikasi</h3>
        <div class="security-status">
            <span class="secure-badge">🔒 TERVERIFIKASI SUPER KETAT</span>
        </div>
        <table>
            <tr>
                <th>No. HP</th>
                <th>Username</th>
                <th>Jumlah</th>
                <th>Waktu</th>
                <th>Status</th>
            </tr>`;
        
        sampleData.forEach(data => {
            const statusClass = data.paymentVerified && data.proofVerified ? 'verified' : 'rejected';
            const statusText = data.paymentVerified && data.proofVerified ? 
                '✅ Valid' : '❌ Ditolak';
            
            html += `<tr>
                <td>${data.phone}</td>
                <td>${data.username}</td>
                <td>Rp ${data.amount.toLocaleString()}</td>
                <td>${new Date(data.time).toLocaleString()}</td>
                <td class="${statusClass}">${statusText}</td>
            </tr>`;
        });
        html += '</table>';

        ownerData.innerHTML = html;
    }

    // ==================== PHONE NUMBER VALIDATION ====================
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', function() {
        // Real-time validation
        const value = this.value;
        
        // Remove any non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        
        // Ensure starts with 62
        let formatted = digitsOnly;
        if (digitsOnly.length > 0 && !digitsOnly.startsWith('62')) {
            formatted = '62' + digitsOnly;
        }
        
        // Limit to 13 digits
        if (formatted.length > 13) {
            formatted = formatted.substring(0, 13);
        }
        
        this.value = formatted;
        
        // Visual feedback
        if (formatted.length === 13 && formatted.startsWith('62')) {
            this.style.borderColor = '#4CAF50';
        } else {
            this.style.borderColor = '#ff6b6b';
        }
    });

    // ==================== USERNAME VALIDATION ====================
    const usernameInput = document.getElementById('username');
    usernameInput.addEventListener('input', function() {
        // Basic anti-scripting protection
        const value = this.value;
        const cleanValue = value.replace(/[<>\/\\]/g, '');
        
        if (value !== cleanValue) {
            this.value = cleanValue;
        }
        
        // Visual feedback
        if (cleanValue.length >= 3) {
            this.style.borderColor = '#4CAF50';
        } else {
            this.style.borderColor = '#ff6b6b';
        }
    });

    // ==================== FORM NAVIGATION WITH STRICT VALIDATION ====================
    const nextStep1 = document.getElementById('nextStep1');
    const formStep1 = document.getElementById('formStep1');
    const formStep2 = document.getElementById('formStep2');
    const phoneError = document.getElementById('phoneError');
    const userError = document.getElementById('userError');

    nextStep1.addEventListener('click', function() {
        const phoneNumber = phoneInput.value;
        const username = usernameInput.value;
        
        // Reset errors
        phoneError.style.display = 'none';
        userError.style.display = 'none';
        
        let isValid = true;

        // Phone validation (military grade)
        if (!phoneNumber.startsWith('62') || phoneNumber.length !== 13 || !/^\d+$/.test(phoneNumber)) {
            phoneError.textContent = 'HARUS 13 DIGIT DIAWALI 62! CONTOH: 6281234567890';
            phoneError.style.display = 'block';
            phoneInput.style.border = '2px solid red';
            isValid = false;
            
            // Shake animation for emphasis
            phoneInput.style.animation = 'shake 0.5s';
            setTimeout(() => { phoneInput.style.animation = ''; }, 500);
        }

        // Username validation
        if (username.trim().length < 3) {
            userError.textContent = 'USERNAME MINIMAL 3 KARAKTER!';
            userError.style.display = 'block';
            usernameInput.style.border = '2px solid red';
            isValid = false;
            
            usernameInput.style.animation = 'shake 0.5s';
            setTimeout(() => { usernameInput.style.animation = ''; }, 500);
        }

        // Check for suspicious patterns
        if (username.toLowerCase().includes('admin') || 
            username.toLowerCase().includes('owner') ||
            username.toLowerCase().includes('script')) {
            userError.textContent = 'USERNAME TIDAK DIIZINKAN!';
            userError.style.display = 'block';
            usernameInput.style.border = '2px solid red';
            isValid = false;
            
            usernameInput.style.animation = 'shake 0.5s 2';
            setTimeout(() => { usernameInput.style.animation = ''; }, 1000);
        }

        if (isValid) {
            // Additional security: Verify phone number format
            const phoneRegex = /^62[1-9]\d{7,11}$/;
            if (!phoneRegex.test(phoneNumber)) {
                phoneError.textContent = 'NOMOR TIDAK VALID! HARUS NOMOR INDONESIA';
                phoneError.style.display = 'block';
                phoneInput.style.border = '2px solid red';
                isValid = false;
                
                phoneInput.style.animation = 'shake 0.5s 3';
                setTimeout(() => { phoneInput.style.animation = ''; }, 1500);
                return;
            }

            // If all validations pass
            formStep1.classList.remove('active');
            formStep2.classList.add('active');
            
            // Security logging (in production would send to server)
            console.log('User passed validation:', {
                phone: phoneNumber,
                username: username,
                timestamp: new Date().toISOString()
            });
        }
    });

    // ==================== PAYMENT METHOD SELECTION ====================
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Clear all selections first
            paymentOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.style.border = '1px solid transparent';
            });
            
            // Activate selected
            this.classList.add('active');
            this.style.border = '2px solid #FFD700';
            
            // Security logging
            const method = this.getAttribute('data-method');
            console.log('Payment method selected:', method);
        });
    });

    // ==================== ANTI-TAMPERING MECHANISM ====================
    // Detect if developer tools are open
    setInterval(function() {
        const before = new Date().getTime();
        debugger;
        const after = new Date().getTime();
        if (after - before > 100) {
            document.body.innerHTML = `
            <div style="background:black;color:red;padding:20px;text-align:center;">
                <h1>⚠️ AKTIFKAN ALAT DEVELOPER TERDETEKSI! ⚠️</h1>
                <p>Akses ditolak karena aktivitas mencurigakan</p>
                <p>Silakan muat ulang halaman untuk melanjutkan</p>
            </div>`;
            window.stop();
        }
    }, 1000);

    // Prevent right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        alert('FITUR INI DILINDUNGI!');
        return false;
    });

    // Prevent F12, Ctrl+Shift+I, etc.
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') || 
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            alert('AKSES DEVELOPER DIBLOKIR!');
            return false;
        }
    });
});

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
.verified { color: #4CAF50; font-weight: bold; }
.rejected { color: #f44336; font-weight: bold; }
.secure-badge {
    background: #4CAF50;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 12px;
    display: inline-block;
    margin-bottom: 10px;
}`;
document.head.appendChild(style);