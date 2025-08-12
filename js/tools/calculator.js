// tools/calculator.js
document.addEventListener('DOMContentLoaded', () => {
  const display = document.querySelector('.tool-card .text-right');
  let expression = '';

  const buttons = document.querySelectorAll('.tool-card button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const value = button.textContent;

      switch (value) {
        case 'C':
          expression = '';
          break;
        case '←':
          expression = expression.slice(0, -1);
          break;
        case '=':
          try {
            expression = eval(expression).toString();
          } catch {
            expression = '错误';
          }
          break;
        case '÷':
          expression += '/';
          break;
        case '×':
          expression += '*';
          break;
        default:
          expression += value;
      }

      display.textContent = expression || '0';
    });
  });
});