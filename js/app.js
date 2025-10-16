
const MODEL_PATH = 'modelo/model.json';
let aiModel = null;
let modelLoaded = false;
let loadMethod = 'none';

const CLASSES = ['Ascaris', 'Giardia', 'Hookworm', 'Trichuris', 'Negative'];

async function init() {
    console.log("🚀 Iniciando - MÉTODOS MÚLTIPLES");
    await loadModelWithMultipleMethods();
    setupEvents();
}

async function loadModelWithMultipleMethods() {
    console.log("🔧 Probando múltiples métodos de carga...");
    
    if (typeof tf === 'undefined') {
        console.error("❌ TensorFlow.js no cargado");
        return;
    }
    
    // MÉTODO 1: loadGraphModel
    console.log("1️⃣ Intentando loadGraphModel...");
    try {
        aiModel = await tf.loadGraphModel(MODEL_PATH);
        loadMethod = 'graph';
        console.log("🎉 ¡ÉXITO con loadGraphModel!");
        console.log("Inputs:", aiModel.inputs);
        modelLoaded = true;
        document.getElementById('model-status').textContent = '✅ IA REAL - GraphModel';
        return;
    } catch (e) {
        console.warn("❌ loadGraphModel falló:", e.message);
    }
    
    // MÉTODO 2: loadLayersModel con opciones
    console.log("2️⃣ Intentando loadLayersModel...");
    try {
        aiModel = await tf.loadLayersModel(MODEL_PATH, {
            strict: false  // Más tolerante
        });
        loadMethod = 'layers';
        console.log("🎉 ¡ÉXITO con loadLayersModel!");
        console.log("Input shape:", aiModel.inputs[0].shape);
        modelLoaded = true;
        document.getElementById('model-status').textContent = '✅ IA REAL - LayersModel';
        return;
    } catch (e) {
        console.warn("❌ loadLayersModel falló:", e.message);
    }
    
    // MÉTODO 3: Carga manual desde JSON
    console.log("3️⃣ Intentando carga manual...");
    try {
        const modelJson = await fetch(MODEL_PATH).then(r => r.json());
        console.log("📋 Estructura del modelo:", {
            format: modelJson.format,
            generatedBy: modelJson.generatedBy
        });
        
        // Intentar cargar con diferentes enfoques
        aiModel = await tf.loadLayersModel(MODEL_PATH);
        loadMethod = 'manual';
        console.log("🎉 ¡ÉXITO con carga manual!");
        modelLoaded = true;
        document.getElementById('model-status').textContent = '✅ IA REAL - Manual';
        return;
    } catch (e) {
        console.error("❌ Todos los métodos fallaron:", e);
        document.getElementById('model-status').textContent = '❌ Error cargando IA';
    }
}

async function processImage(file) {
    if (!modelLoaded) {
        return simulatePrediction();
    }
    
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
                
                let prediction;
                if (loadMethod === 'graph') {
                    prediction = aiModel.execute(tensor);
                } else {
                    prediction = aiModel.predict(tensor);
                }
                
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
                    simulation: !modelLoaded
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
    
    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>🔍 RESULTADO - ${status}</h3>
            <div class="prediction">🎯 ${result.className}</div>
            <div class="confidence">📈 ${result.confidence}%</div>
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
