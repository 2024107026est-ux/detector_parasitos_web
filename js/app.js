
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
    console.log("Iniciando Detector de Parásitos");
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
    console.log("Cargando modelo...");
    updateUIStatus('loading');
    
    try {
        if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js no disponible');
        }
        
        const response = await fetch(MODEL_PATH);
        if (!response.ok) throw new Error('No acceso al modelo');
        
        aiModel = await tf.loadLayersModel(MODEL_PATH, {
            onProgress: (fraction) => {
                const percent = Math.round(fraction * 100);
                updateUIStatus('loading', percent);
            }
        });
        
        console.log("Modelo cargado");
        console.log("Input shape:", aiModel.inputs[0].shape);
        
        await warmUpModel();
        modelLoaded = true;
        usingSimulation = false;
        updateUIStatus('ready');
        
    } catch (error) {
        console.error('Error:', error);
        await enableSimulationMode();
    }
}

async function warmUpModel() {
    try {
        const warmUpTensor = tf.zeros([1, 224, 224, 3]);
        const prediction = await aiModel.predict(warmUpTensor);
        warmUpTensor.dispose();
        prediction.dispose();
    } catch (error) {
        console.warn("Error precalentamiento:", error);
    }
}

async function enableSimulationMode() {
    modelLoaded = false;
    usingSimulation = true;
    updateUIStatus('simulation');
}

async function processImage(imageFile) {
    if (!modelLoaded && !usingSimulation) return;
    
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
        console.error('Error:', error);
        updateUIStatus('error');
    }
}

async function predictWithAI(imageFile) {
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
            img.onerror = () => reject(new Error('Error imagen'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Error archivo'));
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    let html = '<div class="result-card">';
    html += '<h3>Resultado</h3>';
    html += '<div><strong>Parásito:</strong> ' + results.className + '</div>';
    html += '<div><strong>Confianza:</strong> ' + results.confidence + '%</div>';
    if (results.simulation) {
        html += '<div>⚠️ Modo simulación</div>';
    }
    html += '<div><small>' + results.timestamp + '</small></div>';
    html += '</div>';
    
    resultsDiv.innerHTML = html;
}

function updateUIStatus(status, data = null) {
    const statusElement = document.getElementById('model-status');
    if (!statusElement) return;
    
    const messages = {
        'loading': 'Cargando... ' + (data || ''),
        'ready': '✅ Modelo listo',
        'simulation': '⚠️ Modo simulación',
        'processing': 'Procesando...',
        'error': '❌ Error'
    };
    
    statusElement.textContent = messages[status] || 'Estado';
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
    }
}

document.addEventListener('DOMContentLoaded', initApp);
