document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');
    const previewContainer = document.getElementById('previewContainer');
    const filePreview = document.getElementById('filePreview');
    const downloadButton = document.getElementById('downloadButton');
    const convertButton = document.getElementById('convertButton');
    let currentFile = null;
    let selectedFormat = null;

    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const highlight = () => dropZone.classList.add('dragover');
    const unhighlight = () => dropZone.classList.remove('dragover');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    uploadForm.addEventListener('submit', handleSubmit);
    convertButton.addEventListener('click', handleConversion);

    // Adicionar event listeners para as opções de conversão
    document.querySelectorAll('.conversion-option').forEach(option => {
        option.addEventListener('click', handleConversionOption);
    });

    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            currentFile = files[0];
            showPreview(currentFile);
            resetConversionState();
        }
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            currentFile = files[0];
            showPreview(currentFile);
            handleFiles(files);
            resetConversionState();
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        const files = fileInput.files;
        handleFiles(files);
    }

    function resetConversionState() {
        selectedFormat = null;
        convertButton.classList.remove('visible');
        downloadButton.classList.remove('visible');
        document.querySelectorAll('.conversion-option').forEach(opt => {
            opt.classList.remove('selected');
        });
    }

    function handleConversionOption(e) {
        const option = e.target.closest('.conversion-option');
        if (!option) return;

        // Remover seleção anterior
        document.querySelectorAll('.conversion-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Selecionar nova opção
        option.classList.add('selected');
        selectedFormat = option.querySelector('span').textContent;
        
        // Mostrar botão de conversão
        convertButton.classList.add('visible');
    }

    async function handleConversion() {
        if (!currentFile || !selectedFormat) return;

        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('targetFormat', selectedFormat);

        try {
            uploadStatus.textContent = 'Converting...';
            uploadStatus.className = 'upload-status';

            const response = await fetch('/convert', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    throw new Error(data.error || 'Conversion failed');
                } else {
                    throw new Error('Conversion failed. Please try again.');
                }
            }

            const data = await response.json();
            
            uploadStatus.innerHTML = `
                <span>✓</span>
                <span>File converted successfully!</span>
            `;
            uploadStatus.className = 'upload-status success';

            // Habilitar o botão de download
            downloadButton.classList.add('visible');
            downloadButton.onclick = () => window.location.href = data.downloadUrl;
        } catch (error) {
            uploadStatus.textContent = error.message;
            uploadStatus.className = 'upload-status error';
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showPreview(file) {
        previewContainer.classList.add('visible');
        filePreview.innerHTML = '';

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            filePreview.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const icon = document.createElement('div');
            icon.className = 'file-icon';
            icon.innerHTML = '🎥';
            filePreview.appendChild(icon);
        } else {
            const icon = document.createElement('div');
            icon.className = 'file-icon';
            icon.innerHTML = '📄';
            filePreview.appendChild(icon);
        }

        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <p>${file.name}</p>
            <p class="file-type">${file.type.split('/')[1].toUpperCase()}</p>
            <p>${formatFileSize(file.size)}</p>
        `;
        filePreview.appendChild(fileInfo);

        // Mostrar opções de conversão apropriadas
        const conversionOptions = document.getElementById('conversionOptions');
        const imageOptions = document.getElementById('imageOptions');
        const videoOptions = document.getElementById('videoOptions');

        if (file.type.startsWith('image/')) {
            imageOptions.style.display = 'grid';
            videoOptions.style.display = 'none';
            conversionOptions.classList.add('visible');
        } else if (file.type.startsWith('video/')) {
            imageOptions.style.display = 'none';
            videoOptions.style.display = 'grid';
            conversionOptions.classList.add('visible');
        } else {
            conversionOptions.classList.remove('visible');
        }
    }

    async function handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            uploadStatus.textContent = 'Uploading...';
            uploadStatus.className = 'upload-status';

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    throw new Error(data.error || 'Upload failed');
                } else {
                    throw new Error('Upload failed. Please try again.');
                }
            }

            const data = await response.json();

            uploadStatus.innerHTML = `
                <span>✓</span>
                <span>File uploaded successfully!</span>
            `;
            uploadStatus.className = 'upload-status success';
            fileInput.value = '';
        } catch (error) {
            uploadStatus.textContent = error.message;
            uploadStatus.className = 'upload-status error';
        }
    }
}); 