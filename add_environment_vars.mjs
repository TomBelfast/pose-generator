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

async function addEnvironmentVars() {
    console.log('🔧 Dodawanie zmiennych środowiskowych do aplikacji...\n');
    
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
        
        // 2. Spróbuj dodać zmienne środowiskowe
        console.log('\n2️⃣ Dodawanie zmiennych środowiskowych...');
        const envVars = {
            NODE_ENV: 'production',
            PORT: '4999',
            DATABASE_URL: 'file:/app/data/production.db',
            VITE_GEMINI_API_KEY: 'your_gemini_api_key_here',
            VITE_CLERK_PUBLISHABLE_KEY: 'your_clerk_key_here'
        };
        
        const addEnvResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`, {
            method: 'POST',
            body: envVars
        });
        console.log(`Status: ${addEnvResponse.status}`);
        if (addEnvResponse.status === 200) {
            console.log('✅ Zmienne środowiskowe dodane');
            console.log('Response:', JSON.stringify(addEnvResponse.data, null, 2));
        } else {
            console.log('❌ Błąd dodawania zmiennych:', addEnvResponse.data);
        }
        
        // 3. Sprawdź zmienne po dodaniu
        console.log('\n3️⃣ Sprawdzanie zmiennych po dodaniu...');
        const envResponse2 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`);
        console.log(`Status: ${envResponse2.status}`);
        if (envResponse2.status === 200) {
            console.log('Zmienne po dodaniu:', JSON.stringify(envResponse2.data, null, 2));
        } else {
            console.log('Błąd pobierania zmiennych:', envResponse2.data);
        }
        
        // 4. Restart aplikacji
        console.log('\n4️⃣ Restart aplikacji...');
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
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

addEnvironmentVars();
