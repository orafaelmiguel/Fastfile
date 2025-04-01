import 'dotenv/config';
import app from './config/express';

const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';

// Log das rotas registradas
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(`Route registered: ${Object.keys(r.route.methods)} ${r.route.path}`);
  }
});

app.listen(port, () => {
  process.stdout.write(`Server running on port ${port} in ${nodeEnv} mode\n`);
}); 