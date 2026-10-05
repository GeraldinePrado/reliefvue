import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const source = join(process.cwd(), 'docs', 'brandbook_v06');
const destination = join(process.cwd(), 'dist', 'brand-guide');

await mkdir(destination, { recursive: true });
for (const file of ['index.html', 'theme_v01.css', 'asset_register.md']) {
  await cp(join(source, file), join(destination, file));
}
await cp(join(source, 'assets'), join(destination, 'assets'), {
  recursive: true,
  filter: path => !path.endsWith('Icon\r') && !path.endsWith('.DS_Store'),
});

console.log('Copied brand guide v06 to dist/brand-guide/');
