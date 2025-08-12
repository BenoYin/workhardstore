const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // 引入path模块处理文件路径
const { getBlogPosts, getBlogCategories, getBlogPostBySlug } = require('./notion-api');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';

// 中间件配置
// 1. 静态资源服务（优先配置，确保前端资源正确加载）
app.use(express.static(path.join(__dirname, '../public'), {
  // 配置静态资源的MIME类型
  setHeaders: (res, filePath) => {
    // 处理JavaScript文件
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    }
    // 处理CSS文件
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    }
    // 处理JSON文件
    if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    }
  },
  // 缓存控制（开发环境禁用缓存，生产环境设置合理缓存）
  maxAge: isDevelopment ? 0 : '1d'
}));

// 2. CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));

// 3. 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API路由
app.get('/api/blog', (req, res) => {
  res.json({
    message: '博客API根路径',
    availableRoutes: [
      '/api/blog/posts (GET) - 获取文章列表，支持?category=分类筛选',
      '/api/blog/categories (GET) - 获取所有分类',
      '/api/blog/posts/:slug (GET) - 通过slug获取单篇文章'
    ],
    documentation: '访问各接口获取详细数据格式'
  });
});

app.get('/api/blog/posts', async (req, res) => {
  try {
    const { category } = req.query;
    const posts = await getBlogPosts(category);
    
    // 开发环境下输出调试信息
    if (isDevelopment) {
      console.log(`[${new Date().toISOString()}] 文章列表请求，分类: ${category || '全部'}`);
      console.log(`返回文章数量: ${posts.length}`);
    }
    
    res.json(posts);
  } catch (error) {
    console.error('获取博客文章失败:', error);
    const errorMsg = isDevelopment 
      ? `获取失败: ${error.message}` 
      : '获取博客文章失败，请稍后重试';
    res.status(500).json({ error: errorMsg });
  }
});

app.get('/api/blog/categories', async (req, res) => {
  try {
    const categories = await getBlogCategories();
    
    if (isDevelopment) {
      console.log(`[${new Date().toISOString()}] 分类请求，返回数量: ${categories.length}`);
    }
    
    res.json(categories);
  } catch (error) {
    console.error('获取博客分类失败:', error);
    const errorMsg = isDevelopment 
      ? `获取失败: ${error.message}` 
      : '获取博客分类失败，请稍后重试';
    res.status(500).json({ error: errorMsg });
  }
});

app.get('/api/blog/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await getBlogPostBySlug(slug);
    
    if (isDevelopment) {
      console.log(`[${new Date().toISOString()}] 文章请求，slug: ${slug}`);
    }
    
    if (!post) {
      return res.status(404).json({ 
        error: '博客文章不存在',
        slug,
        suggestion: '请检查slug是否正确或文章已发布'
      });
    }
    
    res.json(post);
  } catch (error) {
    console.error(`获取博客文章 ${req.params.slug} 失败:`, error);
    const errorMsg = isDevelopment 
      ? `获取失败: ${error.message}` 
      : '获取博客文章详情失败，请稍后重试';
    res.status(500).json({ error: errorMsg });
  }
});

// 404处理（所有未匹配的路由）
app.use((req, res) => {
  // 判断请求的是API还是静态资源
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      error: '接口不存在',
      requestedPath: req.path,
      hint: '请检查请求路径是否正确，可访问/api/blog查看可用接口'
    });
  } else {
    // 静态资源不存在时返回404页面（如果有）
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'), (err) => {
      if (err) {
        res.status(404).json({ error: '资源不存在', requestedPath: req.path });
      }
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: isDevelopment ? err.message : '请稍后重试'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] 服务器运行在 http://localhost:${PORT}`);
  console.log(`环境: ${isDevelopment ? '开发' : '生产'}`);
  console.log(`允许的前端域名: ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
  console.log(`静态资源目录: ${path.join(__dirname, '../public')}`);
});
