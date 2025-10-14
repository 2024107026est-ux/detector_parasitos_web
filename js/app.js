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
const resultsSection = document.getElementById('resultsSection');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const resultTitle = document.getElementById('resultTitle');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceText = document.getElementById('confidenceText');
const allResults = document.getElementById('allResults');
const description = document.getElementById('description');
const parasitesGrid = document.getElementById('parasitesGrid');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplicación iniciada');
    setupEventListeners();
    displayParasitesInfo();
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
    
    resultsSection.style.display = 'block';
    loading.style.display = 'block';
    results.style.display = 'none';
    
    // Simular análisis (en una versión real aquí cargarías el modelo)
    setTimeout(() => {
        loading.style.display = 'none';
        results.style.display = 'block';
        
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🧠 Analizar con IA';
        
        // Resultados de ejemplo
        const randomIndex = Math.floor(Math.random() * CONFIG.classes.length);
        const randomConfidence = Math.floor(Math.random() * 30) + 70; // 70-100%
        
        resultTitle.textContent = CONFIG.classes[randomIndex].displayName + ' Detectado';
        animateConfidenceBar(randomConfidence);
        
        description.innerHTML = `
            <h4>📋 Información:</h4>
            <p>${CONFIG.classes[randomIndex].description}</p>
            <p><strong>Confianza del análisis: ${randomConfidence}%</strong></p>
            <p><em>Nota: Esta es una demostración. En la versión real se usaría IA entrenada.</em></p>
        `;
    }, 2000);
}

// Animar barra de confianza
function animateConfidenceBar(confidence) {
    let currentWidth = 0;
    const targetWidth = Math.min(confidence, 100);
    const animation = setInterval(() => {
        if (currentWidth >= targetWidth) {
            clearInterval(animation);
            return;
        }
        currentWidth += 1;
        confidenceFill.style.width = currentWidth + '%';
        confidenceText.textContent = currentWidth + '%';
    }, 20);
}

// Mostrar información de parásitos
function displayParasitesInfo() {
    parasitesGrid.innerHTML = '';
    
    CONFIG.classes.forEach(parasite => {
        const card = document.createElement('div');
        card.className = 'parasite-card';
        card.innerHTML = `
            <div class="parasite-icon">🦠</div>
            <h3>${parasite.displayName}</h3>
            <p>${parasite.description}</p>
        `;
        parasitesGrid.appendChild(card);
    });
}

console.log('✅ JavaScript cargado');