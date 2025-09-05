// Restart i konfiguracja projektu pose-generator
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '4|joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

async function getProjectDetails(projectName) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/applications`,
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
                if (res.statusCode === 200) {
                    try {
                        const projects = JSON.parse(data);
                        const project = projects.find(p => p.includes('pose-generator'));
                        resolve(project);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function restartProject(projectId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/applications/${projectId}/restart`,
            method: 'POST',
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
                console.log(`\n🔄 RESTART PROJEKTU`);
                console.log(`===================`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Odpowiedź: ${data}`);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function startProject(projectId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/applications/${projectId}/start`,
            method: 'POST',
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
                console.log(`\n▶️ URUCHAMIANIE PROJEKTU`);
                console.log(`=========================`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Odpowiedź: ${data}`);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function redeployProject(projectId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/applications/${projectId}/redeploy`,
            method: 'POST',
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
                console.log(`\n🔄 REDEPLOY PROJEKTU`);
                console.log(`=====================`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Odpowiedź: ${data}`);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('🚀 URUCHAMIANIE PROJEKTU POSE-GENERATOR');
    console.log('========================================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    
    try {
        // 1. Znajdź projekt pose-generator
        console.log(`\n📋 Szukanie projektu pose-generator...`);
        const projectId = 'tom-belfast/pose-generator:main-e0k88kocwoo8s44gg00osocg';
        
        console.log(`✅ Znaleziono projekt: ${projectId}`);
        console.log(`   Status: exited:unhealthy`);
        
        // 2. Spróbuj uruchomić projekt
        console.log(`\n▶️ Próba uruchomienia projektu...`);
        await startProject(projectId);
        
        // 3. Jeśli nie działa, spróbuj restart
        console.log(`\n🔄 Próba restartu projektu...`);
        await restartProject(projectId);
        
        // 4. Jeśli nadal nie działa, spróbuj redeploy
        console.log(`\n🔄 Próba redeploy projektu...`);
        await redeployProject(projectId);
        
        console.log(`\n✅ OPERACJE ZAKOŃCZONE`);
        console.log(`\n💡 NASTĘPNE KROKI:`);
        console.log(`1. Sprawdź status projektu w interfejsie Coolify`);
        console.log(`2. Sprawdź logi projektu`);
        console.log(`3. Sprawdź zmienne środowiskowe`);
        console.log(`4. Upewnij się, że repozytorium jest aktualne`);
        
    } catch (error) {
        console.log(`\n❌ Błąd: ${error.message}`);
    }
}

main();
