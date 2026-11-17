import { createHash, randomUUID } from "node:crypto";
import {
  linkSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import type { IncomingMessage } from "node:http";
import { resolve } from "node:path";
import type { AstroIntegration } from "astro";
import type { Project, ProjectGroup } from "../content/projects";
import { contentDocuments, validateDocument } from "./contentDocuments";

export const editorPath = "/__local/projects";
export const contentEditorPath = "/__local/edit";
export const documentsPath = "/__local/content";

export const isLocalEditor = (hostname: string) =>
  ["localhost", "127.0.0.1", "[::1]"].includes(hostname);

const fingerprint = (value: string) =>
  createHash("sha256").update(value).digest("hex");

async function readBody(req: IncomingMessage, limit: number) {
  req.setEncoding("utf8");
  let body = "";
  let size = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += Buffer.byteLength(chunk);
    if (size > limit) {
      req.resume();
      return null;
    }
    body += chunk;
  }
  return body;
}

function writeContent(file: string, source: string, create = false) {
  const pending = `${file}.${randomUUID()}.tmp`;
  try {
    writeFileSync(pending, source, { flag: "wx" });
    if (create) linkSync(pending, file);
    else renameSync(pending, file);
  } finally {
    rmSync(pending, { force: true });
  }
}
export const projectFields = [
  { name: "title", label: "标题", maxLength: 100 },
  { name: "type", label: "类别", maxLength: 40 },
  { name: "summary", label: "摘要", maxLength: 400 },
  { name: "detail", label: "详情", maxLength: 2000 },
] as const;

export function projectRevision(project: Project) {
  const fields = projectFields.map(({ name }) => project[name] ?? "");
  return fingerprint(JSON.stringify(fields));
}

export default function projectEditor(): AstroIntegration {
  return {
    name: "local-content-editor",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command === "dev") {
          injectRoute({
            pattern: contentEditorPath,
            entrypoint: "./src/components/LocalContentEditor.astro",
            prerender: true,
          });
        }
      },
      "astro:server:setup": ({ server }) => {
        const root = realpathSync(server.config.root);
        const file = resolve(root, "src/content/projects.json");
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/__local/")) return next();
          const request = new URL(req.url, "http://localhost");
          const pathname = request.pathname.replace(/\/$/, "");
          if (
            ![editorPath, contentEditorPath, documentsPath].includes(pathname)
          ) {
            return next();
          }

          res.setHeader("Cache-Control", "no-store");
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("X-Frame-Options", "DENY");
          const reply = (code: number, message: string) => {
            res.statusCode = code;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end(message);
          };

          const host = req.headers.host ?? "";
          const peer = req.socket.remoteAddress ?? "";
          if (
            !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(peer) ||
            !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)
          ) {
            return reply(403, "请通过本机 localhost 打开编辑页。");
          }
          if (pathname === contentEditorPath) return next();
          if (
            req.method === "POST" &&
            req.headers.origin !== `http://${host}`
          ) {
            return reply(403, "请从当前站点的本地编辑页提交。");
          }

          if (pathname === documentsPath) {
            try {
              const documents = contentDocuments(root);
              const document = documents.find(
                (item) => item.key === request.searchParams.get("key"),
              );
              const json = (data: unknown) => {
                res.setHeader(
                  "Content-Type",
                  "application/json; charset=utf-8",
                );
                res.end(JSON.stringify(data));
              };

              if (req.method === "GET") {
                if (!request.searchParams.has("key")) return json(documents);
                if (!document) return reply(404, "找不到这项内容。");
                const path = resolve(root, document.file);
                if (realpathSync(path) !== path)
                  return reply(403, "编辑器只读取仓库内的普通文件。");
                const source = readFileSync(path, "utf8");
                return json({ source, revision: fingerprint(source) });
              }
              if (req.method !== "POST") {
                res.setHeader("Allow", "GET, POST");
                return reply(405, "请求方法不受支持。");
              }
              if (
                req.headers["content-type"]?.split(";")[0] !==
                "application/json"
              ) {
                return reply(415, "保存请求格式不正确。");
              }
              const body = await readBody(req, 1024 * 1024);
              if (body === null) return reply(413, "提交内容太长。");
              let source: string;
              let revision: string | null;
              try {
                const data = JSON.parse(body);
                if (
                  typeof data.source !== "string" ||
                  (data.revision !== null && typeof data.revision !== "string")
                ) {
                  return reply(400, "保存请求格式不正确。");
                }
                ({ source, revision } = data);
              } catch {
                return reply(400, "保存请求格式不正确。");
              }

              const key = request.searchParams.get("key") ?? "";
              const newPost = key.match(/^post:([a-z0-9][a-z0-9-]{0,63}\.md)$/);
              if (!document && (!newPost || revision !== null)) {
                return reply(404, "找不到这项内容。");
              }
              if (
                !document &&
                documents.some((item) => item.key === `${key}x`)
              ) {
                return reply(409, "该文章地址已经被 MDX 文章使用。");
              }
              const path = resolve(
                root,
                document?.file ?? `src/content/blog/${newPost?.[1]}`,
              );
              if (document && realpathSync(path) !== path) {
                return reply(403, "编辑器只修改仓库内的普通文件。");
              }
              const previous = document ? readFileSync(path, "utf8") : null;
              if (previous !== null && fingerprint(previous) !== revision) {
                return reply(
                  409,
                  "文件已更新。请保留当前改动并重新打开后合并。",
                );
              }
              if (previous !== source) {
                try {
                  const result = validateDocument(key, source);
                  if (!result.success) {
                    const issue = result.error.issues[0];
                    return reply(
                      400,
                      `${issue.path.join(".") || "内容"}：${issue.message}`,
                    );
                  }
                } catch (error) {
                  return reply(
                    400,
                    error instanceof Error ? error.message : "内容格式不正确。",
                  );
                }
                if (
                  !document &&
                  realpathSync(resolve(root, "src/content/blog")) !==
                    resolve(root, "src/content/blog")
                ) {
                  return reply(403, "编辑器只在仓库内创建文件。");
                }
                writeContent(path, source, !document);
              }
              return json({ revision: fingerprint(source) });
            } catch {
              return reply(500, "读写失败。请检查本地文件后重试。");
            }
          }
          if (req.method !== "POST") {
            res.setHeader("Allow", "POST");
            return reply(405, "只接受表单保存请求。");
          }
          if (
            req.headers["content-type"]?.split(";")[0] !==
            "application/x-www-form-urlencoded"
          ) {
            return reply(415, "保存请求格式不正确。");
          }

          try {
            const body = await readBody(req, 32 * 1024);
            if (body === null) return reply(413, "提交内容太长。");

            const form = new URLSearchParams(body);
            const id = form.get("id");
            if (realpathSync(file) !== file)
              return reply(403, "编辑器只修改仓库内的普通文件。");
            const groups: ProjectGroup[] = JSON.parse(
              readFileSync(file, "utf8"),
            );
            const project = groups
              .flatMap(({ items }) => items)
              .find((item) => item.id === id);
            if (!project) return reply(404, "找不到这项作品。");
            if (projectRevision(project) !== form.get("revision")) {
              return reply(409, "作品已更新。请返回、刷新页面后再编辑。");
            }

            for (const { name, label, maxLength } of projectFields) {
              const value = form.get(name)?.replaceAll("\r\n", "\n").trim();
              if (
                value === undefined ||
                (name !== "detail" && !value) ||
                value.length > maxLength
              ) {
                return reply(400, `${label}为空或超出长度限制。`);
              }
              if (name === "detail" && !value) delete project.detail;
              else project[name] = value;
            }

            if (projectRevision(project) !== form.get("revision")) {
              writeContent(file, `${JSON.stringify(groups, null, 2)}\n`);
            }

            const anchor = encodeURIComponent(project.id);
            res.statusCode = 303;
            res.setHeader("Location", `/project/#saved-${anchor}`);
            res.end();
          } catch {
            reply(500, "保存失败。请检查本地项目文件后重试。");
          }
        });
      },
    },
  };
}
