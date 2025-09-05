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

async function checkAppNetworkConfig() {
    console.log('🔍 Sprawdzanie konfiguracji sieci aplikacji...\n');
    
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
            
            // Sprawdź destination (serwer)
            if (app.destination) {
                console.log('\n2️⃣ Informacje o serwerze:');
                console.log(`   - Serwer: ${app.destination.name}`);
                console.log(`   - IP: ${app.destination.ip}`);
                console.log(`   - Port: ${app.destination.port}`);
                console.log(`   - UUID: ${app.destination.uuid}`);
                
                // Sprawdź serwer
                if (app.destination.server) {
                    console.log('\n3️⃣ Szczegóły serwera:');
                    console.log(`   - Nazwa: ${app.destination.server.name}`);
                    console.log(`   - IP: ${app.destination.server.ip}`);
                    console.log(`   - Port: ${app.destination.server.port}`);
                    console.log(`   - UUID: ${app.destination.server.uuid}`);
                }
            }
        }
        
        // 2. Sprawdź czy aplikacja ma dostępny adres IP
        console.log('\n4️⃣ Sprawdzanie dostępnych adresów IP...');
        
        // Sprawdź czy aplikacja ma kontenery
        const containersResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/containers`);
        console.log(`Status kontenerów: ${containersResponse.status}`);
        if (containersResponse.status === 200) {
            console.log('Kontenery:', JSON.stringify(containersResponse.data, null, 2));
        } else {
            console.log('Błąd kontenerów:', containersResponse.data);
        }
        
        // 3. Sprawdź czy aplikacja ma dostępny adres IP przez inne endpointy
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
        
        // 4. Sprawdź czy aplikacja ma dostępny adres IP przez status
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/status`);
        console.log(`Status status: ${statusResponse.status}`);
        if (statusResponse.status === 200) {
            console.log('Status:', JSON.stringify(statusResponse.data, null, 2));
        } else {
            console.log('Błąd status:', statusResponse.data);
        }
        
        // 5. Sprawdź czy aplikacja ma dostępny adres IP przez logs
        console.log('\n6️⃣ Sprawdzanie logów...');
        const logsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/logs`);
        console.log(`Status logów: ${logsResponse.status}`);
        if (logsResponse.status === 200) {
            console.log('Logi:', JSON.stringify(logsResponse.data, null, 2));
        } else {
            console.log('Błąd logów:', logsResponse.data);
        }
        
        // 6. Sprawdź czy aplikacja ma dostępny adres IP przez proxy
        console.log('\n7️⃣ Sprawdzanie proxy...');
        const proxyResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/proxy`);
        console.log(`Status proxy: ${proxyResponse.status}`);
        if (proxyResponse.status === 200) {
            console.log('Proxy:', JSON.stringify(proxyResponse.data, null, 2));
        } else {
            console.log('Błąd proxy:', proxyResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkAppNetworkConfig();
