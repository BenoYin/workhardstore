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
<p class="p1">// router-guard.js - 路由权限控制</p>
<p class="p1">import { authManager } from './auth-utils.js';</p>
<p class="p2"><br></p>
<p class="p1">export function initRouterGuard() {</p>
<p class="p1"><span class="Apple-converted-space">  </span>// 公共路由</p>
<p class="p1"><span class="Apple-converted-space">  </span>const publicRoutes = ['/index.html', '/contact.html', '/intro.html'];</p>
<p class="p2"><span class="Apple-converted-space">  </span></p>
<p class="p1"><span class="Apple-converted-space">  </span>// 认证路由</p>
<p class="p1"><span class="Apple-converted-space">  </span>const authRoutes = ['/login.html', '/register.html'];</p>
<p class="p2"><span class="Apple-converted-space">  </span></p>
<p class="p1"><span class="Apple-converted-space">  </span>// 受保护路由</p>
<p class="p1"><span class="Apple-converted-space">  </span>const protectedRoutes = ['/member.html', '/profile.html'];</p>
<p class="p2"><span class="Apple-converted-space">  </span></p>
<p class="p1"><span class="Apple-converted-space">  </span>const currentPath = window.location.pathname;</p>
<p class="p2"><span class="Apple-converted-space">  </span></p>
<p class="p1"><span class="Apple-converted-space">  </span>authManager.onAuthChange(user =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">    </span>// 已登录用户访问认证页面</p>
<p class="p1"><span class="Apple-converted-space">    </span>if (user &amp;&amp; authRoutes.includes(currentPath)) {</p>
<p class="p1"><span class="Apple-converted-space">      </span>window.location.href = 'index.html';</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p2"><span class="Apple-converted-space">    </span></p>
<p class="p1"><span class="Apple-converted-space">    </span>// 未登录用户访问受保护页面</p>
<p class="p1"><span class="Apple-converted-space">    </span>if (!user &amp;&amp; protectedRoutes.includes(currentPath)) {</p>
<p class="p1"><span class="Apple-converted-space">      </span>const redirect = currentPath !== '/login.html' ?<span class="Apple-converted-space"> </span></p>
<p class="p1"><span class="Apple-converted-space">        </span>`?redirect=${encodeURIComponent(currentPath)}` : '';</p>
<p class="p1"><span class="Apple-converted-space">      </span>window.location.href = `login.html${redirect}`;</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p1"><span class="Apple-converted-space">  </span>});</p>
<p class="p1">}</p>
</body>
</html>
