// member-guard.js - 会员中心访问控制
import { authManager } from './auth-utils.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
  authManager.onAuthChange(async (user) => {
    if (!user) {
      window.location.href = `index.html?redirect=member.html`;
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        document.getElementById('userInfo').innerHTML = `
          <p><strong>用户名：</strong> ${userData.username}</p>
          <p><strong>邮箱：</strong> ${user.email}</p>
          <p><strong>注册时间：</strong> ${userData.createdAt.toDate().toLocaleString()}</p>
        `;
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  });

  // 退出登录
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await authManager.logout();
    window.location.href = 'index.html';
  });
});