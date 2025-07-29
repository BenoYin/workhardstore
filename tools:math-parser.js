<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2575.6">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; min-height: 14.0px}
  </style>
</head>
<body>
<p class="p1">// tools/math-parser.js - 安全数学表达式解析</p>
<p class="p1">export function safeEval(expression) {</p>
<p class="p1"><span class="Apple-converted-space">  </span>// 移除所有非数学字符</p>
<p class="p1"><span class="Apple-converted-space">  </span>const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');</p>
<p class="p2"><span class="Apple-converted-space">  </span></p>
<p class="p1"><span class="Apple-converted-space">  </span>// 使用Function构造函数安全执行</p>
<p class="p1"><span class="Apple-converted-space">  </span>try {</p>
<p class="p1"><span class="Apple-converted-space">    </span>return Function(`return (${sanitized})`)();</p>
<p class="p1"><span class="Apple-converted-space">  </span>} catch (e) {</p>
<p class="p1"><span class="Apple-converted-space">    </span>throw new Error('无效的数学表达式');</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p1">}</p>
</body>
</html>
