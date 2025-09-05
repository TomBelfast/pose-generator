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

async function checkAppAfterRestart() {
    console.log('🔍 Sprawdzanie statusu aplikacji po restarcie...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Sprawdź status aplikacji
        console.log('1️⃣ Status aplikacji...');
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse.status === 200) {
            const app = statusResponse.data;
            console.log(`   - Status: ${app.status}`);
            console.log(`   - Ostatni online: ${app.last_online_at}`);
            console.log(`   - Port: ${app.ports_exposes}`);
            console.log(`   - Port mapping: ${app.ports_mappings}`);
            console.log(`   - FQDN: ${app.fqdn || 'Brak'}`);
            
            if (app.status === 'running:healthy') {
                console.log('   ✅ Aplikacja działa!');
            } else if (app.status === 'restarting:unhealthy') {
                console.log('   ⏳ Aplikacja nadal się restartuje...');
            } else {
                console.log(`   ℹ️ Status: ${app.status}`);
            }
        }
        
        // 2. Sprawdź logi aplikacji
        console.log('\n2️⃣ Logi aplikacji...');
        const logsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/logs`);
        console.log(`Status logów: ${logsResponse.status}`);
        if (logsResponse.status === 200) {
            console.log('Logi:', JSON.stringify(logsResponse.data, null, 2));
        } else {
            console.log('Błąd logów:', logsResponse.data);
        }
        
        // 3. Sprawdź czy aplikacja ma kontenery
        console.log('\n3️⃣ Kontenery...');
        const containersResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/containers`);
        console.log(`Status kontenerów: ${containersResponse.status}`);
        if (containersResponse.status === 200) {
            console.log('Kontenery:', JSON.stringify(containersResponse.data, null, 2));
        } else {
            console.log('Błąd kontenerów:', containersResponse.data);
        }
        
        // 4. Sprawdź czy aplikacja ma deploymenty
        console.log('\n4️⃣ Deploymenty...');
        const deploymentsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/deployments`);
        console.log(`Status deploymentów: ${deploymentsResponse.status}`);
        if (deploymentsResponse.status === 200) {
            console.log('Deploymenty:', JSON.stringify(deploymentsResponse.data, null, 2));
        } else {
            console.log('Błąd deploymentów:', deploymentsResponse.data);
        }
        
        // 5. Sprawdź czy aplikacja ma dostępny adres IP przez inne endpointy
        console.log('\n5️⃣ Sprawdzanie adresów IP przez inne endpointy...');
        
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
        
        // 6. Sprawdź czy aplikacja ma dostępny adres IP przez status
        const statusResponse2 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/status`);
        console.log(`Status status: ${statusResponse2.status}`);
        if (statusResponse2.status === 200) {
            console.log('Status:', JSON.stringify(statusResponse2.data, null, 2));
        } else {
            console.log('Błąd status:', statusResponse2.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkAppAfterRestart();
