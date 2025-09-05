import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '4|joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

// Funkcja do wykonywania zapytań HTTPS
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });
        
        req.on('error', reject);
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

async function checkStatusAfterRestart() {
    console.log('🔍 Sprawdzanie statusu aplikacji po restarcie...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // Sprawdź status kilka razy z przerwami
        for (let i = 1; i <= 5; i++) {
            console.log(`\n${i}️⃣ Sprawdzanie statusu (próba ${i}/5)...`);
            
            const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
            if (statusResponse.status === 200) {
                const app = statusResponse.data;
                console.log(`   - Status: ${app.status}`);
                console.log(`   - Ostatni online: ${app.last_online_at}`);
                console.log(`   - Health check: ${app.health_check_enabled ? 'Włączony' : 'Wyłączony'}`);
                console.log(`   - Health check path: ${app.health_check_path}`);
                console.log(`   - Health check port: ${app.health_check_port}`);
                
                if (app.status === 'running') {
                    console.log('✅ Aplikacja działa!');
                    break;
                } else if (app.status === 'exited:unhealthy') {
                    console.log('⚠️ Aplikacja nadal ma problemy');
                } else {
                    console.log(`ℹ️ Status: ${app.status}`);
                }
            } else {
                console.log('❌ Błąd pobierania statusu:', statusResponse.data);
            }
            
            if (i < 5) {
                console.log('⏳ Czekam 30 sekund przed następnym sprawdzeniem...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }
        
        // Sprawdź logi na końcu
        console.log('\n🔍 Sprawdzanie logów...');
        const logsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/logs`);
        console.log(`Status logów: ${logsResponse.status}`);
        if (logsResponse.status === 200) {
            console.log('Logi:', JSON.stringify(logsResponse.data, null, 2));
        } else {
            console.log('Błąd logów:', logsResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkStatusAfterRestart();
