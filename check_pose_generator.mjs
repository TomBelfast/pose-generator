// Sprawdzanie szczegółów projektu pose-generator
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = 'joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';
const PROJECT_ID = 'tom-belfast/pose-generator:main-e0k88kocwoo8s44gg00osocg';

async function getProjectDetails(projectId) {
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
                console.log(`\n🔍 SZCZEGÓŁY PROJEKTU POSE-GENERATOR`);
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
                        console.log(`   Ostatnia aktualizacja: ${project.updatedAt}`);
                        console.log(`   URL: ${project.url || 'Brak'}`);
                        console.log(`   Typ: ${project.type}`);
                        console.log(`   Repozytorium: ${project.repository || 'Brak'}`);
                        console.log(`   Branch: ${project.branch || 'Brak'}`);
                        console.log(`   Dockerfile: ${project.dockerfile || 'Brak'}`);
                        console.log(`   Zmienne środowiskowe: ${project.environmentVariables ? 'Tak' : 'Nie'}`);
                        
                        if (project.environmentVariables) {
                            console.log(`   Lista zmiennych:`);
                            Object.keys(project.environmentVariables).forEach(key => {
                                const value = project.environmentVariables[key];
                                const maskedValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
                                console.log(`     ${key}: ${maskedValue}`);
                            });
                        }
                        
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

        req.on('error', (error) => {
            console.log(`❌ Błąd połączenia: ${error.message}`);
            reject(error);
        });

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
                console.log(`\n📋 LOGI PROJEKTU POSE-GENERATOR`);
                console.log(`=================================`);
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const logs = JSON.parse(data);
                        console.log(`✅ Logi pobrane!`);
                        if (Array.isArray(logs)) {
                            console.log(`   Liczba wpisów: ${logs.length}`);
                            logs.slice(-10).forEach((log, index) => {
                                console.log(`   ${index + 1}. ${log.timestamp || 'Brak czasu'}: ${log.message || log}`);
                            });
                        } else {
                            console.log(`   Logi: ${data.substring(0, 500)}...`);
                        }
                        resolve(logs);
                    } catch (error) {
                        console.log(`   Logi (raw): ${data.substring(0, 1000)}...`);
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
                console.log(`\n🔄 RESTART PROJEKTU POSE-GENERATOR`);
                console.log(`===================================`);
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    console.log(`✅ Projekt zrestartowany pomyślnie!`);
                    console.log(`Odpowiedź: ${data}`);
                } else {
                    console.log(`❌ Błąd restartu: ${data}`);
                }
                
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Błąd połączenia: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

async function main() {
    console.log('🚀 DIAGNOZA PROJEKTU POSE-GENERATOR');
    console.log('====================================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    console.log(`📦 Projekt: ${PROJECT_ID}`);
    
    try {
        // 1. Pobierz szczegóły projektu
        const project = await getProjectDetails(PROJECT_ID);
        
        // 2. Pobierz logi
        await getProjectLogs(PROJECT_ID);
        
        // 3. Zrestartuj projekt
        console.log(`\n🔄 Próba restartu projektu...`);
        await restartProject(PROJECT_ID);
        
        console.log(`\n✅ DIAGNOZA ZAKOŃCZONA`);
        console.log(`💡 Sprawdź status projektu w interfejsie Coolify`);
        
    } catch (error) {
        console.log(`\n❌ Błąd podczas diagnozy: ${error.message}`);
    }
}

main();
