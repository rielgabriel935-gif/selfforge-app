// Global App State & LocalStorage Keys
let currentPinInput = "";
let savedPin = localStorage.getItem("sf_pin") || "";

// Inisialisasi Aplikasi Saat Halaman Di-load
window.onload = function() {
    checkPinStatus();
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    loadBoundaryLogs();
    loadReadingLogs();
    startNotificationTimer();
};

// Deteksi Status Jaringan Online/Offline
function updateOnlineStatus() {
    const el = document.getElementById('networkStatus');
    if (navigator.onLine) {
        el.className = "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5";
        el.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE';
    } else {
        el.className = "px-3 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1.5";
        el.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span> OFFLINE';
    }
}

// System PIN Security
function checkPinStatus() {
    const lockScreen = document.getElementById('lockScreen');
    if (!savedPin) {
        document.getElementById('lockTitle').innerText = "Buat PIN Baru";
        document.getElementById('lockDesc').innerText = "Buat 4 digit PIN rahasia untuk pertama kali";
    } else {
        document.getElementById('lockTitle').innerText = "Masukkan PIN";
        document.getElementById('lockDesc').innerText = "Masukkan 4 digit PIN untuk membuka SelfForge";
    }
    lockScreen.classList.remove('hidden');
}

function pressNum(num) {
    if (currentPinInput.length < 4) {
        currentPinInput += num;
        updateDots();
    }
}

function clearPin() {
    currentPinInput = "";
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('#pinDots .dot');
    dots.forEach((dot, index) => {
        if (index < currentPinInput.length) {
            dot.classList.add('bg-blue-500', 'border-blue-500');
        } else {
            dot.classList.remove('bg-blue-500', 'border-blue-500');
        }
    });
}

function submitPin() {
    const msg = document.getElementById('pinMsg');
    if (currentPinInput.length !== 4) {
        msg.innerText = "PIN harus 4 digit!";
        return;
    }

    if (!savedPin) {
        localStorage.setItem("sf_pin", currentPinInput);
        savedPin = currentPinInput;
        msg.innerText = "";
        document.getElementById('lockScreen').classList.add('hidden');
        clearPin();
    } else if (currentPinInput === savedPin) {
        msg.innerText = "";
        document.getElementById('lockScreen').classList.add('hidden');
        clearPin();
    } else {
        msg.innerText = "PIN Salah! Coba lagi.";
        clearPin();
    }
}

function lockApp() {
    clearPin();
    checkPinStatus();
}

function resetPinPrompt() {
    if (confirm("Apakah Anda yakin ingin mengganti PIN?")) {
        localStorage.removeItem("sf_pin");
        savedPin = "";
        lockApp();
    }
}

// Navigasi Tab
function switchTab(tabId) {
    const tabs = ['dashboard', 'boundaries', 'reading', 'sleep', 'comfort', 'settings'];
    tabs.forEach(tab => {
        document.getElementById(`tab-${tab}`).classList.add('hidden-tab');
        const btn = document.getElementById(`btn-${tab}`);
        if (btn) {
            btn.classList.remove('active-tab');
            btn.classList.add('bg-slate-800', 'text-slate-300');
        }
    });
    document.getElementById(`tab-${tabId}`).classList.remove('hidden-tab');
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active-tab');
        activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
    }
}

// Generator Skrip Penolakan Tegas
const rejectScripts = {
    work: {
        polite: "Maaf banget ya, untuk saat ini jadwal tugas dan pekerjaan saya lagi padat. Saya khawatir tidak bisa maksimal bantu kamu.",
        direct: "Maaf ya, saya belum bisa bantu untuk tugas ini karena ada fokus lain yang harus saya selesaikan.",
        busy: "Saya lagi fokus menyelesaikan target pekerjaan saya dulu. Jadi untuk kali ini saya harus lewatkan dulu ya."
    },
    social: {
        polite: "Terima kasih banyak sudah mengajak! Tapi maaf banget malam ini saya perlu istirahat dan memulihkan energi.",
        direct: "Maaf ya, hari ini saya tidak bisa ikut nongkrong. Lain kali kalau jadwal saya luang saya kabari.",
        busy: "Wah menarik, tapi jadwal saya minggu ini lagi penuh banget. Terima kasih tawaran ajakannya ya!"
    },
    item: {
        polite: "Maaf ya, barang/kendaraan ini sedang rutin saya pakai sendiri, jadi belum bisa saya pinjamkan.",
        direct: "Maaf, saya tidak terbiasa meminjamkan barang ini ke orang lain demi kenyamanan bersama.",
        busy: "Maaf ya belum bisa, barangnya masih saya butuhkan untuk aktivitas harian."
    },
    money: {
        polite: "Maaf sekali, alokasi keuangan saya bulan ini sedang ketat untuk kebutuhan pokok, jadi belum bisa bantu.",
        direct: "Maaf ya, untuk saat ini saya sedang tidak memegang dana dingin untuk dipinjamkan.",
        busy: "Maaf banget, pos keuangan saya lagi fokus untuk prioritas pribadi bulan ini."
    }
};

function generateRejectScript() {
    const cat = document.getElementById('rejectCategory').value;
    const tone = document.getElementById('rejectTone').value;
    document.getElementById('scriptOutput').innerText = `"${rejectScripts[cat][tone]}"`;
}

function copyRejectScript() {
    const text = document.getElementById('scriptOutput').innerText;
    navigator.clipboard.writeText(text);
    alert("Teks penolakan berhasil disalin!");
}

// Jurnal Batas Diri
function addBoundaryLog() {
    const title = document.getElementById('boundaryTitle').value;
    const desc = document.getElementById('boundaryDesc').value;
    if (!title) return;

    const logs = JSON.parse(localStorage.getItem('sf_boundaries') || '[]');
    logs.unshift({ title, desc, date: new Date().toLocaleDateString('id-ID') });
    localStorage.setItem('sf_boundaries', JSON.stringify(logs));
    document.getElementById('boundaryTitle').value = '';
    document.getElementById('boundaryDesc').value = '';
    loadBoundaryLogs();
}

function loadBoundaryLogs() {
    const logs = JSON.parse(localStorage.getItem('sf_boundaries') || '[]');
    const container = document.getElementById('boundaryLogs');
    container.innerHTML = logs.map(l => `
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="flex justify-between items-center mb-1">
                <h4 class="font-bold text-emerald-400 text-sm">${l.title}</h4>
                <span class="text-xs text-slate-500">${l.date}</span>
            </div>
            <p class="text-xs text-slate-300">${l.desc}</p>
        </div>
    `).join('');
}

// Micro-Reading Tracker
function logReading() {
    const title = document.getElementById('bookTitle').value;
    const pages = parseInt(document.getElementById('pagesRead').value);
    if (!title || !pages) return;

    const logs = JSON.parse(localStorage.getItem('sf_reading') || '[]');
    logs.unshift({ title, pages, date: new Date().toLocaleDateString('id-ID') });
    localStorage.setItem('sf_reading', JSON.stringify(logs));
    
    document.getElementById('dashPages').innerText = `${pages} Halaman`;
    document.getElementById('bookTitle').value = '';
    document.getElementById('pagesRead').value = '';
    loadReadingLogs();
}

function loadReadingLogs() {
    const logs = JSON.parse(localStorage.getItem('sf_reading') || '[]');
    const container = document.getElementById('readingLogs');
    container.innerHTML = logs.map(l => `
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
            <div>
                <h4 class="font-bold text-blue-400 text-sm">${l.title}</h4>
                <span class="text-xs text-slate-500">${l.date}</span>
            </div>
            <span class="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-full text-xs font-semibold">+${l.pages} Hal</span>
        </div>
    `).join('');
}

// Tantangan Keberanian (Zona Nyaman)
const challenges = [
    "Menyapa orang baru atau berkata 'tidak' pada 1 ajakan yang tidak penting hari ini.",
    "Tatap mata lawan bicara selama 3 detik saat berbicara.",
    "Coba rute jalan baru atau pesan menu makanan yang belum pernah dipesan.",
    "Berikan pujian jujur kepada 1 orang rekan atau teman.",
    "Ungkapkan pendapatmu secara langsung di dalam forum/diskusi."
];

function getNewChallenge() {
    const rand = Math.floor(Math.random() * challenges.length);
    document.getElementById('currentChallengeText').innerText = `"${challenges[rand]}"`;
    document.getElementById('dashChallengeStatus').innerText = "Sedang Berjalan";
}

// Notifikasi & Pengingat Harian
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                alert("Izin notifikasi berhasil diaktifkan!");
            }
        });
    }
}

function startNotificationTimer() {
    setInterval(() => {
        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5);
        
        const timeSleep = document.getElementById('timeSleep').value;
        const timeRead = document.getElementById('timeRead').value;

        if (currentTime === timeSleep && now.getSeconds() === 0) {
            triggerNotify("Waktunya Screen Shutdown!", "Matikan layar HP/Laptop untuk menjaga pola tidur dan mencegah begadang.");
        }
        if (currentTime === timeRead && now.getSeconds() === 0) {
            triggerNotify("Sesi Micro-Reading!", "Luangkan 5 menit untuk membaca 2-5 halaman buku favoritmu.");
        }
    }, 1000);
}

function triggerNotify(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: body });
    } else {
        alert(`${title}\n${body}`);
    }
}