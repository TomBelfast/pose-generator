import https from 'https';
import http from 'http';

async function test192_168_0_25() {
    console.log('🧪 Testowanie adresu 192.168.0.25:4999...\n');
    
    try {
        // 1. Testuj HTTP na 192.168.0.25:4999
        console.log('1️⃣ Testowanie HTTP na 192.168.0.25:4999...');
        try {
            const httpResponse = await new Promise((resolve, reject) => {
                const req = http.request('http://192.168.0.25:4999/', (res) => {
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
                req.setTimeout(10000, () => reject(new Error('Timeout')));
                req.end();
            });
            
            console.log(`   - Status: ${httpResponse.status}`);
            console.log(`   - Headers: ${JSON.stringify(httpResponse.headers, null, 2)}`);
            console.log(`   - Response: ${httpResponse.data}`);
            
        } catch (error) {
            console.log(`   - Błąd HTTP: ${error.message}`);
        }
        
        // 2. Testuj health check na 192.168.0.25:4999
        console.log('\n2️⃣ Testowanie health check na 192.168.0.25:4999...');
        try {
            const healthResponse = await new Promise((resolve, reject) => {
                const req = http.request('http://192.168.0.25:4999/api/health', (res) => {
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
                req.setTimeout(10000, () => reject(new Error('Timeout')));
                req.end();
            });
            
            console.log(`   - Status: ${healthResponse.status}`);
            console.log(`   - Response: ${healthResponse.data}`);
            
        } catch (error) {
            console.log(`   - Błąd health check: ${error.message}`);
        }
        
        // 3. Testuj inne endpointy na 192.168.0.25:4999
        console.log('\n3️⃣ Testowanie innych endpointów na 192.168.0.25:4999...');
        const endpoints = [
            '/api/user',
            '/api/user-limit',
            '/api/increment-count',
            '/dist/',
            '/index.html'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await new Promise((resolve, reject) => {
                    const req = http.request(`http://192.168.0.25:4999${endpoint}`, (res) => {
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
                    req.setTimeout(5000, () => reject(new Error('Timeout')));
                    req.end();
                });
                
                console.log(`   - ${endpoint}: ${response.status} - ${response.data}`);
                
            } catch (error) {
                console.log(`   - ${endpoint}: Błąd - ${error.message}`);
            }
        }
        
        // 4. Testuj ping do 192.168.0.25
        console.log('\n4️⃣ Testowanie ping do 192.168.0.25...');
        try {
            const { exec } = await import('child_process');
            const pingResponse = await new Promise((resolve, reject) => {
                exec('ping -n 4 192.168.0.25', (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            console.log(`   - Ping response: ${pingResponse}`);
        } catch (error) {
            console.log(`   - Błąd ping: ${error.message}`);
        }
        
        // 5. Testuj telnet do 192.168.0.25:4999
        console.log('\n5️⃣ Testowanie telnet do 192.168.0.25:4999...');
        try {
            const { exec } = await import('child_process');
            const telnetResponse = await new Promise((resolve, reject) => {
                exec('telnet 192.168.0.25 4999', (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            console.log(`   - Telnet response: ${telnetResponse}`);
        } catch (error) {
            console.log(`   - Błąd telnet: ${error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    }
}

test192_168_0_25();
