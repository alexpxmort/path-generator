import App from './app';
import { router } from './routes';

export function start(): Promise<string> {
  const strPort = process.env.PORT_NUMBER || '5000';
  const port = Number.parseInt(strPort, 10);

  const app = new App();
  app.setupRoutes(router);
  return new Promise((resolve) => {
    app.listen(port, () => {
      resolve(`Server is listening on port ${port}`);
    });
  });
}
