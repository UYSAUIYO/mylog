import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "password",
  database: process.env.DATABASE_NAME || "mylog",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_INITIAL_PASSWORD || "admin123",
    10
  );

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      displayName: "博客管理员",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin.username);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "frontend" },
      update: {},
      create: { name: "前端开发", slug: "frontend", description: "前端技术相关文章" },
    }),
    prisma.category.upsert({
      where: { slug: "backend" },
      update: {},
      create: { name: "后端开发", slug: "backend", description: "后端技术相关文章" },
    }),
    prisma.category.upsert({
      where: { slug: "ai" },
      update: {},
      create: { name: "人工智能", slug: "ai", description: "AI/机器学习相关文章" },
    }),
    prisma.category.upsert({
      where: { slug: "embedded" },
      update: {},
      create: { name: "嵌入式", slug: "embedded", description: "嵌入式开发相关文章" },
    }),
    prisma.category.upsert({
      where: { slug: "devops" },
      update: {},
      create: { name: "DevOps", slug: "devops", description: "运维部署相关文章" },
    }),
  ]);

  console.log("Categories created:", categories.length);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: "react" }, update: {}, create: { name: "React", slug: "react" } }),
    prisma.tag.upsert({ where: { slug: "nextjs" }, update: {}, create: { name: "Next.js", slug: "nextjs" } }),
    prisma.tag.upsert({ where: { slug: "typescript" }, update: {}, create: { name: "TypeScript", slug: "typescript" } }),
    prisma.tag.upsert({ where: { slug: "python" }, update: {}, create: { name: "Python", slug: "python" } }),
    prisma.tag.upsert({ where: { slug: "docker" }, update: {}, create: { name: "Docker", slug: "docker" } }),
    prisma.tag.upsert({ where: { slug: "mysql" }, update: {}, create: { name: "MySQL", slug: "mysql" } }),
    prisma.tag.upsert({ where: { slug: "tailwindcss" }, update: {}, create: { name: "Tailwind CSS", slug: "tailwindcss" } }),
  ]);

  console.log("Tags created:", tags.length);

  // Create a sample article
  const sampleArticle = await prisma.article.upsert({
    where: { slug: "hello-world" },
    update: {},
    create: {
      title: "欢迎来到我的博客",
      slug: "hello-world",
      content: `# 欢迎来到我的博客

这是我的第一篇博客文章。在这里，我将分享技术学习笔记和项目经验。

## 关于这个博客

这个博客使用以下技术栈构建：

- **框架**: Next.js 16
- **样式**: Tailwind CSS v4
- **数据库**: MySQL 8.0 + Prisma ORM
- **Markdown**: react-markdown + KaTeX + Mermaid

## 代码示例

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

## 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)
$$

## 流程图

\`\`\`mermaid
graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[结束]
    C --> D
\`\`\`

> 感谢阅读！`,
      excerpt: "这是我的第一篇博客文章，介绍这个博客的技术栈和功能。",
      status: "PUBLISHED",
      isPublished: true,
      publishedAt: new Date(),
      readingTime: 2,
      wordCount: 150,
      authorId: admin.id,
      categories: {
        create: [
          { category: { connect: { slug: "frontend" } } },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { slug: "react" } } },
          { tag: { connect: { slug: "nextjs" } } },
          { tag: { connect: { slug: "typescript" } } },
        ],
      },
    },
  });

  console.log("Sample article created:", sampleArticle.title);

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
