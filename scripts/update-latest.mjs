// Rewrites the "Latest guides" block of profile/README.md from the site's public API.
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://www.cloudsoftzone.com';
const UTM = 'utm_source=github&utm_medium=profile&utm_campaign=org-readme';
const FILE = 'profile/README.md';
const BLOCK = /(<!-- latest:start -->)[\s\S]*?(<!-- latest:end -->)/;

const response = await fetch(`${SITE}/api/v1/posts?pageSize=6`, { headers: { 'user-agent': 'cloudsoft-zone-profile' } });
if (!response.ok) throw new Error(`posts API answered ${response.status}`);
const { data } = await response.json();
// An empty or malformed answer must fail the run, never blank the list.
if (!Array.isArray(data) || data.length === 0 || !data.every((post) => post.title && /^[a-z0-9-]+$/.test(post.slug))) throw new Error('posts API returned no usable articles');

const escape = (text) => String(text).replace(/[\\[\]<>|`*_]/g, (char) => `\\${char}`);
const rows = data.map((post) => `- [${escape(post.title)}](${SITE}/blog/${post.slug}?${UTM}) · ${escape(post.category?.name ?? 'Guide')}`).join('\n');
const text = readFileSync(FILE, 'utf8');
if (!BLOCK.test(text)) throw new Error('latest markers not found');
writeFileSync(FILE, text.replace(BLOCK, (_, start, end) => `${start}\n${rows}\n${end}`));
console.log(rows);
