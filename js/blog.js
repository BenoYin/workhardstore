// 博客API基础URL
const BLOG_API_URL = 'http://localhost:3000/api/blog';

// 分页与分类控制变量
let currentPage = 1;
const postsPerPage = 6;
let currentCategory = '全部'; // 保持与原逻辑一致使用分类名称
let isDebugMode = true; // 调试模式开关

// DOM元素
const blogCategories = document.getElementById('blogCategories');
const blogList = document.getElementById('blogList');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const blogModal = document.getElementById('blogModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModalBtn');
const blogSection = document.getElementById('blog');

// 日志工具函数
function log(message, type = 'log') {
    if (!isDebugMode) return;
    
    const prefix = '[博客加载]';
    switch(type) {
        case 'error':
            console.error(`${prefix} ${message}`);
            break;
        case 'warn':
            console.warn(`${prefix} ${message}`);
            break;
        default:
            console.log(`${prefix} ${message}`);
    }
}

// 初始化博客功能
async function initBlog() {
    try {
        // 验证核心DOM元素
        if (!blogList) {
            log('未找到博客列表容器元素', 'error');
            return;
        }
        if (!blogCategories) {
            log('未找到分类容器元素', 'warn');
        }
        if (!loadMoreBtn) {
            log('未找到加载更多按钮', 'warn');
        }

        // 当博客区域进入视口时加载内容
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                log('博客区域进入视口，开始初始化');
                loadCategories().catch(err => log(`分类加载失败: ${err.message}`, 'error'));
                loadBlogPosts(true).catch(err => log(`文章加载失败: ${err.message}`, 'error'));
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        
        if (blogSection) {
            observer.observe(blogSection);
        } else {
            log('未找到博客区域元素，直接初始化', 'warn');
            await loadCategories();
            await loadBlogPosts(true);
        }
        
        // 添加事件监听器
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMorePosts);
        }
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeBlogModal);
        }
        if (blogModal) {
            blogModal.addEventListener('click', (e) => {
                if (e.target === blogModal) closeBlogModal();
            });
        }
        
        // 键盘ESC关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && blogModal && !blogModal.classList.contains('hidden')) {
                closeBlogModal();
            }
        });
        
    } catch (error) {
        log(`初始化博客失败: ${error.message}`, 'error');
        showErrorState(blogList, '初始化博客失败，请刷新页面重试', 1);
    }
}

// 加载博客分类
async function loadCategories() {
    if (!blogCategories) return;
    
    try {
        log('开始加载分类数据');
        const response = await fetch(`${BLOG_API_URL}/categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误: 状态码 ${response.status}`);
        }
        
        const categories = await response.json();
        if (!Array.isArray(categories)) {
            throw new Error('分类数据格式不正确');
        }
        
        renderCategories(categories);
        log(`成功加载 ${categories.length} 个分类`);
        
    } catch (error) {
        log(`加载分类失败: ${error.message}`, 'error');
        blogCategories.innerHTML = `
            <div class="text-red-500 text-sm">分类加载失败</div>
            <button onclick="loadCategories()" class="text-primary text-sm hover:underline mt-1">重试</button>
        `;
    }
}

// 渲染分类
function renderCategories(categories) {
    if (!blogCategories) return;
    
    blogCategories.innerHTML = '';
    
    // 添加"全部"分类
    const allBtn = document.createElement('button');
    allBtn.className = `px-4 py-2 rounded-full text-sm transition-colors ${
        currentCategory === '全部' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
    }`;
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', () => filterPostsByCategory('全部'));
    blogCategories.appendChild(allBtn);
    
    // 添加其他分类
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = `px-4 py-2 rounded-full text-sm transition-colors ${
            currentCategory === category.name ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
        }`;
        btn.textContent = category.name;
        btn.addEventListener('click', () => filterPostsByCategory(category.name));
        blogCategories.appendChild(btn);
    });
}

// 分类筛选功能
function filterPostsByCategory(categoryName) {
    log(`切换到分类: ${categoryName}`);
    currentCategory = categoryName;
    currentPage = 1; // 重置为第一页
    loadBlogPosts(true);
    
    // 更新按钮样式
    document.querySelectorAll('#blogCategories button').forEach(btn => {
        if (btn.textContent === currentCategory) {
            btn.className = 'px-4 py-2 rounded-full text-sm bg-primary text-white transition-colors';
        } else {
            btn.className = 'px-4 py-2 rounded-full text-sm bg-white text-gray-700 hover:bg-gray-100 transition-colors';
        }
    });
}

// 加载博客文章
async function loadBlogPosts(clearExisting = false) {
    if (!blogList) {
        log('未找到博客列表容器，无法加载文章', 'error');
        return;
    }
    
    // 避免重复加载
    if (blogList.dataset.loading === 'true') {
        log('正在加载中，避免重复请求');
        return;
    }
    blogList.dataset.loading = 'true';
    
    try {
        // 显示加载状态
        showLoadingState(blogList, clearExisting ? 1 : currentPage);
        
        // 准备请求参数
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', postsPerPage);
        if (currentCategory !== '全部') {
            params.append('category', encodeURIComponent(currentCategory));
        }
        
        // 构建请求URL
        const apiUrl = `${BLOG_API_URL}/posts?${params.toString()}`;
        log(`请求文章URL: ${apiUrl}`);
        
        // 配置请求选项
        const requestOptions = {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors',
            cache: 'no-cache'
        };
        
        // 发送请求（带超时控制）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            log('请求超时', 'error');
        }, 10000);
        
        const response = await fetch(apiUrl, {
            ...requestOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // 检查HTTP响应状态
        if (!response.ok) {
            log(`HTTP错误: 状态码 ${response.status} ${response.statusText}`, 'error');
            let errorMsg = `加载失败 (${response.status})`;
            if (response.status === 404) errorMsg += ' - 未找到资源';
            else if (response.status === 500) errorMsg += ' - 服务器错误';
            showErrorState(blogList, errorMsg, clearExisting ? 1 : currentPage);
            return;
        }
        
        // 解析响应数据
        const data = await response.json();
        if (!data || !Array.isArray(data.posts)) {
            throw new Error('文章数据格式不正确');
        }
        
        // 渲染博客文章
        renderBlogPosts(data.posts, clearExisting);
        
        // 控制"加载更多"按钮
        if (loadMoreBtn) {
            const hasMore = data.posts.length >= postsPerPage;
            loadMoreBtn.classList.toggle('hidden', !hasMore);
            loadMoreBtn.innerHTML = hasMore 
                ? '<span>加载更多</span><i class="fa fa-chevron-down ml-2"></i>' 
                : '<span>没有更多文章了</span>';
            loadMoreBtn.disabled = !hasMore;
        }
        
        log(`成功加载 ${data.posts.length} 篇文章`);
        
    } catch (error) {
        log(`加载文章出错: ${error.message}`, 'error');
        let errorMsg = '加载失败，请稍后重试';
        if (error.name === 'AbortError') errorMsg = '请求超时，请检查网络';
        else if (error.message.includes('Failed to fetch')) errorMsg = '网络连接错误';
        showErrorState(blogList, errorMsg, clearExisting ? 1 : currentPage);
    } finally {
        blogList.dataset.loading = 'false';
    }
}

// 加载更多文章
async function loadMorePosts() {
    currentPage++;
    await loadBlogPosts(false);
}

// 显示加载状态
function showLoadingState(container, page) {
    if (page === 1) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-gray-500">正在加载博客文章...</p>
            </div>
        `;
    } else if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i> 加载中...';
        loadMoreBtn.disabled = true;
    }
}

// 显示错误状态
function showErrorState(container, message, page) {
    if (page === 1) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-red-500 mb-4">${message}</p>
                <button onclick="loadBlogPosts(true)" 
                        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                    重试
                </button>
                <button onclick="loadBlogPostsWithMockData()" 
                        class="ml-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                    加载示例数据
                </button>
            </div>
        `;
    } else if (loadMoreBtn) {
        loadMoreBtn.innerHTML = `<span class="text-red-500">${message}</span>`;
        loadMoreBtn.disabled = false;
        loadMoreBtn.onclick = () => loadBlogPosts(false);
    }
}

// 渲染博客文章
function renderBlogPosts(posts, clearExisting) {
    // 清除加载状态
    if (clearExisting) {
        blogList.innerHTML = '';
    } else if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<span>加载更多</span><i class="fa fa-chevron-down ml-2"></i>';
        loadMoreBtn.disabled = false;
    }
    
    if (posts.length === 0) {
        if (currentPage === 1) {
            blogList.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500">暂无博客文章</p>
                </div>
            `;
        } else {
    // 分页加载无更多数据时，隐藏空白栏位
    loadMoreBtn.classList.add('hidden');
        }
        return;
    }
    
    const postFragment = document.createDocumentFragment();
    posts.forEach(post => {
        const postCard = document.createElement('article');
        postCard.className = 'bg-white rounded-xl overflow-hidden blog-card-shadow blog-card-hover';
        
        // 生成文章卡片HTML
        postCard.innerHTML = `
            <div class="relative h-48 overflow-hidden">
                <img 
                    src="${post.coverUrl || 'https://picsum.photos/600/400?random=' + post.id}" 
                    alt="${post.title}" 
                    class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                >
                <div class="absolute top-3 left-3">
                    <span class="px-3 py-1 bg-primary/90 text-white text-sm rounded-full">
                        ${post.category}
                    </span>
                </div>
                ${post.isMemberOnly ? `
                    <div class="absolute top-3 right-3">
                        <span class="px-3 py-1 bg-accent/90 text-white text-sm rounded-full flex items-center">
                            <i class="fa fa-lock mr-1"></i> 会员专享
                        </span>
                    </div>
                ` : ''}
            </div>
            <div class="p-6">
                <div class="flex justify-between text-sm text-gray-500 mb-3">
                    <span>${formatDate(post.date)}</span>
                    <span><i class="fa fa-eye mr-1"></i> ${post.views}k</span>
                </div>
                <h3 class="text-xl font-bold mb-3 hover:text-primary transition-colors">
                    ${post.title}
                </h3>
                <p class="text-gray-600 mb-5 line-clamp-2">
                    ${post.excerpt || '点击阅读全文了解更多内容...'}
                </p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <img 
                            src="https://picsum.photos/100/100?random=${post.authorName}" 
                            alt="${post.authorName}" 
                            class="w-10 h-10 rounded-full mr-3 object-cover"
                            loading="lazy"
                        >
                        <span class="text-gray-700">${post.authorName}</span>
                    </div>
                    <button class="text-primary hover:text-primary/80 font-medium read-more-btn" data-slug="${post.slug}">
                        阅读全文 <i class="fa fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
        `;
        
        postFragment.appendChild(postCard);
        
        // 添加"阅读全文"按钮事件
        postCard.querySelector('.read-more-btn').addEventListener('click', () => {
            openBlogPost(post.slug);
        });
    });
    
    blogList.appendChild(postFragment);
}

// 加载模拟数据（备用方案）
function loadBlogPostsWithMockData() {
    if (!blogList) return;
    
    // 显示加载状态
    showLoadingState(blogList, 1);
    
    // 模拟网络延迟
    setTimeout(() => {
        // 模拟数据
        const mockData = {
            posts: [
                {
                    id: '1',
                    title: '10个提升工作效率的在线工具',
                    excerpt: '本文介绍了10个可以显著提升日常工作效率的在线工具，包括文档协作、时间管理和自动化工具...',
                    coverUrl: 'https://picsum.photos/id/0/400/300',
                    category: '工具推荐',
                    authorName: '张三',
                    date: '2023-06-15',
                    views: '2.4',
                    slug: 'productivity-tools'
                },
                {
                    id: '2',
                    title: '如何培养良好的时间管理习惯',
                    excerpt: '时间管理是提高 productivity 的关键，本文分享了几个经过实践验证的时间管理方法和习惯养成技巧...',
                    coverUrl: 'https://picsum.photos/id/1/400/300',
                    category: '效率技巧',
                    authorName: '李四',
                    date: '2023-06-10',
                    views: '1.8',
                    slug: 'time-management'
                },
                {
                    id: '3',
                    title: '成长型思维：终身学习的关键',
                    excerpt: '成长型思维能够帮助我们更好地面对挑战和失败，本文探讨如何培养成长型思维，实现持续学习和进步...',
                    coverUrl: 'https://picsum.photos/id/2/400/300',
                    category: '成长思维',
                    authorName: '王五',
                    date: '2023-06-05',
                    views: '3.2',
                    isMemberOnly: true,
                    slug: 'growth-mindset'
                }
            ]
        };
        
        // 渲染分类（如果存在）
        if (blogCategories) {
            renderCategories([
                { name: '工具推荐' },
                { name: '效率技巧' },
                { name: '成长思维' }
            ]);
        }
        
        // 渲染文章
        blogList.innerHTML = '';
        renderBlogPosts(mockData.posts, true);
        
        // 控制加载更多按钮
        if (loadMoreBtn) {
            loadMoreBtn.classList.add('hidden');
        }
        
        blogList.dataset.loading = 'false';
        
    }, 1000);
}

// 打开博客文章详情
async function openBlogPost(slug) {
    if (!blogModal || !modalTitle || !modalContent) {
        log('未找到模态框相关元素', 'error');
        return;
    }
    
    try {
        // 显示加载状态
        modalTitle.textContent = '加载中...';
        modalContent.innerHTML = `
            <div class="flex justify-center py-10">
                <i class="fa fa-spinner fa-spin text-3xl text-primary"></i>
            </div>
        `;
        blogModal.classList.remove('hidden');
        blogModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        
        // 获取文章详情
        const response = await fetch(`${BLOG_API_URL}/posts/${slug}`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误: 状态码 ${response.status}`);
        }
        
        const post = await response.json();
        
        // 渲染文章详情
        modalTitle.textContent = post.title;
        modalContent.innerHTML = `
            <div class="mb-6">
                <img 
                    src="${post.coverUrl || 'https://picsum.photos/1200/600?random=' + post.id}" 
                    alt="${post.title}" 
                    class="w-full h-auto rounded-lg mb-4"
                >
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center">
                        <img 
                            src="https://picsum.photos/100/100?random=${post.authorName}" 
                            alt="${post.authorName}" 
                            class="w-12 h-12 rounded-full mr-3 object-cover"
                        >
                        <div>
                            <div class="font-medium">${post.authorName}</div>
                            <div class="text-sm text-gray-500">${formatDate(post.date)}</div>
                        </div>
                    </div>
                    <span class="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        ${post.category}
                    </span>
                </div>
            </div>
            
            <div class="prose max-w-none">
                ${renderNotionContent(post.content || [])}
            </div>
            
            ${post.isMemberOnly ? `
                <div class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div class="flex items-start">
                        <i class="fa fa-info-circle text-yellow-500 mt-1 mr-3"></i>
                        <div>
                            <h4 class="font-medium text-yellow-800">会员专享内容</h4>
                            <p class="text-yellow-700 text-sm mt-1">
                                这是会员专享内容，升级会员即可阅读完整内容，解锁更多优质文章和工具。
                            </p>
                            <button class="mt-3 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
                                立即升级会员
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
        log(`成功加载文章详情: ${slug}`);
        
    } catch (error) {
        log(`打开博客文章失败: ${error.message}`, 'error');
        modalContent.innerHTML = `
            <div class="text-center py-10">
                <i class="fa fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
                <p class="text-gray-700">加载文章失败，请稍后重试</p>
                <button onclick="openBlogPost('${slug}')" class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                    重试
                </button>
            </div>
        `;
    }
}

// 关闭博客文章模态框
function closeBlogModal() {
    if (blogModal) {
        blogModal.classList.add('hidden');
        blogModal.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

// 渲染Notion内容
function renderNotionContent(blocks) {
    let html = '';
    
    blocks.forEach(block => {
        switch (block.type) {
            case 'heading_1':
                html += `<h1 class="text-3xl font-bold mt-8 mb-4">${renderRichText(block.heading_1.rich_text)}</h1>`;
                break;
            case 'heading_2':
                html += `<h2 class="text-2xl font-bold mt-6 mb-3">${renderRichText(block.heading_2.rich_text)}</h2>`;
                break;
            case 'heading_3':
                html += `<h3 class="text-xl font-bold mt-5 mb-2">${renderRichText(block.heading_3.rich_text)}</h3>`;
                break;
            case 'paragraph':
                html += `<p class="mb-4">${renderRichText(block.paragraph.rich_text)}</p>`;
                break;
            case 'bulleted_list_item':
            case 'numbered_list_item':
                const listType = block.type === 'bulleted_list_item' ? 'ul' : 'ol';
                html += `<${listType} class="mb-4 pl-5"><li>${renderRichText(block[block.type].rich_text)}</li></${listType}>`;
                break;
            case 'image':
                const imageUrl = block.image.file?.url || block.image.external?.url;
                const caption = block.image.caption.length > 0 ? renderRichText(block.image.caption) : '';
                html += `
                    <figure class="my-8">
                        <img src="${imageUrl}" alt="${caption}" class="w-full h-auto rounded-lg">
                        ${caption ? `<figcaption class="text-center text-gray-500 text-sm mt-2">${caption}</figcaption>` : ''}
                    </figure>
                `;
                break;
            case 'code':
                html += `
                    <pre class="bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto">
                        <code>${escapeHtml(renderRichText(block.code.rich_text))}</code>
                    </pre>
                `;
                break;
            case 'quote':
                html += `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${renderRichText(block.quote.rich_text)}</blockquote>`;
                break;
            default:
                log(`未处理的块类型: ${block.type}`, 'warn');
        }
    });
    
    return html;
}

// 渲染富文本
function renderRichText(richTextArray) {
    if (!richTextArray || richTextArray.length === 0) {
        return '';
    }
    
    return richTextArray.map(text => {
        let content = escapeHtml(text.plain_text);
        
        // 处理格式
        if (text.annotations.bold) content = `<strong>${content}</strong>`;
        if (text.annotations.italic) content = `<em>${content}</em>`;
        if (text.annotations.strikethrough) content = `<s>${content}</s>`;
        if (text.annotations.underline) content = `<u>${content}</u>`;
        if (text.annotations.code) content = `<code>${content}</code>`;
        
        // 处理链接
        if (text.href) {
            content = `<a href="${text.href}" target="_blank" rel="noopener">${content}</a>`;
        }
        
        return content;
    }).join('');
}

// HTML转义
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 页面加载完成后初始化博客功能
document.addEventListener('DOMContentLoaded', initBlog);