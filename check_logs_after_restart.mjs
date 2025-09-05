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

async function checkLogsAfterRestart() {
    console.log('🔍 Sprawdzanie logów po restarcie aplikacji pose-generator...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // Poczekaj chwilę na restart
        console.log('⏳ Czekam 10 sekund na restart aplikacji...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // 1. Sprawdź status aplikacji
        console.log('1️⃣ Status aplikacji po restarcie...');
        const appDetailsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        console.log(`Status: ${appDetailsResponse.status}`);
        if (appDetailsResponse.status === 200) {
            console.log('Status aplikacji:', appDetailsResponse.data.status);
            console.log('Ostatni online:', appDetailsResponse.data.last_online_at);
        }
        
        // 2. Sprawdź logi aplikacji
        console.log('\n2️⃣ Logi aplikacji...');
        const logsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/logs`);
        console.log(`Status: ${logsResponse.status}`);
        if (logsResponse.status === 200) {
            console.log('Logi:', JSON.stringify(logsResponse.data, null, 2));
        } else {
            console.log('Błąd logów:', logsResponse.data);
        }
        
        // 3. Sprawdź historię deploymentów
        console.log('\n3️⃣ Historia deploymentów...');
        const deploymentsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/deployments`);
        console.log(`Status: ${deploymentsResponse.status}`);
        if (deploymentsResponse.status === 200 && Array.isArray(deploymentsResponse.data)) {
            console.log('Liczba deploymentów:', deploymentsResponse.data.length);
            if (deploymentsResponse.data.length > 0) {
                const latestDeployment = deploymentsResponse.data[0];
                console.log('Najnowszy deployment:', JSON.stringify(latestDeployment, null, 2));
                
                // Sprawdź logi najnowszego deploymentu
                console.log('\n4️⃣ Logi najnowszego deploymentu...');
                const deploymentLogsResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/deployments/${latestDeployment.uuid}/logs`);
                console.log(`Status: ${deploymentLogsResponse.status}`);
                if (deploymentLogsResponse.status === 200) {
                    console.log('Logi deploymentu:', JSON.stringify(deploymentLogsResponse.data, null, 2));
                } else {
                    console.log('Błąd logów deploymentu:', deploymentLogsResponse.data);
                }
            }
        } else {
            console.log('Błąd deploymentów:', deploymentsResponse.data);
        }
        
        // 5. Sprawdź kontenery
        console.log('\n5️⃣ Kontenery...');
        const containersResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/containers`);
        console.log(`Status: ${containersResponse.status}`);
        if (containersResponse.status === 200) {
            console.log('Kontenery:', JSON.stringify(containersResponse.data, null, 2));
        } else {
            console.log('Błąd kontenerów:', containersResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkLogsAfterRestart();
