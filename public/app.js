document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');
    const previewContainer = document.getElementById('previewContainer');
    const filePreview = document.getElementById('filePreview');

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
    uploadForm.addEventListener('submit', handleSubmit);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleSubmit(e) {
        e.preventDefault();
        const files = fileInput.files;
        handleFiles(files);
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
        } else {
            const icon = document.createElement('div');
            icon.innerHTML = '📄';
            icon.style.fontSize = '48px';
            icon.style.textAlign = 'center';
            icon.style.marginBottom = '1rem';
            filePreview.appendChild(icon);
        }

        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <p><strong>Name:</strong> ${file.name}</p>
            <p><strong>Type:</strong> ${file.type}</p>
            <p><strong>Size:</strong> ${formatFileSize(file.size)}</p>
        `;
        filePreview.appendChild(fileInfo);
    }

    async function handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];
        showPreview(file);

        const formData = new FormData();
        formData.append('file', file);

        try {
            uploadStatus.textContent = 'Uploading...';
            uploadStatus.className = 'upload-status';

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                uploadStatus.textContent = 'File uploaded successfully!';
                uploadStatus.className = 'upload-status success';
                fileInput.value = '';
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            uploadStatus.textContent = error.message;
            uploadStatus.className = 'upload-status error';
        }
    }
}); 