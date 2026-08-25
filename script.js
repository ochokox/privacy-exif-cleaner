const dropZone = document.getElementById("drop-zone");
const browseButton = document.getElementById("browse-button");
const fileInput = document.getElementById("file-input");
const previewSection = document.getElementById("preview-section");
const fileList = document.getElementById("file-list");
const status = document.getElementById("status");
const clearButton = document.getElementById("clear-button");

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;

const SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

browseButton.addEventListener("click", (event) => {
  event.stopPropagation();
  fileInput.click();
});

dropZone.addEventListener("click", (event) => {
  if (event.target === browseButton) return;
  fileInput.click();
});

dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragover");

  handleFiles(event.dataTransfer.files);
});

fileInput.addEventListener("change", () => {
  handleFiles(fileInput.files);

  // Allow selecting the same file again.
  fileInput.value = "";
});

clearButton.addEventListener("click", clearResults);

function setStatus(message, type = "") {
  status.textContent = message;
  status.className = `status ${type}`;
}

function handleFiles(files) {
  if (!files || files.length === 0) {
    return;
  }

  previewSection.classList.remove("hidden");

  let accepted = 0;

  Array.from(files).forEach((file) => {
    if (!SUPPORTED_TYPES.has(file.type)) {
      addErrorItem(
        file.name,
        "Unsupported file format. Please use JPG, PNG or WebP."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      addErrorItem(
        file.name,
        "File is too large. The maximum size is 25 MB."
      );
      return;
    }

    accepted++;
    processImage(file);
  });

  if (accepted > 0) {
    setStatus(`Processing ${accepted} image${accepted === 1 ? "" : "s"}...`);
  }
}

function processImage(file) {
  const reader = new FileReader();

  reader.onerror = () => {
    addErrorItem(file.name, "Could not read this file.");
  };

  reader.onload = () => {
    const img = new Image();

    img.onerror = () => {
      addErrorItem(file.name, "This image could not be decoded.");
    };

    img.onload = () => {
      try {
        const pixelCount = img.width * img.height;

        if (pixelCount > MAX_PIXELS) {
          addErrorItem(
            file.name,
            "This image is too large to process safely in this browser."
          );
          return;
        }

        const canvas = document.createElement("canvas");

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Canvas is not supported.");
        }

        ctx.drawImage(img, 0, 0);

        let outputType = file.type;

        if (!["image/jpeg", "image/png", "image/webp"].includes(outputType)) {
          outputType = "image/png";
        }

        const quality =
          outputType === "image/jpeg" || outputType === "image/webp"
            ? 0.92
            : undefined;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              addErrorItem(
                file.name,
                "The browser could not create the cleaned image."
              );
              return;
            }

            const url = URL.createObjectURL(blob);

            renderFileItem(
              file.name,
              file.size,
              blob.size,
              url
            );

            setStatus("Processing complete.", "success");

            // Release the temporary image data.
            URL.revokeObjectURL(img.src.startsWith("blob:") ? img.src : "");
          },
          outputType,
          quality
        );

      } catch (error) {
        console.error(error);

        addErrorItem(
          file.name,
          "An unexpected error occurred while processing this image."
        );
      }
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
}

function renderFileItem(name, originalSize, cleanedSize, downloadUrl) {
  const item = document.createElement("div");
  item.className = "file-item";

  const nameElement = document.createElement("div");
  nameElement.className = "file-name";
  nameElement.textContent = name;

  const infoElement = document.createElement("div");
  infoElement.className = "file-info";
  infoElement.textContent =
    `Original: ${formatBytes(originalSize)} → ` +
    `Cleaned: ${formatBytes(cleanedSize)}`;

  const downloadButton = document.createElement("a");
  downloadButton.className = "download-btn";
  downloadButton.href = downloadUrl;
  downloadButton.download = `cleaned_${createSafeFilename(name)}`;
  downloadButton.textContent = "Download";

  item.appendChild(nameElement);
  item.appendChild(infoElement);
  item.appendChild(downloadButton);

  fileList.appendChild(item);
}

function addErrorItem(name, message) {
  previewSection.classList.remove("hidden");

  const item = document.createElement("div");
  item.className = "file-item";

  const nameElement = document.createElement("div");
  nameElement.className = "file-name";
  nameElement.textContent = name;

  const errorElement = document.createElement("div");
  errorElement.className = "file-info";
  errorElement.textContent = message;

  item.appendChild(nameElement);
  item.appendChild(errorElement);

  fileList.appendChild(item);

  setStatus(message, "error");
}

function createSafeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function clearResults() {
  const links = fileList.querySelectorAll("a.download-btn");

  links.forEach((link) => {
    URL.revokeObjectURL(link.href);
  });

  fileList.replaceChildren();
  previewSection.classList.add("hidden");
  setStatus("");
}
