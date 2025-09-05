import https from 'https';

async function testFrontend() {
    console.log('🧪 Testowanie frontendu aplikacji...\n');
    
    try {
        // Testuj różne endpointy
        const endpoints = [
            '/',
            '/index.html',
            '/dist/',
            '/dist/index.html',
            '/static/',
            '/assets/',
            '/app',
            '/pose-generator'
        ];
        
        for (const endpoint of endpoints) {
            console.log(`\n🔍 Testowanie: https://pg.aihub.ovh${endpoint}`);
            
            try {
                const response = await new Promise((resolve, reject) => {
                    const req = https.request(`https://pg.aihub.ovh${endpoint}`, (res) => {
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
                    req.setTimeout(5000, () => reject(new Error('Timeout')));
                    req.end();
                });
                
                console.log(`   - Status: ${response.status}`);
                console.log(`   - Content-Type: ${response.contentType}`);
                console.log(`   - Response: ${response.data}`);
                
                if (response.status === 200 && response.contentType && response.contentType.includes('text/html')) {
                    console.log('   ✅ Znaleziono frontend!');
                }
                
            } catch (error) {
                console.log(`   - Błąd: ${error.message}`);
            }
        }
        
        // Testuj API endpoints
        console.log('\n🔍 Testowanie API endpoints...');
        const apiEndpoints = [
            '/api/health',
            '/api/user',
            '/api/user-limit'
        ];
        
        for (const endpoint of apiEndpoints) {
            try {
                const response = await new Promise((resolve, reject) => {
                    const req = https.request(`https://pg.aihub.ovh${endpoint}`, (res) => {
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
                    req.setTimeout(5000, () => reject(new Error('Timeout')));
                    req.end();
                });
                
                console.log(`   - ${endpoint}: ${response.status} - ${response.data}`);
                
            } catch (error) {
                console.log(`   - ${endpoint}: Błąd - ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

testFrontend();
