<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2575.6">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px 'Helvetica Neue'; color: #111214; -webkit-text-stroke: #111214; background-color: #ffffff}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px 'Helvetica Neue'; color: #111214; -webkit-text-stroke: #111214; background-color: #ffffff; min-height: 14.0px}
    span.s1 {font-kerning: none}
  </style>
</head>
<body>
<p class="p1"><span class="s1">// tools/password-generator.js</span></p>
<p class="p1"><span class="s1">document.addEventListener('DOMContentLoaded', () =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const output = document.querySelector('#generatedPassword');</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const generateBtn = document.querySelector('#generateBtn');</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const lengthInput = document.querySelector('#lengthInput');</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const generatePassword = (length = 12) =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&amp;*()';</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>let pwd = '';</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for (let i = 0; i &lt; length; i++) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>pwd += chars.charAt(Math.floor(Math.random() * chars.length));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return pwd;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>};</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (generateBtn &amp;&amp; output &amp;&amp; lengthInput) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>generateBtn.addEventListener('click', () =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>const len = parseInt(lengthInput.value) || 12;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>output.value = generatePassword(len);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>});</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1">});</span></p>
</body>
</html>
