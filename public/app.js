document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');

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