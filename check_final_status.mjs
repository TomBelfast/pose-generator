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

async function checkFinalStatus() {
    console.log('🔍 Sprawdzanie finalnego statusu aplikacji...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // Sprawdź status kilka razy
        for (let i = 1; i <= 3; i++) {
            console.log(`\n${i}️⃣ Sprawdzanie statusu (próba ${i}/3)...`);
            
            const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
            if (statusResponse.status === 200) {
                const app = statusResponse.data;
                console.log(`   - Status: ${app.status}`);
                console.log(`   - Ostatni online: ${app.last_online_at}`);
                
                if (app.status === 'running:healthy') {
                    console.log('   ✅ Aplikacja działa!');
                    
                    // Testuj frontend
                    console.log('\n🧪 Testowanie frontendu...');
                    try {
                        const frontendResponse = await new Promise((resolve, reject) => {
                            const req = https.request('https://pg.aihub.ovh/', (res) => {
                                let data = '';
                                res.on('data', chunk => data += chunk);
                                res.on('end', () => {
                                    resolve({ 
                                        status: res.statusCode, 
                                        contentType: res.headers['content-type'],
                                        data: data.substring(0, 200) + '...' 
                                    });
                                });
                            });
                            req.on('error', reject);
                            req.end();
                        });
                        
                        console.log(`   - Frontend Status: ${frontendResponse.status}`);
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
                    
                    // Testuj API
                    console.log('\n🧪 Testowanie API...');
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
                    
                    break;
                } else if (app.status === 'restarting:unhealthy') {
                    console.log('   ⏳ Aplikacja nadal się restartuje...');
                } else {
                    console.log(`   ℹ️ Status: ${app.status}`);
                }
            } else {
                console.log('   ❌ Błąd pobierania statusu:', statusResponse.data);
            }
            
            if (i < 3) {
                console.log('   ⏳ Czekam 20 sekund przed następnym sprawdzeniem...');
                await new Promise(resolve => setTimeout(resolve, 20000));
            }
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

checkFinalStatus();
