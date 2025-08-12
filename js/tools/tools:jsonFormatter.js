import { registerTool } from './modules.js';

const jsonFormatter = {
  getContent() {
    return `
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button id="formatBtn" class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">格式化</button>
          <button id="minifyBtn" class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">压缩</button>
          <button id="validateBtn" class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">验证</button>
          <button id="clearBtn" class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">清空</button>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">JSON输入</label>
          <textarea id="jsonInput" rows="8" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition" placeholder='请输入JSON字符串，例如: {"name": "工具"}'></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">处理结果
            <span id="jsonStatus" class="ml-2 text-sm"></span>
          </label>
          <textarea id="jsonOutput" rows="8" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" readonly></textarea>
        </div>
        
        <div class="flex justify-end">
          <button id="copyJsonBtn" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            复制结果
          </button>
        </div>
      </div>
    `;
  },

  init() {
    document.addEventListener('toolLoaded', (e) => {
      if (e.detail.toolId !== 'json-formatter') return;

      const jsonInput = document.getElementById('jsonInput');
      const jsonOutput = document.getElementById('jsonOutput');
      const jsonStatus = document.getElementById('jsonStatus');
      const formatBtn = document.getElementById('formatBtn');
      const minifyBtn = document.getElementById('minifyBtn');
      const validateBtn = document.getElementById('validateBtn');
      const clearBtn = document.getElementById('clearBtn');
      const copyJsonBtn = document.getElementById('copyJsonBtn');

      // 显示状态信息
      function showStatus(message, isError = false) {
        jsonStatus.textContent = message;
        jsonStatus.className = `ml-2 text-sm ${isError ? 'text-red-500' : 'text-green-500'}`;
      }

      // 验证JSON
      function validateJson() {
        try {
          if (!jsonInput.value.trim()) {
            showStatus('请输入JSON内容', true);
            return null;
          }
          
          const parsed = JSON.parse(jsonInput.value);
          showStatus('JSON格式有效');
          return parsed;
        } catch (error) {
          showStatus(`无效的JSON: ${error.message}`, true);
          return null;
        }
      }

      // 格式化JSON
      function formatJson() {
        const parsed = validateJson();
        if (parsed) {
          jsonOutput.value = JSON.stringify(parsed, null, 2);
        }
      }

      // 压缩JSON
      function minifyJson() {
        const parsed = validateJson();
        if (parsed) {
          jsonOutput.value = JSON.stringify(parsed);
        }
      }

      // 事件监听
      formatBtn.addEventListener('click', formatJson);
      minifyBtn.addEventListener('click', minifyJson);
      validateBtn.addEventListener('click', validateJson);
      
      clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        jsonOutput.value = '';
        jsonStatus.textContent = '';
      });
      
      copyJsonBtn.addEventListener('click', () => {
        if (jsonOutput.value) {
          jsonOutput.select();
          document.execCommand('copy');
          const originalText = copyJsonBtn.textContent;
          copyJsonBtn.textContent = '已复制!';
          setTimeout(() => {
            copyJsonBtn.textContent = originalText;
          }, 2000);
        }
      });

      // 输入变化时自动验证
      jsonInput.addEventListener('input', () => {
        if (jsonInput.value.trim().length > 0) {
          validateJson();
        } else {
          jsonStatus.textContent = '';
        }
      });
    });
  }
};

registerTool('json-formatter', jsonFormatter);
