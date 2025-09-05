// Skrypt do sprawdzania projektów w Coolify z tokenem
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '3|361AxU45vtYXcGHRGwnwWkwGJ9G4WrjAiKsSeT3Y299800c9';

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
                    console.log('📋 LISTA PROJEKTÓW W COOLIFY');
                    console.log('============================');
                    
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
                        console.log(`   Typ: ${project.type || 'Nieznany'}`);
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

async function getResources(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: '/api/resources',
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
                    const resources = JSON.parse(data);
                    console.log('\n🔧 ZASOBY SYSTEMOWE');
                    console.log('==================');
                    
                    if (resources.length === 0) {
                        console.log('❌ Brak zasobów systemowych');
                        return;
                    }

                    resources.forEach((resource, index) => {
                        console.log(`\n${index + 1}. ${resource.name || 'Bez nazwy'}`);
                        console.log(`   ID: ${resource.id}`);
                        console.log(`   Status: ${resource.status || 'Nieznany'}`);
                        console.log(`   Typ: ${resource.type || 'Nieznany'}`);
                        console.log(`   Port: ${resource.port || 'Nie ustawiony'}`);
                    });

                    resolve(resources);
                } catch (error) {
                    console.log('❌ Błąd parsowania zasobów:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Błąd pobierania zasobów:', error);
            reject(error);
        });

        req.end();
    });
}

async function main() {
    try {
        console.log('🚀 SPRAWDZANIE PROJEKTÓW W COOLIFY');
        console.log('==================================');
        console.log(`🌐 Serwer: ${COOLIFY_URL}`);
        console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
        
        const projects = await getProjects(TOKEN);
        const resources = await getResources(TOKEN);
        
        console.log('\n✅ SPRAWDZANIE ZAKOŃCZONE');
        console.log(`📊 Znaleziono ${projects.length} projektów`);
        console.log(`🔧 Znaleziono ${resources.length} zasobów systemowych`);
        
    } catch (error) {
        console.log('\n❌ Błąd podczas sprawdzania:', error.message);
    }
}

// Uruchom skrypt
main();
