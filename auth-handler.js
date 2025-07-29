// auth-handler.js - 认证交互处理
import { modalManager, authManager } from './auth-utils.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase-init.js';

export function initPasswordReset() {
  document.getElementById('resetPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const errorEl = document.getElementById('resetError');
    const successEl = document.getElementById('resetSuccess');

    try {
      await authManager.resetPassword(email);
      successEl.textContent = `重置链接已发送至 ${email}`;
      successEl.classList.remove('hidden');
      errorEl.classList.add('hidden');
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
      successEl.classList.add('hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  modalManager.initBackdropClose('loginModal');
  modalManager.initBackdropClose('registerModal');
  modalManager.initBackdropClose('resetModal');

  // 登录按钮
  document.querySelectorAll('.login-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalManager.open('loginModal');
    });
  });

  // 注册按钮
  document.querySelectorAll('.register-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalManager.close('loginModal');
      modalManager.open('registerModal');
    });
  });

  // 密码重置按钮
  document.querySelectorAll('.reset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalManager.close('loginModal');
      modalManager.open('resetModal');
    });
  });

  // 登录表单
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    try {
      await authManager.login(email, password);
      modalManager.close('loginModal');
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    }
  });

  // 注册表单
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorEl = document.getElementById('registerError');

    try {
      const userCredential = await authManager.register(email, password, username);
      modalManager.close('registerModal');
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    }
  });
});