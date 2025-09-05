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

async function restartApp() {
    console.log('🔄 Restartowanie aplikacji pose-generator...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Sprawdź aktualny status
        console.log('1️⃣ Sprawdzanie aktualnego statusu...');
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse.status === 200) {
            console.log(`Status: ${statusResponse.data.status}`);
            console.log(`Ostatni online: ${statusResponse.data.last_online_at}`);
        }
        
        // 2. Restart aplikacji
        console.log('\n2️⃣ Restartowanie aplikacji...');
        const restartResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/restart`, {
            method: 'POST'
        });
        console.log(`Status: ${restartResponse.status}`);
        if (restartResponse.status === 200) {
            console.log('✅ Aplikacja zrestartowana');
            console.log('Response:', JSON.stringify(restartResponse.data, null, 2));
        } else {
            console.log('❌ Błąd restartu:', restartResponse.data);
        }
        
        // 3. Sprawdź status po restarcie
        console.log('\n3️⃣ Sprawdzanie statusu po restarcie...');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Czekaj 10 sekund
        
        const newStatusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (newStatusResponse.status === 200) {
            console.log(`Status: ${newStatusResponse.data.status}`);
            console.log(`Ostatni online: ${newStatusResponse.data.last_online_at}`);
        }
        
        // 4. Sprawdź logi po restarcie
        console.log('\n4️⃣ Sprawdzanie logów po restarcie...');
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

restartApp();
