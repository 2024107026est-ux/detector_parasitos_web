// Configuración básica
const CONFIG = {
    modelPath: 'modelo/model.json',
    imageSize: 224,
    classes: [
        { name: 'ascaris', displayName: 'Ascaris', description: 'Gusano redondo grande' },
        { name: 'trichuris', displayName: 'Trichuris', description: 'Gusano con forma de látigo' },
        { name: 'giardia', displayName: 'Giardia', description: 'Protozoo en forma de lágrima' },
        { name: 'entamoeba', displayName: 'Entamoeba', description: 'Protozoo irregular' },
        { name: 'hymenolepis', displayName: 'Hymenolepis', description: 'Tenia pequeña' }
    ]
};

let model = null;
let currentImage = null;

// Elementos del DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplicación iniciada');
    setupEventListeners();
});

// Configurar eventos
function setupEventListeners() {
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    analyzeBtn.addEventListener('click', analyzeImage);
}

// Manejar selección de archivo
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
}

// Procesar archivo
function handleFile(file) {
    if (!file.type.match('image.*')) {
        alert('Por favor selecciona una imagen válida (JPG, JPEG, PNG)');
        return;
    }
    
    currentImage = file;
    
    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewSection.style.display = 'block';
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// Analizar imagen (simulación)
function analyzeImage() {
    if (!currentImage) return;
    
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🔍 Analizando...';
    
    // Simular análisis
    setTimeout(() => {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🧠 Analizar con IA';
        
        // Mostrar resultados de ejemplo
        const resultsSection = document.getElementById('resultsSection');
        const loading = document.getElementById('loading');
        const results = document.getElementById('results');
        
        resultsSection.style.display = 'block';
        loading.style.display = 'none';
        results.style.display = 'block';
        
        // Resultado aleatorio de ejemplo
        const randomIndex = Math.floor(Math.random() * CONFIG.classes.length);
        const randomConfidence = Math.floor(Math.random() * 30) + 70;
        
        document.getElementById('resultTitle').textContent = CONFIG.classes[randomIndex].displayName + ' Detectado';
        document.getElementById('confidenceText').textContent = randomConfidence + '%';
        
        // Animar barra
        const confidenceFill = document.getElementById('confidenceFill');
        confidenceFill.style.width = randomConfidence + '%';
        
    }, 2000);
}

console.log('✅ JavaScript cargado');
