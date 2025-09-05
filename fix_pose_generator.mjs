// Naprawa projektu pose-generator
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

async function createNewProject() {
    return new Promise((resolve, reject) => {
        const projectData = {
            name: 'pose-generator',
            repository: 'https://github.com/tom-belfast/pose-generator', // Zastąp swoim repozytorium
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
                console.log(`\n🆕 TWORZENIE NOWEGO PROJEKTU POSE-GENERATOR`);
                console.log(`============================================`);
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 201 || res.statusCode === 200) {
                    console.log(`✅ Projekt utworzony pomyślnie!`);
                    console.log(`Odpowiedź: ${data}`);
                } else {
                    console.log(`❌ Błąd tworzenia: ${data}`);
                }
                
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify(projectData));
        req.end();
    });
}

async function main() {
    console.log('🚀 NAPRAWA PROJEKTU POSE-GENERATOR');
    console.log('===================================');
    console.log(`🌐 Serwer: ${COOLIFY_URL}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...`);
    
    try {
        // 1. Sprawdź wszystkie projekty
        console.log(`\n📋 Sprawdzanie istniejących projektów...`);
        const projects = await getAllProjects();
        
        console.log(`\n📊 ZNALEZIONE PROJEKTY:`);
        projects.forEach((project, index) => {
            console.log(`${index + 1}. ${project.name || 'Bez nazwy'}`);
            console.log(`   ID: ${project.id}`);
            console.log(`   Status: ${project.status}`);
            console.log(`   Port: ${project.port}`);
            console.log(`   Repozytorium: ${project.repository || 'Brak'}`);
            console.log('');
        });
        
        // 2. Znajdź pose-generator
        const poseGenerator = projects.find(p => 
            p.name && p.name.includes('pose-generator') ||
            p.repository && p.repository.includes('pose-generator')
        );
        
        if (poseGenerator) {
            console.log(`✅ Znaleziono projekt pose-generator!`);
            console.log(`   ID: ${poseGenerator.id}`);
            console.log(`   Status: ${poseGenerator.status}`);
            console.log(`   Port: ${poseGenerator.port}`);
            
            if (poseGenerator.status === 'exited:unhealthy') {
                console.log(`\n💡 PROJEKT JEST ZATRZYMANY - potrzebujesz go zrestartować w interfejsie Coolify`);
            }
        } else {
            console.log(`❌ Nie znaleziono projektu pose-generator`);
            console.log(`\n💡 ROZWIĄZANIA:`);
            console.log(`1. Sprawdź interfejs Coolify - projekt może mieć inną nazwę`);
            console.log(`2. Utwórz nowy projekt z repozytorium pose-generator`);
            console.log(`3. Skonfiguruj zmienne środowiskowe`);
        }
        
        console.log(`\n✅ SPRAWDZANIE ZAKOŃCZONE`);
        
    } catch (error) {
        console.log(`\n❌ Błąd: ${error.message}`);
    }
}

main();
