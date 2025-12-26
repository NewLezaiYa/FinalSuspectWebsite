class EnhancedSearchEngine {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.searchResults = document.querySelector('.search-results');
        this.searchableContent = [];
        this.allPages = [];
        this.categories = [];
        this.activeFilter = 'all';
        this.debounceTimer = null;
        this.searchIndexLoaded = false;

        this.init();
    }

    async init() {
        this.collectCurrentPageContent();
        await this.loadSearchIndex();
        this.setupEventListeners();
        this.setupUI();
    }

    collectCurrentPageContent() {
        // 收集当前页面的内容
        const sections = document.querySelectorAll('.section');

        sections.forEach(section => {
            const title = section.querySelector('.section-title')?.textContent || '';
            const content = section.querySelector('.section-content')?.textContent || '';
            const link = section.querySelector('.feature-link')?.href || '';
            const icon = section.querySelector('.section-title i')?.className || 'fas fa-file-alt';

            if (title && content) {
                this.searchableContent.push({
                    id: section.id || '',
                    title: this.cleanText(title),
                    content: this.cleanText(content),
                    description: content.substring(0, 200),
                    link: link,
                    icon: icon,
                    category: '当前页面',
                    isLocal: true,
                    element: section
                });
            }
        });

        // 添加页面标题
        this.searchableContent.push({
            id: 'home',
            title: 'FinalSuspect 模组文档',
            content: this.cleanText(document.querySelector('.hero-tagline')?.textContent || ''),
            description: 'The ultimate mod for the original Among Us, redefining your space werewolf hunting experience',
            link: window.location.href,
            icon: 'fas fa-home',
            category: '主页',
            isLocal: true
        });
    }

    async loadSearchIndex() {
        try {
            const response = await fetch('search-index.json');
            if (!response.ok) throw new Error('搜索索引加载失败');

            const data = await response.json();
            this.allPages = data.pages;
            this.categories = data.categories;

            // 将远程页面添加到搜索内容中
            this.allPages.forEach(page => {
                this.searchableContent.push({
                    ...page,
                    isLocal: false,
                    content: page.description,
                    icon: page.icon || 'fas fa-file-alt'
                });
            });

            this.searchIndexLoaded = true;
            console.log('搜索索引加载成功，共加载', this.allPages.length, '个页面');
        } catch (error) {
            console.error('加载搜索索引失败:', error);
            // 使用备用数据
            this.loadFallbackIndex();
        }
    }

    loadFallbackIndex() {
        // 备用索引数据（如果JSON文件无法加载）
        this.allPages = [
            {
                id: 'intro',
                title: 'FinalSuspect 简介',
                description: '了解Final Suspect模组的详细信息',
                url: 'FinalSuspect/Introduction',
                icon: 'fas fa-book-open',
                category: '基础'
            },
            {
                id: 'faq',
                title: 'FinalSuspect 疑难解答',
                description: '常见问题解答和解决方案',
                url: 'FinalSuspect/FAQ',
                icon: 'fas fa-life-ring',
                category: '帮助'
            },
            {
                id: 'options',
                title: 'FinalSuspect 选项',
                description: '超过20项可调节选项',
                url: 'FinalSuspect/Options/',
                icon: 'fas fa-sliders-h',
                category: '配置'
            }
        ];

        this.allPages.forEach(page => {
            this.searchableContent.push({
                ...page,
                isLocal: false,
                content: page.description
            });
        });

        this.searchIndexLoaded = true;
    }

    setupUI() {
        // 添加搜索过滤器和统计信息容器
        const searchHeader = document.createElement('div');
        searchHeader.className = 'search-header';
        searchHeader.innerHTML = `
            <div class="search-filter">
                <button class="filter-btn active" data-filter="all">全部</button>
                <button class="filter-btn" data-filter="current">当前页面</button>
                ${this.categories.map(cat =>
            `<button class="filter-btn" data-filter="${cat.id}">${cat.name}</button>`
        ).join('')}
            </div>
            <div class="search-stats">
                <span class="result-count">共找到 <span id="resultCount">0</span> 个结果</span>
                <span class="search-time" id="searchTime"></span>
            </div>
        `;

        this.searchResults.prepend(searchHeader);

        // 添加过滤器事件监听
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.filter;

                // 重新执行当前搜索
                if (this.searchInput.value.trim()) {
                    this.handleSearch(this.searchInput.value);
                }
            });
        });
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.searchInput.addEventListener('focus', () => {
            if (!this.searchInput.value.trim()) {
                this.showSearchSuggestions();
            } else if (this.searchResults.children.length > 2) { // 2 = header + stats
                this.searchResults.style.display = 'block';
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.searchResults.style.display = 'none';
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.focus();
                this.searchInput.select();
            }

            if (e.key === 'Escape') {
                this.searchResults.style.display = 'none';
                this.searchInput.blur();
            }

            // 上下箭头导航搜索结果
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && this.searchResults.style.display === 'block') {
                this.navigateResults(e.key);
                e.preventDefault();
            }
        });
    }

    navigateResults(direction) {
        const results = this.searchResults.querySelectorAll('.search-result-item');
        if (results.length === 0) return;

        const currentFocus = document.activeElement;
        let nextIndex = 0;

        if (currentFocus.classList.contains('search-result-item')) {
            const currentIndex = Array.from(results).indexOf(currentFocus);
            nextIndex = direction === 'ArrowDown'
                ? Math.min(currentIndex + 1, results.length - 1)
                : Math.max(currentIndex - 1, 0);
        }

        results[nextIndex]?.focus();
    }

    async handleSearch(query) {
        clearTimeout(this.debounceTimer);

        if (!query.trim()) {
            this.searchResults.style.display = 'none';
            return;
        }

        // 显示加载状态
        this.showLoading();

        this.debounceTimer = setTimeout(async () => {
            const startTime = performance.now();
            const results = await this.searchContent(query);
            const endTime = performance.now();

            this.displayResults(results, query, endTime - startTime);
        }, 300);
    }

    async searchContent(query) {
        const searchTerm = query.toLowerCase().trim();
        const terms = searchTerm.split(/\s+/).filter(term => term.length > 0);

        if (terms.length === 0) return [];

        // 给每个内容项评分
        const scoredResults = this.searchableContent
            .filter(item => this.filterItem(item))
            .map(item => {
                let score = 0;
                let matchedTerms = [];

                terms.forEach(term => {
                    // 标题匹配（最高权重）
                    if (item.title.toLowerCase().includes(term)) {
                        score += 10;
                        matchedTerms.push(term);
                    }

                    // 内容匹配
                    if (item.content.toLowerCase().includes(term)) {
                        score += 5;
                        matchedTerms.push(term);
                    }

                    // 描述匹配
                    if (item.description?.toLowerCase().includes(term)) {
                        score += 3;
                        matchedTerms.push(term);
                    }

                    // 关键词匹配
                    if (item.keywords?.some(keyword =>
                        keyword.toLowerCase().includes(term) || term.includes(keyword.toLowerCase())
                    )) {
                        score += 8;
                        matchedTerms.push(term);
                    }

                    // 分类匹配
                    if (item.category?.toLowerCase().includes(term)) {
                        score += 2;
                    }
                });

                // 去除重复的匹配词
                matchedTerms = [...new Set(matchedTerms)];

                return {
                    ...item,
                    score,
                    matchedTerms,
                    matchCount: matchedTerms.length
                };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => {
                // 按分数降序排序
                if (b.score !== a.score) return b.score - a.score;
                // 分数相同时按匹配词数量排序
                if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
                // 其他条件相同时，本地内容优先
                if (a.isLocal !== b.isLocal) return a.isLocal ? -1 : 1;
                return 0;
            });

        return scoredResults;
    }

    filterItem(item) {
        if (this.activeFilter === 'all') return true;
        if (this.activeFilter === 'current') return item.isLocal;
        return item.category === this.activeFilter;
    }

    displayResults(results, query, searchTime) {
        const resultsContainer = this.searchResults.querySelector('.search-results-container');
        const resultCount = document.getElementById('resultCount');
        const searchTimeElement = document.getElementById('searchTime');

        // 更新统计信息
        resultCount.textContent = results.length;
        searchTimeElement.textContent = `搜索用时 ${searchTime.toFixed(0)}ms`;

        // 创建或获取结果容器
        let container = this.searchResults.querySelector('.search-results-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'search-results-container';
            this.searchResults.appendChild(container);
        }

        if (results.length === 0) {
            container.innerHTML = this.getNoResultsHTML(query);
        } else {
            container.innerHTML = results.map(result =>
                this.getResultItemHTML(result, query)
            ).join('');

            // 为结果项添加事件监听
            container.querySelectorAll('.search-result-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.navigateToResult(results[index]);
                });

                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.navigateToResult(results[index]);
                    }
                });

                item.tabIndex = 0;
            });
        }

        this.searchResults.style.display = 'block';
        this.saveSearchHistory(query, results.length);
    }

    getResultItemHTML(result, query) {
        const highlightedTitle = this.highlightText(result.title, query);
        const highlightedDesc = this.highlightText(
            result.description || result.content.substring(0, 150) + '...',
            query
        );

        const url = result.isLocal ?
            (result.link || (result.element ? `#${result.element.id}` : '#')) :
            result.url;

        return `
            <div class="search-result-item">
                <div class="search-result-title">
                    <i class="${result.icon}"></i>
                    ${highlightedTitle}
                    ${result.category ? `<span class="search-category">${result.category}</span>` : ''}
                    ${result.isLocal ? '<span class="search-category" style="background: rgba(255,71,87,0.1); color: var(--accent);">当前页面</span>' : ''}
                </div>
                <div class="search-result-desc">${highlightedDesc}</div>
                <div class="search-result-url">
                    <i class="fas fa-link"></i>
                    ${url.startsWith('#') ? '本页' : url}
                </div>
            </div>
        `;
    }

    getNoResultsHTML(query) {
        const suggestions = this.getSearchSuggestions(query);

        return `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <div style="margin-bottom: 15px;">没有找到与 "<strong>${query}</strong>" 相关的结果</div>
                
                ${suggestions.length > 0 ? `
                    <div class="search-suggestions">
                        <div class="suggestion-title">建议尝试搜索：</div>
                        <div class="suggestion-list">
                            ${suggestions.map(suggestion =>
            `<div class="suggestion-item" onclick="document.querySelector('.search-input').value='${suggestion}';document.querySelector('.search-input').dispatchEvent(new Event('input'))">${suggestion}</div>`
        ).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div style="margin-top: 20px; color: var(--text-secondary); font-size: 0.9rem;">
                    <p>搜索提示：</p>
                    <ul style="padding-left: 20px; margin-top: 5px;">
                        <li>尝试不同的关键词</li>
                        <li>检查拼写是否正确</li>
                        <li>使用更通用的词语</li>
                        <li>使用左侧过滤器筛选类型</li>
                    </ul>
                </div>
            </div>
        `;
    }

    showLoading() {
        let container = this.searchResults.querySelector('.search-results-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'search-results-container';
            this.searchResults.appendChild(container);
        }

        container.innerHTML = `
            <div class="search-loading">
                <i class="fas fa-spinner"></i>
                <div>正在搜索...</div>
            </div>
        `;

        this.searchResults.style.display = 'block';
    }

    showSearchSuggestions() {
        const history = this.getSearchHistory();
        const popularSearches = ['安装教程', '选项设置', '常见问题', '快捷键', '角色介绍', '更新日志'];

        let container = this.searchResults.querySelector('.search-results-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'search-results-container';
            this.searchResults.appendChild(container);
        }

        let html = `
            <div class="search-suggestions">
                ${history.length > 0 ? `
                    <div class="suggestion-title">
                        搜索历史
                        <span class="clear-history" onclick="searchEngine.clearSearchHistory()">清除</span>
                    </div>
                    <div class="search-history">
                        ${history.slice(0, 5).map(item => `
                            <div class="history-item" onclick="document.querySelector('.search-input').value='${item.query}';document.querySelector('.search-input').dispatchEvent(new Event('input'))">
                                <div class="history-query">
                                    <i class="fas fa-history"></i> ${item.query}
                                </div>
                                <div>
                                    <span class="history-time">${this.formatTimeAgo(item.timestamp)}</span>
                                    <span class="history-remove" onclick="event.stopPropagation();searchEngine.removeSearchHistory('${item.query}')">
                                        <i class="fas fa-times"></i>
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="suggestion-title" style="margin-top: 15px;">热门搜索</div>
                <div class="suggestion-list">
                    ${popularSearches.map(term =>
            `<div class="suggestion-item" onclick="document.querySelector('.search-input').value='${term}';document.querySelector('.search-input').dispatchEvent(new Event('input'))">${term}</div>`
        ).join('')}
                </div>
                
                <div class="suggestion-title" style="margin-top: 15px;">快速导航</div>
                <div class="suggestion-list">
                    ${this.allPages.slice(0, 8).map(page =>
            `<div class="suggestion-item" onclick="window.location.href='${page.url}'">
                            <i class="${page.icon}"></i> ${page.title}
                         </div>`
        ).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.searchResults.style.display = 'block';
    }

    getSearchSuggestions(query) {
        if (!query || query.length < 2) return [];

        const suggestions = new Set();

        // 从标题中提取建议
        this.searchableContent.forEach(item => {
            if (item.title.toLowerCase().includes(query.toLowerCase())) {
                const words = item.title.split(/[\s\-·]/);
                words.forEach(word => {
                    if (word.length > query.length && word.toLowerCase().includes(query.toLowerCase())) {
                        suggestions.add(word);
                    }
                });
            }
        });

        // 从关键词中提取建议
        this.searchableContent.forEach(item => {
            if (item.keywords) {
                item.keywords.forEach(keyword => {
                    if (keyword.toLowerCase().includes(query.toLowerCase())) {
                        suggestions.add(keyword);
                    }
                });
            }
        });

        return Array.from(suggestions).slice(0, 5);
    }

    navigateToResult(result) {
        if (result.isLocal) {
            if (result.element) {
                result.element.scrollIntoView({ behavior: 'smooth' });
                // 添加高亮效果
                result.element.style.boxShadow = '0 0 0 3px var(--accent)';
                setTimeout(() => {
                    result.element.style.boxShadow = '';
                }, 2000);
            } else if (result.link) {
                window.location.href = result.link;
            }
        } else if (result.url) {
            if (result.url.startsWith('#')) {
                const target = document.querySelector(result.url);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.location.href = result.url;
            }
        }

        this.searchResults.style.display = 'none';
        this.searchInput.value = '';
    }

    highlightText(text, query) {
        if (!text || !query) return text;

        const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        let highlighted = text;

        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="search-result-highlight">$1</span>');
        });

        return highlighted;
    }

    cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // 搜索历史功能
    saveSearchHistory(query, resultCount) {
        const history = this.getSearchHistory();
        const existingIndex = history.findIndex(item => item.query === query);

        if (existingIndex > -1) {
            history.splice(existingIndex, 1);
        }

        history.unshift({
            query,
            resultCount,
            timestamp: Date.now()
        });

        // 只保留最近的20条记录
        const trimmedHistory = history.slice(0, 20);
        localStorage.setItem('fs_search_history', JSON.stringify(trimmedHistory));
    }

    getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('fs_search_history') || '[]');
        } catch (e) {
            return [];
        }
    }

    clearSearchHistory() {
        localStorage.removeItem('fs_search_history');
        this.showSearchSuggestions();
    }

    removeSearchHistory(query) {
        const history = this.getSearchHistory();
        const filtered = history.filter(item => item.query !== query);
        localStorage.setItem('fs_search_history', JSON.stringify(filtered));
        this.showSearchSuggestions();
    }

    formatTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        return `${days}天前`;
    }
}

// 页面加载动画控制类
class PageLoader {
    constructor() {
        this.loader = document.getElementById('pageLoader');
        this.minimumLoadTime = 1000;
        this.loadStartTime = Date.now();

        this.init();
    }

    init() {
        // 预加载搜索索引
        this.preloadSearchIndex();

        window.addEventListener('load', () => {
            const elapsedTime = Date.now() - this.loadStartTime;
            const remainingTime = Math.max(0, this.minimumLoadTime - elapsedTime);

            setTimeout(() => {
                this.hideLoader();
            }, remainingTime);
        });

        // 防止加载时间过长
        setTimeout(() => {
            if (this.loader && !this.loader.classList.contains('fade-out')) {
                this.hideLoader();
            }
        }, 5000);
    }

    async preloadSearchIndex() {
        // 提前加载搜索索引，提升搜索响应速度
        try {
            const response = await fetch('search-index.json');
            await response.json();
        } catch (error) {
            console.log('搜索索引预加载失败，将在需要时重试');
        }
    }

    hideLoader() {
        if (this.loader) {
            this.loader.classList.add('fade-out');

            setTimeout(() => {
                if (this.loader && this.loader.parentNode) {
                    this.loader.parentNode.removeChild(this.loader);
                }
            }, 500);
        }
    }
}

// 全局变量
let searchEngine;

// 初始化功能
document.addEventListener('DOMContentLoaded', () => {
    // 初始化搜索功能
    searchEngine = new EnhancedSearchEngine();

    // 初始化页面加载动画
    const pageLoader = new PageLoader();

    // 添加全局快捷键提示
    const searchInput = document.querySelector('.search-input');
    searchInput.setAttribute('title', '按 Ctrl+K 聚焦搜索框，ESC 关闭搜索结果');

    // 在控制台显示欢迎信息
    console.log('%c🔍 FinalSuspect 搜索系统已就绪', 'color: #00d2ff; font-size: 14px; font-weight: bold;');
    console.log('%c支持多页面搜索、分类过滤、搜索历史和智能建议', 'color: #b0b0d0;');
});