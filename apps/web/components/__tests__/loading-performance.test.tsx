import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PageMotion } from '../motion/page-motion';
import { Avatar } from '../ui/avatar';
import { getAvatarImageUrl } from '../../lib/avatar-image';

describe('Content and image loading', () => {
  it('renders readable page content without waiting for animation JavaScript', () => {
    const html = renderToString(<PageMotion><h1>Meet the club</h1></PageMotion>);
    expect(html).toContain('<h1>Meet the club</h1>');
    expect(html).not.toContain('opacity');
  });
  it('requests a CDN size matching a high density avatar instead of a full-size image', () => {
    expect(getAvatarImageUrl('https://cdn.discordapp.com/avatars/123/hash.png?size=4096', 48)).toBe('https://cdn.discordapp.com/avatars/123/hash.png?size=128');
    const html = renderToString(<Avatar src="https://cdn.discordapp.com/avatars/123/hash.png" alt="Alex" size={48} />);
    expect(html).toContain('size=128');
    expect(html).toContain('width="48"');
    expect(html).toContain('height="48"');
    expect(html).toContain('loading="lazy"');
  });
  it('does not rewrite external or malformed avatar locations', () => {
    for(const url of ['https://example.com/avatar.jpg','https://cdn.discordapp.com.example.com/avatar.png','not-a-url']) expect(getAvatarImageUrl(url,48)).toBe(url);
  });
});
