const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewSection = document.getElementById('preview-section');
const fileList = document.getElementById('file-list');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  if (files.length === 0) return;
  previewSection.classList.remove('hidden');

  Array.from(files).forEach(file => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(`Unsupported file format: ${file.name}`);
      return;
    }
    processImage(file);
  });
}

function processImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const cleanedDataUrl = canvas.toDataURL(file.type, 0.92);
      
      const originalSize = (file.size / 1024).toFixed(1);
      const cleanedSize = Math.round((cleanedDataUrl.length * 3 / 4) / 1024).toFixed(1);

      renderFileItem(file.name, originalSize, cleanedSize, cleanedDataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderFileItem(name, originalSize, cleanedSize, dataUrl) {
  const item = document.createElement('div');
  item.className = 'file-item';
  item.innerHTML = `
    <div>
      <strong>${name}</strong><br>
      <small>Original: ${originalSize} KB → Cleaned: ~${cleanedSize} KB</small>
    </div>
    <a href="${dataUrl}" download="cleaned_${name}" class="download-btn">Download</a>
  `;
  fileList.appendChild(item);
}
