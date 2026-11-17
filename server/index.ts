import { createApp } from './app.ts';
import { config } from './config.ts';

const app = await createApp();

app.listen(config.port, () => {
  console.log(`IdeaPilot running on http://localhost:${config.port}`);
});
