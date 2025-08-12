const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 初始化Notion客户端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 从Notion数据库获取博客文章
async function getBlogPosts(category = null) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    console.log(`[getBlogPosts] 开始查询数据库，databaseId: ${databaseId}, 分类: ${category || '全部'}`);
    
    // 构建查询参数
    const queryParams = {
      database_id: databaseId,
      sorts: [
        {
          property: '发布时间',
          direction: 'descending',
        },
      ],
    };
    console.log(`[getBlogPosts] 查询参数:`, JSON.stringify(queryParams, null, 2));

    // 如果指定了分类，添加筛选条件
    if (category && category !== '全部') {
      queryParams.filter = {
        property: '分类',
        select: {
          equals: category,
        },
      };
      console.log(`[getBlogPosts] 添加分类筛选: ${category}`);
    }
    
    // 查询数据库
    const response = await notion.databases.query(queryParams);
    console.log(`[getBlogPosts] API调用成功，返回${response.results.length}条记录`);
    // 生产环境可注释掉原始数据打印，避免日志过大
    console.log(`[getBlogPosts] 原始响应数据:`, JSON.stringify(response, null, 2));
    
    // 处理返回的结果，提取需要的字段
    return response.results.map(page => {
      const properties = page.properties;
      
      const post = {
        id: page.id,
        title: properties.标题.title[0]?.plain_text || '无标题',
        slug: properties.标题.title[0]?.plain_text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
        category: properties.分类.select?.name || '未分类',
        date: properties.发布时间.date?.start || new Date().toISOString().split('T')[0],
        excerpt: properties.摘要.rich_text[0]?.plain_text || '',
        coverUrl: page.cover?.file?.url || page.cover?.external?.url || '',
        views: properties.阅读量.number || 0,
        isMemberOnly: properties.会员专享.checkbox || false,
        authorName: properties.作者.rich_text[0]?.plain_text || '未知作者',
        tags: properties.标签.multi_select.map(tag => tag.name) || [],
      };
      console.log(`[getBlogPosts] 解析文章: ${post.title} (slug: ${post.slug})`);
      return post;
    });

  } catch (error) {
    console.error(`[getBlogPosts] 调用失败:`, {
      message: error.message,
      status: error.status,
      response: error.response?.data || '无响应数据',
      stack: error.stack
    });
    throw error;
  }
}

// 获取所有博客分类
async function getBlogCategories() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    console.log(`[getBlogCategories] 开始获取分类，databaseId: ${databaseId}`);
    
    // 获取数据库结构以获取分类选项
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    });
    console.log(`[getBlogCategories] 数据库结构获取成功`);
    
    // 提取分类选项
    const categories = database.properties.分类.select.options.map(option => ({
      name: option.name,
      id: option.id,
    }));
    const result = [{ name: '全部', id: 'all' }, ...categories];
    console.log(`[getBlogCategories] 提取分类成功，共${result.length}个分类:`, result.map(c => c.name));
    
  return result;
  } catch (error) {
    console.error(`[getBlogCategories] 调用失败:`, {
      message: error.message,
      status: error.status,
      response: error.response?.data || '无响应数据',
      stack: error.stack
    });
    throw error;
  }
}

// 获取单篇博客文章详情
async function getBlogPostBySlug(slug) {
  try {
    console.log(`[getBlogPostBySlug] 开始查询文章，slug: ${slug}`);

    const posts = await getBlogPosts();
    const post = posts.find(p => p.slug === slug);
    
    if (!post) {
      console.log(`[getBlogPostBySlug] 未找到文章，slug: ${slug}`);
      return null;
    }
    console.log(`[getBlogPostBySlug] 找到文章: ${post.title} (id: ${post.id})`);
    
    // 获取完整的页面内容
    const pageResponse = await notion.pages.retrieve({
      page_id: post.id,
    });
    console.log(`[getBlogPostBySlug] 页面详情获取成功，id: ${post.id}`);
    
    // 获取页面内容块
    const blocks = await notion.blocks.children.list({
      block_id: post.id,
      page_size: 100,
    });
    console.log(`[getBlogPostBySlug] 内容块获取成功，共${blocks.results.length}个块`);

    const result = { ...post, content: blocks.results };
    return result;
  } catch (error) {
    console.error(`[getBlogPostBySlug] 调用失败 (slug: ${slug}):`, {
      message: error.message,
      status: error.status,
      response: error.response?.data || '无响应数据',
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  getBlogPosts,
  getBlogCategories,
  getBlogPostBySlug,
};