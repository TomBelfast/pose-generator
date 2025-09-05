// Skrypt do sprawdzania projektów w Coolify
// Uruchom: node check_coolify_projects.js

const https = require('https');

const COOLIFY_URL = 'https://host.aihub.ovh';
const EMAIL = 'aiwbiznesiepl@gmail.com';
const PASSWORD = 'Swiat1976@#$';

async function loginToCoolify() {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({
            identity: EMAIL,
            secret: PASSWORD
        });

        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: '/api/tokens',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.token) {
                        console.log('✅ Zalogowano pomyślnie do Coolify');
                        resolve(response.token);
                    } else {
                        console.log('❌ Błąd logowania:', response);
                        reject(new Error('Nie udało się zalogować'));
                    }
                } catch (error) {
                    console.log('❌ Błąd parsowania odpowiedzi:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Błąd połączenia:', error);
            reject(error);
        });

        req.write(loginData);
        req.end();
    });
}

async function getProjects(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: '/api/applications',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const projects = JSON.parse(data);
                    console.log('📋 Lista projektów:');
                    console.log('==================');
                    
                    if (projects.length === 0) {
                        console.log('❌ Brak projektów na serwerze');
                        return;
                    }

                    projects.forEach((project, index) => {
                        console.log(`\n${index + 1}. ${project.name || 'Bez nazwy'}`);
                        console.log(`   ID: ${project.id}`);
                        console.log(`   Status: ${project.status || 'Nieznany'}`);
                        console.log(`   Port: ${project.port || 'Nie ustawiony'}`);
                        console.log(`   Domena: ${project.domain || 'Brak'}`);
                        console.log(`   Ostatnia aktualizacja: ${project.updatedAt || 'Nieznana'}`);
                        console.log(`   URL: ${project.url || 'Brak'}`);
                    });

                    resolve(projects);
                } catch (error) {
                    console.log('❌ Błąd parsowania listy projektów:', error);
                    console.log('Odpowiedź serwera:', data);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Błąd pobierania projektów:', error);
            reject(error);
        });

        req.end();
    });
}

async function main() {
    try {
        console.log('🚀 Sprawdzanie projektów w Coolify...');
        console.log('=====================================');
        
        const token = await loginToCoolify();
        const projects = await getProjects(token);
        
        console.log('\n✅ Sprawdzanie zakończone pomyślnie');
        console.log(`📊 Znaleziono ${projects.length} projektów`);
        
    } catch (error) {
        console.log('\n❌ Błąd podczas sprawdzania projektów:', error.message);
        console.log('\n💡 Sprawdź:');
        console.log('   - Czy serwer Coolify jest dostępny');
        console.log('   - Czy dane logowania są poprawne');
        console.log('   - Czy masz połączenie z internetem');
    }
}

// Uruchom skrypt
main();
