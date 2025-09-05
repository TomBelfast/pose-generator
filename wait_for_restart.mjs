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

async function waitForRestart() {
    console.log('⏳ Czekam na zakończenie restartu aplikacji...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // Sprawdź status kilka razy
        for (let i = 1; i <= 10; i++) {
            console.log(`\n${i}️⃣ Sprawdzanie statusu (próba ${i}/10)...`);
            
            const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
            if (statusResponse.status === 200) {
                const app = statusResponse.data;
                console.log(`   - Status: ${app.status}`);
                console.log(`   - Ostatni online: ${app.last_online_at}`);
                console.log(`   - Port: ${app.ports_exposes}`);
                console.log(`   - Port mapping: ${app.ports_mappings}`);
                
                if (app.status === 'running:healthy') {
                    console.log('   ✅ Aplikacja działa!');
                    
                    // Testuj aplikację
                    console.log('\n🧪 Testowanie aplikacji...');
                    try {
                        const testResponse = await new Promise((resolve, reject) => {
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
                        
                        console.log(`   - Test Status: ${testResponse.status}`);
                        console.log(`   - Test Response: ${testResponse.data}`);
                        
                    } catch (error) {
                        console.log(`   - Błąd testowania: ${error.message}`);
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
            
            if (i < 10) {
                console.log('   ⏳ Czekam 30 sekund przed następnym sprawdzeniem...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

waitForRestart();
