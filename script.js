const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewSection = document.getElementById('preview-section');
const fileList = document.getElementById('file-list');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  if (!files.length) return;

  previewSection.classList.remove('hidden');

  Array.from(files).forEach(file => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(`Unsupported file format: ${file.name}`);
      return;
    }

    processImage(file);
  });

  fileInput.value = '';
}

async function processImage(file) {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image'
    });

    const canvas = document.createElement('canvas');

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas is not supported.');
    }

    ctx.drawImage(bitmap, 0, 0);

    bitmap.close();

    // Canvasから新しい画像データとして再エンコード
    const outputType = file.type;
    const quality =
      outputType === 'image/png' ? undefined : 0.92;

    const cleanedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Image conversion failed.'));
        }
      }, outputType, quality);
    });

    const cleanedUrl = URL.createObjectURL(cleanedBlob);

    const originalSize = formatSize(file.size);
    const cleanedSize = formatSize(cleanedBlob.size);

    const outputName = createOutputName(
      file.name,
      outputType
    );

    renderFileItem(
      file.name,
      outputName,
      originalSize,
      cleanedSize,
      cleanedUrl
    );

  } catch (error) {
    console.error(error);
    alert(`Could not process: ${file.name}`);
  }
}

function createOutputName(originalName, mimeType) {
  const nameWithoutExtension =
    originalName.replace(/\.[^/.]+$/, '');

  let extension = 'jpg';

  if (mimeType === 'image/png') {
    extension = 'png';
  }

  if (mimeType === 'image/webp') {
    extension = 'webp';
  }

  // 元画像と絶対に区別しやすい名前
  return `cleaned_${nameWithoutExtension}_${Date.now()}.${extension}`;
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function renderFileItem(
  originalName,
  outputName,
  originalSize,
  cleanedSize,
  downloadUrl
) {
  const item = document.createElement('div');
  item.className = 'file-item';

  const info = document.createElement('div');

  const title = document.createElement('strong');
  title.textContent = originalName;

  const br1 = document.createElement('br');

  const size = document.createElement('small');
  size.textContent =
    `Original: ${originalSize} → Processed: ${cleanedSize}`;

  const br2 = document.createElement('br');

  const outputInfo = document.createElement('small');
  outputInfo.textContent =
    `Output: ${outputName}`;

  info.appendChild(title);
  info.appendChild(br1);
  info.appendChild(size);
  info.appendChild(br2);
  info.appendChild(outputInfo);

  const button = document.createElement('a');
  button.href = downloadUrl;
  button.download = outputName;
  button.className = 'download-btn';
  button.textContent = 'Download';

  item.appendChild(info);
  item.appendChild(button);

  fileList.appendChild(item);
}
