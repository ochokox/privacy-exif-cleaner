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

  // 同じファイルを再選択できるようにする
  fileInput.value = '';
}

async function processImage(file) {
  try {
    /*
     * createImageBitmap + imageOrientation:"from-image"
     *
     * スマホ写真などのExif Orientationを考慮して、
     * 見た目の向き・縦横比を維持した状態でCanvasへ描画する。
     */
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image'
    });

    const canvas = document.createElement('canvas');

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      bitmap,
      0,
      0,
      bitmap.width,
      bitmap.height
    );

    bitmap.close();

    /*
     * 再エンコードすることで元画像のExif等を引き継がない。
     */
    const quality = file.type === 'image/png' ? undefined : 0.92;

    const cleanedBlob = await new Promise(resolve => {
      canvas.toBlob(
        resolve,
        file.type,
        quality
      );
    });

    if (!cleanedBlob) {
      throw new Error('Image conversion failed.');
    }

    const cleanedUrl = URL.createObjectURL(cleanedBlob);

    const originalSize = formatSize(file.size);
    const cleanedSize = formatSize(cleanedBlob.size);

    renderFileItem(
      file.name,
      originalSize,
      cleanedSize,
      cleanedUrl
    );

  } catch (error) {
    console.error(error);
    alert(`Could not process: ${file.name}`);
  }
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function renderFileItem(
  name,
  originalSize,
  cleanedSize,
  downloadUrl
) {
  const item = document.createElement('div');
  item.className = 'file-item';

  const info = document.createElement('div');

  const title = document.createElement('strong');
  title.textContent = name;

  const br = document.createElement('br');

  const size = document.createElement('small');
  size.textContent =
    `Original: ${originalSize} → Cleaned: ${cleanedSize}`;

  info.appendChild(title);
  info.appendChild(br);
  info.appendChild(size);

  const button = document.createElement('a');
  button.href = downloadUrl;
  button.download = `cleaned_${name}`;
  button.className = 'download-btn';
  button.textContent = 'Download';

  item.appendChild(info);
  item.appendChild(button);

  fileList.appendChild(item);
}
