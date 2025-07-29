// index-auth.js (简化后)
import { modalManager, userManager } from './auth-utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // 初始化模态框
  modalManager.initBackdropClose('loginModal');
  modalManager.initBackdropClose('registerModal');

  // 登录按钮点击
  document.querySelectorAll('.login-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      userManager.onAuthChange(user => {
        if (!user) modalManager.open('loginModal');
        else window.location.href = '/member.html'; // 已登录跳转会员中心
      });
    });
  });

  // 登录表单提交
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const userCredential = await userManager.login(email, password);
      localStorage.setItem('user', JSON.stringify(userCredential.user));
      userManager.updateLoginButtons(userCredential.user);
      modalManager.close('loginModal');
    } catch (error) {
      document.getElementById('loginError').textContent = error.message;
    }
  });

  // 注册表单逻辑类似...
});