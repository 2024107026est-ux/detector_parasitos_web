
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
    console.log("🧪 Iniciando Detector de Parásitos - Diagnóstico Mejorado");
    showConsoleInfo();
    await loadAIModel();
    setupEventListeners();
}

function showConsoleInfo() {
    console.log("🔍 INFORMACIÓN DEL SISTEMA:");
    console.log("🌐 URL:", window.location.href);
    console.log("🖥️ UserAgent:", navigator.userAgent);
    console.log("🔧 TensorFlow.js disponible:", typeof tf !== 'undefined');
    if (typeof tf !== 'undefined') {
        console.log("📦 Versión TF.js:", tf.version.tfjs);
        console.log("⚙️ Backend:", tf.getBackend());
    }
}

async function loadAIModel() {
    console.log("🔄 CARGANDO MODELO DE IA...");
    updateUIStatus('loading', '0%');
    
    try {
        // 1. Verificar TensorFlow.js
        if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js no está cargado. Revisa la conexión a internet.');
        }
        console.log("✅ TensorFlow.js cargado");
        
        // 2. Verificar que el modelo existe
        console.log("🔍 Verificando acceso al modelo...");
        const modelUrl = window.location.origin + '/' + MODEL_PATH;
        console.log("📡 URL del modelo:", modelUrl);
        
        const response = await fetch(MODEL_PATH);
        if (!response.ok) {
            throw new Error(`No se puede acceder al modelo. Error HTTP: ${response.status}`);
        }
        console.log("✅ Modelo accesible via HTTP");
        
        // 3. Cargar modelo
        console.log("📥 Cargando modelo con tf.loadLayersModel...");
        aiModel = await tf.loadLayersModel(MODEL_PATH, {
            onProgress: (fraction) => {
                const percent = Math.round(fraction * 100);
                console.log(`📊 Progreso carga: ${percent}%`);
                updateUIStatus('loading', percent + '%');
            }
        });
        
        console.log("🎉 MODELO CARGADO EXITOSAMENTE");
        console.log("📐 Inputs:", aiModel.inputs);
        console.log("📤 Outputs:", aiModel.outputs);
        console.log("🔢 Número de inputs:", aiModel.inputs.length);
        console.log("🔢 Número de outputs:", aiModel.outputs.length);
        
        if (aiModel.inputs && aiModel.inputs[0]) {
            console.log("📏 Input shape:", aiModel.inputs[0].shape);
        }
        
        // 4. Precalentar modelo
        await warmUpModel();
        
        // 5. Marcar como cargado
        modelLoaded = true;
        usingSimulation = false;
        console.log("🚀 SISTEMA DE IA LISTO PARA USAR");
        updateUIStatus('ready');
        
    } catch (error) {
        console.error('💥 ERROR CRÍTICO AL CARGAR MODELO:', error);
        console.log("🔄 Activando modo simulación como respaldo...");
        await enableSimulationMode();
    }
}

async function warmUpModel() {
    try {
        console.log("🔥 Precalentando modelo...");
        const warmUpTensor = tf.zeros([1, 224, 224, 3]);
        console.log("🧪 Tensor de prueba creado:", warmUpTensor.shape);
        
        const prediction = await aiModel.predict(warmUpTensor);
        console.log("✅ Predicción de prueba exitosa");
        console.log("📤 Output shape:", prediction.shape);
        
        warmUpTensor.dispose();
        prediction.dispose();
        
        console.log("🧹 Memoria liberada");
        if (tf.memory) {
            console.log("💾 Memoria TF.js:", tf.memory());
        }
        
    } catch (error) {
        console.warn("⚠️ Error en precalentamiento:", error);
    }
}

async function enableSimulationMode() {
    console.warn("🎭 ACTIVANDO MODO SIMULACIÓN");
    console.log("💡 Esto significa que el modelo real no pudo cargarse");
    modelLoaded = false;
    usingSimulation = true;
    updateUIStatus('simulation');
}

async function processImage(imageFile) {
    if (!modelLoaded && !usingSimulation) {
        alert('⚠️ El sistema no está listo. Espera a que cargue el modelo.');
        return;
    }
    
    console.log("🖼️ Procesando imagen:", imageFile.name, "Tamaño:", imageFile.size, "bytes");
    updateUIStatus('processing');
    
    try {
        let results;
        if (usingSimulation) {
            console.log("🎭 Usando modo simulación...");
            results = await simulatePrediction();
        } else {
            console.log("🤖 Usando IA real...");
            results = await predictWithAI(imageFile);
        }
        
        displayResults(results);
        updateUIStatus('ready');
        
    } catch (error) {
        console.error('❌ Error procesando imagen:', error);
        updateUIStatus('error', error.message);
    }
}

async function predictWithAI(imageFile) {
    console.log("🔬 Iniciando análisis con IA real...");
    const imageTensor = await loadAndProcessImage(imageFile);
    console.log("🖼️ Tensor de imagen preparado:", imageTensor.shape);
    
    try {
        console.log("🧠 Realizando predicción...");
        const startTime = performance.now();
        const prediction = aiModel.predict(imageTensor);
        const results = await prediction.data();
        const endTime = performance.now();
        
        console.log("⏱️ Tiempo de predicción:", (endTime - startTime).toFixed(2), "ms");
        console.log("📊 Resultados brutos:", Array.from(results));
        
        const processedResults = processPredictionResults(results);
        
        // Liberar memoria
        imageTensor.dispose();
        prediction.dispose();
        
        console.log("✅ Análisis con IA completado");
        return processedResults;
        
    } catch (error) {
        console.error('❌ Error en predicción:', error);
        imageTensor.dispose();
        throw error;
    }
}

async function loadAndProcessImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const img = new Image();
                img.onload = async function() {
                    try {
                        console.log("📐 Procesando imagen:", img.naturalWidth + "x" + img.naturalHeight);
                        
                        let tensor = tf.browser.fromPixels(img)
                            .resizeNearestNeighbor([224, 224])
                            .toFloat()
                            .expandDims(0)
                            .div(255.0);
                            
                        console.log("🔄 Imagen procesada a:", tensor.shape);
                        resolve(tensor);
                        
                    } catch (error) {
                        reject(new Error('Error procesando imagen: ' + error.message));
                    }
                };
                
                img.onerror = () => reject(new Error('Error cargando imagen'));
                img.src = e.target.result;
                
            } catch (error) {
                reject(new Error('Error en FileReader: ' + error.message));
            }
        };
        
        reader.onerror = () => reject(new Error('Error leyendo archivo'));
        reader.readAsDataURL(file);
    });
}

function processPredictionResults(results) {
    const scores = Array.from(results);
    const maxScore = Math.max(...scores);
    const predictedClass = scores.indexOf(maxScore);
    
    console.log("📈 Procesando resultados:");
    scores.forEach((score, index) => {
        console.log(`   ${CLASSES[index]}: ${(score * 100).toFixed(2)}%`);
    });
    
    return {
        predictedClass: predictedClass,
        className: CLASSES[predictedClass],
        confidence: (maxScore * 100).toFixed(2),
        scores: scores,
        timestamp: new Date().toLocaleString()
    };
}

async function simulatePrediction() {
    console.log("🎭 Generando predicción simulada...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const randomScores = Array(5).fill(0).map(() => Math.random());
    const total = randomScores.reduce((a, b) => a + b, 0);
    const normalizedScores = randomScores.map(score => score / total);
    const maxScore = Math.max(...normalizedScores);
    const predictedClass = normalizedScores.indexOf(maxScore);
    
    console.log("📊 Resultados simulados:");
    normalizedScores.forEach((score, index) => {
        console.log(`   ${CLASSES[index]}: ${(score * 100).toFixed(2)}%`);
    });
    
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
    console.log("📋 Mostrando resultados al usuario:", results);
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) {
        console.error("❌ No se encontró el elemento results");
        return;
    }
    
    const confidence = parseFloat(results.confidence);
    let confidenceColor = '#dc143c'; // Rojo por defecto
    
    if (confidence > 80) {
        confidenceColor = '#00ff00'; // Verde
    } else if (confidence > 60) {
        confidenceColor = '#daa520'; // Oro
    }
    
    let html = '<div class="result-card">';
    html += '<h3>🔍 RESULTADO DEL ANÁLISIS</h3>';
    html += '<div class="prediction">🎯 <strong>Parásito Detectado:</strong> ' + results.className + '</div>';
    html += '<div class="confidence" style="color: ' + confidenceColor + '">';
    html += '📈 <strong>Nivel de Confianza:</strong> ' + results.confidence + '%</div>';
    
    if (results.simulation) {
        html += '<div class="simulation-warning">⚠️ MODO SIMULACIÓN - DATOS DE PRUEBA</div>';
        html += '<div class="simulation-info">El modelo de IA real no pudo cargarse. Esto son datos de ejemplo.</div>';
    } else {
        html += '<div class="real-ai-indicator">✅ ANÁLISIS CON IA REAL</div>';
    }
    
    html += '<div class="timestamp">🕐 Análisis realizado: ' + results.timestamp + '</div>';
    html += '</div>';
    
    resultsDiv.innerHTML = html;
}

function updateUIStatus(status, data = null) {
    const statusElement = document.getElementById('model-status');
    if (!statusElement) {
        console.error("❌ No se encontró el elemento model-status");
        return;
    }
    
    const messages = {
        'loading': '🔄 ' + (data || 'Cargando modelo de IA...'),
        'ready': '✅ SISTEMA DE IA LISTO - Sube una muestra para análisis real',
        'simulation': '🎭 MODO SIMULACIÓN - Usando datos de prueba',
        'processing': '🔬 Analizando muestra con ' + (usingSimulation ? 'simulación' : 'IA real'),
        'error': '❌ ERROR - ' + (data || 'Revisa la consola')
    };
    
    statusElement.textContent = messages[status] || 'Estado desconocido';
    statusElement.className = 'model-status status-' + status;
    
    console.log("📢 Estado UI actualizado:", status, data);
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
    } else {
        console.error("❌ No se encontraron elementos de upload");
    }
}

// Función para diagnóstico manual
function debugModel() {
    console.log("🔧 DIAGNÓSTICO MANUAL:");
    console.log("- Modelo cargado:", modelLoaded);
    console.log("- Usando simulación:", usingSimulation);
    console.log("- TensorFlow.js:", typeof tf !== 'undefined');
    if (aiModel) {
        console.log("- Modelo AI:", aiModel);
        console.log("- Inputs:", aiModel.inputs);
        console.log("- Outputs:", aiModel.outputs);
    }
}

document.addEventListener('DOMContentLoaded', initApp);

// Hacer debugModel disponible globalmente
window.debugModel = debugModel;
window.detectorApp = {
    loadAIModel,
    processImage,
    debugModel,
    usingSimulation: () => usingSimulation,
    modelLoaded: () => modelLoaded
};

console.log("🔧 detectorApp cargado. Usa debugModel() para diagnóstico.");
