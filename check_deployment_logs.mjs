// Sprawdzanie logów deploymentu projektu pose-generator
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '4|joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

async function getProjectLogs(projectId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/applications/${projectId}/logs`,
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
                console.log(`\n📋 LOGI PROJEKTU POSE-GENERATOR`);
                console.log(`=================================`);
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const logs = JSON.parse(data);
                        console.log(`✅ Logi pobrane pomyślnie!`);
                        
                        if (Array.isArray(logs)) {
                            console.log(`   Liczba wpisów: ${logs.length}`);
                            console.log(`\n📝 OSTATNIE 20 WPISÓW Z LOGÓW:`);
                            console.log(`================================`);
                            
                            logs.slice(-20).forEach((log, index) => {
                                const timestamp = log.timestamp || log.time || 'Brak czasu';
                                const message = log.message || log.content || log;
                                const level = log.level || log.severity || 'INFO';
                                
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
                    console.log(`❌ Błąd pobierania logów: ${data}`);
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Błąd połączenia: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

async function getProjectStatus(projectId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/applications/${projectId}`,
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
                console.log(`\n📊 STATUS PROJEKTU`);
                console.log(`==================`);
                console.log(`Status HTTP: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const project = JSON.parse(data);
                        console.log(`✅ Projekt znaleziony!`);
                        console.log(`   ID: ${project.id}`);
                        console.log(`   Nazwa: ${project.name}`);
                        console.log(`   Status: ${project.status}`);
                        console.log(`   Port: ${project.port}`);
                        console.log(`   Domena: ${project.domain || 'Brak'}`);
                        console.log(`   Ostatnia aktualizacja: ${project.updatedAt}`);
                        console.log(`   URL: ${project.url || 'Brak'}`);
                        resolve(project);
                    } catch (error) {
                        console.log(`❌ Błąd parsowania: ${error.message}`);
                        console.log(`Odpowiedź: ${data}`);
                        reject(error);
                    }
                } else {
                    console.log(`❌ Błąd: ${data}`);
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function getAllProjects() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: '/api/v1/applications',
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
                        resolve(projects);
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

async function main() {
    console.log('🔍 SPRAWDZANIE LOGÓW DEPLOYMENTU POSE-GENERATOR');
    console.log('================================================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    
    try {
        // 1. Pobierz wszystkie projekty
        console.log(`\n📋 Pobieranie listy projektów...`);
        const projects = await getAllProjects();
        
        console.log(`\n📊 ZNALEZIONE PROJEKTY:`);
        projects.forEach((project, index) => {
            console.log(`${index + 1}. ${project}`);
        });
        
        // 2. Znajdź pose-generator
        const poseGenerator = projects.find(p => p && p.includes && p.includes('pose-generator'));
        
        if (poseGenerator) {
            console.log(`\n✅ Znaleziono projekt pose-generator: ${poseGenerator}`);
            
            // 3. Sprawdź status projektu
            await getProjectStatus(poseGenerator);
            
            // 4. Pobierz logi
            await getProjectLogs(poseGenerator);
            
        } else {
            console.log(`\n❌ Nie znaleziono projektu pose-generator`);
            console.log(`\n💡 MOŻLIWE PRZYCZYNY:`);
            console.log(`- Projekt został usunięty`);
            console.log(`- Projekt ma inną nazwę`);
            console.log(`- Sprawdź interfejs Coolify`);
        }
        
        console.log(`\n✅ SPRAWDZANIE ZAKOŃCZONE`);
        
    } catch (error) {
        console.log(`\n❌ Błąd: ${error.message}`);
    }
}

main();
