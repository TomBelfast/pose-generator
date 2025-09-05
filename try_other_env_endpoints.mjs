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

async function tryOtherEnvEndpoints() {
    console.log('🔧 Próba dodania zmiennych środowiskowych przez inne endpointy...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Sprawdź aktualne zmienne środowiskowe
        console.log('1️⃣ Sprawdzanie aktualnych zmiennych środowiskowych...');
        const envResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`);
        console.log(`Status: ${envResponse.status}`);
        if (envResponse.status === 200) {
            console.log('Aktualne zmienne:', JSON.stringify(envResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania zmiennych:', envResponse.data);
        }
        
        // 2. Spróbuj dodać zmienne środowiskowe przez różne endpointy
        console.log('\n2️⃣ Próba dodawania zmiennych przez różne endpointy...');
        
        const envVars = {
            NODE_ENV: 'production',
            PORT: '4999',
            DATABASE_URL: 'file:/app/data/production.db',
            VITE_GEMINI_API_KEY: 'your_gemini_api_key_here',
            VITE_CLERK_PUBLISHABLE_KEY: 'your_clerk_key_here'
        };
        
        // Próba 1: /api/v1/applications/{id}/environment
        console.log('\n   Próba 1: /api/v1/applications/{id}/environment');
        const addEnvResponse1 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`, {
            method: 'POST',
            body: envVars
        });
        console.log(`   Status: ${addEnvResponse1.status}`);
        if (addEnvResponse1.status === 200) {
            console.log('   ✅ Sukces!');
            console.log('   Response:', JSON.stringify(addEnvResponse1.data, null, 2));
        } else {
            console.log('   ❌ Błąd:', addEnvResponse1.data);
        }
        
        // Próba 2: /api/v1/applications/{id}/env
        console.log('\n   Próba 2: /api/v1/applications/{id}/env');
        const addEnvResponse2 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/env`, {
            method: 'POST',
            body: envVars
        });
        console.log(`   Status: ${addEnvResponse2.status}`);
        if (addEnvResponse2.status === 200) {
            console.log('   ✅ Sukces!');
            console.log('   Response:', JSON.stringify(addEnvResponse2.data, null, 2));
        } else {
            console.log('   ❌ Błąd:', addEnvResponse2.data);
        }
        
        // Próba 3: /api/v1/applications/{id}/variables
        console.log('\n   Próba 3: /api/v1/applications/{id}/variables');
        const addEnvResponse3 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/variables`, {
            method: 'POST',
            body: envVars
        });
        console.log(`   Status: ${addEnvResponse3.status}`);
        if (addEnvResponse3.status === 200) {
            console.log('   ✅ Sukces!');
            console.log('   Response:', JSON.stringify(addEnvResponse3.data, null, 2));
        } else {
            console.log('   ❌ Błąd:', addEnvResponse3.data);
        }
        
        // Próba 4: /api/v1/applications/{id}/config
        console.log('\n   Próba 4: /api/v1/applications/{id}/config');
        const addEnvResponse4 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/config`, {
            method: 'POST',
            body: envVars
        });
        console.log(`   Status: ${addEnvResponse4.status}`);
        if (addEnvResponse4.status === 200) {
            console.log('   ✅ Sukces!');
            console.log('   Response:', JSON.stringify(addEnvResponse4.data, null, 2));
        } else {
            console.log('   ❌ Błąd:', addEnvResponse4.data);
        }
        
        // Próba 5: /api/v1/applications/{id}/settings
        console.log('\n   Próba 5: /api/v1/applications/{id}/settings');
        const addEnvResponse5 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/settings`, {
            method: 'POST',
            body: envVars
        });
        console.log(`   Status: ${addEnvResponse5.status}`);
        if (addEnvResponse5.status === 200) {
            console.log('   ✅ Sukces!');
            console.log('   Response:', JSON.stringify(addEnvResponse5.data, null, 2));
        } else {
            console.log('   ❌ Błąd:', addEnvResponse5.data);
        }
        
        // 3. Sprawdź zmienne po próbach
        console.log('\n3️⃣ Sprawdzanie zmiennych po próbach...');
        const envResponse2 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`);
        console.log(`Status: ${envResponse2.status}`);
        if (envResponse2.status === 200) {
            console.log('Zmienne po próbach:', JSON.stringify(envResponse2.data, null, 2));
        } else {
            console.log('Błąd pobierania zmiennych:', envResponse2.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

tryOtherEnvEndpoints();
