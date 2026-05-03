const fileInput = document.querySelector('#fileInput');
const dropZone = document.querySelector('#dropZone');
const fileList = document.querySelector('#fileList');
const uploadForm = document.querySelector('#uploadForm');
const uploadMessage = document.querySelector('#uploadMessage');

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function showUploadMessage(text, type = 'info') {
  if (!uploadMessage) return;
  uploadMessage.hidden = false;
  uploadMessage.textContent = text;
  uploadMessage.className = `upload-message ${type}`;
}

function clearUploadMessage() {
  if (!uploadMessage) return;
  uploadMessage.hidden = true;
  uploadMessage.textContent = '';
  uploadMessage.className = 'upload-message';
}

function renderSelectedFiles() {
  if (!fileInput || !fileList) return;
  const files = Array.from(fileInput.files || []);
  if (files.length === 0) {
    fileList.hidden = true;
    fileList.innerHTML = '';
    return;
  }

  fileList.hidden = false;
  fileList.innerHTML = `
    <div class="selected-summary">已选择 ${files.length} 个文件</div>
    <ul>
      ${files
        .map((file) => {
          const name = escapeHtml(file.name);
          return `<li><span title="${name}">${name}</span><em>${formatSize(file.size)}</em></li>`;
        })
        .join('')}
    </ul>
  `;
}

if (fileInput) {
  fileInput.addEventListener('change', () => {
    clearUploadMessage();
    renderSelectedFiles();
  });
}

if (dropZone && fileInput) {
  ['dragenter', 'dragover'].forEach((name) => {
    dropZone.addEventListener(name, (event) => {
      event.preventDefault();
      dropZone.classList.add('dragging');
    });
  });

  ['dragleave', 'drop'].forEach((name) => {
    dropZone.addEventListener(name, (event) => {
      event.preventDefault();
      dropZone.classList.remove('dragging');
    });
  });

  dropZone.addEventListener('drop', (event) => {
    if (!event.dataTransfer?.files?.length) return;
    fileInput.files = event.dataTransfer.files;
    clearUploadMessage();
    renderSelectedFiles();
  });
}

if (uploadForm && fileInput) {
  uploadForm.addEventListener('submit', (event) => {
    if (!fileInput.files || fileInput.files.length === 0) {
      event.preventDefault();
      showUploadMessage('请先选择或拖入至少一张图片。', 'error');
      dropZone?.focus?.();
    }
  });
}

document.addEventListener('click', async (event) => {
  const copyButton = event.target.closest('.copy-button');
  if (!copyButton) return;

  const text = copyButton.dataset.copy;
  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = '已复制';
    setTimeout(() => {
      copyButton.textContent = '复制 URL';
    }, 1200);
  } catch {
    window.prompt('复制 URL', text);
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('.confirm-form');
  if (!form) return;
  const message = form.dataset.confirm || '确定执行此操作吗？';
  if (!window.confirm(message)) {
    event.preventDefault();
  }
});
