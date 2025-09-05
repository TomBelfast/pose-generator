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

async function checkGitHubRepo() {
    console.log('🔍 Sprawdzanie repozytorium GitHub dla aplikacji pose-generator...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Sprawdź szczegóły aplikacji
        console.log('1️⃣ Szczegóły aplikacji...');
        const appDetailsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (appDetailsResponse.status === 200) {
            const app = appDetailsResponse.data;
            console.log('Informacje o repozytorium:');
            console.log(`   - Git repository: ${app.git_repository}`);
            console.log(`   - Git branch: ${app.git_branch}`);
            console.log(`   - Git commit: ${app.git_commit_sha}`);
            console.log(`   - Source type: ${app.source_type}`);
            console.log(`   - Source ID: ${app.source_id}`);
            console.log(`   - Repository project ID: ${app.repository_project_id}`);
        }
        
        // 2. Sprawdź źródła
        console.log('\n2️⃣ Sprawdzanie źródeł...');
        const sourcesResponse = await makeRequest(`${COOLIFY_URL}/api/v1/sources`);
        console.log(`Status: ${sourcesResponse.status}`);
        if (sourcesResponse.status === 200) {
            console.log('Źródła:', JSON.stringify(sourcesResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania źródeł:', sourcesResponse.data);
        }
        
        // 3. Sprawdź czy aplikacja ma dostęp do GitHub
        console.log('\n3️⃣ Sprawdzanie dostępu do GitHub...');
        const githubResponse = await makeRequest(`${COOLIFY_URL}/api/v1/sources/1`);
        console.log(`Status: ${githubResponse.status}`);
        if (githubResponse.status === 200) {
            console.log('GitHub source:', JSON.stringify(githubResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania GitHub source:', githubResponse.data);
        }
        
        // 4. Sprawdź czy aplikacja ma poprawny Dockerfile
        console.log('\n4️⃣ Sprawdzanie Dockerfile...');
        const dockerfileResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/dockerfile`);
        console.log(`Status: ${dockerfileResponse.status}`);
        if (dockerfileResponse.status === 200) {
            console.log('Dockerfile:', dockerfileResponse.data);
        } else {
            console.log('Błąd pobierania Dockerfile:', dockerfileResponse.data);
        }
        
        // 5. Sprawdź czy aplikacja ma poprawny docker-compose
        console.log('\n5️⃣ Sprawdzanie docker-compose...');
        const composeResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/docker-compose`);
        console.log(`Status: ${composeResponse.status}`);
        if (composeResponse.status === 200) {
            console.log('Docker Compose:', composeResponse.data);
        } else {
            console.log('Błąd pobierania docker-compose:', composeResponse.data);
        }
        
        // 6. Sprawdź czy aplikacja ma poprawny build pack
        console.log('\n6️⃣ Sprawdzanie build pack...');
        const buildPackResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/build-pack`);
        console.log(`Status: ${buildPackResponse.status}`);
        if (buildPackResponse.status === 200) {
            console.log('Build pack:', JSON.stringify(buildPackResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania build pack:', buildPackResponse.data);
        }
        
        // 7. Sprawdź czy aplikacja ma poprawny start command
        console.log('\n7️⃣ Sprawdzanie start command...');
        const startCommandResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/start-command`);
        console.log(`Status: ${startCommandResponse.status}`);
        if (startCommandResponse.status === 200) {
            console.log('Start command:', JSON.stringify(startCommandResponse.data, null, 2));
        } else {
            console.log('Błąd pobierania start command:', startCommandResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkGitHubRepo();
