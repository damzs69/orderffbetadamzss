// ================ KONFIGURASI LEVEL SUPER DEWA ================
const VALID_RECIPIENT_NAMES = ["yanti", "damzs", "jb damzs store"];
const VALID_ACCOUNT_NUMBER = "082129071128";
const MIN_AMOUNT = 10000; // Minimal transfer Rp 10.000
const TIME_TOLERANCE = 5 * 60 * 1000; // Toleransi waktu: 5 menit
const WIB_OFFSET = 7 * 60 * 60 * 1000; // UTC+7 (WIB)

// ================ FUNGSI UTAMA VERIFIKASI ================
async function verifyPaymentProof(imageFile) {
    // 1. EKSTRAK DATA DARI FOTO (Simulasi OCR)
    const extractedData = await extractDataFromImage(imageFile);
    
    // 2. VALIDASI LEVEL SUPER DEWA
    const validation = ultimateValidation(extractedData);
    
    // 3. JIKA LOLOS, KIRIM DATA KE SERVER
    if (validation.isValid) {
        confirmPaymentAutomatically(extractedData);
        return { success: true, data: extractedData };
    } else {
        return { success: false, reason: validation.reason };
    }
}

// ================ EKSTRAK DATA DARI BUKTI TRANSFER ================
async function extractDataFromImage(imageFile) {
    // (Dalam aplikasi nyata, gunakan OCR seperti Tesseract.js atau API)
    return {
        recipientName: "JB Damzs Store", // Contoh data ter-extract
        accountNumber: "082129071128",   // Nomor tujuan
        amount: "10000",                 // Jumlah transfer
        time: "14:30 WIB",              // Waktu transfer (format HH:MM WIB)
        date: "20/05/2024",             // Tanggal transfer (format DD/MM/YYYY)
        bankName: "DANA",               // Nama bank
        isEdited: false                 // Deteksi edit foto
    };
}

// ================ VALIDASI LEVEL SUPER DEWA ================
function ultimateValidation(data) {
    const errors = [];
    const now = new Date();
    const currentTimeWIB = new Date(now.getTime() + WIB_OFFSET);

    // 1. VALIDASI NAMA PENERIMA
    const isRecipientValid = VALID_RECIPIENT_NAMES.some(name => 
        data.recipientName.toLowerCase().includes(name)
    );
    if (!isRecipientValid) {
        errors.push("NAMA PENERIMA TIDAK SESUAI (HARUS: Yanti/Damzs/JB Damzs Store)");
    }

    // 2. VALIDASI NOMOR TUJUAN
    if (data.accountNumber !== VALID_ACCOUNT_NUMBER) {
        errors.push(`NOMOR TUJUAN SALAH (HARUS: ${VALID_ACCOUNT_NUMBER})`);
    }

    // 3. VALIDASI WAKTU (HARUS WIB & ±5 MENIT DARI SEKARANG)
    const [timeStr, timezone] = data.time.split(" ");
    const [hours, minutes] = timeStr.split(":").map(Number);
    
    const paymentTime = new Date(currentTimeWIB);
    paymentTime.setUTCHours(hours, minutes, 0, 0);
    
    const timeDiff = Math.abs(currentTimeWIB - paymentTime);
    if (timeDiff > TIME_TOLERANCE || timezone !== "WIB") {
        errors.push("WAKTU TRANSFER TIDAK VALID (HARUS WIB & ±5 MENIT DARI SEKARANG)");
    }

    // 4. VALIDASI TANGGAL (HARUS HARI INI)
    const [day, month, year] = data.date.split("/").map(Number);
    const paymentDate = new Date(Date.UTC(year, month - 1, day));
    
    if (
        paymentDate.getUTCDate() !== currentTimeWIB.getUTCDate() ||
        paymentDate.getUTCMonth() !== currentTimeWIB.getUTCMonth() ||
        paymentDate.getUTCFullYear() !== currentTimeWIB.getUTCFullYear()
    ) {
        errors.push("TANGGAL TRANSFER TIDAK SESUAI (HARUS HARI INI)");
    }

    // 5. VALIDASI JUMLAH TRANSFER
    if (parseInt(data.amount) < MIN_AMOUNT) {
        errors.push(`MINIMAL TRANSFER RP ${MIN_AMOUNT.toLocaleString("id-ID")}`);
    }

    // 6. DETEKSI FOTO EDIT (METADATA & MAGIC NUMBER)
    if (data.isEdited) {
        errors.push("BUKTI TRANSFER TERDETEKSI EDIT!");
    }

    return {
        isValid: errors.length === 0,
        reason: errors.join("\n")
    };
}

// ================ KONFIRMASI OTOMATIS JIKA VALID ================
function confirmPaymentAutomatically(data) {
    console.log("✅ PEMBAYARAN TERVERIFIKASI LEVEL SUPER DEWA");
    console.log("📅 Tanggal:", data.date);
    console.log("⏰ Waktu:", data.time);
    console.log("💳 Nomor Tujuan:", data.accountNumber);
    console.log("👤 Penerima:", data.recipientName);
    console.log("💸 Jumlah: Rp", data.amount);
    
    // LANGSUNG KIRIM DATA AKUN KE PEMBELI
    sendAccountDetailsToBuyer();
}

// ================ CONTOH PENGGUNAAN ================
document.getElementById("submitPayment").addEventListener("click", async () => {
    const paymentProof = document.getElementById("paymentProof").files[0];
    if (!paymentProof) {
        alert("HARAP UPLOAD BUKTI TRANSFER!");
        return;
    }

    const result = await verifyPaymentProof(paymentProof);
    if (result.success) {
        alert("PEMBAYARAN BERHASIL! AKUN FF BETA AKAN DIKIRIM.");
    } else {
        alert(`VERIFIKASI GAGAL:\n${result.reason}`);
    }
});