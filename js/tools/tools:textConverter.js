import { registerTool } from './modules.js';

// 注册文本转换工具
registerTool('textConverter', {
  name: '文本转换器',
  description: '提供文本大小写转换、去除空格、反转文本等功能',
  icon: '<i class="fa fa-font text-primary text-2xl"></i>',
  category: 'text', // 属于文本工具分类

  /**
   * 返回工具的HTML内容
   * @returns {string} 工具界面的HTML字符串
   */
  getContent() {
    return `
      <div class="text-converter-container space-y-6">
        <!-- 输入区域 -->
        <div>
          <label for="sourceText" class="block text-sm font-medium text-gray-700 mb-2">
            输入文本
          </label>
          <textarea 
            id="sourceText" 
            class="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
            placeholder="请输入需要处理的文本..."></textarea>
          <div class="flex justify-end mt-2 text-sm text-gray-500">
            <span id="charCount">0 字符</span>
          </div>
        </div>

        <!-- 功能按钮区 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button id="toUpperBtn" class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            <i class="fa fa-arrow-up mr-1"></i> 转大写
          </button>
          <button id="toLowerBtn" class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            <i class="fa fa-arrow-down mr-1"></i> 转小写
          </button>
          <button id="invertCaseBtn" class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            <i class="fa fa-exchange mr-1"></i> 反转大小写
          </button>
          <button id="trimBtn" class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            <i class="fa fa-scissors mr-1"></i> 去除空格
          </button>
          <button id="reverseBtn" class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            <i class="fa fa-rotate-right mr-1"></i> 反转文本
          </button>
          <button id="clearBtn" class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            <i class="fa fa-trash mr-1"></i> 清空
          </button>
          <button id="copyBtn" class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition col-span-2 sm:col-span-1">
            <i class="fa fa-copy mr-1"></i> 复制结果
          </button>
        </div>

        <!-- 输出区域 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            处理结果
          </label>
          <div 
            id="resultText" 
            class="w-full h-32 p-3 border border-gray-300 rounded-lg bg-gray-50 overflow-auto"
          ></div>
        </div>
      </div>
    `;
  },

  /**
   * 工具初始化逻辑（绑定事件、设置交互）
   * @param {HTMLElement} container - 工具的DOM容器
   */
  init(container) {
    // 获取DOM元素
    const sourceText = container.querySelector('#sourceText');
    const resultText = container.querySelector('#resultText');
    const charCount = container.querySelector('#charCount');
    const toUpperBtn = container.querySelector('#toUpperBtn');
    const toLowerBtn = container.querySelector('#toLowerBtn');
    const invertCaseBtn = container.querySelector('#invertCaseBtn');
    const trimBtn = container.querySelector('#trimBtn');
    const reverseBtn = container.querySelector('#reverseBtn');
    const clearBtn = container.querySelector('#clearBtn');
    const copyBtn = container.querySelector('#copyBtn');

    // 实时更新字符计数
    sourceText.addEventListener('input', () => {
      charCount.textContent = `${sourceText.value.length} 字符`;
    });

    // 转大写
    toUpperBtn.addEventListener('click', () => {
      const processed = sourceText.value.toUpperCase();
      resultText.textContent = processed;
    });

    // 转小写
    toLowerBtn.addEventListener('click', () => {
      const processed = sourceText.value.toLowerCase();
      resultText.textContent = processed;
    });

    // 反转大小写
    invertCaseBtn.addEventListener('click', () => {
      const processed = sourceText.value.split('').map(char => {
        return char === char.toUpperCase() 
          ? char.toLowerCase() 
          : char.toUpperCase();
      }).join('');
      resultText.textContent = processed;
    });

    // 去除空格（包括首尾和中间多余空格）
    trimBtn.addEventListener('click', () => {
      const processed = sourceText.value
        .trim()
        .replace(/\s+/g, ' ');
      resultText.textContent = processed;
    });

    // 反转文本
    reverseBtn.addEventListener('click', () => {
      const processed = sourceText.value.split('').reverse().join('');
      resultText.textContent = processed;
    });

    // 清空输入
    clearBtn.addEventListener('click', () => {
      sourceText.value = '';
      resultText.textContent = '';
      charCount.textContent = '0 字符';
    });

    // 复制结果到剪贴板
    copyBtn.addEventListener('click', async () => {
      if (!resultText.textContent) {
        alert('没有可复制的内容');
        return;
      }
      try {
        await navigator.clipboard.writeText(resultText.textContent);
        copyBtn.textContent = '✓ 已复制';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fa fa-copy mr-1"></i> 复制结果';
        }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      }
    });
  }
});