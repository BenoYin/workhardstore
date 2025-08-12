const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getBlogPosts, getBlogCategories, getBlogPostBySlug } = require('./notion-api');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';

// 中间件配置
// 精确CORS配置，只允许前端域名访问
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

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

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    requestedPath: req.path,
    hint: '请检查请求路径是否正确，可访问/api/blog查看可用接口'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] 服务器运行在 http://localhost:${PORT}`);
  console.log(`环境: ${isDevelopment ? '开发' : '生产'}`);
  console.log(`允许的前端域名: ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
});
