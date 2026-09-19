const normalizedBase = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export function withBase(path = '') {
  return `${normalizedBase}${path.replace(/^\\/+/, '')}`;
}
