// 博客API基础URL
const BLOG_API_URL = 'http://localhost:3000/api/blog';

// DOM元素
let blogList;
let blogContent;
let categoriesContainer;
let loadingIndicator;
let errorContainer;
let currentPage = 1;
const postsPerPage = 5;
let hasMorePosts = true;
let currentCategory = null;
let observer;

// 初始化博客功能
document.addEventListener('DOMContentLoaded', async () => {
    blogList = document.getElementById('blog-list');
    blogContent = document.getElementById('blog-content');
    categoriesContainer = document.getElementById('categories-container');
    loadingIndicator = document.getElementById('loading-indicator');
    errorContainer = document.getElementById('error-container');

    // 初始化事件委托
    initEventDelegation();

    try {
        // 同时加载分类和文章
        await Promise.all([
            loadCategories(),
            loadBlogPosts()
        ]);
        
        // 初始化无限滚动
        initInfiniteScroll();
    } catch (error) {
        showGlobalError('初始化博客失败，请刷新页面重试');
        console.error('初始化错误:', error);
    }
});

// 初始化事件委托
function initEventDelegation() {
    // 监听文档范围内的所有点击事件（使用事件委托）
    document.addEventListener('click', (e) => {
        // 处理分类点击
        if (e.target.closest('.category-item')) {
            const categoryElement = e.target.closest('.category-item');
            const category = categoryElement.dataset.category;
            handleCategoryClick(category, categoryElement);
            return;
        }

        // 处理"阅读全文"按钮点击
        if (e.target.closest('.read-more-btn')) {
            const slug = e.target.closest('.read-more-btn').dataset.slug;
            openBlogPost(slug);
            return;
        }

        // 处理"返回列表"按钮点击
        if (e.target.closest('.back-to-list')) {
            showBlogList();
            return;
        }

        // 处理错误状态下的"重试加载分类"按钮
        if (e.target.closest('.retry-load-categories')) {
            loadCategories();
            return;
        }

        // 处理错误状态下的"重试加载文章"按钮
        if (e.target.closest('.retry-load-posts')) {
            loadBlogPosts(true);
            return;
        }

        // 处理"加载示例数据"按钮
        if (e.target.closest('.load-mock-data')) {
            loadBlogPostsWithMockData();
            return;
        }
    });
}

// 加载分类
async function loadCategories() {
    if (!categoriesContainer) return;

    showLoading(categoriesContainer);

    try {
        const response = await fetch(`${BLOG_API_URL}/categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const categories = await response.json();
        
        if (categories.length === 0) {
            categoriesContainer.innerHTML = '<p class="text-gray-500">暂无分类</p>';
            return;
        }

        // 渲染分类列表
        categoriesContainer.innerHTML = `
            <div class="category-item active" data-category="">
                <span class="category-name">全部文章</span>
                <span class="category-count">${await getTotalPostsCount()}</span>
            </div>
            ${categories.map(category => `
                <div class="category-item" data-category="${category.name}">
                    <span class="category-name">${category.name}</span>
                    <span class="category-count">${category.count}</span>
                </div>
            `).join('')}
        `;

    } catch (error) {
        showErrorState(categoriesContainer, '加载分类失败', 'retry-load-categories');
        console.error('加载分类错误:', error);
    }
}

// 处理分类点击
function handleCategoryClick(category, element) {
    // 更新当前分类
    currentCategory = category || null;
    
    // 重置分页
    currentPage = 1;
    hasMorePosts = true;
    
    // 更新UI
    document.querySelectorAll('.category-item').forEach(el => {
        el.classList.remove('active');
    });
    element.classList.add('active');
    
    // 重新加载文章
    loadBlogPosts(true);
}

// 加载博客文章
async function loadBlogPosts(reset = false) {
    if (!blogList) return;

    // 如果是重置，清空列表
    if (reset) {
        blogList.innerHTML = '';
        // 停止之前的无限滚动观察器
        if (observer) {
            observer.disconnect();
        }
    } else {
        // 显示加载指示器
        showLoadingIndicator();
    }

    try {
        // 构建请求URL，包含分页和分类参数
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', postsPerPage);
        if (currentCategory) {
            params.append('category', currentCategory);
        }

        const response = await fetch(`${BLOG_API_URL}/posts?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const posts = await response.json();
        
        // 隐藏加载指示器
        hideLoadingIndicator();

        // 检查是否有更多文章
        if (posts.length < postsPerPage) {
            hasMorePosts = false;
            // 如果不是第一页且没有数据，添加提示
            if (currentPage > 1 && posts.length === 0) {
                blogList.innerHTML += '<p class="text-center text-gray-500 py-4">已经到底啦~</p>';
            }
        }

        // 如果是第一页且没有数据
        if (currentPage === 1 && posts.length === 0) {
            blogList.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">暂无文章</p>
                    <button class="load-mock-data mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        加载示例数据
                    </button>
                </div>
            `;
            return;
        }

        // 渲染文章列表
        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'blog-post bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.01]';
            postElement.innerHTML = `
                <div class="p-6">
                    <div class="flex justify-between items-start mb-2">
                        <h2 class="text-xl font-bold text-gray-800">${post.title}</h2>
                        <span class="text-sm bg-gray-100 px-2 py-1 rounded-full">${post.category}</span>
                    </div>
                    <p class="text-gray-600 mb-4 line-clamp-3">${post.excerpt || '阅读全文了解更多...'}</p>
                    <div class="flex justify-between items-center">
                        <time class="text-sm text-gray-500">${formatDate(post.date)}</time>
                        <button class="read-more-btn text-blue-500 hover:text-blue-700 font-medium" data-slug="${post.slug}">
                            阅读全文 →
                        </button>
                    </div>
                </div>
            `;
            blogList.appendChild(postElement);
        });

        // 增加页码
        currentPage++;

        // 重新初始化无限滚动
        if (hasMorePosts) {
            initInfiniteScroll();
        }

    } catch (error) {
        hideLoadingIndicator();
        if (reset || currentPage === 1) {
            showErrorState(blogList, '加载博客失败', 'retry-load-posts');
        } else {
            showGlobalError('加载更多文章失败', 'retry-load-posts');
        }
        console.error('加载博客错误:', error);
    }
}

// 打开博客文章详情
async function openBlogPost(slug) {
    if (!blogContent || !slug) return;

    // 显示加载状态
    blogContent.innerHTML = `
        <div class="loading flex justify-center items-center py-10">
            <div class="spinner"></div>
            <p class="ml-2">加载文章中...</p>
        </div>
    `;
    
    // 显示文章内容区域，隐藏列表
    blogList.classList.add('hidden');
    blogContent.classList.remove('hidden');
    categoriesContainer.classList.add('hidden');

    try {
        const response = await fetch(`${BLOG_API_URL}/posts/${slug}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('文章不存在');
            }
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const post = await response.json();
        
        // 渲染文章内容
        blogContent.innerHTML = `
            <button class="back-to-list mb-4 inline-flex items-center text-blue-500 hover:text-blue-700">
                <i class="fa fa-arrow-left mr-1"></i> 返回列表
            </button>
            <article class="blog-post-detail">
                <h1 class="text-3xl font-bold text-gray-800 mb-4">${post.title}</h1>
                <div class="flex items-center text-gray-500 mb-6">
                    <time>${formatDate(post.date)}</time>
                    <span class="mx-2">•</span>
                    <span class="bg-gray-100 px-2 py-1 rounded-full text-sm">${post.category}</span>
                </div>
                <div class="prose max-w-none">${post.content || '<p>文章内容正在整理中...</p>'}</div>
            </article>
        `;

    } catch (error) {
        blogContent.innerHTML = `
            <button class="back-to-list mb-4 inline-flex items-center text-blue-500 hover:text-blue-700">
                <i class="fa fa-arrow-left mr-1"></i> 返回列表
            </button>
            <div class="error-state text-center py-10">
                <i class="fa fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                <p class="text-red-500 mb-3">${error.message || '加载文章失败'}</p>
                <button class="retry-load-posts px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    重试
                </button>
            </div>
        `;
        console.error('加载文章详情错误:', error);
    }
}

// 显示博客列表
function showBlogList() {
    if (!blogList || !blogContent) return;
    
    // 显示列表和分类，隐藏文章内容
    blogList.classList.remove('hidden');
    blogContent.classList.add('hidden');
    categoriesContainer.classList.remove('hidden');
}

// 加载示例数据（用于测试）
function loadBlogPostsWithMockData() {
    if (!blogList) return;

    // 清空列表
    blogList.innerHTML = '';
    
    // 模拟数据
    const mockPosts = [
        {
            title: "示例文章 1",
            excerpt: "这是一篇示例文章，用于展示博客功能。实际使用时，这里会显示从Notion获取的文章摘要。",
            date: new Date().toISOString(),
            category: "示例",
            slug: "example-post-1"
        },
        {
            title: "示例文章 2",
            excerpt: "这是另一篇示例文章，包含更多的内容来展示博客的排版效果。实际使用时，这里会显示从Notion获取的文章摘要。",
            date: new Date(Date.now() - 86400000).toISOString(),
            category: "示例",
            slug: "example-post-2"
        }
    ];
    
    // 渲染模拟数据
    mockPosts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'blog-post bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.01]';
        postElement.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-2">
                    <h2 class="text-xl font-bold text-gray-800">${post.title}</h2>
                    <span class="text-sm bg-gray-100 px-2 py-1 rounded-full">${post.category}</span>
                </div>
                <p class="text-gray-600 mb-4 line-clamp-3">${post.excerpt}</p>
                <div class="flex justify-between items-center">
                    <time class="text-sm text-gray-500">${formatDate(post.date)}</time>
                    <button class="read-more-btn text-blue-500 hover:text-blue-700 font-medium" data-slug="${post.slug}">
                        阅读全文 →
                    </button>
                </div>
            </div>
        `;
        blogList.appendChild(postElement);
    });
    
    // 隐藏加载状态
    hideLoadingIndicator();
}

// 初始化无限滚动
function initInfiniteScroll() {
    // 检查是否已有观察器，如有则先断开
    if (observer) {
        observer.disconnect();
    }

    // 创建最后一个文章元素的观察器
    const lastPost = blogList.lastElementChild;
    if (lastPost) {
        observer = new IntersectionObserver((entries) => {
            const lastEntry = entries[0];
            if (lastEntry.isIntersecting && hasMorePosts) {
                // 当最后一个元素可见时，加载更多文章
                loadBlogPosts();
            }
        }, { threshold: 0.1 });

        observer.observe(lastPost);
    }
}

// 显示加载状态
function showLoading(container) {
    container.innerHTML = `
        <div class="loading flex justify-center items-center py-4">
            <div class="spinner"></div>
            <p class="ml-2">加载中...</p>
        </div>
    `;
}

// 显示加载指示器
function showLoadingIndicator() {
    if (loadingIndicator) {
        loadingIndicator.innerHTML = `
            <div class="loading flex justify-center items-center py-4">
                <div class="spinner"></div>
                <p class="ml-2">加载更多文章...</p>
            </div>
        `;
        loadingIndicator.classList.remove('hidden');
    }
}

// 隐藏加载指示器
function hideLoadingIndicator() {
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
        loadingIndicator.innerHTML = '';
    }
}

// 显示错误状态
function showErrorState(container, message, retryClass) {
    container.innerHTML = `
        <div class="error-state text-center py-6">
            <i class="fa fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
            <p class="text-red-500 mb-3">${message}</p>
            <button class="${retryClass} px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                重试
            </button>
        </div>
    `;
}

// 显示全局错误
function showGlobalError(message, retryClass) {
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error-state bg-red-50 text-red-500 p-4 rounded-md flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fa fa-exclamation-circle mr-2"></i>
                    <p>${message}</p>
                </div>
                ${retryClass ? `<button class="${retryClass} ml-4 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                    重试
                </button>` : ''}
            </div>
        `;
        errorContainer.classList.remove('hidden');
        
        // 5秒后自动隐藏
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// 获取总文章数（用于分类计数）
async function getTotalPostsCount() {
    try {
        const response = await fetch(`${BLOG_API_URL}/posts?page=1&limit=1`);
        if (response.ok) {
            const posts = await response.json();
            // 这里假设API返回的响应头中包含总计数
            const totalCount = response.headers.get('X-Total-Count');
            return totalCount || posts.length;
        }
        return 0;
    } catch (error) {
        console.error('获取总文章数失败:', error);
        return 0;
    }
}
