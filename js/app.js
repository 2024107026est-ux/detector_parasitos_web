
const MODEL_PATH = 'modelo/model.json';
let aiModel = null;
let modelLoaded = false;
let usingSimulation = false;

const CLASSES = {
    0: 'Ascaris',
    1: 'Giardia', 
    2: 'Hookworm',
    3: 'Trichuris',
    4: 'Negative'
};

async function initApp() {
    console.log("🧪 Iniciando Detector de Parásitos - Modo Gótico");
    try {
        await loadAIModel();
        setupEventListeners();
        updateUIStatus('ready');
    } catch (error) {
        console.error('Error:', error);
        enableSimulationMode();
    }
}

async function loadAIModel() {
    console.log("🔄 Cargando modelo de IA...");
    updateUIStatus('loading');
    
    try {
        if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js no disponible');
        }
        
        const response = await fetch(MODEL_PATH);
        if (!response.ok) throw new Error('No se puede acceder al modelo');
        
        aiModel = await tf.loadLayersModel(MODEL_PATH, {
            onProgress: (fraction) => {
                const percent = Math.round(fraction * 100);
                updateUIStatus('loading', percent + '%');
            }
        });
        
        console.log("✅ Modelo cargado exitosamente");
        console.log("📐 Input shape:", aiModel.inputs[0].shape);
        
        await warmUpModel();
        modelLoaded = true;
        usingSimulation = false;
        updateUIStatus('ready');
        
    } catch (error) {
        console.error('❌ Error cargando modelo:', error);
        await enableSimulationMode();
    }
}

async function warmUpModel() {
    try {
        console.log("🔥 Precalentando modelo...");
        const warmUpTensor = tf.zeros([1, 224, 224, 3]);
        const prediction = await aiModel.predict(warmUpTensor);
        warmUpTensor.dispose();
        prediction.dispose();
        console.log("✅ Precalentamiento completado");
    } catch (error) {
        console.warn("⚠️ Error en precalentamiento:", error);
    }
}

async function enableSimulationMode() {
    console.warn("🎭 Activando modo simulación");
    modelLoaded = false;
    usingSimulation = true;
    updateUIStatus('simulation');
}

async function processImage(imageFile) {
    if (!modelLoaded && !usingSimulation) return;
    
    console.log("🖼️ Procesando imagen:", imageFile.name);
    updateUIStatus('processing');
    
    try {
        let results;
        if (usingSimulation) {
            results = await simulatePrediction();
        } else {
            results = await predictWithAI(imageFile);
        }
        displayResults(results);
        updateUIStatus('ready');
    } catch (error) {
        console.error('❌ Error procesando imagen:', error);
        updateUIStatus('error');
    }
}

async function predictWithAI(imageFile) {
    console.log("🤖 Realizando análisis con IA...");
    const imageTensor = await loadAndProcessImage(imageFile);
    
    try {
        const prediction = aiModel.predict(imageTensor);
        const results = await prediction.data();
        const processedResults = processPredictionResults(results);
        imageTensor.dispose();
        prediction.dispose();
        return processedResults;
    } catch (error) {
        imageTensor.dispose();
        throw error;
    }
}

async function loadAndProcessImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const img = new Image();
            img.onload = async function() {
                let tensor = tf.browser.fromPixels(img)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .expandDims(0)
                    .div(255.0);
                resolve(tensor);
            };
            img.onerror = () => reject(new Error('Error cargando imagen'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Error leyendo archivo'));
        reader.readAsDataURL(file);
    });
}

function processPredictionResults(results) {
    const scores = Array.from(results);
    const maxScore = Math.max(...scores);
    const predictedClass = scores.indexOf(maxScore);
    
    return {
        predictedClass: predictedClass,
        className: CLASSES[predictedClass],
        confidence: (maxScore * 100).toFixed(2),
        scores: scores,
        timestamp: new Date().toLocaleString()
    };
}

async function simulatePrediction() {
    console.log("🎭 Simulando predicción...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const randomScores = Array(5).fill(0).map(() => Math.random());
    const total = randomScores.reduce((a, b) => a + b, 0);
    const normalizedScores = randomScores.map(score => score / total);
    const maxScore = Math.max(...normalizedScores);
    const predictedClass = normalizedScores.indexOf(maxScore);
    
    return {
        predictedClass: predictedClass,
        className: CLASSES[predictedClass],
        confidence: (maxScore * 100).toFixed(2),
        scores: normalizedScores,
        timestamp: new Date().toLocaleString(),
        simulation: true
    };
}

function displayResults(results) {
    console.log("📊 Mostrando resultados:", results);
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    const confidenceColor = results.confidence > 80 ? '#00ff00' : 
                           results.confidence > 60 ? '#daa520' : '#dc143c';
    
    let html = '<div class="result-card">';
    html += '<h3>🔍 RESULTADO DEL ANÁLISIS</h3>';
    html += '<div class="prediction">🎯 <strong>Parásito Detectado:</strong> ' + results.className + '</div>';
    html += '<div class="confidence" style="color: ' + confidenceColor + '">';
    html += '📈 <strong>Nivel de Confianza:</strong> ' + results.confidence + '%</div>';
    
    if (results.simulation) {
        html += '<div class="simulation-warning">⚠️ MODO SIMULACIÓN - DATOS DE PRUEBA</div>';
    }
    
    html += '<div class="timestamp">🕐 Análisis realizado: ' + results.timestamp + '</div>';
    html += '</div>';
    
    resultsDiv.innerHTML = html;
}

function updateUIStatus(status, data = null) {
    const statusElement = document.getElementById('model-status');
    if (!statusElement) return;
    
    const messages = {
        'loading': '🔄 ' + (data || 'Cargando modelo de IA...'),
        'ready': '✅ SISTEMA LISTO - Sube una muestra para analizar',
        'simulation': '🎭 MODO SIMULACIÓN ACTIVADO - Usando datos de prueba',
        'processing': '🔬 Analizando muestra...',
        'error': '❌ ERROR - Revisa la consola para detalles'
    };
    
    statusElement.textContent = messages[status] || 'Estado desconocido';
    statusElement.className = 'model-status status-' + status;
}

function setupEventListeners() {
    const uploadInput = document.getElementById('image-upload');
    const uploadArea = document.getElementById('upload-area');
    
    if (uploadInput && uploadArea) {
        uploadInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                processImage(e.target.files[0]);
            }
        });
        
        uploadArea.addEventListener('click', () => uploadInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                processImage(e.dataTransfer.files[0]);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initApp);

window.detectorApp = {
    loadAIModel,
    processImage,
    enableSimulationMode,
    usingSimulation: () => usingSimulation,
    modelLoaded: () => modelLoaded
};
