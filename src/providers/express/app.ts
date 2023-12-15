/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cors from 'cors';

import express, { Router } from 'express';

export default class App {
  service: express.Express;

  constructor() {
    this.service = express();

    this.service.use(express.json());
    this.service.use(
      cors({
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST', 'DELETE', 'PUT']
      })
    );
  }

  setupRoutes(router: Router) {
    this.service.use('/', router);
  }

  listen(port: number, callback: () => void) {
    this.service.listen(port, callback);
  }
}
