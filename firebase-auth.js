
// firebase-auth.js

// Firebase 初始化（确保已在主文件中初始化 Firebase App）
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
         sendPasswordResetEmail, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

// 注册用户
async function registerUser(email, password, username) {
  const usernameTaken = await checkUsernameExists(username);
  if (usernameTaken) {
    alert("⚠️ 此用户名已被使用，请选择其他名称");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: email,
      username: username,
      isPremium: false,
      createdAt: new Date().toISOString()
    });

    alert("✅ 注册成功，已自动登录");
    closeModal(); // 关闭模态框
  } catch (error) {
    alert("❌ 注册失败：" + error.message);
  }
}

// 检查用户名是否已存在
async function checkUsernameExists(username) {
  const q = query(collection(db, "users"), where("username", "==", username));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// 登录用户
async function loginUser(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ 登录成功！");
    closeModal(); // 关闭模态框
  } catch (error) {
    alert("❌ 登录失败：" + error.message);
  }
}

// 发送密码重设邮件
async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("📩 重设密码链接已发送，请查看邮箱");
  } catch (error) {
    alert("❌ 重设密码失败：" + error.message);
  }
}

// 登录状态监听
onAuthStateChanged(auth, async (user) => {
  const userArea = document.getElementById("userArea");
  const loginBtn = document.getElementById("loginButton");

  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const username = userDoc.exists() ? userDoc.data().username : "使用者";

    if (userArea) {
      userArea.innerHTML = `<span class="mr-2">👋 嗨，${username}</span>
                            <button onclick="logoutUser()" class="text-red-500 underline">登出</button>`;
    }
    if (loginBtn) loginBtn.style.display = "none";
  } else {
    if (userArea) userArea.innerHTML = "";
    if (loginBtn) loginBtn.style.display = "block";
  }
});

// 登出功能
function logoutUser() {
  signOut(auth).then(() => {
    alert("👋 已登出");
  });
}

// 暴露函数至全局（供 HTML 绑定）
window.registerUser = registerUser;
window.loginUser = loginUser;
window.resetPassword = resetPassword;
window.logoutUser = logoutUser;
