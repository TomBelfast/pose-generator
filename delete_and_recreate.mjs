// Usuwanie starego projektu i tworzenie nowego
import https from 'https';

const COOLIFY_URL = 'https://host.aihub.ovh';
const TOKEN = '4|joQbgiXZvKTPXBNqiYoJDcwKv4zrC43GCJdOchrY69e140f1';

async function deleteProject(projectId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: `/api/v1/applications/${projectId}`,
            method: 'DELETE',
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
                console.log(`\n🗑️ USUWANIE STAREGO PROJEKTU`);
                console.log(`==============================`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Odpowiedź: ${data}`);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function createNewProject() {
    return new Promise((resolve, reject) => {
        const projectData = {
            name: 'pose-generator',
            repository: 'https://github.com/TomBelfast/pose-generator.git',
            branch: 'main',
            dockerfile: './Dockerfile',
            port: 4999,
            environmentVariables: {
                'VITE_GEMINI_API_KEY': 'your_gemini_api_key_here',
                'VITE_CLERK_PUBLISHABLE_KEY': 'pk_live_your_clerk_key_here',
                'DATABASE_URL': 'file:/app/data/production.db',
                'NODE_ENV': 'production',
                'PORT': '4999'
            }
        };

        const options = {
            hostname: 'host.aihub.ovh',
            port: 443,
            path: '/api/v1/applications',
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
                console.log(`\n🆕 TWORZENIE NOWEGO PROJEKTU`);
                console.log(`=============================`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Odpowiedź: ${data}`);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify(projectData));
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
    console.log('🚀 USUWANIE I TWORZENIE NOWEGO PROJEKTU POSE-GENERATOR');
    console.log('======================================================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    
    try {
        // 1. Sprawdź istniejące projekty
        console.log(`\n📋 Sprawdzanie istniejących projektów...`);
        const projects = await getAllProjects();
        
        const poseGenerator = projects.find(p => p && p.includes && p.includes('pose-generator'));
        if (poseGenerator) {
            console.log(`✅ Znaleziono stary projekt: ${poseGenerator}`);
            
            // 2. Usuń stary projekt
            console.log(`\n🗑️ Usuwanie starego projektu...`);
            await deleteProject(poseGenerator);
        } else {
            console.log(`ℹ️ Nie znaleziono starego projektu pose-generator`);
        }
        
        // 3. Utwórz nowy projekt
        console.log(`\n🆕 Tworzenie nowego projektu...`);
        await createNewProject();
        
        // 4. Sprawdź nowe projekty
        console.log(`\n📋 Sprawdzanie nowych projektów...`);
        const newProjects = await getAllProjects();
        console.log(`\n📊 LISTA PROJEKTÓW PO OPERACJI:`);
        newProjects.forEach((project, index) => {
            console.log(`${index + 1}. ${project}`);
        });
        
        console.log(`\n✅ OPERACJA ZAKOŃCZONA`);
        console.log(`\n💡 NASTĘPNE KROKI:`);
        console.log(`1. Sprawdź nowy projekt w interfejsie Coolify`);
        console.log(`2. Skonfiguruj zmienne środowiskowe (klucze API)`);
        console.log(`3. Uruchom projekt`);
        console.log(`4. Sprawdź logi podczas uruchamiania`);
        
    } catch (error) {
        console.log(`\n❌ Błąd: ${error.message}`);
        console.log(`\n💡 POSSIBLE SOLUTIONS:`);
        console.log(`1. Sprawdź czy masz uprawnienia do usuwania/tworzenia projektów`);
        console.log(`2. Usuń projekt ręcznie w interfejsie Coolify`);
        console.log(`3. Utwórz nowy projekt ręcznie`);
    }
}

main();
