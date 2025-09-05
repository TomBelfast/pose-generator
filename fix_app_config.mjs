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

async function fixAppConfig() {
    console.log('🔧 Naprawianie konfiguracji aplikacji pose-generator...\n');
    
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
            console.log(`   - Port exposes: ${app.ports_exposes}`);
            console.log(`   - Port mappings: ${app.ports_mappings}`);
        }
        
        // 2. Włącz health check
        console.log('\n2️⃣ Włączanie health check...');
        const healthCheckUpdate = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`, {
            method: 'PATCH',
            body: {
                health_check_enabled: true,
                health_check_path: '/api/health',
                health_check_port: 4999,
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
        
        // 3. Sprawdź czy aplikacja ma zmienne środowiskowe
        console.log('\n3️⃣ Sprawdzanie zmiennych środowiskowych...');
        const envResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`);
        console.log(`Status: ${envResponse.status}`);
        if (envResponse.status === 200) {
            console.log('Zmienne środowiskowe:', JSON.stringify(envResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania zmiennych środowiskowych:', envResponse.data);
        }
        
        // 4. Spróbuj dodać zmienne środowiskowe
        console.log('\n4️⃣ Dodawanie zmiennych środowiskowych...');
        const envUpdate = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`, {
            method: 'POST',
            body: {
                NODE_ENV: 'production',
                PORT: '4999',
                DATABASE_URL: 'file:/app/data/production.db'
            }
        });
        console.log(`Status: ${envUpdate.status}`);
        if (envUpdate.status === 200) {
            console.log('✅ Zmienne środowiskowe dodane');
        } else {
            console.log('❌ Błąd dodawania zmiennych środowiskowych:', envUpdate.data);
        }
        
        // 5. Sprawdź czy aplikacja ma poprawny Dockerfile
        console.log('\n5️⃣ Sprawdzanie Dockerfile...');
        const dockerfileResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/dockerfile`);
        console.log(`Status: ${dockerfileResponse.status}`);
        if (dockerfileResponse.status === 200) {
            console.log('Dockerfile:', dockerfileResponse.data);
        } else {
            console.log('Błąd pobierania Dockerfile:', dockerfileResponse.data);
        }
        
        // 6. Spróbuj zrestartować aplikację
        console.log('\n6️⃣ Restart aplikacji...');
        const restartResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/restart`, {
            method: 'POST'
        });
        console.log(`Status: ${restartResponse.status}`);
        if (restartResponse.status === 200) {
            console.log('✅ Aplikacja zrestartowana');
        } else {
            console.log('❌ Błąd restartu:', restartResponse.data);
        }
        
        // 7. Sprawdź status po restarcie
        console.log('\n7️⃣ Status po restarcie...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Czekaj 5 sekund
        
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse.status === 200) {
            console.log('Status aplikacji:', statusResponse.data.status);
            console.log('Ostatni online:', statusResponse.data.last_online_at);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

fixAppConfig();
