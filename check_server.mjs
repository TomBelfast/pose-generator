// Sprawdzanie podstawowych informacji o serwerze Coolify
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '3|361AxU45vtYXcGHRGwnwWkwGJ9G4WrjAiKsSeT3Y299800c9';

async function checkServer() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: '/',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('🌐 INFORMACJE O SERWERZE');
                console.log('========================');
                console.log(`Status: ${res.statusCode}`);
                console.log(`Headers:`, res.headers);
                console.log(`Odpowiedź (pierwsze 500 znaków): ${data.substring(0, 500)}...`);
                resolve({ status: res.statusCode, headers: res.headers, data });
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Błąd połączenia: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

async function checkTokenValidity() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: '/api/me',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('\n🔑 WERYFIKACJA TOKENU');
                console.log('=====================');
                console.log(`Status: ${res.statusCode}`);
                console.log(`Odpowiedź: ${data}`);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Błąd weryfikacji tokenu: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

async function main() {
    console.log('🚀 SPRAWDZANIE SERWERA COOLIFY');
    console.log('===============================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    
    try {
        await checkServer();
        await checkTokenValidity();
        
        console.log('\n💡 WNIOSKI:');
        console.log('- Serwer Coolify jest dostępny');
        console.log('- Token może być nieprawidłowy lub wygasł');
        console.log('- API może mieć inną strukturę');
        console.log('- Sprawdź dokumentację: https://coolify.io/docs');
        
    } catch (error) {
        console.log(`❌ Błąd: ${error.message}`);
    }
}

main();
