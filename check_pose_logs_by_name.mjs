// Sprawdzanie logów projektu pose-generator po nazwie
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '4|joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

async function getProjectLogsByName(projectName) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/applications/${encodeURIComponent(projectName)}/logs`,
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

async function getProjectDetailsByName(projectName) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/applications/${encodeURIComponent(projectName)}`,
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
                console.log(`\n📊 SZCZEGÓŁY PROJEKTU POSE-GENERATOR`);
                console.log(`=====================================`);
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const project = JSON.parse(data);
                        console.log(`✅ Projekt znaleziony!`);
                        console.log(`   ID: ${project.id}`);
                        console.log(`   Nazwa: ${project.name}`);
                        console.log(`   Status: ${project.status}`);
                        console.log(`   Port: ${project.port}`);
                        console.log(`   Domena: ${project.domain || 'Brak'}`);
                        console.log(`   Repozytorium: ${project.repository || 'Brak'}`);
                        console.log(`   Branch: ${project.branch || 'Brak'}`);
                        console.log(`   Ostatnia aktualizacja: ${project.updatedAt}`);
                        console.log(`   URL: ${project.url || 'Brak'}`);
                        console.log(`   Typ: ${project.type || 'Brak'}`);
                        
                        if (project.environmentVariables) {
                            console.log(`   Zmienne środowiskowe: ${Object.keys(project.environmentVariables).length} ustawione`);
                        }
                        
                        resolve(project);
                    } catch (error) {
                        console.log(`❌ Błąd parsowania: ${error.message}`);
                        console.log(`Odpowiedź: ${data}`);
                        resolve(null);
                    }
                } else {
                    console.log(`❌ Błąd: ${data}`);
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
    console.log('🔍 SPRAWDZANIE LOGÓW PROJEKTU POSE-GENERATOR');
    console.log('============================================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    console.log(`📦 Projekt: pose-generator`);
    
    try {
        // 1. Sprawdź szczegóły projektu
        console.log(`\n📊 Pobieranie szczegółów projektu...`);
        const project = await getProjectDetailsByName('pose-generator');
        
        // 2. Pobierz logi
        console.log(`\n📋 Pobieranie logów projektu...`);
        const logs = await getProjectLogsByName('pose-generator');
        
        if (project) {
            console.log(`\n💡 ANALIZA PROJEKTU:`);
            console.log(`===================`);
            
            if (project.status === 'exited:unhealthy') {
                console.log(`❌ Projekt jest zatrzymany i niezdrowy`);
                console.log(`   - Sprawdź logi powyżej aby zobaczyć błędy`);
                console.log(`   - Sprawdź zmienne środowiskowe`);
                console.log(`   - Sprawdź konfigurację portu`);
            } else if (project.status === 'running:unhealthy') {
                console.log(`⚠️ Projekt działa ale jest niezdrowy`);
                console.log(`   - Sprawdź logi powyżej`);
                console.log(`   - Sprawdź health check`);
            } else if (project.status === 'running:healthy') {
                console.log(`✅ Projekt działa poprawnie!`);
            } else {
                console.log(`❓ Nieznany status: ${project.status}`);
            }
        }
        
        console.log(`\n✅ SPRAWDZANIE ZAKOŃCZONE`);
        
    } catch (error) {
        console.log(`\n❌ Błąd: ${error.message}`);
    }
}

main();
