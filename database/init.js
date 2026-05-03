const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'personal_blog',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) DEFAULT '/images/default-avatar.png',
        role VARCHAR(20) DEFAULT 'user',
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        slug VARCHAR(50) NOT NULL UNIQUE,
        description TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content LONGTEXT NOT NULL,
        summary TEXT,
        cover_image VARCHAR(255) DEFAULT '',
        author_id INT NOT NULL,
        category_id INT,
        status VARCHAR(20) DEFAULT 'published',
        is_pinned TINYINT DEFAULT 0,
        view_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_posts_slug (slug),
        INDEX idx_posts_category (category_id),
        INDEX idx_posts_author (author_id),
        INDEX idx_posts_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        slug VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (post_id, tag_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        content TEXT NOT NULL,
        post_id INT NOT NULL,
        user_id INT,
        parent_id INT DEFAULT NULL,
        guest_name VARCHAR(50),
        guest_email VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
        INDEX idx_comments_post (post_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      await conn.execute("ALTER TABLE comments ADD COLUMN guest_name VARCHAR(50) AFTER parent_id");
    } catch (_) {}
    try {
      await conn.execute("ALTER TABLE comments ADD COLUMN guest_email VARCHAR(100) AFTER guest_name");
    } catch (_) {}

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_post (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        comment_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_comment (user_id, comment_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } finally {
    conn.release();
  }
}

async function seedData() {
  const bcrypt = require('bcryptjs');

  // 检查是否存在旧数据（文章数量不足），开发环境自动清理重来
  const [oldPostCount] = await pool.execute('SELECT COUNT(*) as count FROM posts');
  if (oldPostCount[0].count > 0 && oldPostCount[0].count < 80) {
    console.log('[Seed] 检测到旧数据，清理中...');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.execute('TRUNCATE TABLE comments');
    await pool.execute('TRUNCATE TABLE comment_likes');
    await pool.execute('TRUNCATE TABLE post_tags');
    await pool.execute('TRUNCATE TABLE likes');
    await pool.execute('TRUNCATE TABLE posts');
    await pool.execute('TRUNCATE TABLE tags');
    await pool.execute('TRUNCATE TABLE categories');
    await pool.execute('TRUNCATE TABLE users');
    await pool.execute('TRUNCATE TABLE subscribers');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('[Seed] 旧数据已清空');
  }

  const [adminRows] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
  if (adminRows[0].count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    const users_data = [
      ['admin', 'admin@blog.com', hash, 'admin', '博客管理员，全栈工程师，热爱技术与写作。', 'https://api.dicebear.com/9.x/avataaars/svg?seed=admin'],
      ['墨白', 'mobai@blog.com', bcrypt.hashSync('123456', 10), 'user', '前阿里P7，现自由职业。专注于前端工程化与性能优化。', 'https://api.dicebear.com/9.x/avataaars/svg?seed=mobai'],
      ['南风', 'nanfeng@blog.com', bcrypt.hashSync('123456', 10), 'user', '数据分析师转行后端开发，Python和Go双修。', 'https://api.dicebear.com/9.x/avataaars/svg?seed=nanfeng'],
      ['星辰', 'xingchen@blog.com', bcrypt.hashSync('123456', 10), 'user', '大学生创业者，对AI和产品设计充满热情。', 'https://api.dicebear.com/9.x/avataaars/svg?seed=xingchen'],
      ['浅夏', 'qianxia@blog.com', bcrypt.hashSync('123456', 10), 'user', 'UI设计师转前端，热爱CSS艺术和交互动效。', 'https://api.dicebear.com/9.x/avataaars/svg?seed=qianxia'],
      ['北城', 'beicheng@blog.com', bcrypt.hashSync('123456', 10), 'user', '算法工程师，在BAT某厂做推荐系统，偶尔写写技术博客。', 'https://api.dicebear.com/9.x/avataaars/svg?seed=beicheng'],
      ['demo', 'demo@blog.com', bcrypt.hashSync('demo123', 10), 'user', '一个热爱生活的博主。', 'https://api.dicebear.com/9.x/avataaars/svg?seed=demo'],
    ];
    for (const u of users_data) {
      await pool.execute(
        'INSERT INTO users (username, email, password, role, bio, avatar) VALUES (?, ?, ?, ?, ?, ?)', u
      );
    }
  }

  const [catRows] = await pool.execute('SELECT COUNT(*) as count FROM categories');
  if (catRows[0].count === 0) {
    const categories = [
      ['技术笔记', 'tech', '编程、算法和技术相关的深度分享'],
      ['前端开发', 'frontend', 'HTML/CSS/JS 和现代前端框架'],
      ['后端架构', 'backend', '服务端开发、数据库、分布式系统'],
      ['AI & 数据', 'ai', '人工智能、机器学习与数据科学'],
      ['生活随笔', 'life', '生活中的点滴感悟与记录'],
      ['项目实战', 'project', '实际项目的开发经验与总结'],
      ['读书笔记', 'reading', '读书心得与知识整理'],
      ['产品设计', 'design', '用户体验与产品思考'],
    ];
    for (const c of categories) {
      await pool.execute('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)', c);
    }
  }

  const [tagRows] = await pool.execute('SELECT COUNT(*) as count FROM tags');
  if (tagRows[0].count === 0) {
    const tags = [
      ['JavaScript', 'javascript'], ['TypeScript', 'typescript'], ['Vue', 'vue'], ['React', 'react'],
      ['Node.js', 'nodejs'], ['Python', 'python'], ['Go', 'go'], ['Rust', 'rust'],
      ['数据库', 'database'], ['MySQL', 'mysql'], ['MongoDB', 'mongodb'], ['Redis', 'redis'],
      ['前端', 'fe'], ['CSS', 'css'], ['Webpack', 'webpack'], ['Vite', 'vite'],
      ['后端', 'be'], ['Docker', 'docker'], ['Kubernetes', 'k8s'], ['Linux', 'linux'],
      ['算法', 'algorithm'], ['设计模式', 'patterns'], ['Git', 'git'], ['CI/CD', 'cicd'],
      ['AI', 'ai-tag'], ['机器学习', 'ml'], ['深度学习', 'dl'], ['NLP', 'nlp'],
      ['面试', 'interview'], ['性能优化', 'perf'], ['安全', 'security'], ['测试', 'testing'],
    ];
    for (const t of tags) {
      await pool.execute('INSERT INTO tags (name, slug) VALUES (?, ?)', t);
    }
  }

  const [postRows] = await pool.execute('SELECT COUNT(*) as count FROM posts');
  if (postRows[0].count === 0) {
    console.log('[Seed] 正在生成种子数据...');

    // ============ 文章标题池 ============
    const techTitles = [
      '深入理解 JavaScript 原型链与继承机制',
      'TypeScript 高级类型体操：从入门到放弃',
      'Vue 3 响应式系统源码解析',
      'React Hooks 最佳实践与常见陷阱',
      'Node.js 事件循环：一张图讲清楚',
      '异步编程的演进：Callback → Promise → async/await',
      '浏览器渲染原理：从DOM到像素',
      'CSS Grid 与 Flexbox 实战对比',
      'Webpack 打包优化：把你的包从 5MB 瘦到 500KB',
      '深入浅出 WebSocket：实时通信实战',
      '前端监控系统搭建实战',
      'Vite 为什么这么快？原理剖析',
      'JavaScript 内存管理与垃圾回收',
      '微前端架构：从概念到落地',
      '正则表达式完全指南',
      '手写 Promise：理解异步编程的本质',
      'CSS 动画性能优化：60fps 的秘密',
      'HTTP 缓存策略深度解析',
      '跨域问题的 N 种解决方案',
      'GraphQL vs REST：API 设计的未来',
      'Service Worker 与 PWA 实战',
      '前端国际化(i18n)方案选型',
      'WebAssembly 入门：让前端跑 C++ 代码',
      'Electron 桌面应用开发实战',
      '前端单元测试：从 Jest 到 Vitest',
    ];
    const beTitles = [
      'MySQL 索引优化实战：从 10s 到 10ms',
      'Redis 数据结构选型与应用场景',
      '分布式锁的实现与选型',
      '消息队列选型：Kafka vs RabbitMQ vs RocketMQ',
      '微服务架构设计：从单体到分布式',
      'Docker 容器化部署完全指南',
      'Go 语言并发编程：goroutine 与 channel',
      'Python FastAPI 高并发实践',
      '数据库分库分表方案设计',
      'Nginx 反向代理与负载均衡实战',
      'RESTful API 设计最佳实践',
      'JWT 认证与 OAuth2.0 详解',
      'Linux 常用命令与性能调优',
      '设计模式在业务中的实践',
      'Elasticsearch 搜索引擎实战',
      'Git 工作流与团队协作规范',
      'CI/CD 流水线：从提交到部署',
      'API 网关设计模式',
      '日志系统：从 ELK 到 Loki',
      '系统设计面试：如何设计一个短链服务',
      'MongoDB 聚合管道实战',
      'gRPC vs REST：高性能服务间通信',
      '领域驱动设计(DDD)入门',
      '如何设计一个高可用的秒杀系统',
      'Serverless 架构实践',
    ];
    const aiTitles = [
      '机器学习入门：从线性回归开始',
      '深度学习框架对比：PyTorch vs TensorFlow',
      'NLP 实战：用 BERT 做文本分类',
      '推荐系统从零到一',
      '计算机视觉入门：图像分类实战',
      '强化学习基础：Q-Learning 详解',
      '大语言模型(LLM)微调实践',
      '向量数据库：RAG 系统的核心',
      '时间序列预测：从 ARIMA 到 LSTM',
      '特征工程的艺术',
      '模型部署与 MLOps 实践',
      'Prompt Engineering 进阶技巧',
      '知识图谱构建与应用',
      '数据可视化：用 Python 讲好数据故事',
      'A/B 测试：从理论到实践',
    ];
    const lifeTitles = [
      '在忙碌中找到生活的节奏',
      '搬宿舍的那天下了大雨',
      '实习日记：第一次走进互联网大厂',
      '一个程序员的健身之路',
      '凌晨三点的代码和清晨六点的阳光',
      '那年在黑客马拉松的 48 小时',
      '我的远程办公初体验',
      '辞职后的第 30 天',
      '三十岁，写给自己的信',
      '旅行的意义：在代码之外看见世界',
      '从零开始学做饭',
      '写给刚入行的自己',
      '我的大学室友们',
      '北漂三年，我学会了什么',
      '咖啡与代码：程序员的日常',
    ];
    const projectTitles = [
      '从零搭建个人博客系统',
      '企业级权限管理系统设计',
      '实时聊天系统技术选型',
      '数据可视化大屏实战',
      '搭建自动化测试平台',
      '脚手架工具开发：从模板到发布',
      '搭建私有 NPM 仓库',
      '低代码平台的实现思路',
      '一个完整的上传文件系统',
      '搭建监控告警平台',
      'CMS 内容管理系统开发',
      'API 管理平台的搭建',
      '即时通讯 SDK 设计',
      '工作流引擎的实现',
      '日志分析平台实战',
    ];
    const readingTitles = [
      '《代码整洁之道》读后感',
      '《深入理解计算机系统》笔记',
      '《设计模式》精读笔记',
      '《重构》改善既有代码的设计',
      '《人月神话》项目管理启示',
      '《高性能MySQL》核心要点',
      '《算法导论》学习路径',
      '《你不知道的JavaScript》笔记',
      '《领域驱动设计》读书笔记',
      '《黑客与画家》程序员哲学',
      '《软技能》程序员的职业规划',
      '《数据密集型应用设计》精读',
    ];
    const designTitles = [
      '用户体验设计的十大原则',
      '从零学习 Figma：设计师的协作工具',
      '移动端交互设计的那些坑',
      '色彩理论在UI设计中的应用',
      '设计系统：从组件到规范',
      '信息架构：让产品更易用',
      'B端产品设计心得',
      '动效设计的原则与实践',
    ];

    const categoryTitleMap = [
      { catId: 1, titles: techTitles, tagIds: [1,2,3,4,5,6,13,14,15,16,24,25,26,27,32,33,34] },
      { catId: 2, titles: techTitles, tagIds: [1,2,3,4,13,14,15,16,32] },
      { catId: 3, titles: beTitles, tagIds: [5,6,7,8,9,10,11,12,17,18,19,20,21,22,23,26,27,28] },
      { catId: 4, titles: aiTitles, tagIds: [6,7,25,26,27,28] },
      { catId: 5, titles: lifeTitles, tagIds: [] },
      { catId: 6, titles: projectTitles, tagIds: [1,2,3,4,5,6,7,8,9,10,11,12,17,18,19,20,32,33,34] },
      { catId: 7, titles: readingTitles, tagIds: [] },
      { catId: 8, titles: designTitles, tagIds: [13,14,15,34] },
    ];

    const authors = [1,2,3,4,5,6,7];
    const usedSlugs = new Set();
    let slugCounter = 0;

    function makeSlug(title) {
      let s = title.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
      if (usedSlugs.has(s)) s += '-' + (++slugCounter);
      usedSlugs.add(s);
      return s;
    }

    function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function pickRandom(arr, min, max) {
      const count = randInt(min, max || min);
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    function genContent(title) {
      const sections = [];
      sections.push(`# ${title}\n`);
      sections.push(`## 前言\n\n最近在工作中遇到了一个关于此话题的实际场景，查阅了很多资料后才理清思路。于是整理成这篇文章，希望能帮助到和我有同样困惑的朋友。\n`);

      if (title.includes('实战') || title.includes('搭建') || title.includes('系统')) {
        sections.push(`## 技术选型\n\n在开始之前，先梳理一下我们需要的技术栈：\n`);
        sections.push(`- **前端**: Vue 3 + TypeScript + Vite\n- **后端**: Node.js + Express / Go + Gin\n- **数据库**: MySQL + Redis\n- **部署**: Docker + Nginx\n`);
        sections.push(`## 核心实现\n\n以下是关键代码片段：\n\n\`\`\`javascript
const start = async () => {
  const config = await loadConfig();
  const db = await connectDB(config.database);
  const server = createServer(db);
  server.listen(config.port, () => {
    console.log(\`Server running at http://localhost:\${config.port}\`);
  });
};
start().catch(console.error);
\`\`\`\n`);
      } else if (title.includes('优化') || title.includes('性能') || title.includes('原理')) {
        sections.push(`## 核心原理\n\n要理解这个问题，首先要从底层机制说起。\n`);
        sections.push(`## 优化策略\n\n| 策略 | 效果 | 适用场景 |\n|------|------|----------|\n| 缓存 | 减少重复计算 | 频繁访问的数据 |\n| 懒加载 | 减少首屏加载 | 大型列表/图片 |\n| 预加载 | 提升后续页面速度 | 用户可能访问的页面 |\n| 压缩 | 减少传输体积 | 所有静态资源 |\n`);
        sections.push(`## 实践案例\n\n在实际项目中应用这些策略后，性能指标有了明显提升：\n\n- 首屏加载时间从 3.2s 降到 1.1s\n- Lighthouse 评分从 65 提升到 92\n- 资源总大小减少 60%\n`);
      } else if (title.includes('入门') || title.includes('指南') || title.includes('学习')) {
        sections.push(`## 基础概念\n\n先来了解几个核心概念：\n\n1. **概念A**：这是整个体系的基石\n2. **概念B**：建立在概念A之上的抽象层\n3. **概念C**：实际开发中最常用的部分\n`);
        sections.push(`## 快速上手\n\n\`\`\`bash
# 第一步：安装依赖
npm install

# 第二步：配置环境
cp .env.example .env

# 第三步：启动项目
npm run dev
\`\`\`\n`);
        sections.push(`## 常见问题\n\n> **Q: 为什么启动后页面空白？**\n> A: 检查 .env 文件中的 API_BASE_URL 是否正确配置。\n\n> **Q: 如何调试？**\n> A: 在浏览器中按 F12 打开开发者工具，切换到 Console 标签查看错误信息。\n`);
      } else if (title.includes('设计') || title.includes('UI') || title.includes('体验')) {
        sections.push(`## 设计理念\n\n好的设计不是装饰，而是解决问题。以下几个原则值得思考：\n`);
        sections.push(`1. **简洁至上** - 减少认知负担\n2. **一致性** - 统一的交互模式\n3. **反馈及时** - 让用户知道发生了什么\n4. **容错设计** - 允许犯错并快速恢复\n`);
      } else if (title.includes('面试') || title.includes('设计模式') || title.includes('算法')) {
        sections.push(`## 问题分析\n\n这道题考察的核心能力是：\n\n- 对基础数据结构的理解\n- 时间/空间复杂度的分析\n- 边界条件的处理\n`);
        sections.push(`## 解法\n\n\`\`\`python
def solution(input_data):
    result = []
    for item in input_data:
        # 核心逻辑
        processed = transform(item)
        result.append(processed)
    return result
\`\`\`\n`);
      } else {
        sections.push(`## 核心内容\n\n首先来看一段代码：\n\n\`\`\`typescript
interface Config {
  baseUrl: string;
  timeout: number;
  retryCount: number;
}

const defaultConfig: Config = {
  baseUrl: 'http://localhost:3000',
  timeout: 5000,
  retryCount: 3
};

function mergeConfig(userConfig: Partial<Config>): Config {
  return { ...defaultConfig, ...userConfig };
}
\`\`\`\n`);
      }

      sections.push(`## 深入思考\n\n在实际应用中，还有一些需要注意的点：\n`);
      sections.push(`- **边界条件**: 空值、异常输入的处理\n- **扩展性**: 未来需求变更时的改动成本\n- **可维护性**: 三个月后的自己能否看懂\n`);
      sections.push(`> 技术只是手段，解决问题才是目的。不要为了用新技术而用新技术。\n`);
      sections.push(`## 总结\n\n回顾全文，核心要点可以归纳为：\n`);
      sections.push(`1. 理解底层原理比记住API更重要\n2. 实践是检验理解的最好方式\n3. 持续学习是程序员的核心竞争力\n`);
      sections.push(`---\n\n*本文由 ${randFrom(['墨白','南风','星辰','浅夏','北城','admin'])} 原创，欢迎讨论交流。*`);
      return sections.join('\n');
    }

    function genSummary(title) {
      return `本文围绕"${title}"展开讨论，分享个人经验与思考，希望对你有所帮助。`;
    }

    // ============ 生成文章 ============
    const allPosts = [];
    for (const group of categoryTitleMap) {
      for (const title of group.titles) {
        allPosts.push({
          title,
          slug: makeSlug(title),
          content: genContent(title),
          summary: genSummary(title),
          authorId: randFrom(authors),
          categoryId: group.catId,
          viewCount: randInt(30, 800),
          tagIds: group.tagIds.length > 0 ? pickRandom(group.tagIds, 1, 4) : [],
        });
      }
    }

    console.log(`[Seed] 生成 ${allPosts.length} 篇文章...`);
    const postIds = [];
    for (const p of allPosts) {
      const [res] = await pool.execute(
        'INSERT INTO posts (title, slug, content, summary, author_id, category_id, cover_image, view_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.title, p.slug, p.content, p.summary, p.authorId, p.categoryId, '', p.viewCount, 'published']
      );
      postIds.push(res.insertId);
      for (const tagId of p.tagIds) {
        try { await pool.execute('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [res.insertId, tagId]); } catch (_) {}
      }
    }

    // ============ 生成评论 ============
    const commentTemplates = [
      '写得太好了，解决了我一直以来的困惑！',
      '学习了，感谢分享。准备在项目中实践一下。',
      '有几点不太同意，感觉作者有些地方没讲透。',
      '这几天正好在搞这个，及时雨啊！',
      '请问文中的方案在生产环境中稳定吗？',
      '收藏了，以后慢慢看。',
      '写得很详细，比某些付费教程强多了。',
      '期待下一篇文章！',
      '多年经验的老手表示，写得不错。',
      '新手看不太懂，能出个更基础的版本吗？',
      '楼主能不能分享一下完整代码？',
      '这些内容在我面试的时候用上了，感谢！',
      '有个小问题请教一下，私信你了。',
      '看了三遍，每次都有新收获。',
      '这个方案我们团队也在用，确实好用。',
      '博主更新频率好快，持续关注中。',
      '和你不一样，我们用的是另一种方案。',
      '代码片段有个小bug，第三行应该是await。',
    ];

    const replyTemplates = [
      '确实，我之前也这么觉得。',
      '说的没错，实践出真知。',
      '我后来发现用另一种方式也可以，供参考。',
      '感谢指正，已经修改了~',
      '这个问题我有研究过，可以看看这篇文章。',
      '不太同意，我试试你的办法再说。',
      '回复楼主：GitHub上有个类似的开源项目可以参考。',
      '好的，谢谢你的建议！',
    ];

    console.log('[Seed] 生成评论...');
    const commentIds = [];
    // 为每篇文章生成 1-4 条评论
    for (const pid of postIds) {
      const numComments = randInt(1, 4);
      for (let i = 0; i < numComments; i++) {
        const [res] = await pool.execute(
          'INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)',
          [randFrom(commentTemplates), pid, randFrom(authors)]
        );
        commentIds.push(res.insertId);
      }
    }

    // 随机生成一些回复
    console.log('[Seed] 生成回复...');
    const replyCount = Math.floor(commentIds.length * 0.3);
    for (let i = 0; i < replyCount; i++) {
      const parentId = randFrom(commentIds);
      const [parent] = await pool.execute('SELECT post_id FROM comments WHERE id = ?', [parentId]);
      if (parent.length > 0) {
        await pool.execute(
          'INSERT INTO comments (content, post_id, user_id, parent_id) VALUES (?, ?, ?, ?)',
          [randFrom(replyTemplates), parent[0].post_id, randFrom(authors), parentId]
        );
      }
    }

    console.log(`[Seed] 完成！${allPosts.length} 篇文章，${commentIds.length} 条评论`);
  }
}

module.exports = { pool, initDatabase, seedData };
