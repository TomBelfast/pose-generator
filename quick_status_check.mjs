import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '4|joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

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

async function quickStatusCheck() {
    console.log('🔍 Szybkie sprawdzenie statusu aplikacji...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse.status === 200) {
            const app = statusResponse.data;
            console.log(`Status: ${app.status}`);
            console.log(`Ostatni online: ${app.last_online_at}`);
            console.log(`Health check: ${app.health_check_enabled ? 'Włączony' : 'Wyłączony'}`);
            console.log(`Health check path: ${app.health_check_path}`);
            console.log(`Health check port: ${app.health_check_port}`);
            
            if (app.status === 'running') {
                console.log('✅ Aplikacja działa!');
            } else if (app.status === 'exited:unhealthy') {
                console.log('⚠️ Aplikacja nadal ma problemy');
            } else {
                console.log(`ℹ️ Status: ${app.status}`);
            }
        } else {
            console.log('❌ Błąd pobierania statusu:', statusResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

quickStatusCheck();
