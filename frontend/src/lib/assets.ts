/**
 * Resolves static asset and image URLs uploaded to TaskFlow backend.
 * Handles absolute URLs, blob/data URLs, and relative /uploads/* paths.
 */
export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return '';

  const cleanPath = path.trim();
  if (
    cleanPath.startsWith('http://') ||
    cleanPath.startsWith('https://') ||
    cleanPath.startsWith('data:') ||
    cleanPath.startsWith('blob:')
  ) {
    return cleanPath;
  }

  // Ensure leading slash
  const normalized = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // Next.js rewrites `/uploads/:path*` to the backend automatically.
  // In development, Next.js rewrite or direct backend origin works.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const backendOrigin = apiUrl.replace(/\/api\/?$/, '');

  // If path starts with /uploads, return backendOrigin + normalized
  if (normalized.startsWith('/uploads')) {
    return `${backendOrigin}${normalized}`;
  }

  return `${backendOrigin}${normalized}`;
}

/**
 * Returns a deterministic vibrant background color gradient and text color
 * based on user name or email for initials avatars.
 */
export function getAvatarColor(nameOrEmail: string | null | undefined): {
  bg: string;
  text: string;
  border: string;
} {
  const seed = (nameOrEmail || 'TaskFlow User').trim();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const palettes = [
    {
      bg: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
      text: 'text-white',
      border: 'border-indigo-400/40',
    },
    {
      bg: 'bg-gradient-to-br from-violet-500 to-purple-700',
      text: 'text-white',
      border: 'border-purple-400/40',
    },
    {
      bg: 'bg-gradient-to-br from-sky-500 to-blue-700',
      text: 'text-white',
      border: 'border-blue-400/40',
    },
    {
      bg: 'bg-gradient-to-br from-teal-500 to-emerald-700',
      text: 'text-white',
      border: 'border-emerald-400/40',
    },
    {
      bg: 'bg-gradient-to-br from-emerald-500 to-green-700',
      text: 'text-white',
      border: 'border-green-400/40',
    },
    {
      bg: 'bg-gradient-to-br from-amber-500 to-orange-700',
      text: 'text-white',
      border: 'border-amber-400/40',
    },
    {
      bg: 'bg-gradient-to-br from-rose-500 to-pink-700',
      text: 'text-white',
      border: 'border-rose-400/40',
    },
    {
      bg: 'bg-gradient-to-br from-fuchsia-500 to-pink-700',
      text: 'text-white',
      border: 'border-fuchsia-400/40',
    },
    {
      bg: 'bg-gradient-to-br from-blue-600 to-cyan-600',
      text: 'text-white',
      border: 'border-cyan-400/40',
    },
  ];

  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

/**
 * Extracts 1-2 initials from user's name or email.
 */
export function getInitials(nameOrEmail: string | null | undefined): string {
  if (!nameOrEmail) return 'U';
  const clean = nameOrEmail.trim();

  // If email without display name
  if (clean.includes('@') && !clean.includes(' ')) {
    return clean.charAt(0).toUpperCase();
  }

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

