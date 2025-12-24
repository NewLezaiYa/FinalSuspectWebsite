/**
 * version-nav.js - 版本导航交互功能
 * 适用于 FinalSuspect 更新日志页面
 * 功能：版本导航、滚动定位、折叠/隐藏控制
 */

(function () {
    'use strict';

    // ============================================
    // 全局变量和配置
    // ============================================

    // DOM 元素引用
    let versionNav = null;
    let navToggle = null;
    let navHide = null;
    let navShowBtn = null;
    let restoreNavBtn = null;
    let navRestoreTip = null;
    let indicator = null;
    let navItems = null;
    let versionContents = null;

    // 状态管理
    const STORAGE_KEY = 'version_nav_state';
    const DEFAULT_STATE = {
        collapsed: false,
        hidden: false,
        lastActiveVersion: 'v1.3.0_20251005'
    };

    // 动画和交互配置
    const CONFIG = {
        scrollOffset: 100,           // 滚动偏移量
        scrollDetectionDelay: 100,   // 滚动检测延迟
        indicatorDuration: 3000,     // 指示器显示时长
        restoreTipDuration: 3000,    // 恢复提示显示时长
        touchSwipeThreshold: 50,     // 触摸滑动阈值
        touchVerticalMax: 30         // 垂直移动最大值
    };

    // 当前活动版本
    let activeVersion = '1.3.0';

    // 定时器引用
    let scrollTimeout = null;
    let indicatorTimeout = null;
    let restoreTipTimeout = null;

    // ============================================
    // 初始化函数
    // ============================================

    /**
     * 初始化所有功能
     */
    function init() {
        // 检查是否在更新日志页面
        if (!document.querySelector('.changelog-content')) {
            console.log('不在更新日志页面，跳过导航栏初始化');
            return;
        }

        // 获取 DOM 元素
        getDOMElements();

        // 验证必要元素
        if (!validateElements()) {
            console.error('导航栏初始化失败：缺少必要的 DOM 元素');
            return;
        }

        // 设置初始状态
        setupInitialState();

        // 绑定事件监听器
        bindEventListeners();

        // 初始滚动检测
        checkVisibleVersion();

        // 初始化完成
        console.log('版本导航已加载完成');
        console.log('快捷键: Alt+N 显示/隐藏导航 | Alt+C 折叠/展开导航 | ESC 关闭提示');
    }

    /**
     * 获取 DOM 元素引用
     */
    function getDOMElements() {
        versionNav = document.getElementById('versionNav');
        navToggle = document.getElementById('navToggle');
        navHide = document.getElementById('navHide');
        navShowBtn = document.getElementById('navShowBtn');
        restoreNavBtn = document.getElementById('restoreNavBtn');
        navRestoreTip = document.getElementById('navRestoreTip');
        navItems = document.querySelectorAll('.nav-item');
        versionContents = document.querySelectorAll('.changelog-content');
    }

    /**
     * 验证必要元素是否存在
     */
    function validateElements() {
        const requiredElements = [
            versionNav, navToggle, navHide, navShowBtn,
            restoreNavBtn, navRestoreTip
        ];

        return requiredElements.every(element => element !== null);
    }

    /**
     * 设置初始状态
     */
    function setupInitialState() {
        // 创建当前版本指示器
        createIndicator();

        // 从本地存储获取状态
        const savedState = getSavedState();

        // 应用保存的状态
        applyNavState(savedState);

        // 更新折叠按钮图标
        updateToggleIcon();

        // 设置初始活动版本
        activeVersion = savedState.lastActiveVersion || '1.3.0';
        updateActiveNavItem(activeVersion);
    }

    /**
     * 创建当前版本指示器
     */
    function createIndicator() {
        indicator = document.createElement('div');
        indicator.className = 'current-version-indicator';
        indicator.innerHTML = '<span>当前查看: <strong>1.3.0 正式版</strong></span>';
        document.body.appendChild(indicator);
    }

    // ============================================
    // 状态管理函数
    // ============================================

    /**
     * 从本地存储获取状态
     */
    function getSavedState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : { ...DEFAULT_STATE };
        } catch (error) {
            console.error('读取本地存储失败:', error);
            return { ...DEFAULT_STATE };
        }
    }

    /**
     * 保存状态到本地存储
     */
    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('保存到本地存储失败:', error);
        }
    }

    /**
     * 应用导航状态
     */
    function applyNavState(state) {
        // 应用隐藏状态
        if (state.hidden) {
            versionNav.classList.add('hidden');
            navShowBtn.classList.add('visible');
            showRestoreTip();
        } else {
            versionNav.classList.remove('hidden');
            navShowBtn.classList.remove('visible');
        }

        // 应用折叠状态
        if (state.collapsed) {
            versionNav.classList.add('collapsed');
        } else {
            versionNav.classList.remove('collapsed');
        }

        // 保存活动版本
        state.lastActiveVersion = activeVersion;
        saveState(state);
    }

    // ============================================
    // 导航控制函数
    // ============================================

    /**
     * 切换折叠状态
     */
    function toggleCollapse() {
        const currentState = getSavedState();
        currentState.collapsed = !currentState.collapsed;
        applyNavState(currentState);
        updateToggleIcon();

        // 添加动画反馈
        animateButtonFeedback(navToggle);
    }

    /**
     * 更新折叠按钮图标
     */
    function updateToggleIcon() {
        const isCollapsed = versionNav.classList.contains('collapsed');
        navToggle.innerHTML = isCollapsed ?
            '<i class="fas fa-chevron-right"></i>' :
            '<i class="fas fa-chevron-left"></i>';
        navToggle.title = isCollapsed ? '展开导航' : '折叠导航';
    }

    /**
     * 隐藏导航栏
     */
    function hideNav() {
        const currentState = getSavedState();
        currentState.hidden = true;
        applyNavState(currentState);

        // 显示恢复提示
        showRestoreTip();

        // 添加脉冲动画
        navShowBtn.classList.add('pulsing');
        setTimeout(() => {
            navShowBtn.classList.remove('pulsing');
        }, 2000);

        // 添加动画反馈
        animateButtonFeedback(navHide);
    }

    /**
     * 显示导航栏
     */
    function showNav() {
        const currentState = getSavedState();
        currentState.hidden = false;
        applyNavState(currentState);

        // 隐藏恢复提示
        hideRestoreTip();

        // 添加动画反馈
        animateButtonFeedback(navShowBtn);
    }

    /**
     * 按钮动画反馈
     */
    function animateButtonFeedback(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 300);
    }

    // ============================================
    // 提示和指示器函数
    // ============================================

    /**
     * 显示恢复提示
     */
    function showRestoreTip() {
        navRestoreTip.classList.add('visible');

        // 清除之前的定时器
        if (restoreTipTimeout) {
            clearTimeout(restoreTipTimeout);
        }

        // 设置自动隐藏
        restoreTipTimeout = setTimeout(() => {
            hideRestoreTip();
        }, CONFIG.restoreTipDuration);
    }

    /**
     * 隐藏恢复提示
     */
    function hideRestoreTip() {
        navRestoreTip.classList.remove('visible');

        if (restoreTipTimeout) {
            clearTimeout(restoreTipTimeout);
            restoreTipTimeout = null;
        }
    }

    /**
     * 更新当前版本指示器
     */
    function updateIndicator(version, type) {
        indicator.innerHTML = `<span>当前查看: <strong>${version} ${type}</strong></span>`;
        indicator.classList.add('show');

        // 清除之前的定时器
        if (indicatorTimeout) {
            clearTimeout(indicatorTimeout);
        }

        // 设置自动隐藏
        indicatorTimeout = setTimeout(() => {
            indicator.classList.remove('show');
        }, CONFIG.indicatorDuration);
    }

    // ============================================
    // 导航和滚动功能
    // ============================================

    /**
     * 平滑滚动到元素
     */
    function smoothScrollTo(element) {
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - CONFIG.scrollOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * 更新活动导航项
     */
    function updateActiveNavItem(version) {
        navItems.forEach(item => {
            const isActive = item.getAttribute('data-version') === version;
            item.classList.toggle('active', isActive);
        });
    }

    /**
     * 导航到指定版本
     */
    function navigateToVersion(version) {
        const versionType = document.querySelector(`.nav-item[data-version="${version}"] .version-type`)?.textContent || '';
        const targetId = `v${version}`;
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // 更新活动状态
            activeVersion = version;
            updateActiveNavItem(version);

            // 平滑滚动到目标
            smoothScrollTo(targetElement);

            // 更新指示器
            updateIndicator(version, versionType);

            // 移动端：如果导航栏隐藏，滚动后自动显示
            if (window.innerWidth <= 992 && versionNav.classList.contains('hidden')) {
                showNav();
            }

            // 保存活动版本
            const currentState = getSavedState();
            currentState.lastActiveVersion = version;
            saveState(currentState);
        }
    }

    /**
     * 检查当前可见的版本
     */
    function checkVisibleVersion() {
        let currentVisibleVersion = null;
        let maxVisibleArea = 0;

        versionContents.forEach(content => {
            const rect = content.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // 计算元素在视口中的可见比例
            const visibleTop = Math.max(rect.top, 0);
            const visibleBottom = Math.min(rect.bottom, windowHeight);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibleRatio = visibleHeight / rect.height;

            // 如果可见比例超过30%，并且是当前可见面积最大的
            if (visibleRatio > 0.3 && visibleHeight > maxVisibleArea) {
                maxVisibleArea = visibleHeight;
                currentVisibleVersion = content.id.replace('v', '');
            }
        });

        // 更新活动导航项
        if (currentVisibleVersion && currentVisibleVersion !== activeVersion) {
            activeVersion = currentVisibleVersion;
            updateActiveNavItem(currentVisibleVersion);

            // 保存活动版本
            const currentState = getSavedState();
            currentState.lastActiveVersion = currentVisibleVersion;
            saveState(currentState);
        }
    }

    /**
     * 防抖滚动检测
     */
    function debouncedCheckVisibleVersion() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(checkVisibleVersion, CONFIG.scrollDetectionDelay);
    }

    // ============================================
    // 事件处理函数
    // ============================================

    /**
     * 绑定所有事件监听器
     */
    function bindEventListeners() {
        // 导航控制按钮事件
        navToggle.addEventListener('click', toggleCollapse);
        navHide.addEventListener('click', hideNav);
        navShowBtn.addEventListener('click', showNav);
        restoreNavBtn.addEventListener('click', showNav);

        // 导航项点击事件
        navItems.forEach(item => {
            item.addEventListener('click', handleNavItemClick);
        });

        // 滚动事件
        window.addEventListener('scroll', debouncedCheckVisibleVersion);

        // 页面其他地方点击隐藏恢复提示
        document.addEventListener('click', handleDocumentClick);

        // 键盘事件
        document.addEventListener('keydown', handleKeyDown);

        // 触摸事件（移动端）
        setupTouchEvents();

        // 窗口大小变化事件
        window.addEventListener('resize', handleResize);

        // 移动端导航栏头部点击事件
        setupMobileNavToggle();
    }

    /**
     * 处理导航项点击
     */
    function handleNavItemClick(event) {
        event.preventDefault();
        const version = this.getAttribute('data-version');
        navigateToVersion(version);
    }

    /**
     * 处理文档点击（隐藏恢复提示）
     */
    function handleDocumentClick(event) {
        if (!navRestoreTip.contains(event.target) && event.target !== restoreNavBtn) {
            hideRestoreTip();
        }
    }

    /**
     * 处理键盘事件
     */
    function handleKeyDown(event) {
        // Alt+N 显示/隐藏导航
        if (event.altKey && event.key === 'n') {
            const state = getSavedState();
            if (state.hidden) {
                showNav();
            } else {
                hideNav();
            }
            event.preventDefault();
        }

        // Alt+C 折叠/展开导航
        if (event.altKey && event.key === 'c') {
            toggleCollapse();
            event.preventDefault();
        }

        // ESC 键关闭恢复提示
        if (event.key === 'Escape') {
            hideRestoreTip();
        }

        // 数字键快速导航
        if (event.altKey && event.key >= '1' && event.key <= '4') {
            const index = parseInt(event.key) - 1;
            const navItem = Array.from(navItems)[index];
            if (navItem) {
                const version = navItem.getAttribute('data-version');
                navigateToVersion(version);
                event.preventDefault();
            }
        }
    }

    /**
     * 设置触摸事件
     */
    function setupTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', function (event) {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        });

        document.addEventListener('touchend', function (event) {
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // 检测向右滑动显示导航（仅在移动端且导航隐藏时）
            if (window.innerWidth <= 992 &&
                versionNav.classList.contains('hidden') &&
                diffX > CONFIG.touchSwipeThreshold &&
                Math.abs(diffY) < CONFIG.touchVerticalMax &&
                touchStartX < 50) {
                showNav();
            }
        });
    }

    /**
     * 处理窗口大小变化
     */
    function handleResize() {
        // 重新检测可见版本
        checkVisibleVersion();

        // 移动端调整
        if (window.innerWidth <= 768) {
            versionNav.classList.remove('collapsed');
            updateToggleIcon();
        }
    }

    /**
     * 设置移动端导航栏切换
     */
    function setupMobileNavToggle() {
        const navHeader = versionNav.querySelector('.nav-header');

        if (navHeader) {
            navHeader.addEventListener('click', function (event) {
                // 只在移动端生效
                if (window.innerWidth <= 768 &&
                    !event.target.closest('.nav-controls')) {
                    versionNav.classList.toggle('expanded');
                }
            });
        }
    }

    // ============================================
    // 辅助函数
    // ============================================

    /**
     * 添加按钮点击样式类
     */
    function addButtonClickStyle() {
        const style = document.createElement('style');
        style.textContent = `
            .nav-toggle-btn.clicked,
            .nav-hide-btn.clicked,
            .nav-show-btn.clicked {
                transform: scale(0.9);
                background: rgba(94, 234, 212, 0.3);
            }
            
            .nav-item.clicked {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 增强导航项点击效果
     */
    function enhanceNavItemClicks() {
        navItems.forEach(item => {
            item.addEventListener('mousedown', function () {
                this.classList.add('clicked');
            });

            item.addEventListener('mouseup', function () {
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 150);
            });

            item.addEventListener('mouseleave', function () {
                this.classList.remove('clicked');
            });
        });
    }

    // ============================================
    // 公共 API（可选）
    // ============================================

    /**
     * 导航到指定版本（公共方法）
     */
    window.navigateToVersion = function (version) {
        navigateToVersion(version);
    };

    /**
     * 获取当前活动版本
     */
    window.getCurrentVersion = function () {
        return activeVersion;
    };

    /**
     * 显示/隐藏导航栏
     */
    window.toggleNavVisibility = function () {
        const state = getSavedState();
        if (state.hidden) {
            showNav();
        } else {
            hideNav();
        }
    };

    // ============================================
    // 页面加载后初始化
    // ============================================

    // 等待 DOM 完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM 已经加载完成
        init();
    }

    // 添加按钮点击样式
    addButtonClickStyle();

})();