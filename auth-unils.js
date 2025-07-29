// auth-utils.js - 认证管理工具
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from './firebase-init.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const modalManager = {
  open: (id) => document.getElementById(id).classList.remove('hidden'),
  close: (id) => document.getElementById(id).classList.add('hidden'),
  initBackdropClose: (id) => {
    const modal = document.getElementById(id);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modalManager.close(id);
    });
  }
};

export const authManager = {
  currentUser: null,
  
  login: async (email, password) => {
    if (!validateEmail(email)) throw new Error('无效的邮箱格式');
    if (!validatePassword(password)) throw new Error('密码需至少6位字符');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await authManager.saveUserData(userCredential.user);
    return userCredential;
  },
  
  register: async (email, password, username) => {
    if (!validateEmail(email)) throw new Error('无效的邮箱格式');
    if (!validatePassword(password)) throw new Error('密码需至少6位字符');
    if (!validateUsername(username)) throw new Error('用户名需3-20位字母数字');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username,
      createdAt: new Date()
    });
    await authManager.saveUserData(userCredential.user);
    return userCredential;
  },
  
  logout: async () => {
    await signOut(auth);
    localStorage.removeItem('user');
  },
  
  resetPassword: async (email) => {
    if (!validateEmail(email)) throw new Error('无效的邮箱格式');
    await sendPasswordResetEmail(auth, email);
    return true;
  },
  
  saveUserData: async (user) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = {
      uid: user.uid,
      email: user.email,
      ...(userDoc.exists() ? userDoc.data() : {})
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    this.currentUser = userData;
    return userData;
  },
  
  onAuthChange: (callback) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await authManager.saveUserData(user);
        callback(userData);
      } else {
        localStorage.removeItem('user');
        this.currentUser = null;
        callback(null);
      }
    });
  },
  
  updateUI: (user) => {
    const loginButtons = document.querySelectorAll('.login-btn');
    const logoutButtons = document.querySelectorAll('.logout-btn');
    const userElements = document.querySelectorAll('.user-info');
    
    if (user) {
      loginButtons.forEach(btn => btn.classList.add('hidden'));
      logoutButtons.forEach(btn => btn.classList.remove('hidden'));
      userElements.forEach(el => {
        el.textContent = user.username || user.email.split('@')[0];
      });
    } else {
      loginButtons.forEach(btn => btn.classList.remove('hidden'));
      logoutButtons.forEach(btn => btn.classList.add('hidden'));
      userElements.forEach(el => el.textContent = '');
    }
  },
  
  requireAuth: () => {
    const protectedRoutes = ['/member.html', '/profile.html'];
    if (protectedRoutes.includes(window.location.pathname)) {
      authManager.onAuthChange(user => {
        if (!user) window.location.href = `index.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      });
    }
  }
};

// 验证函数
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validateUsername(username) {
  return /^[a-zA-Z0-9]{3,20}$/.test(username);
}