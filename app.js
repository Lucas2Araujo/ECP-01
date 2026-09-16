/**
 * ECP-01 - Materiais Acadêmicos
 * Aplicação Frontend Vanilla JS
 */

(() => {
  'use strict';

  // --- Estado da Aplicação ---
  const state = {
    materials: [],
    disciplines: [],
    categories: [],
    selectedDiscipline: 'ALL',
    selectedCategory: 'ALL',
    searchQuery: '',
    theme: 'auto',
    currentFilteredList: [],
    previewIndex: -1,
  };

  // --- Elementos do DOM ---
  const DOM = {
    html: document.documentElement,
    themeToggle: document.getElementById('themeToggle'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    disciplineChips: document.getElementById('disciplineChips'),
    categoryChips: document.getElementById('categoryChips'),
    resultsCount: document.getElementById('resultsCount'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    materialsGroupContainer: document.getElementById('materialsGroupContainer'),
    previewModal: document.getElementById('previewModal'),
    previewModalTitle: document.getElementById('previewModalTitle'),
    previewModalMeta: document.getElementById('previewModalMeta'),
    previewModalIcon: document.getElementById('previewModalIcon'),
    previewModalBody: document.getElementById('previewModalBody'),
    previewDownloadBtn: document.getElementById('previewDownloadBtn'),
    previewNewTabBtn: document.getElementById('previewNewTabBtn'),
    previewPrevBtn: document.getElementById('previewPrevBtn'),
    previewNextBtn: document.getElementById('previewNextBtn'),
    closePreviewBtn: document.getElementById('closePreviewBtn'),
  };

  // --- Utilitários ---

  /** Normaliza texto removendo acentos e convertendo para minúsculas */
  function normalizeText(text) {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  /** Escapa strings para uso seguro no HTML */
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** Obtém a extensão do arquivo em minúsculo */
  function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  /** Verifica se o arquivo pode ser visualizado nativamente no navegador */
  function isPreviewable(extension) {
    const previewableExts = ['pdf', 'png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'txt'];
    return previewableExts.includes(extension);
  }

  /** Retorna o tipo de arquivo e ícone SVG correspondente */
  function getFileIcon(extension) {
    const ext = extension.toLowerCase();

    if (ext === 'pdf') {
      return {
        typeClass: 'pdf',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
      };
    }

    if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext)) {
      return {
        typeClass: 'doc',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`
      };
    }

    if (['mobi', 'epub', 'azw3'].includes(ext)) {
      return {
        typeClass: 'ebook',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
      };
    }

    if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) {
      return {
        typeClass: 'img',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
      };
    }

    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return {
        typeClass: 'archive',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>`
      };
    }

    return {
      typeClass: 'generic',
      svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`
    };
  }

  // --- Gerenciamento de Tema (Dark/Light) ---

  function initTheme() {
    const savedTheme = localStorage.getItem('ecp_theme') || 'auto';
    setTheme(savedTheme, false);

    DOM.themeToggle.addEventListener('click', () => {
      const currentTheme = DOM.html.getAttribute('data-theme') || 'auto';
      let nextTheme = 'dark';

      if (currentTheme === 'dark') {
        nextTheme = 'light';
      } else if (currentTheme === 'light') {
        nextTheme = 'dark';
      } else {
        // Se estava em auto, detecta o sistema e inverte
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        nextTheme = isSystemDark ? 'light' : 'dark';
      }

      setTheme(nextTheme, true);
    });
  }

  function setTheme(theme, save = true) {
    state.theme = theme;
    DOM.html.setAttribute('data-theme', theme);
    if (save) {
      localStorage.setItem('ecp_theme', theme);
    }
  }

  // --- Processamento de Dados e Filtros ---

  /** Extrai disciplinas únicas e conta materiais */
  function extractDisciplines(materials) {
    const counts = {};
    for (const item of materials) {
      counts[item.discipline] = (counts[item.discipline] || 0) + 1;
    }

    const disciplines = Object.keys(counts).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    return disciplines.map(name => ({
      name,
      count: counts[name],
    }));
  }

  /** Extrai categorias únicas e conta materiais */
  function extractCategories(materials) {
    const counts = {};
    for (const item of materials) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }

    const priority = { 'Livros': 1, 'Slides': 2, 'Atividades': 3, 'Artigos Para Ler': 4, 'Geral': 5 };
    const categories = Object.keys(counts).sort((a, b) => {
      const pA = priority[a] || 99;
      const pB = priority[b] || 99;
      return pA - pB || a.localeCompare(b, 'pt-BR');
    });

    return categories.map(name => ({
      name,
      count: counts[name],
    }));
  }

  /** Renderiza os botões/chips de categorias */
  function renderCategoryChips() {
    if (!DOM.categoryChips) return;
    const totalCount = state.materials.length;

    let html = `
      <button class="chip-btn ${state.selectedCategory === 'ALL' ? 'active' : ''}" data-category="ALL">
        <span>Todos</span>
        <span class="chip-count">${totalCount}</span>
      </button>
    `;

    for (const c of state.categories) {
      const isActive = state.selectedCategory === c.name;
      html += `
        <button class="chip-btn ${isActive ? 'active' : ''}" data-category="${escapeHTML(c.name)}">
          <span>${escapeHTML(c.name)}</span>
          <span class="chip-count">${c.count}</span>
        </button>
      `;
    }

    DOM.categoryChips.innerHTML = html;

    // Vincula eventos nos chips de categoria
    DOM.categoryChips.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        if (state.selectedCategory !== cat) {
          state.selectedCategory = cat;
          updateActiveChips();
          syncURLParams();
          applyFilters();
        }
      });
    });
  }

  /** Renderiza os botões/chips de disciplinas */
  function renderDisciplineChips() {
    const totalCount = state.materials.length;

    let html = `
      <button class="chip-btn ${state.selectedDiscipline === 'ALL' ? 'active' : ''}" data-discipline="ALL">
        <span>Todas</span>
        <span class="chip-count">${totalCount}</span>
      </button>
    `;

    for (const d of state.disciplines) {
      const isActive = state.selectedDiscipline === d.name;
      html += `
        <button class="chip-btn ${isActive ? 'active' : ''}" data-discipline="${escapeHTML(d.name)}">
          <span>${escapeHTML(d.name)}</span>
          <span class="chip-count">${d.count}</span>
        </button>
      `;
    }

    DOM.disciplineChips.innerHTML = html;

    // Vincula eventos nos chips
    DOM.disciplineChips.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const disc = btn.getAttribute('data-discipline');
        if (state.selectedDiscipline !== disc) {
          state.selectedDiscipline = disc;
          updateActiveChips();
          syncURLParams();
          applyFilters();
        }
      });
    });
  }

  function updateActiveChips() {
    DOM.disciplineChips.querySelectorAll('.chip-btn').forEach(btn => {
      if (btn.getAttribute('data-discipline') === state.selectedDiscipline) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        btn.classList.remove('active');
      }
    });

    if (DOM.categoryChips) {
      DOM.categoryChips.querySelectorAll('.chip-btn').forEach(btn => {
        if (btn.getAttribute('data-category') === state.selectedCategory) {
          btn.classList.add('active');
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  /** Atualiza parâmetros de URL para deep linking */
  function syncURLParams() {
    const params = new URLSearchParams();
    if (state.selectedDiscipline !== 'ALL') {
      params.set('disciplina', state.selectedDiscipline);
    }
    if (state.selectedCategory !== 'ALL') {
      params.set('tipo', state.selectedCategory);
    }
    if (state.searchQuery) {
      params.set('busca', state.searchQuery);
    }

    const newQuery = params.toString();
    const newRelativePathQuery = window.location.pathname + (newQuery ? '?' + newQuery : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }

  /** Lê parâmetros da URL na inicialização */
  function loadURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('disciplina')) {
      state.selectedDiscipline = params.get('disciplina');
    }
    if (params.has('tipo')) {
      state.selectedCategory = params.get('tipo');
    }
    if (params.has('busca')) {
      state.searchQuery = params.get('busca');
      DOM.searchInput.value = state.searchQuery;
      DOM.clearSearchBtn.hidden = !state.searchQuery;
    }
  }

  /** Filtra os materiais com base na busca, disciplina e categoria selecionada */
  function getFilteredMaterials() {
    const query = normalizeText(state.searchQuery.trim());
    const filterDisc = state.selectedDiscipline;
    const filterCat = state.selectedCategory;

    return state.materials.filter(item => {
      // Filtro de disciplina
      if (filterDisc !== 'ALL' && item.discipline !== filterDisc) {
        return false;
      }

      // Filtro de categoria
      if (filterCat !== 'ALL' && item.category !== filterCat) {
        return false;
      }

      // Filtro de busca
      if (!query) return true;

      const normName = normalizeText(item.name);
      const normDisc = normalizeText(item.discipline);
      const normCat = normalizeText(item.category);

      return (
        normName.includes(query) ||
        normDisc.includes(query) ||
        normCat.includes(query)
      );
    });
  }

  /** Agrupa os materiais filtrados por Disciplina -> Categoria */
  function groupMaterials(materials) {
    const grouped = new Map();

    for (const item of materials) {
      if (!grouped.has(item.discipline)) {
        grouped.set(item.discipline, new Map());
      }
      const discMap = grouped.get(item.discipline);

      if (!discMap.has(item.category)) {
        discMap.set(item.category, []);
      }
      discMap.get(item.category).push(item);
    }

    return grouped;
  }

  /** Renderiza o catálogo na tela */
  function renderCatalog(filtered) {
    const totalFiltered = filtered.length;
    const totalAll = state.materials.length;

    // Atualiza contadores
    if (totalFiltered === totalAll) {
      DOM.resultsCount.textContent = `Exibindo todos os ${totalAll} materiais catalogados`;
    } else {
      DOM.resultsCount.textContent = `Exibindo ${totalFiltered} de ${totalAll} materiais`;
    }

    // Se nenhum resultado for encontrado
    if (totalFiltered === 0) {
      DOM.materialsGroupContainer.innerHTML = '';
      DOM.emptyState.hidden = false;
      return;
    }

    DOM.emptyState.hidden = true;
    const grouped = groupMaterials(filtered);
    let outputHTML = '';

    grouped.forEach((categories, discipline) => {
      let discTotalFiles = 0;
      categories.forEach(items => (discTotalFiles += items.length));

      outputHTML += `
        <article class="discipline-block">
          <header class="discipline-header">
            <div class="discipline-title-group">
              <h2 class="discipline-title">${escapeHTML(discipline)}</h2>
              <span class="discipline-badge">${discTotalFiles} ${discTotalFiles === 1 ? 'arquivo' : 'arquivos'}</span>
            </div>
          </header>
          <div class="discipline-content">
      `;

      // Ordem amigável de categorias: Livros, Slides, Atividades, Artigos Para Ler, Geral, Outros
      const sortedCategories = Array.from(categories.keys()).sort((a, b) => {
        const priority = { 'Livros': 1, 'Slides': 2, 'Atividades': 3, 'Artigos Para Ler': 4, 'Geral': 5 };
        const pA = priority[a] || 99;
        const pB = priority[b] || 99;
        return pA - pB || a.localeCompare(b, 'pt-BR');
      });

      for (const catName of sortedCategories) {
        const items = categories.get(catName);
        outputHTML += `
          <div class="category-group">
            <div class="category-header">
              <h3 class="category-name">${escapeHTML(catName)}</h3>
              <span class="category-count">(${items.length})</span>
            </div>
            <div class="materials-grid">
        `;

        for (const item of items) {
          const ext = getFileExtension(item.name);
          const icon = getFileIcon(ext);
          const canPreview = isPreviewable(ext);

          outputHTML += `
            <div class="material-card">
              <div class="material-card-body">
                <div class="file-icon-wrapper ${icon.typeClass}" title="${ext ? ext.toUpperCase() : 'Arquivo'}">
                  ${icon.svg}
                </div>
                <div class="file-meta">
                  <div class="file-name" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</div>
                  <div class="file-submeta">
                    <span class="file-size">${escapeHTML(item.size_human)}</span>
                  </div>
                </div>
              </div>

              <div class="material-card-actions">
                <a href="${escapeHTML(item.download_url)}" download="${escapeHTML(item.name)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-download" title="Baixar ${escapeHTML(item.name)}">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Baixar</span>
                </a>

                ${canPreview ? `
                  <button type="button" class="btn-action btn-preview" data-preview-index="${filtered.indexOf(item)}" data-preview-url="${escapeHTML(item.download_url)}" data-file-name="${escapeHTML(item.name)}" data-file-meta="${escapeHTML(item.discipline)} • ${escapeHTML(item.category)} • ${escapeHTML(item.size_human)}" data-file-ext="${ext}" title="Pré-visualizar ${escapeHTML(item.name)}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Visualizar</span>
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }

        outputHTML += `
            </div>
          </div>
        `;
      }

      outputHTML += `
          </div>
        </article>
      `;
    });

    DOM.materialsGroupContainer.innerHTML = outputHTML;
  }

  // --- Sistema de Pré-visualização (Modal Preview) ---

  function updatePreviewNavButtons() {
    if (!DOM.previewPrevBtn || !DOM.previewNextBtn) return;
    
    // Procura o item previewable anterior
    let hasPrev = false;
    for (let i = state.previewIndex - 1; i >= 0; i--) {
      const ext = getFileExtension(state.currentFilteredList[i].name);
      if (isPreviewable(ext)) {
        hasPrev = true;
        break;
      }
    }

    // Procura o próximo item previewable
    let hasNext = false;
    for (let i = state.previewIndex + 1; i < state.currentFilteredList.length; i++) {
      const ext = getFileExtension(state.currentFilteredList[i].name);
      if (isPreviewable(ext)) {
        hasNext = true;
        break;
      }
    }

    DOM.previewPrevBtn.disabled = !hasPrev;
    DOM.previewNextBtn.disabled = !hasNext;
  }

  function navigatePreview(direction) {
    if (state.previewIndex === -1) return;
    let targetIndex = state.previewIndex + direction;

    while (targetIndex >= 0 && targetIndex < state.currentFilteredList.length) {
      const item = state.currentFilteredList[targetIndex];
      const ext = getFileExtension(item.name);
      if (isPreviewable(ext)) {
        state.previewIndex = targetIndex;
        openPreview(
          item.download_url,
          item.name,
          `${item.discipline} • ${item.category} • ${item.size_human}`,
          ext,
          targetIndex
        );
        return;
      }
      targetIndex += direction;
    }
  }

  function openPreview(url, fileName, fileMeta, ext, index = -1) {
    if (!DOM.previewModal) return;

    state.previewIndex = index;
    updatePreviewNavButtons();

    const icon = getFileIcon(ext);
    DOM.previewModalTitle.textContent = fileName;
    DOM.previewModalMeta.textContent = fileMeta;
    DOM.previewModalIcon.className = `preview-file-icon ${icon.typeClass}`;
    DOM.previewModalIcon.innerHTML = icon.svg;

    DOM.previewDownloadBtn.href = url;
    DOM.previewDownloadBtn.setAttribute('download', fileName);
    DOM.previewNewTabBtn.href = url;

    // Constrói o corpo do preview de acordo com o tipo do arquivo
    DOM.previewModalBody.innerHTML = '';

    if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = fileName;
      img.loading = 'lazy';
      DOM.previewModalBody.appendChild(img);
    } else if (ext === 'pdf') {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.title = fileName;
      DOM.previewModalBody.appendChild(iframe);
    } else {
      DOM.previewModalBody.innerHTML = `
        <div class="preview-unsupported-card">
          <div class="file-icon-wrapper ${icon.typeClass}" style="width: 56px; height: 56px;">
            ${icon.svg}
          </div>
          <h3>Pré-visualização não suportada para este formato</h3>
          <p>Você pode abrir diretamente em uma nova aba ou realizar o download do arquivo.</p>
          <div style="display: flex; gap: 0.5rem;">
            <a href="${escapeHTML(url)}" download="${escapeHTML(fileName)}" class="btn-action btn-download">Baixar arquivo</a>
            <a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-preview">Abrir link</a>
          </div>
        </div>
      `;
    }

    // Abre o elemento dialog nativo
    if (typeof DOM.previewModal.showModal === 'function') {
      DOM.previewModal.showModal();
    } else {
      DOM.previewModal.setAttribute('open', '');
    }
  }

  function closePreview() {
    if (!DOM.previewModal) return;
    state.previewIndex = -1;
    if (typeof DOM.previewModal.close === 'function') {
      DOM.previewModal.close();
    } else {
      DOM.previewModal.removeAttribute('open');
    }
    // Limpa o corpo para descarregar o iframe / parar consumo de memória
    DOM.previewModalBody.innerHTML = '';
  }

  function applyFilters() {
    const filtered = getFilteredMaterials();
    state.currentFilteredList = filtered;
    renderCatalog(filtered);
  }

  // --- Event Listeners e Inicialização ---

  function setupEventListeners() {
    // Busca em tempo real
    DOM.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      DOM.clearSearchBtn.hidden = !state.searchQuery;
      syncURLParams();
      applyFilters();
    });

    // Limpar busca
    DOM.clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.hidden = true;
      DOM.searchInput.focus();
      syncURLParams();
      applyFilters();
    });

    // Resetar filtros no empty state
    DOM.resetFiltersBtn.addEventListener('click', () => {
      state.searchQuery = '';
      state.selectedDiscipline = 'ALL';
      state.selectedCategory = 'ALL';
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.hidden = true;
      updateActiveChips();
      syncURLParams();
      applyFilters();
    });

    // Atalhos de teclado
    window.addEventListener('keydown', (e) => {
      // Se o modal estiver aberto, permite navegar com setas
      if (DOM.previewModal && DOM.previewModal.open) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigatePreview(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigatePreview(1);
        }
        return;
      }

      // Atalho de teclado '/' para focar na busca
      if (e.key === '/' && document.activeElement !== DOM.searchInput) {
        e.preventDefault();
        DOM.searchInput.focus();
      }
    });

    // Eventos do Modal de Preview
    DOM.materialsGroupContainer.addEventListener('click', (e) => {
      const previewBtn = e.target.closest('.btn-preview');
      if (previewBtn && previewBtn.dataset.previewUrl) {
        e.preventDefault();
        const url = previewBtn.dataset.previewUrl;
        const name = previewBtn.dataset.fileName;
        const meta = previewBtn.dataset.fileMeta;
        const ext = previewBtn.dataset.fileExt;
        const index = parseInt(previewBtn.dataset.previewIndex, 10);
        openPreview(url, name, meta, ext, isNaN(index) ? -1 : index);
      }
    });

    if (DOM.previewPrevBtn) {
      DOM.previewPrevBtn.addEventListener('click', () => navigatePreview(-1));
    }
    if (DOM.previewNextBtn) {
      DOM.previewNextBtn.addEventListener('click', () => navigatePreview(1));
    }

    if (DOM.closePreviewBtn) {
      DOM.closePreviewBtn.addEventListener('click', closePreview);
    }

    if (DOM.previewModal) {
      // Fecha ao clicar fora do conteúdo (no backdrop)
      DOM.previewModal.addEventListener('click', (e) => {
        const rect = DOM.previewModal.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          closePreview();
        }
      });

      // Limpa ao fechar via tecla Esc
      DOM.previewModal.addEventListener('close', () => {
        DOM.previewModalBody.innerHTML = '';
      });
    }
  }

  /** Inicialização principal e carregamento dos dados */
  async function init() {
    initTheme();
    loadURLParams();
    setupEventListeners();

    try {
      // Carrega índice de dados
      const response = await fetch('data/index.json');
      if (!response.ok) {
        throw new Error(`Erro HTTP ao carregar índice: ${response.status}`);
      }

      const data = await response.json();
      state.materials = data;
      state.disciplines = extractDisciplines(data);
      state.categories = extractCategories(data);

      // Oculta loading
      DOM.loadingState.hidden = true;

      // Renderiza os componentes
      renderDisciplineChips();
      renderCategoryChips();
      updateActiveChips();
      applyFilters();
    } catch (err) {
      console.error('Falha ao carregar catálogo de materiais:', err);
      DOM.loadingState.innerHTML = `
        <div class="empty-icon" style="color: #ef4444;" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2>Não foi possível carregar os materiais</h2>
        <p>Certifique-se de que o arquivo <code>data/index.json</code> foi gerado e está acessível.</p>
        <button onclick="location.reload()" class="btn-secondary">Tentar novamente</button>
      `;
    }
  }

  // Inicia a aplicação quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

