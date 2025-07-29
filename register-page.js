import { register } from './auth.js';

document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const pw = document.getElementById('password').value;

  try {
    const res = await register(email, pw);
    localStorage.setItem('user', JSON.stringify(res.user));
    alert('注册成功，已自动登录');
    window.location.href = '/index.html';
  } catch (err) {
    document.getElementById('error').textContent = err.message;
  }
});