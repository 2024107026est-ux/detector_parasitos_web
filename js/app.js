
const MODEL_PATH = 'modelo/model.json';
let aiModel = null;
let modelLoaded = false;

const CLASSES = ['Ascaris', 'Giardia', 'Hookworm', 'Trichuris', 'Negative'];

// Función ultra-simple para cargar el modelo
async function loadModelSimple() {
    console.log("🔧 Cargando modelo - Método ultra-simple");
    
    try {
        // Verificar que TensorFlow.js está cargado
        if (typeof tf === 'undefined') {
            console.error("❌ TensorFlow.js no está cargado");
            return false;
        }
        
        console.log("✅ TensorFlow.js disponible");
        
        // Intentar cargar el modelo
        console.log("📥 Descargando modelo...");
        aiModel = await tf.loadLayersModel(MODEL_PATH);
        
        console.log("🎉 MODELO CARGADO EXITOSAMENTE");
        console.log("Input shape:", aiModel.inputs[0].shape);
        
        // Hacer una prueba simple
        console.log("🔥 Probando modelo...");
        const testInput = tf.zeros([1, 224, 224, 3]);
        const testOutput = aiModel.predict(testInput);
        console.log("Output shape:", testOutput.shape);
        testInput.dispose();
        testOutput.dispose();
        
        modelLoaded = true;
        document.getElementById('model-status').textContent = '✅ IA REAL ACTIVA - Sistema listo';
        return true;
        
    } catch (error) {
        console.error('💥 Error cargando modelo:', error);
        document.getElementById('model-status').textContent = '❌ Error cargando IA - Usando simulación';
        return false;
    }
}

// Función simple para procesar imágenes
async function processImageSimple(file) {
    if (!modelLoaded) {
        // Modo simulación si el modelo no carga
        return simulatePrediction();
    }
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = async function() {
                // Procesar imagen para la IA
                const tensor = tf.browser.fromPixels(img)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .expandDims(0)
                    .div(255.0);
                
                // Hacer predicción
                const prediction = aiModel.predict(tensor);
                const results = await prediction.data();
                
                // Procesar resultados
                const scores = Array.from(results);
                const maxScore = Math.max(...scores);
                const predictedClass = scores.indexOf(maxScore);
                
                // Liberar memoria
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

// Simulación simple
async function simulatePrediction() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const randomClass = Math.floor(Math.random() * CLASSES.length);
    const randomConfidence = (Math.random() * 30 + 60).toFixed(2); // 60-90%
    
    return {
        predictedClass: randomClass,
        className: CLASSES[randomClass],
        confidence: randomConfidence,
        simulation: true
    };
}

// Mostrar resultados
function showResults(result) {
    const resultsDiv = document.getElementById('results');
    const status = result.simulation ? 'MODO SIMULACIÓN' : 'IA REAL';
    const statusColor = result.simulation ? 'orange' : 'green';
    
    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>🔍 RESULTADO - ${status}</h3>
            <div class="prediction">🎯 Parásito: ${result.className}</div>
            <div class="confidence" style="color: ${statusColor}">
                📈 Confianza: ${result.confidence}%
            </div>
            <div class="timestamp">🕐 ${new Date().toLocaleString()}</div>
        </div>
    `;
}

// Configurar eventos
function setupEvents() {
    const uploadInput = document.getElementById('image-upload');
    const uploadArea = document.getElementById('upload-area');
    
    if (uploadInput && uploadArea) {
        uploadInput.addEventListener('change', function(e) {
            if (e.target.files[0]) {
                document.getElementById('model-status').textContent = '🔬 Analizando...';
                processImageSimple(e.target.files[0]).then(showResults);
                document.getElementById('model-status').textContent = 
                    modelLoaded ? '✅ IA REAL ACTIVA' : '🎭 MODO SIMULACIÓN';
            }
        });
        
        uploadArea.addEventListener('click', () => uploadInput.click());
    }
}

// Inicializar
async function init() {
    console.log("🚀 Iniciando detector de parásitos");
    await loadModelSimple();
    setupEvents();
}

// Iniciar cuando se cargue la página
document.addEventListener('DOMContentLoaded', init);
