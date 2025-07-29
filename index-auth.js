import { auth } from './firebase-init.js';
import {
  login,
  register,
  checkUsernameExists
} from './register-logic.js';
import { onUserChanged } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const loginButtons = document.querySelectorAll('.login-btn');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const closeRegisterModal = document.getElementById('closeRegisterModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // 登录按钮弹出登录窗或显示用户信息
  onUserChanged(user => {
    if (user) {
      document.querySelectorAll('.login-btn').forEach(btn => {
        btn.innerHTML = `<i class="fa fa-user-circle-o"></i><span>${user.displayName || user.email}</span>`;
      });
    }
  });

  // 登录模态窗控制
  loginButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      loginModal.classList.remove('hidden');
      loginModal.classList.add('flex');
    });
  });

  closeLoginModal.addEventListener('click', () => {
    loginModal.classList.add('hidden');
    loginModal.classList.remove('flex');
  });

  // 注册模态窗控制
  document.querySelectorAll('a[href="#register"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      loginModal.classList.add('hidden');
      registerModal.classList.remove('hidden');
      registerModal.classList.add('flex');
    });
  });

  closeRegisterModal.addEventListener('click', () => {
    registerModal.classList.add('hidden');
    registerModal.classList.remove('flex');
  });

  // 登录表单提交
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      const res = await login(email, password);
      localStorage.setItem('user', JSON.stringify(res.user));
      alert('登录成功');
      location.reload();
    } catch (error) {
      document.getElementById('loginError').textContent = error.message;
      document.getElementById('loginError').classList.remove('hidden');
    }
  });

  // 注册表单提交
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const birthdate = document.getElementById('birthdate').value;
    const gender = document.getElementById('gender').value;

    const usernameFeedback = document.getElementById('usernameFeedback');
    usernameFeedback.classList.add('hidden');

    if (await checkUsernameExists(username)) {
      usernameFeedback.classList.remove('hidden');
      return;
    }

    try {
      await register(email, password, username, { birthdate, gender });
      alert('注册成功');
      location.reload();
    } catch (err) {
      document.getElementById('registerError').textContent = err.message;
      document.getElementById('registerError').classList.remove('hidden');
    }
  });
});