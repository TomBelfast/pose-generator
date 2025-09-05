// Sprawdzanie logów przez prostsze endpointy
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '4|joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

// Różne możliwe endpointy dla logów
const LOG_ENDPOINTS = [
    `/api/v1/applications/e0k88kocwoo8s44gg00osocg/logs`,
    `/api/v1/projects/zksk4gogw44sog8ww04wkwgg/applications/e0k88kocwoo8s44gg00osocg/logs`,
    `/api/v1/environments/og0o8s4g0g4w8wgoss88soko/applications/e0k88kocwoo8s44gg00osocg/logs`,
    `/api/v1/deployments/ds8ws4k8cko80cw88gkc4sww/logs`,
    `/api/v1/logs?applicationId=e0k88kocwoo8s44gg00osocg`,
    `/api/v1/logs?deploymentId=ds8ws4k8cko80cw88gkc4sww`,
    `/api/v1/containers/e0k88kocwoo8s44gg00osocg/logs`,
    `/api/v1/services/e0k88kocwoo8s44gg00osocg/logs`
];

async function checkLogEndpoint(endpoint) {
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
                console.log(`\n🔍 ENDPOINT: ${endpoint}`);
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const logs = JSON.parse(data);
                        console.log(`✅ SUKCES! Logi pobrane pomyślnie!`);
                        
                        if (Array.isArray(logs)) {
                            console.log(`   Liczba wpisów: ${logs.length}`);
                            console.log(`\n📝 OSTATNIE 20 WPISÓW Z LOGÓW:`);
                            console.log(`================================`);
                            
                            logs.slice(-20).forEach((log, index) => {
                                const timestamp = log.timestamp || log.time || log.createdAt || 'Brak czasu';
                                const message = log.message || log.content || log.text || log;
                                const level = log.level || log.severity || log.type || 'INFO';
                                
                                console.log(`\n${index + 1}. [${timestamp}] [${level}]`);
                                console.log(`   ${message}`);
                            });
                        } else {
                            console.log(`   Logi (raw): ${data.substring(0, 2000)}...`);
                        }
                        
                        resolve(logs);
                    } catch (error) {
                        console.log(`   Logi (raw): ${data.substring(0, 2000)}...`);
                        resolve(data);
                    }
                } else {
                    console.log(`❌ Błąd: ${data.substring(0, 200)}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Błąd połączenia: ${error.message}`);
            resolve(null);
        });

        req.end();
    });
}

async function main() {
    console.log('🔍 SPRAWDZANIE RÓŻNYCH ENDPOINTÓW DLA LOGÓW');
    console.log('==========================================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    console.log(`📱 Application ID: e0k88kocwoo8s44gg00osocg`);
    console.log(`🚀 Deployment ID: ds8ws4k8cko80cw88gkc4sww`);
    
    try {
        let successCount = 0;
        
        for (let i = 0; i < LOG_ENDPOINTS.length; i++) {
            const endpoint = LOG_ENDPOINTS[i];
            console.log(`\n${'='.repeat(60)}`);
            console.log(`ENDPOINT ${i + 1}/${LOG_ENDPOINTS.length}`);
            console.log(`${'='.repeat(60)}`);
            
            const result = await checkLogEndpoint(endpoint);
            if (result) {
                successCount++;
            }
        }
        
        console.log(`\n✅ SPRAWDZANIE ZAKOŃCZONE`);
        console.log(`📊 Znaleziono ${successCount} działających endpointów`);
        
        if (successCount === 0) {
            console.log(`\n💡 WNIOSKI:`);
            console.log(`- API Coolify ma ograniczenia dostępu do logów`);
            console.log(`- Potrzebujesz sprawdzić logi w interfejsie webowym`);
            console.log(`- Link do deploymentu: https://host.aihub.ovh/project/zksk4gogw44sog8ww04wkwgg/environment/og0o8s4g0g4w8wgoss88soko/application/e0k88kocwoo8s44gg00osocg/deployment/ds8ws4k8cko80cw88gkc4sww`);
        }
        
    } catch (error) {
        console.log(`\n❌ Błąd: ${error.message}`);
    }
}

main();
