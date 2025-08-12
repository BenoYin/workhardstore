/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @param {HTMLElement} container - 显示提示的容器
 * @returns {Promise<boolean>} - 是否复制成功
 */
export const copyToClipboard = async (text, container) => {
  if (!text) return false;

  try {
    await navigator.clipboard.writeText(text);
    showToast('已复制到剪贴板', container, 'success');
    return true;
  } catch (err) {
    // 降级方案
    try {
      const tempInput = document.createElement('input');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showToast('已复制到剪贴板', container, 'success');
      return true;
    } catch (err2) {
      showToast('复制失败，请手动复制', container, 'error');
      console.error('复制失败:', err2);
      return false;
    }
  }
};

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {HTMLElement} container - 显示容器
 * @param {string} type - 消息类型 (success/error/info)
 * @param {number} duration - 显示时长(ms)
 */
export const showToast = (message, container, type = 'info', duration = 2000) => {
  // 移除已存在的提示
  const existingToast = container.querySelector('.tool-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // 创建新提示
  const toast = document.createElement('div');
  const typeClasses = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  toast.className = `tool-toast fixed bottom-4 right-4 px-4 py-3 rounded-lg border shadow-sm ${typeClasses[type] || typeClasses.info} z-10`;
  toast.textContent = message;

  // 添加到容器
  container.appendChild(toast);

  // 自动移除
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
};

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间(ms)
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

/**
 * 验证输入是否为空
 * @param {string} value - 输入值
 * @returns {boolean} 是否有效
 */
export const validateRequired = (value) => {
  return !!value.trim();
};
