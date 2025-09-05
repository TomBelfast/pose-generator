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

async function diagnoseAppIssue() {
    console.log('🔍 Diagnoza problemu z aplikacją pose-generator...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Szczegóły aplikacji
        console.log('1️⃣ Szczegóły aplikacji...');
        const appDetailsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (appDetailsResponse.status === 200) {
            const app = appDetailsResponse.data;
            console.log('📋 Podstawowe informacje:');
            console.log(`   - Nazwa: ${app.name}`);
            console.log(`   - Status: ${app.status}`);
            console.log(`   - Port: ${app.ports_exposes}`);
            console.log(`   - Port mapping: ${app.ports_mappings}`);
            console.log(`   - Health check: ${app.health_check_enabled ? 'Włączony' : 'Wyłączony'}`);
            console.log(`   - Health check path: ${app.health_check_path}`);
            console.log(`   - Health check port: ${app.health_check_port}`);
            console.log(`   - Health check timeout: ${app.health_check_timeout}`);
            console.log(`   - Health check retries: ${app.health_check_retries}`);
            console.log(`   - Custom healthcheck: ${app.custom_healthcheck_found ? 'Znaleziony' : 'Nie znaleziony'}`);
            console.log(`   - Build pack: ${app.build_pack}`);
            console.log(`   - Dockerfile location: ${app.dockerfile_location}`);
            console.log(`   - Start command: ${app.start_command || 'Brak'}`);
            console.log(`   - Build command: ${app.build_command || 'Brak'}`);
            console.log(`   - Git repository: ${app.git_repository}`);
            console.log(`   - Git branch: ${app.git_branch}`);
            console.log(`   - Git commit: ${app.git_commit_sha}`);
            console.log(`   - Last online: ${app.last_online_at}`);
        }
        
        // 2. Sprawdź zmienne środowiskowe
        console.log('\n2️⃣ Zmienne środowiskowe...');
        const envResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`);
        if (envResponse.status === 200) {
            console.log('Environment variables:', JSON.stringify(envResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania zmiennych środowiskowych:', envResponse.data);
        }
        
        // 3. Sprawdź konfigurację
        console.log('\n3️⃣ Konfiguracja aplikacji...');
        const configResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/config`);
        if (configResponse.status === 200) {
            console.log('Konfiguracja:', JSON.stringify(configResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania konfiguracji:', configResponse.data);
        }
        
        // 4. Sprawdź serwer
        console.log('\n4️⃣ Informacje o serwerze...');
        const serverResponse = await makeRequest(`${COOLIFY_URL}/api/v1/servers`);
        if (serverResponse.status === 200) {
            console.log('Serwery:', JSON.stringify(serverResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania serwerów:', serverResponse.data);
        }
        
        // 5. Sprawdź projekty
        console.log('\n5️⃣ Lista projektów...');
        const projectsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/projects`);
        if (projectsResponse.status === 200) {
            console.log('Projekty:', JSON.stringify(projectsResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania projektów:', projectsResponse.data);
        }
        
        // 6. Sprawdź środowiska
        console.log('\n6️⃣ Lista środowisk...');
        const environmentsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/environments`);
        if (environmentsResponse.status === 200) {
            console.log('Środowiska:', JSON.stringify(environmentsResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania środowisk:', environmentsResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

diagnoseAppIssue();
