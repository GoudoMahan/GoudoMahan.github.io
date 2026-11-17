import projects from "./projects.json";

export type Project = {
  id: string;
  type: string;
  title: string;
  summary: string;
  detail?: string;
  photo?: { src: string; caption: string; width: number; height: number };
  link?: { href: string; label: string };
};

export type ProjectGroup = { id: string; title: string; items: Project[] };

export const projectGroups: ProjectGroup[] = projects;
