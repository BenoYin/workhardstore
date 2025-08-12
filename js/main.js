import { getAllTools, getTool, initAllTools } from './tools/modules.js';
// 导入所有工具模块，确保工具被注册
import './tools/textConverter.js';
import './tools/passwordGenerator.js';
import './tools/calculator.js';
import './tools/wordCounter.js';

/**
 * 工具类 - 通用功能封装
 */
class Utils {
  /**
   * 验证邮箱格式
   * @param {string} email - 要验证的邮箱地址
   * @returns {boolean} 邮箱格式是否有效
   */
  static validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * 显示提示消息
   * @param {string} message - 提示内容
   * @param {string} type - 提示类型，success或error
   * @param {number} [duration=3000] - 自动关闭时间(毫秒)，0表示不自动关闭
   */
  static showToast(message, type = 'success', duration = 3000) {
    // 创建提示框容器
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-white z-50 transition-all duration-300 flex items-center justify-between gap-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;

    // 提示消息内容
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    toast.appendChild(messageSpan);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ml-2 text-white hover:text-gray-200 transition-colors';
    closeBtn.innerHTML = '<i class="fa fa-times"></i>';
    closeBtn.setAttribute('aria-label', '关闭提示');
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);

    // 自动关闭计时器
    let autoCloseTimer;
    if (duration > 0) {
      autoCloseTimer = setTimeout(() => {
        this.hideToast(toast);
      }, duration);
    }

    // 手动关闭事件
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoCloseTimer); // 清除自动关闭计时器
      this.hideToast(toast);
    });
  }

  /**
   * 隐藏提示消息（带动画效果）
   * @param {HTMLElement} toast - 提示框元素
   */
  static hideToast(toast) {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }

  /**
   * 打开模态框
   * @param {HTMLElement} modal - 模态框元素
   */
  static openModal(modal) {
    if (!modal) {
      console.warn('尝试打开不存在的模态框');
      return;
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  /**
   * 关闭模态框
   * @param {HTMLElement} modal - 模态框元素
   */
  static closeModal(modal) {
    if (!modal) {
      console.warn('尝试关闭不存在的模态框');
      return;
    }
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  /**
   * 切换密码显示状态
   * @param {string} inputId - 密码输入框ID
   * @param {string} toggleBtnId - 切换按钮ID
   */
  static togglePassword(inputId, toggleBtnId) {
    const input = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleBtnId);
    if (!input || !toggleBtn) {
      console.warn('密码切换元素未找到');
      return;
    }
    if (toggleBtn._toggleBound) return; // 防止重复绑定
    toggleBtn._toggleBound = true;

    toggleBtn.addEventListener('click', () => {
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      toggleBtn.innerHTML = type === 'password'
        ? '<i class="fa fa-eye-slash"></i>'
        : '<i class="fa fa-eye"></i>';
    });
  }
}

/**
 * UI 管理器 - 处理所有UI相关交互
 */
class UIManager {
  constructor() {
    this.navbar = document.getElementById('navbar');
    this.backToTop = document.getElementById('backToTop');
    this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    this.mobileMenu = document.getElementById('mobileMenu');
  }

  /**
   * 初始化导航栏滚动效果
   */
  initNavbarScroll() {
    if (!this.navbar || !this.backToTop) {
      console.warn('导航栏或回到顶部按钮元素未找到');
      return;
    }

    window.addEventListener('scroll', () => {
      const isScrolled = window.scrollY > 50;
      this.navbar.classList.toggle('shadow-md', isScrolled);
      this.navbar.classList.toggle('shadow-sm', !isScrolled);

      this.backToTop.classList.toggle('opacity-0', !isScrolled);
      this.backToTop.classList.toggle('invisible', !isScrolled);
      this.backToTop.classList.toggle('opacity-100', isScrolled);
      this.backToTop.classList.toggle('visible', isScrolled);
    });
  }

  /**
   * 初始化回到顶部按钮
   */
  initBackToTop() {
    if (!this.backToTop) {
      console.warn('回到顶部按钮元素未找到');
      return;
    }
    this.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * 初始化移动端菜单
   */
  initMobileMenu() {
    if (!this.mobileMenuBtn || !this.mobileMenu) {
      console.warn('移动端菜单元素未找到');
      return;
    }

    this.mobileMenuBtn.addEventListener('click', () => {
      this.mobileMenu.classList.toggle('hidden');
      const icon = this.mobileMenuBtn.querySelector('i');

      if (this.mobileMenu.classList.contains('hidden')) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      } else {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      }
    });
  }

  /**
   * 初始化平滑滚动（事件委托实现）
   */
  initSmoothScroll() {
    document.addEventListener('click', e => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        if (this.mobileMenu && !this.mobileMenu.classList.contains('hidden')) {
          this.mobileMenu.classList.add('hidden');
          if (this.mobileMenuBtn) {
            const icon = this.mobileMenuBtn.querySelector('i');
            if (icon) {
              icon.classList.remove('fa-times');
              icon.classList.add('fa-bars');
            }
          }
        }
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      } else {
        console.warn(`未找到目标元素: ${targetId}`);
      }
    });
  }

  /**
   * 初始化所有UI组件
   */
  initAll() {
    ['NavbarScroll', 'BackToTop', 'MobileMenu', 'SmoothScroll']
      .forEach(method => this[`init${method}`]?.());
  }
}

/**
 * @typedef {Object} Tool
 * @property {string} id - 工具唯一标识
 * @property {string} name - 工具名称
 * @property {string} icon - 工具图标（HTML字符串）
 * @property {string} description - 工具描述
 * @property {() => string} getContent - 返回工具内容HTML的方法
 * @property {() => void} [cleanup] - 工具卸载时的清理方法（可选）
 */

/**
 * 工具系统管理器 - 处理所有工具相关逻辑
 */
class ToolSystem {
  constructor() {
    this.toolModal = document.getElementById('toolModal');
    this.toolModalTitle = document.getElementById('modalTitle');
    this.toolModalContent = document.getElementById('modalContent');
    this.closeToolModal = document.getElementById('closeModal');
    this.toolSearch = document.getElementById('toolSearch');
    this.searchTimer = null; // 用于搜索防抖的计时器
    this.currentToolId = null; // 当前激活的工具ID
  }

  /**
   * 高亮工具名称和描述中的搜索关键词
   * @param {string} text 原文本
   * @param {string} keyword 搜索关键词
   * @returns {string} 高亮后的HTML字符串
   */
  highlightKeyword(text, keyword) {
    if (!keyword) return text;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  }

  /**
   * 渲染工具列表（带关键词高亮）
   */
  renderToolList() {
    const toolGrid = document.querySelector('#toolsGrid');
    if (!toolGrid) {
      console.warn('工具网格容器未找到');
      return;
    }

    const searchTerm = this.toolSearch?.value.toLowerCase().trim() || '';
    /** @type {Tool[]} */
    const tools = getAllTools(); // 获取所有工具
    toolGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const TOOL_CARD_CLASSES = 'bg-white rounded-xl p-5 shadow-sm card-hover';

    tools.forEach(tool => {
      // 如果搜索词不为空，过滤不匹配的工具
      if (searchTerm && !(
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.description.toLowerCase().includes(searchTerm)
      )) return;

      const toolCard = document.createElement('div');
      toolCard.className = TOOL_CARD_CLASSES;
      toolCard.innerHTML = `
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
          ${tool.icon}
        </div>
        <h3 class="text-lg font-semibold mb-2">${this.highlightKeyword(tool.name, searchTerm)}</h3>
        <p class="text-gray-600 text-sm mb-4">${this.highlightKeyword(tool.description, searchTerm)}</p>
        <button class="tool-btn w-full py-2 border border-primary text-primary rounded-lg text-sm hover:bg-primary/5 transition" 
                data-tool="${tool.id}">
          使用工具
        </button>
      `;
      fragment.appendChild(toolCard);
    });

    toolGrid.appendChild(fragment);
  }

  /**
   * 初始化工具模态框
   */
  initToolModal() {
    if (!this.toolModal || !this.toolModalTitle || !this.toolModalContent || !this.closeToolModal) {
      console.warn('工具模态框元素不完整');
      return;
    }

    // 点击使用工具按钮
    document.addEventListener('click', e => {
      const btn = e.target.closest('.tool-btn');
      if (!btn) return;

      const toolId = btn.getAttribute('data-tool');
      /** @type {Tool|null} */
      const tool = getTool(toolId);

      if (tool) {
        this.currentToolId = toolId;
        this.toolModalTitle.textContent = tool.name;
        this.toolModalContent.innerHTML = tool.getContent();

        document.dispatchEvent(new CustomEvent('toolLoaded', { detail: { toolId } }));
        Utils.openModal(this.toolModal);
      } else {
        console.warn(`未找到ID为${toolId}的工具`);
        Utils.showToast('工具加载失败', 'error');
      }
    });

    // 关闭模态框时清理当前工具
    const closeModalHandler = () => {
      if (this.currentToolId) {
        const tool = getTool(this.currentToolId);
        // 如果工具定义了清理方法，则调用
        if (tool && typeof tool.cleanup === 'function') {
          tool.cleanup();
        }
        document.dispatchEvent(new CustomEvent('toolUnloaded', {
          detail: { toolId: this.currentToolId }
        }));
        this.currentToolId = null;
      }
      Utils.closeModal(this.toolModal);
    };

    this.closeToolModal.addEventListener('click', closeModalHandler);

    this.toolModal.addEventListener('click', e => {
      if (e.target === this.toolModal) {
        closeModalHandler();
      }
    });
  }

  /**
   * 初始化工具搜索功能（带防抖处理）
   */
  initToolSearch() {
    if (!this.toolSearch) {
      console.warn('工具搜索框未找到');
      return;
    }

    this.toolSearch.addEventListener('input', () => {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.renderToolList();
      }, 300);
    });
  }

  /**
   * 初始化所有工具系统功能
   */
  initAll() {
    this.renderToolList();
    this.initToolModal();
    this.initToolSearch();
    initAllTools(); // 初始化工具的预加载等逻辑
  }
}

/**
 * 认证系统管理器 - 基础框架示例
 */
class AuthSystem {
  constructor() {
    // 预先缓存常用DOM元素
    this.loginForm = document.getElementById('loginForm');
    this.registerForm = document.getElementById('registerForm');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.userDisplay = document.getElementById('userDisplay');
  }

  /**
   * 示例登录处理（实际根据你的后端或firebase调整）
   */
  async handleLogin(event) {
    event.preventDefault();
    const email = this.loginForm?.querySelector('input[name="email"]')?.value.trim();
    const password = this.loginForm?.querySelector('input[name="password"]')?.value;

    if (!email || !Utils.validateEmail(email)) {
      Utils.showToast('请输入有效邮箱', 'error');
      return;
    }
    if (!password || password.length < 6) {
      Utils.showToast('密码长度至少6位', 'error');
      return;
    }

    try {
      // 假设异步调用登录API，示例代码：
      // await authAPI.login(email, password);
      // 登录成功后UI更新示例
      this.userDisplay.textContent = `欢迎，${email}`;
      Utils.showToast('登录成功');
      this.loginForm.reset();
    } catch (error) {
      console.error('登录失败', error);
      Utils.showToast('登录失败，请重试', 'error');
    }
  }

  /**
   * 初始化认证相关事件绑定
   */
  initAll() {
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }
    // 这里可以补充注册、登出等事件绑定逻辑
  }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  new UIManager().initAll();
  new ToolSystem().initAll();
  new AuthSystem().initAll();
});