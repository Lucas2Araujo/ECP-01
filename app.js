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
    selectedDiscipline: 'ALL',
    searchQuery: '',
    theme: 'auto',
  };

  // --- Elementos do DOM ---
  const DOM = {
    html: document.documentElement,
    themeToggle: document.getElementById('themeToggle'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    disciplineChips: document.getElementById('disciplineChips'),
    resultsCount: document.getElementById('resultsCount'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    materialsGroupContainer: document.getElementById('materialsGroupContainer'),
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
          updateActiveChip();
          applyFilters();
        }
      });
    });
  }

  function updateActiveChip() {
    DOM.disciplineChips.querySelectorAll('.chip-btn').forEach(btn => {
      if (btn.getAttribute('data-discipline') === state.selectedDiscipline) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /** Filtra os materiais com base na busca e disciplina selecionada */
  function getFilteredMaterials() {
    const query = normalizeText(state.searchQuery.trim());
    const filterDisc = state.selectedDiscipline;

    return state.materials.filter(item => {
      // Filtro de disciplina
      if (filterDisc !== 'ALL' && item.discipline !== filterDisc) {
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
                  <a href="${escapeHTML(item.download_url)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-preview" title="Visualizar em nova aba">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Visualizar</span>
                  </a>
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

  function applyFilters() {
    const filtered = getFilteredMaterials();
    renderCatalog(filtered);
  }

  // --- Event Listeners e Inicialização ---

  function setupEventListeners() {
    // Busca em tempo real
    DOM.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      DOM.clearSearchBtn.hidden = !state.searchQuery;
      applyFilters();
    });

    // Limpar busca
    DOM.clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.hidden = true;
      DOM.searchInput.focus();
      applyFilters();
    });

    // Resetar filtros no empty state
    DOM.resetFiltersBtn.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.selectedDiscipline = 'ALL';
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.hidden = true;
      updateActiveChip();
      applyFilters();
    });

    // Atalho de teclado '/' para focar na busca
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== DOM.searchInput) {
        e.preventDefault();
        DOM.searchInput.focus();
      }
    });
  }

  /** Inicialização principal e carregamento dos dados */
  async function init() {
    initTheme();
    setupEventListeners();

    try {
      // Adiciona timestamp para evitar cache em desenvolvimento/atualizações recentes
      const response = await fetch('data/index.json');
      if (!response.ok) {
        throw new Error(`Erro HTTP ao carregar índice: ${response.status}`);
      }

      const data = await response.json();
      state.materials = data;
      state.disciplines = extractDisciplines(data);

      // Oculta loading
      DOM.loadingState.hidden = true;

      // Renderiza os componentes
      renderDisciplineChips();
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

