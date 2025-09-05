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

async function checkAppEnvironmentVars() {
    console.log('🔍 Sprawdzanie zmiennych środowiskowych aplikacji...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Sprawdź szczegóły aplikacji
        console.log('1️⃣ Szczegóły aplikacji...');
        const appDetailsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (appDetailsResponse.status === 200) {
            const app = appDetailsResponse.data;
            console.log('Konfiguracja aplikacji:');
            console.log(`   - Nazwa: ${app.name}`);
            console.log(`   - Status: ${app.status}`);
            console.log(`   - Port: ${app.ports_exposes}`);
            console.log(`   - Port mapping: ${app.ports_mappings}`);
            console.log(`   - FQDN: ${app.fqdn || 'Brak'}`);
            console.log(`   - Ostatni online: ${app.last_online_at}`);
            console.log(`   - Environment ID: ${app.environment_id}`);
            console.log(`   - Destination ID: ${app.destination_id}`);
            console.log(`   - Destination type: ${app.destination_type}`);
        }
        
        // 2. Sprawdź zmienne środowiskowe
        console.log('\n2️⃣ Zmienne środowiskowe...');
        const envResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`);
        console.log(`Status: ${envResponse.status}`);
        if (envResponse.status === 200) {
            console.log('Environment variables:', JSON.stringify(envResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania zmiennych środowiskowych:', envResponse.data);
        }
        
        // 3. Sprawdź konfigurację aplikacji
        console.log('\n3️⃣ Konfiguracja aplikacji...');
        const configResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/config`);
        console.log(`Status: ${configResponse.status}`);
        if (configResponse.status === 200) {
            console.log('Konfiguracja:', JSON.stringify(configResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania konfiguracji:', configResponse.data);
        }
        
        // 4. Sprawdź czy aplikacja ma dostępny adres IP przez inne endpointy
        console.log('\n4️⃣ Sprawdzanie adresów IP przez inne endpointy...');
        
        // Sprawdź czy aplikacja ma dostępny adres IP przez network
        const networkResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/network`);
        console.log(`Status network: ${networkResponse.status}`);
        if (networkResponse.status === 200) {
            console.log('Network:', JSON.stringify(networkResponse.data, null, 2));
        } else {
            console.log('Błąd network:', networkResponse.data);
        }
        
        // Sprawdź czy aplikacja ma dostępny adres IP przez docker
        const dockerResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/docker`);
        console.log(`Status docker: ${dockerResponse.status}`);
        if (dockerResponse.status === 200) {
            console.log('Docker:', JSON.stringify(dockerResponse.data, null, 2));
        } else {
            console.log('Błąd docker:', dockerResponse.data);
        }
        
        // 5. Sprawdź czy aplikacja ma dostępny adres IP przez status
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/status`);
        console.log(`Status status: ${statusResponse.status}`);
        if (statusResponse.status === 200) {
            console.log('Status:', JSON.stringify(statusResponse.data, null, 2));
        } else {
            console.log('Błąd status:', statusResponse.data);
        }
        
        // 6. Sprawdź czy aplikacja ma dostępny adres IP przez logs
        console.log('\n5️⃣ Sprawdzanie logów...');
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

checkAppEnvironmentVars();
