const imagesKey = 'nyaovo:imagesCollapsed';

function isMobile() {
  return window.innerWidth <= 768;
}

export function initAccordion() {
  if (!isMobile()) return;

  const panel = document.getElementById('images');
  if (!panel) return;

  const batchToolbar = panel.querySelector('.batch-toolbar');
  const grid = panel.querySelector('.image-grid');
  const loadMore = panel.querySelector('.load-more-row');
  const pagination = panel.querySelector('.pagination-row');
  if (!grid) return;

  const toggleRow = document.createElement('button');
  toggleRow.type = 'button';
  toggleRow.className = 'ghost images-toggle-btn';

  const insertAfter = batchToolbar || panel.querySelector('.image-filter-bar');
  if (insertAfter) {
    insertAfter.after(toggleRow);
  } else {
    grid.before(toggleRow);
  }

  function updateState(collapsed) {
    grid.classList.toggle('collapsed', collapsed);
    if (loadMore) loadMore.classList.toggle('collapsed', collapsed);
    if (pagination) pagination.classList.toggle('collapsed', collapsed);
    toggleRow.textContent = collapsed ? '展开图片列表 ▾' : '收起图片列表 ▴';
  }

  const saved = localStorage.getItem(imagesKey) === 'true';
  updateState(saved);

  toggleRow.addEventListener('click', () => {
    const isCollapsed = grid.classList.contains('collapsed');
    updateState(!isCollapsed);
    localStorage.setItem(imagesKey, String(!isCollapsed));
  });
}
