import app from './app.mts';
import { PORT } from './config/env.mts';

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
