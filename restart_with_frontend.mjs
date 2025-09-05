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

async function restartWithFrontend() {
    console.log('🔄 Restartowanie aplikacji z frontendem...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // 1. Sprawdź aktualny status
        console.log('1️⃣ Sprawdzanie aktualnego statusu...');
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse.status === 200) {
            console.log(`Status: ${statusResponse.data.status}`);
            console.log(`Ostatni online: ${statusResponse.data.last_online_at}`);
        }
        
        // 2. Restart aplikacji
        console.log('\n2️⃣ Restartowanie aplikacji...');
        const restartResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/restart`, {
            method: 'POST'
        });
        console.log(`Status: ${restartResponse.status}`);
        if (restartResponse.status === 200) {
            console.log('✅ Aplikacja zrestartowana');
            console.log('Response:', JSON.stringify(restartResponse.data, null, 2));
        } else {
            console.log('❌ Błąd restartu:', restartResponse.data);
        }
        
        // 3. Poczekaj na restart
        console.log('\n3️⃣ Czekam na restart (30 sekund)...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // 4. Sprawdź status po restarcie
        console.log('\n4️⃣ Sprawdzanie statusu po restarcie...');
        const newStatusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (newStatusResponse.status === 200) {
            console.log(`Status: ${newStatusResponse.data.status}`);
            console.log(`Ostatni online: ${newStatusResponse.data.last_online_at}`);
        }
        
        // 5. Testuj frontend
        console.log('\n5️⃣ Testowanie frontendu...');
        try {
            const frontendResponse = await new Promise((resolve, reject) => {
                const req = https.request('https://pg.aihub.ovh/', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        resolve({ 
                            status: res.statusCode, 
                            contentType: res.headers['content-type'],
                            data: data.substring(0, 300) + '...' 
                        });
                    });
                });
                req.on('error', reject);
                req.end();
            });
            
            console.log(`   - Status: ${frontendResponse.status}`);
            console.log(`   - Content-Type: ${frontendResponse.contentType}`);
            console.log(`   - Response: ${frontendResponse.data}`);
            
            if (frontendResponse.status === 200 && frontendResponse.contentType && frontendResponse.contentType.includes('text/html')) {
                console.log('   ✅ Frontend działa!');
            } else {
                console.log('   ⚠️ Frontend może nie działać poprawnie');
            }
            
        } catch (error) {
            console.log(`   - Błąd testowania frontendu: ${error.message}`);
        }
        
        // 6. Testuj API
        console.log('\n6️⃣ Testowanie API...');
        try {
            const apiResponse = await new Promise((resolve, reject) => {
                const req = https.request('https://pg.aihub.ovh/api/health', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        resolve({ 
                            status: res.statusCode, 
                            data: data 
                        });
                    });
                });
                req.on('error', reject);
                req.end();
            });
            
            console.log(`   - API Status: ${apiResponse.status}`);
            console.log(`   - API Response: ${apiResponse.data}`);
            
        } catch (error) {
            console.log(`   - Błąd testowania API: ${error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

restartWithFrontend();
