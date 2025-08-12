const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getBlogPosts, getBlogCategories, getBlogPostBySlug } = require('./notion-api');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// API路由
app.get('/api/blog', (req, res) => { // 新增根路径路由
  res.json({
    message: '博客API根路径',
    availableRoutes: [
      '/api/blog/posts (GET)',
      '/api/blog/categories (GET)',
      '/api/blog/posts/:slug (GET)'
    ]
  });
});

app.get('/api/blog/posts', async (req, res) => {
  try {
    const { category } = req.query;
    const posts = await getBlogPosts(category);

    // 调试输出 API 返回的文章数据
    console.log('API 返回的文章数据:', posts);
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: '获取博客文章失败' });
  }
});

app.get('/api/blog/categories', async (req, res) => {
  try {
    const categories = await getBlogCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: '获取博客分类失败' });
  }
});

app.get('/api/blog/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await getBlogPostBySlug(slug);
    
    if (!post) {
      return res.status(404).json({ error: '博客文章不存在' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: '获取博客文章详情失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
