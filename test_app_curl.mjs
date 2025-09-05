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

async function testAppCurl() {
    console.log('🧪 Testowanie aplikacji pose-generator za pomocą curl...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Sprawdź status aplikacji
        console.log('1️⃣ Sprawdzanie statusu aplikacji...');
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse.status === 200) {
            const app = statusResponse.data;
            console.log(`   - Status: ${app.status}`);
            console.log(`   - Ostatni online: ${app.last_online_at}`);
            console.log(`   - Port: ${app.ports_exposes}`);
            console.log(`   - Health check: ${app.health_check_enabled ? 'Włączony' : 'Wyłączony'}`);
            console.log(`   - Health check path: ${app.health_check_path}`);
            console.log(`   - Health check port: ${app.health_check_port}`);
        }
        
        // 2. Sprawdź czy aplikacja ma domenę
        console.log('\n2️⃣ Sprawdzanie domeny aplikacji...');
        if (statusResponse.status === 200) {
            const app = statusResponse.data;
            if (app.fqdn) {
                console.log(`   - Domena: ${app.fqdn}`);
                
                // 3. Testuj aplikację przez domenę
                console.log('\n3️⃣ Testowanie aplikacji przez domenę...');
                try {
                    const appTestResponse = await makeRequest(`http://${app.fqdn}/api/health`);
                    console.log(`   - Status: ${appTestResponse.status}`);
                    console.log(`   - Response: ${JSON.stringify(appTestResponse.data, null, 2)}`);
                } catch (error) {
                    console.log(`   - Błąd: ${error.message}`);
                }
            } else {
                console.log('   - Brak domeny skonfigurowanej');
            }
        }
        
        // 4. Sprawdź logi aplikacji
        console.log('\n4️⃣ Sprawdzanie logów aplikacji...');
        const logsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/logs`);
        console.log(`   - Status logów: ${logsResponse.status}`);
        if (logsResponse.status === 200) {
            console.log('   - Logi:', JSON.stringify(logsResponse.data, null, 2));
        } else {
            console.log('   - Błąd logów:', logsResponse.data);
        }
        
        // 5. Sprawdź czy aplikacja ma kontenery
        console.log('\n5️⃣ Sprawdzanie kontenerów...');
        const containersResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/containers`);
        console.log(`   - Status kontenerów: ${containersResponse.status}`);
        if (containersResponse.status === 200) {
            console.log('   - Kontenery:', JSON.stringify(containersResponse.data, null, 2));
        } else {
            console.log('   - Błąd kontenerów:', containersResponse.data);
        }
        
        // 6. Sprawdź czy aplikacja ma deploymenty
        console.log('\n6️⃣ Sprawdzanie deploymentów...');
        const deploymentsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/deployments`);
        console.log(`   - Status deploymentów: ${deploymentsResponse.status}`);
        if (deploymentsResponse.status === 200) {
            console.log('   - Deploymenty:', JSON.stringify(deploymentsResponse.data, null, 2));
        } else {
            console.log('   - Błąd deploymentów:', deploymentsResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

testAppCurl();
