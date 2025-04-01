import 'dotenv/config';
import app from './config/express';

const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${nodeEnv} mode`);
}); 