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

async function findCoolifyAppAddress() {
    console.log('🔍 Znajdowanie adresu aplikacji w Coolify...\n');
    
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
            }
        }
        
        // 2. Sprawdź serwery
        console.log('\n3️⃣ Lista serwerów...');
        const serversResponse = await makeRequest(`${COOLIFY_URL}/api/v1/servers`);
        if (serversResponse.status === 200) {
            console.log('Serwery:');
            serversResponse.data.forEach((server, index) => {
                console.log(`   ${index + 1}. ${server.name} - ${server.ip}:${server.port}`);
            });
        } else {
            console.log('Błąd pobierania serwerów:', serversResponse.data);
        }
        
        // 3. Sprawdź czy aplikacja ma kontenery
        console.log('\n4️⃣ Sprawdzanie kontenerów...');
        const containersResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/containers`);
        console.log(`Status: ${containersResponse.status}`);
        if (containersResponse.status === 200) {
            console.log('Kontenery:', JSON.stringify(containersResponse.data, null, 2));
        } else {
            console.log('Błąd kontenerów:', containersResponse.data);
        }
        
        // 4. Sprawdź czy aplikacja ma proxy hosty
        console.log('\n5️⃣ Sprawdzanie proxy hostów...');
        const proxyHostsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/proxy-hosts`);
        console.log(`Status: ${proxyHostsResponse.status}`);
        if (proxyHostsResponse.status === 200) {
            console.log('Proxy hosty:', JSON.stringify(proxyHostsResponse.data, null, 2));
        } else {
            console.log('Błąd proxy hostów:', proxyHostsResponse.data);
        }
        
        // 5. Sprawdź czy aplikacja ma nginx konfigurację
        console.log('\n6️⃣ Sprawdzanie nginx konfiguracji...');
        const nginxResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/nginx`);
        console.log(`Status: ${nginxResponse.status}`);
        if (nginxResponse.status === 200) {
            console.log('Nginx konfiguracja:', JSON.stringify(nginxResponse.data, null, 2));
        } else {
            console.log('Błąd nginx konfiguracji:', nginxResponse.data);
        }
        
        // 6. Sprawdź czy aplikacja ma domenę
        console.log('\n7️⃣ Sprawdzanie domeny...');
        const domainResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/domain`);
        console.log(`Status: ${domainResponse.status}`);
        if (domainResponse.status === 200) {
            console.log('Domena:', JSON.stringify(domainResponse.data, null, 2));
        } else {
            console.log('Błąd domeny:', domainResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

findCoolifyAppAddress();
