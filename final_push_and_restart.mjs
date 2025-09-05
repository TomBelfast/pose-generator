import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

async function finalPushAndRestart() {
    console.log('🚀 Finalne wypushowanie i restart aplikacji...\n');
    
    try {
        // 1. Sprawdź status git
        console.log('1️⃣ Sprawdzanie statusu git...');
        try {
            const { stdout: gitStatus } = await execAsync('git status --porcelain');
            console.log('Git status:', gitStatus || 'Brak zmian');
        } catch (error) {
            console.log('Błąd git status:', error.message);
        }
        
        // 2. Commit i push
        console.log('\n2️⃣ Commit i push zmian...');
        try {
            await execAsync('git add server.js');
            await execAsync('git commit -m "Fix Express route path error"');
            await execAsync('git push origin main');
            console.log('✅ Zmiany wypushowane');
        } catch (error) {
            console.log('❌ Błąd push:', error.message);
        }
        
        // 3. Sprawdź status aplikacji
        console.log('\n3️⃣ Sprawdzanie statusu aplikacji...');
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse.status === 200) {
            const app = statusResponse.data;
            console.log(`   - Status: ${app.status}`);
            console.log(`   - Ostatni online: ${app.last_online_at}`);
        }
        
        // 4. Restart aplikacji
        console.log('\n4️⃣ Restartowanie aplikacji...');
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
        
        // 5. Poczekaj i sprawdź status
        console.log('\n5️⃣ Czekam 30 sekund i sprawdzam status...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        const statusResponse2 = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse2.status === 200) {
            const app = statusResponse2.data;
            console.log(`   - Status: ${app.status}`);
            console.log(`   - Ostatni online: ${app.last_online_at}`);
            
            if (app.status === 'running:healthy') {
                console.log('   ✅ Aplikacja działa!');
            } else if (app.status === 'restarting:unhealthy') {
                console.log('   ⏳ Aplikacja nadal się restartuje...');
            } else {
                console.log(`   ℹ️ Status: ${app.status}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

finalPushAndRestart();
