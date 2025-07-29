// main.js - 应用主入口
import { authManager } from './auth-utils.js';
import { initRouterGuard } from './router-guard.js';
import { initCalculator } from './tools/calculator.js';
import { initPasswordReset } from './auth-handler.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('应用已加载');
  
  // 初始化路由守卫
  initRouterGuard();
  
  // 初始化用户状态
  authManager.onAuthChange(user => {
    authManager.updateUI(user);
    
    // 处理重定向
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (user && redirect) {
      window.location.href = redirect;
    }
  });
  
  // 初始化计算器
  if (document.querySelector('.calculator-display')) {
    initCalculator();
  }
  
  // 初始化密码重置
  initPasswordReset();
  
  // 移动菜单切换
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
  });
});