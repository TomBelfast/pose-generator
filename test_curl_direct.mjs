import https from 'https';

async function testCurlDirect() {
    console.log('🧪 Testowanie aplikacji bezpośrednio przez curl...\n');
    
    try {
        // Testuj health check endpoint
        console.log('1️⃣ Testowanie health check endpoint...');
        const healthResponse = await new Promise((resolve, reject) => {
            const req = https.request('https://host.aihub.ovh/api/health', (res) => {
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
            req.end();
        });
        
        console.log(`   - Status: ${healthResponse.status}`);
        console.log(`   - Response: ${JSON.stringify(healthResponse.data, null, 2)}`);
        
        // Testuj główną stronę
        console.log('\n2️⃣ Testowanie głównej strony...');
        const mainResponse = await new Promise((resolve, reject) => {
            const req = https.request('https://host.aihub.ovh/', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({ status: res.statusCode, data: data.substring(0, 200) + '...' });
                });
            });
            req.on('error', reject);
            req.end();
        });
        
        console.log(`   - Status: ${mainResponse.status}`);
        console.log(`   - Response: ${mainResponse.data}`);
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

testCurlDirect();
