import { login, onUserChanged } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
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

  onUserChanged(user => {
    if (user) {
      document.querySelectorAll('.login-btn').forEach(btn => {
        btn.innerHTML = `<i class="fa fa-user-circle-o"></i><span>${user.email}</span>`;
      });
    }
  });
});