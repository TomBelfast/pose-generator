import https from 'https';

async function testDomainAccess() {
    console.log('🧪 Testowanie dostępu do domeny pg.aihub.ovh...\n');
    
    try {
        // Testuj domenę pg.aihub.ovh
        console.log('1️⃣ Testowanie pg.aihub.ovh...');
        const domainResponse = await new Promise((resolve, reject) => {
            const req = https.request('https://pg.aihub.ovh/', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({ 
                        status: res.statusCode, 
                        headers: res.headers,
                        data: data.substring(0, 500) + '...' 
                    });
                });
            });
            req.on('error', reject);
            req.end();
        });
        
        console.log(`   - Status: ${domainResponse.status}`);
        console.log(`   - Headers: ${JSON.stringify(domainResponse.headers, null, 2)}`);
        console.log(`   - Response: ${domainResponse.data}`);
        
        // Testuj health check
        console.log('\n2️⃣ Testowanie health check...');
        const healthResponse = await new Promise((resolve, reject) => {
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
        
        console.log(`   - Status: ${healthResponse.status}`);
        console.log(`   - Response: ${healthResponse.data}`);
        
        // Testuj host.aihub.ovh (główna domena Coolify)
        console.log('\n3️⃣ Testowanie host.aihub.ovh...');
        const hostResponse = await new Promise((resolve, reject) => {
            const req = https.request('https://host.aihub.ovh/', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({ 
                        status: res.statusCode, 
                        data: data.substring(0, 200) + '...' 
                    });
                });
            });
            req.on('error', reject);
            req.end();
        });
        
        console.log(`   - Status: ${hostResponse.status}`);
        console.log(`   - Response: ${hostResponse.data}`);
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

testDomainAccess();
