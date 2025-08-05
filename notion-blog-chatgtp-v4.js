
// notion-blog-v2.js
const NOTION_DATABASE_ID = "2419a13c048a80c7ba63000c42b77548";
const NOTION_API_KEY = "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";
const NOTION_API_VERSION = "2022-06-28";

async function fetchNotionBlogPosts() {
  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_API_VERSION,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    console.error("❌ Notion API Error:", res.status, await res.text());
    const container = document.getElementById("blogList");
    if (container) container.innerHTML = "<p class='text-red-500'>❌ 無法載入部落格文章，請稍後再試。</p>";
    return;
  }

  const data = await res.json();
  const posts = data.results;
  const container = document.getElementById("blogList");
  container.innerHTML = "";

  posts.forEach(post => {
    const title = post.properties?.Title?.title?.[0]?.text?.content || "無標題";
    const cover = post.properties?.Cover?.files?.[0]?.external?.url || "https://via.placeholder.com/300x200?text=No+Image";
    const excerpt = post.properties?.Excerpt?.rich_text?.[0]?.text?.content || "";
    const date = post.properties?.Date?.date?.start || "";
    const tags = post.properties?.Tags?.multi_select || [];

    const card = document.createElement("div");
    card.className = "blog-card border rounded-xl p-4 shadow-md mb-4 bg-white";

    card.innerHTML = `
      <img src="${cover}" alt="${title}" class="w-full h-48 object-cover rounded-xl mb-3">
      <h3 class="text-xl font-semibold mb-2">${title}</h3>
      <p class="text-gray-600 text-sm mb-2">${excerpt}</p>
      <p class="text-xs text-gray-400 mb-1">${date}</p>
      <div class="flex gap-2 flex-wrap">
        ${tags.map(tag => `<span class="px-2 py-1 bg-gray-100 rounded text-xs">${tag.name}</span>`).join("")}
      </div>
    `;
    container.appendChild(card);
  });
}

// 載入頁面時自動執行
window.addEventListener("DOMContentLoaded", fetchNotionBlogPosts);
