import { registerTool } from './modules.js';

const passwordGenerator = {
  getContent() {
    return `
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码长度</label>
          <div class="flex items-center space-x-4">
            <input type="range" id="passwordLength" min="8" max="32" value="16" class="w-full">
            <span id="lengthValue" class="text-lg font-medium min-w-[3rem] text-center">16</span>
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-center">
            <input type="checkbox" id="includeUppercase" checked class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
            <label for="includeUppercase" class="ml-2 block text-gray-700">包含大写字母 (A-Z)</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="includeLowercase" checked class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
            <label for="includeLowercase" class="ml-2 block text-gray-700">包含小写字母 (a-z)</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="includeNumbers" checked class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
            <label for="includeNumbers" class="ml-2 block text-gray-700">包含数字 (0-9)</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="includeSymbols" checked class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
            <label for="includeSymbols" class="ml-2 block text-gray-700">包含特殊符号 (!@#$%^&*)</label>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">生成的密码</label>
          <div class="flex">
            <input type="text" id="generatedPassword" class="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-primary transition" readonly>
            <button id="copyPasswordBtn" class="px-4 py-3 bg-primary text-white rounded-r-lg hover:bg-primary/90 transition">
              <i class="fa fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button id="generatePasswordBtn" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            生成密码
          </button>
        </div>
      </div>
    `;
  },

  init() {
    document.addEventListener('toolLoaded', (e) => {
      if (e.detail.toolId !== 'password-generator') return;

      const passwordLength = document.getElementById('passwordLength');
      const lengthValue = document.getElementById('lengthValue');
      const includeUppercase = document.getElementById('includeUppercase');
      const includeLowercase = document.getElementById('includeLowercase');
      const includeNumbers = document.getElementById('includeNumbers');
      const includeSymbols = document.getElementById('includeSymbols');
      const generatedPassword = document.getElementById('generatedPassword');
      const copyPasswordBtn = document.getElementById('copyPasswordBtn');
      const generatePasswordBtn = document.getElementById('generatePasswordBtn');

      // 更新长度显示
      passwordLength.addEventListener('input', () => {
        lengthValue.textContent = passwordLength.value;
      });

      // 生成密码
      function generatePassword() {
        let charset = '';
        if (includeLowercase.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeUppercase.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers.checked) charset += '0123456789';
        if (includeSymbols.checked) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        if (charset === '') {
          alert('请至少选择一种字符类型');
          return;
        }

        let password = '';
        for (let i = 0; i < passwordLength.value; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          password += charset[randomIndex];
        }
        generatedPassword.value = password;
      }

      // 复制密码
      copyPasswordBtn.addEventListener('click', () => {
        generatedPassword.select();
        document.execCommand('copy');
        const originalText = copyPasswordBtn.innerHTML;
        copyPasswordBtn.innerHTML = '<i class="fa fa-check"></i>';
        setTimeout(() => {
          copyPasswordBtn.innerHTML = '<i class="fa fa-copy"></i>';
        }, 2000);
      });

      generatePasswordBtn.addEventListener('click', generatePassword);

      // 初始生成一次
      generatePassword();
    });
  }
};

registerTool('password-generator', passwordGenerator);