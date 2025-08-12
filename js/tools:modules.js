// 工具注册表 - 存储所有注册的工具
const toolRegistry = new Map();

// 工具分类映射表
export const toolCategories = {
  text: '文本工具',
  dev: '开发工具',
  life: '生活工具',
  math: '数学工具',
  other: '其他工具'
};

/**
 * 注册工具
 * @param {string} toolId - 工具唯一标识（需唯一）
 * @param {Object} toolConfig - 工具配置对象
 * @param {string} toolConfig.name - 工具名称
 * @param {string} toolConfig.description - 工具描述
 * @param {string} toolConfig.icon - 工具图标（HTML字符串）
 * @param {string} toolConfig.category - 工具分类（对应toolCategories的key）
 * @param {Function} toolConfig.getContent - 返回工具HTML内容的函数
 * @param {Function} toolConfig.init - 工具初始化函数（加载后执行）
 * @returns {Object} 标准化后的工具配置
 */
export const registerTool = (toolId, toolConfig) => {
  // 检查工具ID是否已存在
  if (toolRegistry.has(toolId)) {
    console.warn(`工具 ${toolId} 已存在，将被覆盖`);
  }

  // 验证必要方法（强制检查，避免工具加载失败）
  if (typeof toolConfig.getContent !== 'function') {
    throw new Error(`工具 ${toolId} 缺少必要方法：getContent()（需返回HTML字符串）`);
  }
  if (typeof toolConfig.init !== 'function') {
    throw new Error(`工具 ${toolId} 缺少必要方法：init()（需定义初始化逻辑）`);
  }

  // 验证分类合法性
  const validCategories = Object.keys(toolCategories);
  if (!validCategories.includes(toolConfig.category)) {
    console.warn(`工具 ${toolId} 分类 "${toolConfig.category}" 无效，已自动归类为 "other"`);
    toolConfig.category = 'other';
  }

  // 合并默认配置（确保字段完整性）
  const normalizedTool = {
    id: toolId,
    name: '未命名工具',
    description: '无描述',
    icon: '<i class="fa fa-wrench text-primary text-2xl"></i>', // 默认图标
    category: 'other', // 默认分类
    ...toolConfig
  };

  // 注册到工具表
  toolRegistry.set(toolId, normalizedTool);
  return normalizedTool;
};

/**
 * 获取所有工具
 * @param {boolean} grouped - 是否按分类分组（默认false）
 * @returns {Array|Object} 工具列表（数组）或分组对象（键为分类名称）
 */
export const getAllTools = (grouped = false) => {
  const tools = Array.from(toolRegistry.values());

  if (!grouped) {
    return tools; // 不分组：返回工具数组
  }

  // 按分类分组
  return tools.reduce((groups, tool) => {
    const categoryName = toolCategories[tool.category]; // 转换为中文分类名
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    groups[categoryName].push(tool);
    return groups;
  }, {});
};

/**
 * 获取单个工具
 * @param {string} toolId - 工具ID
 * @returns {Object|null} 工具配置（不存在则返回null）
 */
export const getTool = (toolId) => {
  return toolRegistry.get(toolId) || null;
};

/**
 * 加载并初始化工具到指定容器
 * @param {string} toolId - 工具ID
 * @param {HTMLElement} container - 容器DOM元素（工具将渲染到这里）
 */
export const loadTool = (toolId, container) => {
  // 验证容器有效性
  if (!(container instanceof HTMLElement)) {
    console.error('加载工具失败：容器必须是有效的DOM元素');
    return;
  }

  // 获取工具配置
  const tool = getTool(toolId);
  if (!tool) {
    container.innerHTML = `<div class="text-center py-10 text-red-500">工具 ${toolId} 不存在</div>`;
    return;
  }

  try {
    // 清空容器并加载工具内容
    container.innerHTML = ''; // 清空现有内容
    const toolContent = document.createElement('div');
    toolContent.className = 'tool-content p-4'; // 添加基础样式
    toolContent.innerHTML = tool.getContent(); // 执行工具的getContent获取HTML
    container.appendChild(toolContent);

    // 触发工具加载完成事件（供外部监听）
    const event = new CustomEvent('toolLoaded', {
      detail: { toolId, container: toolContent },
      bubbles: true // 允许事件冒泡
    });
    container.dispatchEvent(event);

    // 执行工具初始化逻辑
    tool.init(toolContent); // 将容器传递给init，方便工具操作DOM

    // 更新页面标题（如果存在对应的DOM元素）
    const titleElement = document.querySelector('#currentToolName');
    if (titleElement) {
      titleElement.textContent = tool.name;
    }

  } catch (error) {
    console.error(`工具 ${toolId} 加载失败:`, error);
    container.innerHTML = `<div class="text-center py-10 text-red-500">加载失败：${error.message}</div>`;
  }
};

/**
 * 初始化所有工具（调用每个工具的init方法，预加载必要资源）
 */
export const initAllTools = () => {
  const toolCount = toolRegistry.size;
  if (toolCount === 0) {
    console.warn('没有已注册的工具，请先使用registerTool注册');
    return;
  }

  // 打印注册信息
  console.log(`已注册 ${toolCount} 个工具:`, Array.from(toolRegistry.keys()).join(', '));

  // 初始化所有工具（非强制，避免单个工具失败影响全局）
  toolRegistry.forEach((tool, toolId) => {
    try {
      // 预初始化（若工具需要提前加载资源）
      if (typeof tool.preInit === 'function') {
        tool.preInit();
      }
    } catch (error) {
      console.error(`工具 ${toolId} 预初始化失败:`, error);
    }
  });
};

// 导出工具注册表（仅用于调试，生产环境慎用）
export const debugToolRegistry = toolRegistry;