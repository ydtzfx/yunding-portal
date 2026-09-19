const normalizedBase = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export function withBase(path = '') {
  let cleanPath = path;
  while (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
  return `${normalizedBase}${cleanPath}`;
}
