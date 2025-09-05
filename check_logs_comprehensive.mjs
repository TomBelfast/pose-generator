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

async function checkLogs() {
    console.log('🔍 Sprawdzanie logów dla projektu pose-generator...\n');
    
    try {
        // 1. Sprawdź wszystkie aplikacje
        console.log('1️⃣ Pobieranie listy aplikacji...');
        const appsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications`);
        console.log(`Status: ${appsResponse.status}`);
        
        if (appsResponse.status === 200 && Array.isArray(appsResponse.data)) {
            const poseApp = appsResponse.data.find(app => 
                app.name && app.name.toLowerCase().includes('pose')
            );
            
            if (poseApp) {
                console.log(`✅ Znaleziono aplikację: ${poseApp.name} (ID: ${poseApp.uuid})`);
                
                // 2. Sprawdź logi aplikacji
                console.log('\n2️⃣ Sprawdzanie logów aplikacji...');
                const logsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${poseApp.uuid}/logs`);
                console.log(`Status: ${logsResponse.status}`);
                console.log('Response:', JSON.stringify(logsResponse.data, null, 2));
                
                // 3. Sprawdź logi deploymentu
                console.log('\n3️⃣ Sprawdzanie logów deploymentu...');
                const deploymentLogsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${poseApp.uuid}/deployments`);
                console.log(`Status: ${deploymentLogsResponse.status}`);
                
                if (deploymentLogsResponse.status === 200 && Array.isArray(deploymentLogsResponse.data)) {
                    const latestDeployment = deploymentLogsResponse.data[0];
                    if (latestDeployment) {
                        console.log(`Najnowszy deployment: ${latestDeployment.uuid}`);
                        
                        // Sprawdź logi konkretnego deploymentu
                        const deploymentLogsResponse2 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${poseApp.uuid}/deployments/${latestDeployment.uuid}/logs`);
                        console.log(`Status logów deploymentu: ${deploymentLogsResponse2.status}`);
                        console.log('Deployment logs:', JSON.stringify(deploymentLogsResponse2.data, null, 2));
                    }
                }
                
                // 4. Sprawdź logi kontenera
                console.log('\n4️⃣ Sprawdzanie logów kontenera...');
                const containerLogsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${poseApp.uuid}/containers`);
                console.log(`Status: ${containerLogsResponse.status}`);
                
                if (containerLogsResponse.status === 200 && Array.isArray(containerLogsResponse.data)) {
                    const container = containerLogsResponse.data[0];
                    if (container) {
                        console.log(`Kontener: ${container.name} (ID: ${container.uuid})`);
                        
                        // Sprawdź logi kontenera
                        const containerLogsResponse2 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${poseApp.uuid}/containers/${container.uuid}/logs`);
                        console.log(`Status logów kontenera: ${containerLogsResponse2.status}`);
                        console.log('Container logs:', JSON.stringify(containerLogsResponse2.data, null, 2));
                    }
                }
                
                // 5. Sprawdź logi serwera
                console.log('\n5️⃣ Sprawdzanie logów serwera...');
                const serverLogsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${poseApp.uuid}/server/logs`);
                console.log(`Status: ${serverLogsResponse.status}`);
                console.log('Server logs:', JSON.stringify(serverLogsResponse.data, null, 2));
                
            } else {
                console.log('❌ Nie znaleziono aplikacji pose-generator');
            }
        } else {
            console.log('❌ Błąd pobierania aplikacji:', appsResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkLogs();
