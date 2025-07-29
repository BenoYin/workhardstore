// tools/calculator.js - 计算器功能实现
import { safeEval } from './math-parser.js';

export function initCalculator() {
  const display = document.querySelector('.calculator-display');
  const buttons = document.querySelectorAll('.calculator-btn');
  if (!display || !buttons.length) return;

  let currentValue = '0';
  let lastResult = null;
  const operators = ['+', '-', '*', '÷'];
  const history = [];

  const updateDisplay = () => {
    display.textContent = currentValue;
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.textContent;
      
      if (value === 'C') {
        currentValue = '0';
      } else if (value === '←') {
        currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
      } else if (value === '=') {
        try {
          const expression = currentValue.replace('÷', '/');
          const result = safeEval(expression);
          
          // 保存历史记录
          history.push({
            expression: currentValue,
            result: result.toString(),
            timestamp: new Date().toLocaleString()
          });
          
          currentValue = result.toString();
          lastResult = result;
        } catch (e) {
          currentValue = '错误';
        }
      } else if (value === 'H') {
        // 显示历史记录
        alert(history.map(item => 
          `${item.timestamp}: ${item.expression} = ${item.result}`
        ).join('\n') || '无历史记录');
      } else if (operators.includes(value)) {
        // 使用上次结果继续计算
        if (lastResult !== null && currentValue === '0') {
          currentValue = lastResult.toString();
        }
        
        const lastChar = currentValue.slice(-1);
        if (operators.includes(lastChar)) {
          currentValue = currentValue.slice(0, -1) + value;
        } else {
          currentValue += value;
        }
      } else {
        currentValue = currentValue === '0' ? value : currentValue + value;
      }
      
      updateDisplay();
    });
  });
}