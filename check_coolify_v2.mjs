// Sprawdzanie różnych wersji API Coolify
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
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        if (Array.isArray(response)) {
                            console.log(`   ✅ Znaleziono ${response.length} elementów:`);
                            response.forEach((item, index) => {
                                console.log(`     ${index + 1}. ${item.name || item.id || 'Bez nazwy'}`);
                                if (item.status) console.log(`        Status: ${item.status}`);
                                if (item.port) console.log(`        Port: ${item.port}`);
                                if (item.domain) console.log(`        Domena: ${item.domain}`);
                            });
                        } else {
                            console.log(`   ✅ Odpowiedź:`, JSON.stringify(response, null, 2));
                        }
                    } catch (error) {
                        console.log(`   ✅ Odpowiedź (raw): ${data.substring(0, 200)}...`);
                    }
                } else {
                    console.log(`   ❌ Błąd: ${data}`);
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
    console.log('🚀 SPRAWDZANIE API COOLIFY V2');
    console.log('==============================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    
    const endpoints = [
        // Różne wersje API
        { path: '/api/v1/applications', desc: 'Aplikacje v1' },
        { path: '/api/v2/applications', desc: 'Aplikacje v2' },
        { path: '/api/v3/applications', desc: 'Aplikacje v3' },
        
        // Różne ścieżki
        { path: '/api/apps', desc: 'Aplikacje (apps)' },
        { path: '/api/application', desc: 'Aplikacja (pojedyncza)' },
        { path: '/api/project', desc: 'Projekt (pojedynczy)' },
        
        // Zespoły i użytkownicy
        { path: '/api/team', desc: 'Zespół (pojedynczy)' },
        { path: '/api/user', desc: 'Użytkownik' },
        { path: '/api/users', desc: 'Użytkownicy' },
        
        // Informacje systemowe
        { path: '/api/info', desc: 'Informacje o systemie' },
        { path: '/api/status', desc: 'Status systemu' },
        { path: '/api/health', desc: 'Health check' },
        { path: '/api/version', desc: 'Wersja' },
        
        // Docker i kontenery
        { path: '/api/docker', desc: 'Docker' },
        { path: '/api/docker/containers', desc: 'Kontenery Docker' },
        { path: '/api/docker/images', desc: 'Obrazy Docker' },
        
        // Bazy danych
        { path: '/api/db', desc: 'Baza danych' },
        { path: '/api/database', desc: 'Baza danych (pojedyncza)' },
        
        // Domeny i proxy
        { path: '/api/domains', desc: 'Domeny' },
        { path: '/api/proxy', desc: 'Proxy' },
        { path: '/api/nginx', desc: 'Nginx' },
        
        // Monitoring
        { path: '/api/monitoring', desc: 'Monitoring' },
        { path: '/api/metrics', desc: 'Metryki' },
        { path: '/api/logs', desc: 'Logi' }
    ];
    
    let successCount = 0;
    
    for (const endpoint of endpoints) {
        try {
            const result = await checkEndpoint(endpoint.path, endpoint.desc);
            if (result.status === 200) {
                successCount++;
            }
        } catch (error) {
            // Ignoruj błędy połączenia
        }
    }
    
    console.log('\n✅ SPRAWDZANIE ZAKOŃCZONE');
    console.log(`📊 Znaleziono ${successCount} działających endpointów`);
    
    if (successCount === 0) {
        console.log('\n💡 MOŻLIWE PRZYCZYNY:');
        console.log('- Token jest nieprawidłowy');
        console.log('- API ma inną strukturę niż oczekiwana');
        console.log('- Potrzebujesz uprawnień administratora');
        console.log('- Sprawdź dokumentację: https://coolify.io/docs');
    }
}

main();
