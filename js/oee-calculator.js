
/**
 * OEE Calculator
 * คำนวณ OEE และ components ต่างๆ
 */

function calculateOEE(data) {
    // Availability = Operating Time / Planned Production Time
    const operatingTime = data.plannedTime - data.downtime;
    const availability = (operatingTime / data.plannedTime) * 100;

    // Performance = (Total Output × Ideal Cycle Time) / Operating Time
    const idealProduction = (operatingTime * 60) / data.idealCycleTime; // แปลงนาทีเป็นวินาที
    const performance = (data.totalOutput / idealProduction) * 100;

    // Quality = Good Parts / Total Output
    const quality = (data.goodParts / data.totalOutput) * 100;

    // OEE = A × P × Q
    const oee = (availability * performance * quality) / 10000;

    return {
        oee: Math.min(oee, 100),
        availability: Math.min(availability, 100),
        performance: Math.min(performance, 100),
        quality: Math.min(quality, 100),
        operatingTime: operatingTime,
        idealProduction: idealProduction
    };
}

// Calculate Six Big Losses
function calculateLosses(data, result) {
    const plannedTimeSeconds = data.plannedTime * 60;
    
    return {
        // Availability Losses
        breakdowns: {
            time: data.breakdownTime,
            percent: (data.breakdownTime / data.plannedTime) * 100
        },
        setupChangeover: {
            time: data.setupTime,
            percent: (data.setupTime / data.plannedTime) * 100
        },
        
        // Performance Losses
        minorStops: {
            time: data.minorStops,
            percent: (data.minorStops / data.plannedTime) * 100
        },
        reducedSpeed: {
            time: result.operatingTime - (data.totalOutput * data.idealCycleTime / 60),
            percent: ((result.operatingTime - (data.totalOutput * data.idealCycleTime / 60)) / data.plannedTime) * 100
        },
        
        // Quality Losses
        startupRejects: {
            parts: data.startupRejects,
            percent: (data.startupRejects / data.totalOutput) * 100
        },
        productionRejects: {
            parts: data.productionRejects,
            percent: (data.productionRejects / data.totalOutput) * 100
        }
    };
}

// Get improvement suggestions
function getImprovementSuggestions(result) {
    const suggestions = [];
    
    if (result.availability < 85) {
        suggestions.push({
            component: 'Availability',
            issue: 'Availability ต่ำกว่ามาตรฐาน',
            actions: [
                '🔧 ทำ Preventive Maintenance อย่างสม่ำเสมอ',
                '⚡ ลดเวลา Changeover (SMED)',
                '📋 วิเคราะห์สาเหตุการเสียบ่อย (Breakdown Analysis)'
            ]
        });
    }
    
    if (result.performance < 85) {
        suggestions.push({
            component: 'Performance',
            issue: 'Performance ต่ำกว่ามาตรฐาน',
            actions: [
                '🎯 ปรับปรุงกระบวนการผลิต (Kaizen)',
                '🔍 หาสาเหตุ Minor Stops',
                '⚙️ Optimize machine parameters'
            ]
        });
    }
    
    if (result.quality < 95) {
        suggestions.push({
            component: 'Quality',
            issue: 'Quality ต่ำกว่ามาตรฐาน',
            actions: [
                '✓ ตรวจสอบ Process Parameters',
                '📊 ทำ Defect Analysis (Pareto Chart)',
                '👥 ฝึกอบรม Operators',
                '🔬 ปรับปรุง Inspection Method'
            ]
        });
    }
    
    return suggestions;
}