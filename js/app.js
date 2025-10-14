// ===== CÓDIGO OPTIMIZADO - CARGA RÁPIDA =====

// CONFIGURACIÓN MEJORADA
const CONFIG = {
    modelPath: 'modelo/model.json',
    imageSize: 224,
    classes: [
        { 
            name: 'ascaris', 
            displayName: 'Ascaris lumbricoides', 
            description: 'Gusano redondo grande - uno de los parásitos intestinales más comunes en humanos',
            sintomas: 'Dolor abdominal, náuseas, vómitos, diarrea, pérdida de peso',
            tratamiento: 'Albendazol o Mebendazol'
        },
        { 
            name: 'trichuris', 
            displayName: 'Trichuris trichiura', 
            description: 'Gusano con forma de látigo - causa tricuriasis',
            sintomas: 'Diarrea con moco y sangre, dolor abdominal, anemia',
            tratamiento: 'Albendazol o Mebendazol'
        },
        { 
            name: 'giardia', 
            displayName: 'Giardia lamblia', 
            description: 'Protozoo flagelado - causa giardiasis',
            sintomas: 'Diarrea acuosa, calambres abdominales, flatulencia',
            tratamiento: 'Metronidazol o Tinidazol'
        },
        { 
            name: 'entamoeba', 
            displayName: 'Entamoeba histolytica', 
            description: 'Protozoo que causa amebiasis intestinal',
            sintomas: 'Diarrea con sangre, dolor abdominal, fiebre',
            tratamiento: 'Metronidazol seguido de Paromomicina'
        },
        { 
            name: 'hymenolepis', 
            displayName: 'Hymenolepis nana', 
            description: 'Tenia enana - la tenia más común en humanos',
            sintomas: 'Dolor abdominal, diarrea, pérdida de apetito',
            tratamiento: 'Praziquantel'
        }
    ]
};

// VARIABLES GLOBALES OPTIMIZADAS
let model = null;
let currentImage = null;
let isAnalyzing = false;

// ELEMENTOS DEL DOM - CACHEADOS PARA RAPIDEZ
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    previewSection: document.getElementById('previewSection'),
    previewImage: document.getElementById('previewImage'),
    resultsSection: document.getElementById('resultsSection'),
    loading: document.getElementById('loading'),
    results: document.getElementById('results'),
    resultTitle: document.getElementById('resultTitle'),
    confidenceFill: document.getElementById('confidenceFill'),
    confidenceText: document.getElementById('confidenceText'),
    description: document.getElementById('description'),
    parasitesGrid: document.getElementById('parasitesGrid')
};

// INICIALIZACIÓN MEJORADA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Detector de Parásitos - IA Inicializado');
    initializeApp();
});

async function initializeApp() {
    setupEventListeners();
    displayParasitesInfo();
    preloadResources();
}

// CONFIGURAR EVENTOS DE FORMA OPTIMIZADA
function setupEventListeners() {
    // Evento único para el área de subida
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    
    // Evento optimizado para selección de archivos
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Evento para el botón de análisis
    elements.analyzeBtn.addEventListener('click', analyzeImage);
    
    // Soporte para drag and drop
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('drop', handleDrop);
}

// MANEJO DE ARCHIVOS MEJORADO
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
        processFile(file);
    }
}

// VALIDACIÓN DE ARCHIVO
function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
        showError('Formato no válido. Usa JPG, JPEG o PNG.');
        return false;
    }
    
    if (file.size > maxSize) {
        showError('Imagen muy grande. Máximo 10MB.');
        return false;
    }
    
    return true;
}

// PROCESAMIENTO DE ARCHIVO OPTIMIZADO
function processFile(file) {
    currentImage = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        elements.previewImage.src = e.target.result;
        elements.previewSection.style.display = 'block';
        elements.analyzeBtn.disabled = false;
        
        // Mostrar información del archivo
        updateFileInfo(file);
    };
    reader.readAsDataURL(file);
}

// ACTUALIZAR INFORMACIÓN DEL ARCHIVO
function updateFileInfo(file) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    document.getElementById('imageName').textContent = 'Nombre: ' + file.name;
    document.getElementById('imageSize').textContent = 'Tamaño: ' + sizeInMB + ' MB';
}

// SOPORTE DRAG AND DROP
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.style.borderColor = '#3498db';
    elements.uploadArea.style.background = '#e8f4fd';
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.style.borderColor = '#ddd';
    elements.uploadArea.style.background = '#fafafa';
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
        elements.fileInput.files = e.dataTransfer.files;
        processFile(file);
    }
}

// ANÁLISIS OPTIMIZADO CON FEEDBACK MEJORADO
async function analyzeImage() {
    if (!currentImage || isAnalyzing) return;
    
    isAnalyzing = true;
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.textContent = '🔍 Analizando...';
    
    // Mostrar sección de resultados
    elements.resultsSection.style.display = 'block';
    elements.loading.style.display = 'block';
    elements.results.style.display = 'none';
    
    try {
        // Simular carga del modelo (en producción sería TensorFlow.js)
        await simulateModelLoad();
        
        // Simular análisis de imagen
        const analysisResult = await simulateImageAnalysis();
        
        // Mostrar resultados
        displayResults(analysisResult);
        
    } catch (error) {
        showError('Error en el análisis: ' + error.message);
    } finally {
        isAnalyzing = false;
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.textContent = '🧠 Analizar con IA';
    }
}

// SIMULACIÓN DE CARGA DE MODELO (OPTIMIZADA)
async function simulateModelLoad() {
    return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            elements.loading.querySelector('p').textContent = 
                'Cargando modelo de IA... ' + progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                resolve();
            }
        }, 200);
    });
}

// SIMULACIÓN DE ANÁLISIS DE IMAGEN
async function simulateImageAnalysis() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Resultado aleatorio pero realista
            const randomIndex = Math.floor(Math.random() * CONFIG.classes.length);
            const randomConfidence = Math.floor(Math.random() * 25) + 75; // 75-100%
            
            resolve({
                parasite: CONFIG.classes[randomIndex],
                confidence: randomConfidence,
                allPredictions: CONFIG.classes.map((p, index) => ({
                    ...p,
                    confidence: index === randomIndex ? randomConfidence : Math.floor(Math.random() * 30)
                })).sort((a, b) => b.confidence - a.confidence)
            });
        }, 3000);
    });
}

// MOSTRAR RESULTADOS DE FORMA ELEGANTE
function displayResults(analysisResult) {
    elements.loading.style.display = 'none';
    elements.results.style.display = 'block';
    
    const { parasite, confidence, allPredictions } = analysisResult;
    
    // Resultado principal
    elements.resultTitle.textContent = parasite.displayName + ' Detectado';
    animateConfidenceBar(confidence);
    
    // Descripción detallada
    elements.description.innerHTML = `
        <div class="result-details">
            <h4>📋 Información del Parásito</h4>
            <p><strong>Descripción:</strong> ${parasite.description}</p>
            <p><strong>Síntomas comunes:</strong> ${parasite.sintomas}</p>
            <p><strong>Tratamiento sugerido:</strong> ${parasite.tratamiento}</p>
            <p><strong>Confianza del análisis:</strong> ${confidence}%</p>
            <div class="medical-note">
                <small>💡 Nota: Esta es una demostración. Consulte con un profesional médico para diagnóstico preciso.</small>
            </div>
        </div>
    `;
}

// ANIMACIÓN DE BARRA DE CONFIANZA MEJORADA
function animateConfidenceBar(confidence) {
    let currentWidth = 0;
    const targetWidth = Math.min(confidence, 100);
    const animationSpeed = 20;
    
    const animate = () => {
        if (currentWidth >= targetWidth) return;
        
        currentWidth += 1;
        elements.confidenceFill.style.width = currentWidth + '%';
        elements.confidenceText.textContent = currentWidth + '%';
        
        // Cambiar color según confianza
        if (currentWidth < 70) {
            elements.confidenceFill.style.background = '#e74c3c';
        } else if (currentWidth < 85) {
            elements.confidenceFill.style.background = '#f39c12';
        } else {
            elements.confidenceFill.style.background = '#27ae60';
        }
        
        setTimeout(animate, animationSpeed);
    };
    
    animate();
}

// MOSTRAR INFORMACIÓN DE PARÁSITOS
function displayParasitesInfo() {
    if (!elements.parasitesGrid) return;
    
    elements.parasitesGrid.innerHTML = CONFIG.classes.map(parasite => `
        <div class="parasite-card">
            <div class="parasite-icon">🦠</div>
            <h3>${parasite.displayName}</h3>
            <p>${parasite.description}</p>
            <div class="parasite-details">
                <small><strong>Síntomas:</strong> ${parasite.sintomas.split(', ').slice(0, 2).join(', ')}...</small>
            </div>
        </div>
    `).join('');
}

// MANEJO DE ERRORES MEJORADO
function showError(message) {
    // Crear o reutilizar elemento de error
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: none;
        `;
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.textContent = '⚠️ ' + message;
    errorDiv.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// PRE-CARGA DE RECURSOS
function preloadResources() {
    console.log('📦 Pre-cargando recursos...');
    // Aquí podrías pre-cargar el modelo TensorFlow.js
}

// EXPORTAR FUNCIONES PARA DEBUGGING
window.appDebug = {
    config: CONFIG,
    elements: elements,
    currentImage: () => currentImage,
    simulateAnalysis: analyzeImage
};

console.log('✅ JavaScript optimizado cargado - Versión Mejorada');
