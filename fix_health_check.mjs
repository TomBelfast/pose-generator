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

async function fixHealthCheck() {
    console.log('🔧 Naprawianie health check dla aplikacji pose-generator...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Sprawdź aktualną konfigurację
        console.log('1️⃣ Sprawdzanie aktualnej konfiguracji...');
        const appDetailsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (appDetailsResponse.status === 200) {
            const app = appDetailsResponse.data;
            console.log('Aktualna konfiguracja:');
            console.log(`   - Health check enabled: ${app.health_check_enabled}`);
            console.log(`   - Health check path: ${app.health_check_path}`);
            console.log(`   - Health check port: ${app.health_check_port}`);
            console.log(`   - Health check timeout: ${app.health_check_timeout}`);
            console.log(`   - Health check retries: ${app.health_check_retries}`);
            console.log(`   - Health check start period: ${app.health_check_start_period}`);
        }
        
        // 2. Włącz health check z poprawnym typem danych
        console.log('\n2️⃣ Włączanie health check...');
        const healthCheckUpdate = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`, {
            method: 'PATCH',
            body: {
                health_check_enabled: true,
                health_check_path: '/api/health',
                health_check_port: '4999', // String zamiast number
                health_check_timeout: 10,
                health_check_retries: 3,
                health_check_start_period: 40
            }
        });
        console.log(`Status: ${healthCheckUpdate.status}`);
        if (healthCheckUpdate.status === 200) {
            console.log('✅ Health check włączony');
        } else {
            console.log('❌ Błąd włączania health check:', healthCheckUpdate.data);
        }
        
        // 3. Sprawdź konfigurację po aktualizacji
        console.log('\n3️⃣ Sprawdzanie konfiguracji po aktualizacji...');
        const updatedAppResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (updatedAppResponse.status === 200) {
            const app = updatedAppResponse.data;
            console.log('Zaktualizowana konfiguracja:');
            console.log(`   - Health check enabled: ${app.health_check_enabled}`);
            console.log(`   - Health check path: ${app.health_check_path}`);
            console.log(`   - Health check port: ${app.health_check_port}`);
            console.log(`   - Health check timeout: ${app.health_check_timeout}`);
            console.log(`   - Health check retries: ${app.health_check_retries}`);
            console.log(`   - Health check start period: ${app.health_check_start_period}`);
        }
        
        // 4. Restart aplikacji
        console.log('\n4️⃣ Restart aplikacji...');
        const restartResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/restart`, {
            method: 'POST'
        });
        console.log(`Status: ${restartResponse.status}`);
        if (restartResponse.status === 200) {
            console.log('✅ Aplikacja zrestartowana');
        } else {
            console.log('❌ Błąd restartu:', restartResponse.data);
        }
        
        // 5. Sprawdź status po restarcie
        console.log('\n5️⃣ Status po restarcie...');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Czekaj 10 sekund
        
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse.status === 200) {
            console.log('Status aplikacji:', statusResponse.data.status);
            console.log('Ostatni online:', statusResponse.data.last_online_at);
            
            // 6. Sprawdź logi po restarcie
            console.log('\n6️⃣ Sprawdzanie logów po restarcie...');
            const logsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/logs`);
            console.log(`Status logów: ${logsResponse.status}`);
            if (logsResponse.status === 200) {
                console.log('Logi:', JSON.stringify(logsResponse.data, null, 2));
            } else {
                console.log('Błąd logów:', logsResponse.data);
            }
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

fixHealthCheck();
