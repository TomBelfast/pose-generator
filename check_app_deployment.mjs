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

async function checkAppDeployment() {
    console.log('🔍 Sprawdzanie deploymentu aplikacji pose-generator...\n');
    
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
            console.log(`   - Health check: ${app.health_check_enabled ? 'Włączony' : 'Wyłączony'}`);
            console.log(`   - Health check path: ${app.health_check_path}`);
            console.log(`   - Health check port: ${app.health_check_port}`);
            console.log(`   - Build pack: ${app.build_pack}`);
            console.log(`   - Dockerfile location: ${app.dockerfile_location}`);
            console.log(`   - Start command: ${app.start_command || 'Brak'}`);
            console.log(`   - Build command: ${app.build_command || 'Brak'}`);
            console.log(`   - Git repository: ${app.git_repository}`);
            console.log(`   - Git branch: ${app.git_branch}`);
            console.log(`   - Git commit: ${app.git_commit_sha}`);
            console.log(`   - Environment ID: ${app.environment_id}`);
            console.log(`   - Destination ID: ${app.destination_id}`);
            console.log(`   - Destination type: ${app.destination_type}`);
        }
        
        // 2. Sprawdź czy aplikacja ma poprawny Dockerfile
        console.log('\n2️⃣ Sprawdzanie Dockerfile...');
        const dockerfileResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/dockerfile`);
        console.log(`Status: ${dockerfileResponse.status}`);
        if (dockerfileResponse.status === 200) {
            console.log('Dockerfile:', dockerfileResponse.data);
        } else {
            console.log('Błąd pobierania Dockerfile:', dockerfileResponse.data);
        }
        
        // 3. Sprawdź czy aplikacja ma poprawny docker-compose
        console.log('\n3️⃣ Sprawdzanie docker-compose...');
        const composeResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/docker-compose`);
        console.log(`Status: ${composeResponse.status}`);
        if (composeResponse.status === 200) {
            console.log('Docker Compose:', composeResponse.data);
        } else {
            console.log('Błąd pobierania docker-compose:', composeResponse.data);
        }
        
        // 4. Sprawdź czy aplikacja ma poprawny build pack
        console.log('\n4️⃣ Sprawdzanie build pack...');
        const buildPackResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/build-pack`);
        console.log(`Status: ${buildPackResponse.status}`);
        if (buildPackResponse.status === 200) {
            console.log('Build pack:', JSON.stringify(buildPackResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania build pack:', buildPackResponse.data);
        }
        
        // 5. Sprawdź czy aplikacja ma poprawny start command
        console.log('\n5️⃣ Sprawdzanie start command...');
        const startCommandResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/start-command`);
        console.log(`Status: ${startCommandResponse.status}`);
        if (startCommandResponse.status === 200) {
            console.log('Start command:', JSON.stringify(startCommandResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania start command:', startCommandResponse.data);
        }
        
        // 6. Sprawdź czy aplikacja ma poprawny build command
        console.log('\n6️⃣ Sprawdzanie build command...');
        const buildCommandResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/build-command`);
        console.log(`Status: ${buildCommandResponse.status}`);
        if (buildCommandResponse.status === 200) {
            console.log('Build command:', JSON.stringify(buildCommandResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania build command:', buildCommandResponse.data);
        }
        
        // 7. Sprawdź czy aplikacja ma poprawny environment
        console.log('\n7️⃣ Sprawdzanie environment...');
        const environmentResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/environment`);
        console.log(`Status: ${environmentResponse.status}`);
        if (environmentResponse.status === 200) {
            console.log('Environment:', JSON.stringify(environmentResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania environment:', environmentResponse.data);
        }
        
        // 8. Sprawdź czy aplikacja ma poprawny config
        console.log('\n8️⃣ Sprawdzanie config...');
        const configResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/config`);
        console.log(`Status: ${configResponse.status}`);
        if (configResponse.status === 200) {
            console.log('Config:', JSON.stringify(configResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania config:', configResponse.data);
        }
        
        // 9. Sprawdź czy aplikacja ma poprawny destination
        console.log('\n9️⃣ Sprawdzanie destination...');
        const destinationResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/destination`);
        console.log(`Status: ${destinationResponse.status}`);
        if (destinationResponse.status === 200) {
            console.log('Destination:', JSON.stringify(destinationResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania destination:', destinationResponse.data);
        }
        
        // 10. Sprawdź czy aplikacja ma poprawny source
        console.log('\n🔟 Sprawdzanie source...');
        const sourceResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/source`);
        console.log(`Status: ${sourceResponse.status}`);
        if (sourceResponse.status === 200) {
            console.log('Source:', JSON.stringify(sourceResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania source:', sourceResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkAppDeployment();
