// Szczegółowe sprawdzanie projektów i logów
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '4|joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

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
                console.log(`\n📋 LOGI PROJEKTU ${projectId}`);
                console.log(`===============================`);
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const logs = JSON.parse(data);
                        console.log(`✅ Logi pobrane pomyślnie!`);
                        
                        if (Array.isArray(logs)) {
                            console.log(`   Liczba wpisów: ${logs.length}`);
                            console.log(`\n📝 OSTATNIE 15 WPISÓW Z LOGÓW:`);
                            console.log(`================================`);
                            
                            logs.slice(-15).forEach((log, index) => {
                                const timestamp = log.timestamp || log.time || 'Brak czasu';
                                const message = log.message || log.content || log;
                                const level = log.level || log.severity || 'INFO';
                                
                                console.log(`\n${index + 1}. [${timestamp}] [${level}]`);
                                console.log(`   ${message}`);
                            });
                        } else {
                            console.log(`   Logi (raw): ${data.substring(0, 1500)}...`);
                        }
                        
                        resolve(logs);
                    } catch (error) {
                        console.log(`   Logi (raw): ${data.substring(0, 1500)}...`);
                        resolve(data);
                    }
                } else {
                    console.log(`❌ Błąd pobierania logów: ${data}`);
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
    console.log('🔍 SZCZEGÓŁOWE SPRAWDZANIE PROJEKTÓW I LOGÓW');
    console.log('=============================================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    
    try {
        // 1. Pobierz wszystkie projekty
        console.log(`\n📋 Pobieranie listy projektów...`);
        const projects = await getAllProjects();
        
        console.log(`\n📊 SZCZEGÓŁY WSZYSTKICH PROJEKTÓW:`);
        console.log(`===================================`);
        
        let poseGeneratorFound = false;
        
        projects.forEach((project, index) => {
            console.log(`\n${index + 1}. PROJEKT ${index + 1}`);
            console.log(`   ID: ${project.id || 'Brak'}`);
            console.log(`   Nazwa: ${project.name || 'Brak'}`);
            console.log(`   Status: ${project.status || 'Brak'}`);
            console.log(`   Port: ${project.port || 'Brak'}`);
            console.log(`   Domena: ${project.domain || 'Brak'}`);
            console.log(`   Repozytorium: ${project.repository || 'Brak'}`);
            console.log(`   Branch: ${project.branch || 'Brak'}`);
            console.log(`   Ostatnia aktualizacja: ${project.updatedAt || 'Brak'}`);
            console.log(`   URL: ${project.url || 'Brak'}`);
            
            // Sprawdź czy to pose-generator
            if (project.name && project.name.includes('pose-generator') ||
                project.repository && project.repository.includes('pose-generator')) {
                poseGeneratorFound = true;
                console.log(`   🎯 TO JEST PROJEKT POSE-GENERATOR!`);
            }
        });
        
        if (poseGeneratorFound) {
            console.log(`\n✅ Znaleziono projekt pose-generator!`);
            
            // Znajdź pose-generator i pobierz jego logi
            const poseGenerator = projects.find(p => 
                (p.name && p.name.includes('pose-generator')) ||
                (p.repository && p.repository.includes('pose-generator'))
            );
            
            if (poseGenerator && poseGenerator.id) {
                console.log(`\n📋 Pobieranie logów dla projektu: ${poseGenerator.name || poseGenerator.id}`);
                await getProjectLogs(poseGenerator.id);
            }
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
