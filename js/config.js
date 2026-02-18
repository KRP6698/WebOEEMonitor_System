
// js/config.js

// Supabase Configuration
const SUPABASE_URL = 'https://nnayrboqnttzmvlfmseq.supabase.co'; // เปลี่ยนเป็นของคุณ
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZHJmd3JkanFwdWRpcnlxd2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTY4ODQsImV4cCI6MjA4Njk3Mjg4NH0.6grAw_r6Lhe_aTC7FQAzll23vV7a--MOMostTPzvRxI'; // เปลี่ยนเป็นของคุณ

// ✅ สร้าง Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Log เพื่อเช็ค
console.log('✅ Supabase initialized:', supabase ? 'Success' : 'Failed');

// OEE Thresholds
const OEE_THRESHOLDS = {
    WORLD_CLASS: 85,
    GOOD: 70,
    FAIR: 60
};

// Helper functions
function getOEEStatus(value) {
    if (value >= OEE_THRESHOLDS.WORLD_CLASS) return 'status-good';
    if (value >= OEE_THRESHOLDS.GOOD) return 'status-warning';
    return 'status-poor';
}

function getOEEStatusText(value) {
    if (value >= OEE_THRESHOLDS.WORLD_CLASS) return '✅ World Class';
    if (value >= OEE_THRESHOLDS.GOOD) return '⚠️ Good';
    if (value >= OEE_THRESHOLDS.FAIR) return '⚠️ Fair';
    return '❌ Poor';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatPercent(value) {
    return value.toFixed(1) + '%';
}
