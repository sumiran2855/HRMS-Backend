import { startHttpServer } from './bootstrap/http.bootstrap';
import { initializeDatabase } from './bootstrap/db.bootstrap';

async function main() {
  await startHttpServer();
  await initializeDatabase();
}
main();

