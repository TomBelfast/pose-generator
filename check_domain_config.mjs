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

async function checkDomainConfig() {
    console.log('🌐 Sprawdzanie konfiguracji domeny dla aplikacji pose-generator...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Sprawdź szczegóły aplikacji
        console.log('1️⃣ Szczegóły aplikacji...');
        const appDetailsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (appDetailsResponse.status === 200) {
            const app = appDetailsResponse.data;
            console.log('Konfiguracja domeny:');
            console.log(`   - FQDN: ${app.fqdn || 'Brak'}`);
            console.log(`   - Port: ${app.ports_exposes}`);
            console.log(`   - Port mapping: ${app.ports_mappings}`);
            console.log(`   - Status: ${app.status}`);
            console.log(`   - Ostatni online: ${app.last_online_at}`);
            
            if (app.fqdn) {
                console.log(`\n✅ Aplikacja ma skonfigurowaną domenę: ${app.fqdn}`);
                console.log(`🔗 Adres do logowania: https://${app.fqdn}`);
            } else {
                console.log(`\n⚠️ Aplikacja nie ma skonfigurowanej domeny`);
                console.log(`🔗 Musisz skonfigurować domenę w interfejsie Coolify`);
            }
        }
        
        // 2. Sprawdź czy aplikacja ma proxy hosty
        console.log('\n2️⃣ Sprawdzanie proxy hostów...');
        const proxyHostsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/proxy-hosts`);
        console.log(`Status: ${proxyHostsResponse.status}`);
        if (proxyHostsResponse.status === 200) {
            console.log('Proxy hosty:', JSON.stringify(proxyHostsResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania proxy hostów:', proxyHostsResponse.data);
        }
        
        // 3. Sprawdź czy aplikacja ma nginx konfigurację
        console.log('\n3️⃣ Sprawdzanie nginx konfiguracji...');
        const nginxResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/nginx`);
        console.log(`Status: ${nginxResponse.status}`);
        if (nginxResponse.status === 200) {
            console.log('Nginx konfiguracja:', JSON.stringify(nginxResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania nginx konfiguracji:', nginxResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkDomainConfig();
