import { readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "astro/zod";
import yaml from "js-yaml";
import { blogSchema } from "../content/blogSchema";

const text = z.string();
const requiredText = text.trim().min(1, "请填写内容");
const icon = text.regex(/^(?:[\w-]+:[\w-]+)?$/);
const id = text.regex(/^[\w-]+$/);
const url = text.refine(
  (value) =>
    /^(?:\/(?!\/)|#|https?:\/\/|mailto:)/i.test(value) &&
    !/[\\\r\n\t]/.test(value) &&
    value === value.trim(),
  "链接必须使用站内路径、HTTP(S) 或 mailto",
);
const image = url.refine(
  (value) => /^(?:\/|https?:\/\/)/i.test(value),
  "请输入图片路径",
);
const target = z.enum(["_self", "_blank"]);
const action = z.object({
  label: requiredText,
  href: url,
  icon,
  target: target.optional(),
});
const bio = z.object({
  title: text,
  image,
  name: text,
  education: text,
  bio: text,
  actions: z.array(action),
});
const captionedImage = z.object({
  src: image,
  caption: text,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const pages = z.object({
  home: bio.extend({
    description: text,
    recentTitle: text,
    recentLink: text,
    recentCount: z.number().int().min(0).max(30),
  }),
  about: bio.extend({
    heading: text,
    keywordsTitle: text,
    keywords: z.array(z.object({ title: requiredText, text })),
    skillsTitle: text,
    skills: z.array(
      z.object({
        name: requiredText,
        icon: icon.refine(Boolean, "请填写图标"),
        color: text.regex(/^(?:#[0-9a-fA-F]{3,8}|oklch\([\d. %/]+\))$/),
      }),
    ),
    competitionsTitle: text,
    competitions: z.array(
      z.object({
        id,
        title: requiredText,
        date: text,
        results: z.array(z.tuple([requiredText, requiredText])),
      }),
    ),
  }),
  friends: z.object({
    title: text,
    heading: text,
    image,
    items: z.array(
      z.object({
        name: requiredText,
        avatar: image,
        description: text,
        url,
        type: z.enum(["friend", "tech", "contributor"]).optional(),
      }),
    ),
  }),
  projects: z.object({ title: text, description: text }),
  blog: z.object({ title: text }),
  footer: z.object({ followTitle: text, rssLabel: text }),
});

const projects = z
  .array(
    z.object({
      id,
      title: requiredText,
      items: z.array(
        z.object({
          id,
          type: requiredText,
          title: requiredText,
          summary: requiredText,
          detail: text.optional(),
          link: z.object({ href: url, label: text }).optional(),
          photo: captionedImage.optional(),
        }),
      ),
    }),
  )
  .refine((groups) => {
    const ids = groups.flatMap((group) => [
      group.id,
      ...group.items.map((item) => item.id),
    ]);
    return new Set(ids).size === ids.length;
  }, "作品和分组的标识必须唯一");

const menu = z.object({ id, text, href: url, svg: icon, target });
const social = z.object({
  social: z.array(
    z.object({ href: url, ariaLabel: text, title: text, svg: icon }),
  ),
});
const settings = z.object({
  site: z.object({
    tab: text,
    title: text,
    description: text,
    language: text,
    favicon: image,
    theme: z.object({ light: text, dark: text, code: text }),
    date_format: text,
    blog: z.object({ pageSize: z.number().int().positive() }),
    menu: z.array(menu.extend({ subItems: z.array(menu).optional() })),
  }),
  user: z.object({
    name: text,
    site: text.url().regex(/^https?:\/\//),
    avatar: image,
    sidebar: social,
    footer: social,
  }),
});
const translations = z.record(z.object({ label: z.record(text) }));

const formats = {
  pages: {
    label: "页面文字与图片",
    file: "src/content/site-pages.json",
    format: "json",
    schema: pages,
  },
  projects: {
    label: "作品列表",
    file: "src/content/projects.json",
    format: "json",
    schema: projects,
  },
  settings: {
    label: "站点、导航与社交链接",
    file: "frosti.config.yaml",
    format: "yaml",
    schema: settings,
  },
  translations: {
    label: "主题界面文字",
    file: "src/i18n/translations.yaml",
    format: "yaml",
    schema: translations,
  },
} as const;

export function contentDocuments(root: string) {
  const documents: {
    key: string;
    label: string;
    file: string;
    format: string;
  }[] = Object.entries(formats).map(([key, document]) => ({
    key,
    label: document.label,
    file: document.file,
    format: document.format,
  }));

  for (const entry of readdirSync(join(root, "src/content/blog"), {
    withFileTypes: true,
  })) {
    if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
      documents.push({
        key: `post:${entry.name}`,
        label: entry.name.replace(/\.mdx?$/i, ""),
        file: `src/content/blog/${entry.name}`,
        format: entry.name.endsWith(".mdx") ? "mdx" : "markdown",
      });
    }
  }
  return documents;
}

export function validateDocument(key: string, source: string) {
  if (Object.hasOwn(formats, key)) {
    const format = formats[key as keyof typeof formats];
    return format.schema.safeParse(
      format.format === "json" ? JSON.parse(source) : yaml.load(source),
    );
  }
  const frontmatter = source.match(
    /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/,
  );
  if (!frontmatter) throw new Error("文章开头需要两行 --- 包围的元数据。");
  return blogSchema.safeParse(yaml.load(frontmatter[1]));
}
