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
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
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

async function simpleRestart() {
    console.log('🔄 Restartowanie aplikacji...\n');
    
    try {
        const APP_ID = 'e0k88kocwoo8s44gg00osocg';
        
        // Sprawdź status
        const statusResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}`);
        if (statusResponse.status === 200) {
            const app = statusResponse.data;
            console.log(`Status: ${app.status}`);
        }
        
        // Restart
        const restartResponse = await makeRequest(`${COOLIFY_URL}/api/v1/applications/${APP_ID}/restart`, {
            method: 'POST'
        });
        
        if (restartResponse.status === 200) {
            console.log('✅ Aplikacja zrestartowana');
        } else {
            console.log('❌ Błąd restartu:', restartResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

simpleRestart();
