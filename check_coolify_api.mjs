// Sprawdzanie różnych endpointów API Coolify
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = 'joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

async function checkEndpoint(endpoint, description) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: endpoint,
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
                console.log(`\n🔍 ${description}`);
                console.log(`   Endpoint: ${endpoint}`);
                console.log(`   Status: ${res.statusCode}`);
                
                try {
                    const response = JSON.parse(data);
                    if (Array.isArray(response)) {
                        console.log(`   Znaleziono ${response.length} elementów:`);
                        response.forEach((item, index) => {
                            console.log(`     ${index + 1}. ${item.name || item.id || 'Bez nazwy'}`);
                            if (item.status) console.log(`        Status: ${item.status}`);
                            if (item.port) console.log(`        Port: ${item.port}`);
                        });
                    } else {
                        console.log(`   Odpowiedź:`, JSON.stringify(response, null, 2));
                    }
                } catch (error) {
                    console.log(`   Odpowiedź (raw): ${data}`);
                }
                
                resolve({ endpoint, status: res.statusCode, data });
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Błąd dla ${endpoint}: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

async function main() {
    console.log('🚀 SPRAWDZANIE API COOLIFY');
    console.log('==========================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    
    const endpoints = [
        { path: '/api/applications', desc: 'Aplikacje' },
        { path: '/api/projects', desc: 'Projekty' },
        { path: '/api/services', desc: 'Usługi' },
        { path: '/api/resources', desc: 'Zasoby' },
        { path: '/api/containers', desc: 'Kontenery' },
        { path: '/api/databases', desc: 'Bazy danych' },
        { path: '/api/me', desc: 'Informacje o użytkowniku' },
        { path: '/api/teams', desc: 'Zespoły' },
        { path: '/api/teams/1/applications', desc: 'Aplikacje zespołu 1' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            await checkEndpoint(endpoint.path, endpoint.desc);
        } catch (error) {
            console.log(`❌ Błąd dla ${endpoint.path}: ${error.message}`);
        }
    }
    
    console.log('\n✅ SPRAWDZANIE ZAKOŃCZONE');
}

main();
