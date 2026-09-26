/** Ask Discord's CDN for an appropriately sized avatar; leave other hosts unchanged. */
export function getAvatarImageUrl(source: string, displaySize: number) {
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || !['cdn.discordapp.com', 'media.discordapp.net'].includes(url.hostname)) return source;
    const pixels = Math.min(4096, Math.max(16, 2 ** Math.ceil(Math.log2(displaySize * 2))));
    url.searchParams.set('size', String(pixels));
    return url.toString();
  } catch { return source; }
}
