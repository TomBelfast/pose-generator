// Sprawdzanie logów deploymentu z prawdziwym ID aplikacji
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '4|joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

// Prawdziwe ID z URL
const PROJECT_ID = 'zksk4gogw44sog8ww04wkwgg';
const ENVIRONMENT_ID = 'og0o8s4g0g4w8wgoss88soko';
const APPLICATION_ID = 'e0k88kocwoo8s44gg00osocg';
const DEPLOYMENT_ID = 'ds8ws4k8cko80cw88gkc4sww';

async function getDeploymentLogs() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/projects/${PROJECT_ID}/environments/${ENVIRONMENT_ID}/applications/${APPLICATION_ID}/deployments/${DEPLOYMENT_ID}/logs`,
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
                console.log(`\n📋 LOGI DEPLOYMENTU POSE-GENERATOR`);
                console.log(`===================================`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`URL: ${options.path}`);
                
                if (res.statusCode === 200) {
                    try {
                        const logs = JSON.parse(data);
                        console.log(`✅ Logi pobrane pomyślnie!`);
                        
                        if (Array.isArray(logs)) {
                            console.log(`   Liczba wpisów: ${logs.length}`);
                            console.log(`\n📝 OSTATNIE 25 WPISÓW Z LOGÓW DEPLOYMENTU:`);
                            console.log(`==========================================`);
                            
                            logs.slice(-25).forEach((log, index) => {
                                const timestamp = log.timestamp || log.time || log.createdAt || 'Brak czasu';
                                const message = log.message || log.content || log.text || log;
                                const level = log.level || log.severity || log.type || 'INFO';
                                
                                console.log(`\n${index + 1}. [${timestamp}] [${level}]`);
                                console.log(`   ${message}`);
                            });
                        } else {
                            console.log(`   Logi (raw): ${data.substring(0, 3000)}...`);
                        }
                        
                        resolve(logs);
                    } catch (error) {
                        console.log(`   Logi (raw): ${data.substring(0, 3000)}...`);
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

async function getApplicationDetails() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/projects/${PROJECT_ID}/environments/${ENVIRONMENT_ID}/applications/${APPLICATION_ID}`,
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
                console.log(`\n📊 SZCZEGÓŁY APLIKACJI POSE-GENERATOR`);
                console.log(`=====================================`);
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const app = JSON.parse(data);
                        console.log(`✅ Aplikacja znaleziona!`);
                        console.log(`   ID: ${app.id}`);
                        console.log(`   Nazwa: ${app.name}`);
                        console.log(`   Status: ${app.status}`);
                        console.log(`   Port: ${app.port}`);
                        console.log(`   Domena: ${app.domain || 'Brak'}`);
                        console.log(`   Repozytorium: ${app.repository || 'Brak'}`);
                        console.log(`   Branch: ${app.branch || 'Brak'}`);
                        console.log(`   Ostatnia aktualizacja: ${app.updatedAt}`);
                        console.log(`   URL: ${app.url || 'Brak'}`);
                        console.log(`   Typ: ${app.type || 'Brak'}`);
                        
                        if (app.environmentVariables) {
                            console.log(`   Zmienne środowiskowe: ${Object.keys(app.environmentVariables).length} ustawione`);
                            Object.keys(app.environmentVariables).forEach(key => {
                                const value = app.environmentVariables[key];
                                const maskedValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
                                console.log(`     ${key}: ${maskedValue}`);
                            });
                        }
                        
                        resolve(app);
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

async function getDeploymentDetails() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/projects/${PROJECT_ID}/environments/${ENVIRONMENT_ID}/applications/${APPLICATION_ID}/deployments/${DEPLOYMENT_ID}`,
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
                console.log(`\n🚀 SZCZEGÓŁY DEPLOYMENTU`);
                console.log(`=========================`);
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const deployment = JSON.parse(data);
                        console.log(`✅ Deployment znaleziony!`);
                        console.log(`   ID: ${deployment.id}`);
                        console.log(`   Status: ${deployment.status}`);
                        console.log(`   Data utworzenia: ${deployment.createdAt}`);
                        console.log(`   Data zakończenia: ${deployment.finishedAt || 'W trakcie'}`);
                        console.log(`   Czas trwania: ${deployment.duration || 'Nieznany'}`);
                        console.log(`   Typ: ${deployment.type || 'Brak'}`);
                        console.log(`   Commit: ${deployment.commit || 'Brak'}`);
                        console.log(`   Branch: ${deployment.branch || 'Brak'}`);
                        
                        resolve(deployment);
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
    console.log('🔍 SPRAWDZANIE LOGÓW DEPLOYMENTU POSE-GENERATOR');
    console.log('================================================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    console.log(`📦 Project ID: ${PROJECT_ID}`);
    console.log(`🌍 Environment ID: ${ENVIRONMENT_ID}`);
    console.log(`📱 Application ID: ${APPLICATION_ID}`);
    console.log(`🚀 Deployment ID: ${DEPLOYMENT_ID}`);
    
    try {
        // 1. Sprawdź szczegóły aplikacji
        console.log(`\n📊 Pobieranie szczegółów aplikacji...`);
        const app = await getApplicationDetails();
        
        // 2. Sprawdź szczegóły deploymentu
        console.log(`\n🚀 Pobieranie szczegółów deploymentu...`);
        const deployment = await getDeploymentDetails();
        
        // 3. Pobierz logi deploymentu
        console.log(`\n📋 Pobieranie logów deploymentu...`);
        const logs = await getDeploymentLogs();
        
        if (app) {
            console.log(`\n💡 ANALIZA APLIKACJI:`);
            console.log(`===================`);
            
            if (app.status === 'exited:unhealthy') {
                console.log(`❌ Aplikacja jest zatrzymana i niezdrowa`);
                console.log(`   - Sprawdź logi powyżej aby zobaczyć błędy`);
                console.log(`   - Sprawdź zmienne środowiskowe`);
                console.log(`   - Sprawdź konfigurację portu`);
            } else if (app.status === 'running:unhealthy') {
                console.log(`⚠️ Aplikacja działa ale jest niezdrowa`);
                console.log(`   - Sprawdź logi powyżej`);
                console.log(`   - Sprawdź health check`);
            } else if (app.status === 'running:healthy') {
                console.log(`✅ Aplikacja działa poprawnie!`);
            } else {
                console.log(`❓ Nieznany status: ${app.status}`);
            }
        }
        
        if (deployment) {
            console.log(`\n💡 ANALIZA DEPLOYMENTU:`);
            console.log(`======================`);
            
            if (deployment.status === 'failed') {
                console.log(`❌ Deployment nie powiódł się`);
                console.log(`   - Sprawdź logi powyżej`);
                console.log(`   - Sprawdź konfigurację`);
            } else if (deployment.status === 'success') {
                console.log(`✅ Deployment zakończony sukcesem`);
            } else if (deployment.status === 'running') {
                console.log(`🔄 Deployment w trakcie`);
            } else {
                console.log(`❓ Status deploymentu: ${deployment.status}`);
            }
        }
        
        console.log(`\n✅ SPRAWDZANIE ZAKOŃCZONE`);
        
    } catch (error) {
        console.log(`\n❌ Błąd: ${error.message}`);
    }
}

main();
