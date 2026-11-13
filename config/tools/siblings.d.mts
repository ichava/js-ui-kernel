export function packagesDir(): string;
export function siblingPath(repository: string, path?: string): string | null;
export function parseRepoUrl(url: string): { repository: string; path: string } | null;
