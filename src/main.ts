import * as fs from 'fs';
import * as path from 'path';
import { App } from '@aws-cdk/core';

const STACKS_DIR = path.join(__dirname, './stacks');

(async () => {
  const app = new App();
  for (const stack of fs.readdirSync(STACKS_DIR)) {
    const module = await import(path.join(STACKS_DIR, stack));
    if (module.default) {
      new module.default(app, stack.replace('.ts', ''));
    } else {
      console.warn(`Stack "${stack}" does not have default export!`);
    }
  }
  app.synth();
})().catch(console.error);
