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

async function checkAppDetails() {
    console.log('🔍 Sprawdzanie szczegółów aplikacji pose-generator...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Szczegóły aplikacji
        console.log('1️⃣ Szczegóły aplikacji...');
        const appDetailsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        console.log(`Status: ${appDetailsResponse.status}`);
        if (appDetailsResponse.status === 200) {
            console.log('Aplikacja:', JSON.stringify(appDetailsResponse.data, null, 2));
        } else {
            console.log('Błąd:', appDetailsResponse.data);
        }
        
        // 2. Status aplikacji
        console.log('\n2️⃣ Status aplikacji...');
        const appStatusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/status`);
        console.log(`Status: ${appStatusResponse.status}`);
        if (appStatusResponse.status === 200) {
            console.log('Status:', JSON.stringify(appStatusResponse.data, null, 2));
        } else {
            console.log('Błąd:', appStatusResponse.data);
        }
        
        // 3. Konfiguracja aplikacji
        console.log('\n3️⃣ Konfiguracja aplikacji...');
        const appConfigResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/config`);
        console.log(`Status: ${appConfigResponse.status}`);
        if (appConfigResponse.status === 200) {
            console.log('Konfiguracja:', JSON.stringify(appConfigResponse.data, null, 2));
        } else {
            console.log('Błąd:', appConfigResponse.data);
        }
        
        // 4. Zmienne środowiskowe
        console.log('\n4️⃣ Zmienne środowiskowe...');
        const appEnvResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`);
        console.log(`Status: ${appEnvResponse.status}`);
        if (appEnvResponse.status === 200) {
            console.log('Environment:', JSON.stringify(appEnvResponse.data, null, 2));
        } else {
            console.log('Błąd:', appEnvResponse.data);
        }
        
        // 5. Historia deploymentów
        console.log('\n5️⃣ Historia deploymentów...');
        const deploymentsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/deployments`);
        console.log(`Status: ${deploymentsResponse.status}`);
        if (deploymentsResponse.status === 200) {
            console.log('Deployments:', JSON.stringify(deploymentsResponse.data, null, 2));
        } else {
            console.log('Błąd:', deploymentsResponse.data);
        }
        
        // 6. Próba restartu aplikacji
        console.log('\n6️⃣ Próba restartu aplikacji...');
        const restartResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/restart`, {
            method: 'POST'
        });
        console.log(`Status: ${restartResponse.status}`);
        if (restartResponse.status === 200) {
            console.log('Restart:', JSON.stringify(restartResponse.data, null, 2));
        } else {
            console.log('Błąd restartu:', restartResponse.data);
        }
        
        // 7. Próba uruchomienia aplikacji
        console.log('\n7️⃣ Próba uruchomienia aplikacji...');
        const startResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/start`, {
            method: 'POST'
        });
        console.log(`Status: ${startResponse.status}`);
        if (startResponse.status === 200) {
            console.log('Start:', JSON.stringify(startResponse.data, null, 2));
        } else {
            console.log('Błąd startu:', startResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkAppDetails();
