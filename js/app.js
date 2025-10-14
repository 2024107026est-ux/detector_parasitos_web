// ===== IA REAL INTEGRADA - TENSORFLOW.JS =====

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

// VARIABLES GLOBALES
let model = null;
let currentImage = null;
let isAnalyzing = false;

// ELEMENTOS DEL DOM
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
    description: document.getElementById('description')
};

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Detector de Parásitos - IA Real Inicializado');
    initializeApp();
});

async function initializeApp() {
    setupEventListeners();
    displayParasitesInfo();
}

// CONFIGURAR EVENTOS
function setupEventListeners() {
    if (elements.uploadArea) {
        elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
        elements.fileInput.addEventListener('change', handleFileSelect);
        elements.analyzeBtn.addEventListener('click', analyzeImage);
        
        // Drag and drop
        elements.uploadArea.addEventListener('dragover', handleDragOver);
        elements.uploadArea.addEventListener('drop', handleDrop);
    }
}

// MANEJAR SELECCIÓN DE ARCHIVO
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
        processFile(file);
    }
}

// VALIDAR ARCHIVO
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

// PROCESAR ARCHIVO
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
    if (document.getElementById('imageName')) {
        document.getElementById('imageName').textContent = 'Nombre: ' + file.name;
    }
    if (document.getElementById('imageSize')) {
        document.getElementById('imageSize').textContent = 'Tamaño: ' + sizeInMB + ' MB';
    }
}

// DRAG AND DROP
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

// CARGAR MODELO DE IA REAL
async function loadModel() {
    if (model) {
        console.log('✅ Modelo ya cargado');
        return model;
    }
    
    console.log('🔄 Cargando modelo de IA real...');
    showLoading('Cargando modelo de inteligencia artificial...');
    
    try {
        model = await tf.loadLayersModel(CONFIG.modelPath);
        console.log('✅ Modelo de IA real cargado exitosamente');
        hideLoading();
        return model;
    } catch (error) {
        console.error('❌ Error cargando modelo:', error);
        showError('No se pudo cargar el modelo de IA. Usando modo simulación.');
        return null;
    }
}

// ANÁLISIS CON IA REAL
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
        // Cargar modelo si no está cargado
        const loadedModel = await loadModel();
        
        if (loadedModel) {
            // ANÁLISIS CON IA REAL
            console.log('🎯 Iniciando análisis con IA real...');
            const results = await analyzeWithAI(loadedModel);
            displayRealResults(results);
        } else {
            // FALLBACK: Análisis simulado
            console.log('🔄 Usando análisis simulado');
            await simulateAnalysis();
        }
        
    } catch (error) {
        console.error('❌ Error en análisis:', error);
        showError('Error en el análisis: ' + error.message);
    } finally {
        isAnalyzing = false;
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.textContent = '🧠 Analizar con IA';
    }
}

// ANÁLISIS CON IA REAL
async function analyzeWithAI(model) {
    showLoading('Procesando imagen con IA...');
    
    // Convertir imagen a tensor
    const tensor = tf.browser.fromPixels(elements.previewImage)
        .resizeNearestNeighbor([CONFIG.imageSize, CONFIG.imageSize])
        .toFloat()
        .div(255.0)
        .expandDims();
    
    console.log('📊 Tensor shape:', tensor.shape);
    
    // Hacer predicción
    showLoading('Ejecutando modelo de IA...');
    const prediction = model.predict(tensor);
    const results = await prediction.data();
    
    // Liberar memoria
    tensor.dispose();
    prediction.dispose();
    
    console.log('📈 Resultados brutos:', Array.from(results));
    
    // Procesar resultados
    return processAIPrediction(results);
}

// PROCESAR PREDICCIÓN DE IA
function processAIPrediction(predictionArray) {
    const results = CONFIG.classes.map((parasite, index) => ({
        ...parasite,
        confidence: Math.round(predictionArray[index] * 100)
    })).sort((a, b) => b.confidence - a.confidence);
    
    console.log('🎯 Resultados procesados:', results);
    return results;
}

// ANÁLISIS SIMULADO (FALLBACK)
async function simulateAnalysis() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * CONFIG.classes.length);
            const randomConfidence = Math.floor(Math.random() * 25) + 75;
            
            resolve([{
                ...CONFIG.classes[randomIndex],
                confidence: randomConfidence
            }]);
        }, 3000);
    });
}

// MOSTRAR RESULTADOS REALES
function displayRealResults(results) {
    elements.loading.style.display = 'none';
    elements.results.style.display = 'block';
    
    const bestResult = results[0];
    
    // Resultado principal
    elements.resultTitle.textContent = bestResult.displayName + ' Detectado';
    animateConfidenceBar(bestResult.confidence);
    
    // Descripción detallada
    elements.description.innerHTML = `
        <div class="result-details">
            <h4>📋 Información del Parásito</h4>
            <p><strong>Descripción:</strong> ${bestResult.description}</p>
            <p><strong>Síntomas comunes:</strong> ${bestResult.sintomas}</p>
            <p><strong>Tratamiento sugerido:</strong> ${bestResult.tratamiento}</p>
            <p><strong>Confianza del análisis:</strong> ${bestResult.confidence}%</p>
            
            <div class="medical-note">
                <small>💡 Nota: Este análisis utiliza IA real entrenada con imágenes de parásitos. Consulte con un profesional médico para diagnóstico preciso.</small>
            </div>
        </div>
    `;
}

// ANIMACIÓN DE BARRA DE CONFIANZA
function animateConfidenceBar(confidence) {
    let currentWidth = 0;
    const targetWidth = Math.min(confidence, 100);
    
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
        
        setTimeout(animate, 20);
    };
    
    animate();
}

// MOSTRAR INFORMACIÓN DE PARÁSITOS
function displayParasitesInfo() {
    const parasitesGrid = document.getElementById('parasitesGrid');
    if (!parasitesGrid) return;
    
    parasitesGrid.innerHTML = CONFIG.classes.map(parasite => `
        <div class="parasite-card">
            <div class="parasite-icon">🦠</div>
            <h3>${parasite.displayName}</h3>
            <p>${parasite.description}</p>
        </div>
    `).join('');
}

// MANEJO DE ERRORES
function showError(message) {
    alert('⚠️ ' + message);
}

// FUNCIONES DE LOADING
function showLoading(message) {
    if (elements.loading) {
        elements.loading.style.display = 'block';
        const p = elements.loading.querySelector('p');
        if (p) p.textContent = message;
    }
}

function hideLoading() {
    if (elements.loading) {
        elements.loading.style.display = 'none';
    }
}

console.log('✅ IA Real integrada - Lista para usar');
