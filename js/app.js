
// DETECTOR DE PARÁSITOS - VERSIÓN SIMPLE
const MODEL_PATH = 'modelo/model.json';
let aiModel = null;
let modelLoaded = false;

const CLASSES = ['Ascaris', 'Giardia', 'Hookworm', 'Trichuris', 'Negative'];

async function init() {
    console.log("🚀 Iniciando detector simple");
    await loadModelSimple();
    setupEvents();
}

async function loadModelSimple() {
    console.log("🔄 Cargando modelo...");
    
    try {
        // Verificar TensorFlow.js
        if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js no cargado');
        }
        console.log("✅ TensorFlow.js disponible");
        
        // Verificar acceso al modelo
        console.log("🔍 Verificando modelo...");
        const response = await fetch(MODEL_PATH);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        console.log("✅ Modelo accesible");
        
        // Analizar estructura
        const modelData = await response.json();
        console.log("📋 Estructura:", {
            format: modelData.format,
            hasModelTopology: !!modelData.modelTopology
        });
        
        // Cargar modelo
        console.log("📥 Cargando con tf.loadLayersModel...");
        aiModel = await tf.loadLayersModel(MODEL_PATH);
        
        console.log("🎉 ¡MODELO CARGADO!");
        console.log("📐 Input shape:", aiModel.inputs[0].shape);
        
        // Precalentar
        console.log("🔥 Precalentando...");
        const testTensor = tf.zeros([1, 224, 224, 3]);
        const prediction = aiModel.predict(testTensor);
        console.log("📤 Output shape:", prediction.shape);
        testTensor.dispose();
        prediction.dispose();
        
        modelLoaded = true;
        document.getElementById('model-status').textContent = '✅ IA REAL ACTIVA';
        
    } catch (error) {
        console.error('💥 Error:', error);
        document.getElementById('model-status').textContent = '❌ Error: ' + error.message;
    }
}

async function processImage(file) {
    if (!modelLoaded) {
        console.log("🎭 Usando simulación");
        return simulatePrediction();
    }
    
    console.log("🤖 Procesando con IA real...");
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = async function() {
                const tensor = tf.browser.fromPixels(img)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .expandDims(0)
                    .div(255.0);
                
                const prediction = aiModel.predict(tensor);
                const results = await prediction.data();
                
                const scores = Array.from(results);
                const maxScore = Math.max(...scores);
                const predictedClass = scores.indexOf(maxScore);
                
                tensor.dispose();
                prediction.dispose();
                
                resolve({
                    predictedClass: predictedClass,
                    className: CLASSES[predictedClass],
                    confidence: (maxScore * 100).toFixed(2),
                    simulation: false
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function simulatePrediction() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const randomClass = Math.floor(Math.random() * CLASSES.length);
    return {
        predictedClass: randomClass,
        className: CLASSES[randomClass],
        confidence: (Math.random() * 30 + 60).toFixed(2),
        simulation: true
    };
}

function showResults(result) {
    const resultsDiv = document.getElementById('results');
    const status = result.simulation ? 'MODO SIMULACIÓN' : 'IA REAL';
    const statusColor = result.simulation ? 'orange' : 'green';
    
    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>🔍 RESULTADO - ${status}</h3>
            <div class="prediction">🎯 ${result.className}</div>
            <div class="confidence" style="color: ${statusColor}">
                📈 ${result.confidence}% confianza
            </div>
            <div class="timestamp">🕐 ${new Date().toLocaleString()}</div>
        </div>
    `;
}

function setupEvents() {
    const uploadInput = document.getElementById('image-upload');
    const uploadArea = document.getElementById('upload-area');
    
    if (uploadInput && uploadArea) {
        uploadInput.addEventListener('change', function(e) {
            if (e.target.files[0]) {
                document.getElementById('model-status').textContent = '🔬 Analizando...';
                processImage(e.target.files[0]).then(showResults);
                document.getElementById('model-status').textContent = 
                    modelLoaded ? '✅ IA REAL ACTIVA' : '🎭 MODO SIMULACIÓN';
            }
        });
        
        uploadArea.addEventListener('click', () => uploadInput.click());
    }
}

document.addEventListener('DOMContentLoaded', init);
