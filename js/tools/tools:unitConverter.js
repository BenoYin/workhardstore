import { registerTool } from './modules.js';

const unitConverter = {
  getContent() {
    return `
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">转换类型</label>
          <select id="conversionType" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition">
            <option value="length">长度</option>
            <option value="weight">重量</option>
            <option value="temperature">温度</option>
            <option value="time">时间</option>
          </select>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">从</label>
            <div class="flex">
              <input type="number" id="fromValue" value="1" class="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-primary transition">
              <select id="fromUnit" class="px-4 py-2 border border-gray-300 border-l-0 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-primary transition">
                <!-- 选项会根据转换类型动态生成 -->
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">到</label>
            <div class="flex">
              <input type="number" id="toValue" readonly class="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50">
              <select id="toUnit" class="px-4 py-2 border border-gray-300 border-l-0 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-primary transition">
                <!-- 选项会根据转换类型动态生成 -->
              </select>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button id="convertBtn" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            转换
          </button>
        </div>
      </div>
    `;
  },

  init() {
    document.addEventListener('toolLoaded', (e) => {
      if (e.detail.toolId !== 'unit-converter') return;

      // 单位定义
      const units = {
        length: {
          meter: { name: '米 (m)', factor: 1 },
          kilometer: { name: '千米 (km)', factor: 1000 },
          centimeter: { name: '厘米 (cm)', factor: 0.01 },
          millimeter: { name: '毫米 (mm)', factor: 0.001 },
          inch: { name: '英寸 (in)', factor: 0.0254 },
          foot: { name: '英尺 (ft)', factor: 0.3048 }
        },
        weight: {
          kilogram: { name: '千克 (kg)', factor: 1 },
          gram: { name: '克 (g)', factor: 0.001 },
          ton: { name: '吨 (t)', factor: 1000 },
          pound: { name: '磅 (lb)', factor: 0.453592 },
          ounce: { name: '盎司 (oz)', factor: 0.0283495 }
        },
        temperature: {
          celsius: { name: '摄氏度 (°C)', converter: (val, to) => {
            if (to === 'fahrenheit') return val * 9/5 + 32;
            if (to === 'kelvin') return val + 273.15;
            return val;
          }},
          fahrenheit: { name: '华氏度 (°F)', converter: (val, to) => {
            if (to === 'celsius') return (val - 32) * 5/9;
            if (to === 'kelvin') return (val - 32) * 5/9 + 273.15;
            return val;
          }},
          kelvin: { name: '开尔文 (K)', converter: (val, to) => {
            if (to === 'celsius') return val - 273.15;
            if (to === 'fahrenheit') return (val - 273.15) * 9/5 + 32;
            return val;
          }}
        },
        time: {
          second: { name: '秒 (s)', factor: 1 },
          minute: { name: '分钟 (min)', factor: 60 },
          hour: { name: '小时 (h)', factor: 3600 },
          day: { name: '天 (d)', factor: 86400 },
          week: { name: '周 (wk)', factor: 604800 }
        }
      };

      const conversionType = document.getElementById('conversionType');
      const fromValue = document.getElementById('fromValue');
      const toValue = document.getElementById('toValue');
      const fromUnit = document.getElementById('fromUnit');
      const toUnit = document.getElementById('toUnit');
      const convertBtn = document.getElementById('convertBtn');

      // 生成单位选项
      function populateUnits(type) {
        fromUnit.innerHTML = '';
        toUnit.innerHTML = '';
        
        Object.entries(units[type]).forEach(([key, unit]) => {
          const fromOption = document.createElement('option');
          fromOption.value = key;
          fromOption.textContent = unit.name;
          fromUnit.appendChild(fromOption);
          
          const toOption = document.createElement('option');
          toOption.value = key;
          toOption.textContent = unit.name;
          toUnit.appendChild(toOption);
        });
        
        // 设置默认目标单位
        const unitKeys = Object.keys(units[type]);
        if (unitKeys.length > 1) {
          toUnit.value = unitKeys[1];
        }
      }

      // 执行转换
      function convert() {
        const type = conversionType.value;
        const fromVal = parseFloat(fromValue.value) || 0;
        const fromUnitVal = fromUnit.value;
        const toUnitVal = toUnit.value;
        
        let result;
        
        // 温度转换有特殊逻辑
        if (type === 'temperature') {
          result = units[type][fromUnitVal].converter(fromVal, toUnitVal);
        } else {
          // 其他单位通过换算因子转换
          const baseValue = fromVal * units[type][fromUnitVal].factor;
          result = baseValue / units[type][toUnitVal].factor;
        }
        
        // 保留6位小数
        toValue.value = Number.isInteger(result) ? result : result.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
      }

      // 事件监听
      conversionType.addEventListener('change', () => {
        populateUnits(conversionType.value);
        convert();
      });
      
      fromValue.addEventListener('input', convert);
      fromUnit.addEventListener('change', convert);
      toUnit.addEventListener('change', convert);
      convertBtn.addEventListener('click', convert);

      // 初始化
      populateUnits(conversionType.value);
      convert();
    });
  }
};

registerTool('unit-converter', unitConverter);
