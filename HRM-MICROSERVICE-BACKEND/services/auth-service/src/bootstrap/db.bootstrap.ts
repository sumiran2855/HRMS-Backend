import { connectToDatabase } from "../infrastructure/database/mongodb.connection";

export async function initializeDatabase(): Promise<void> {
  await connectToDatabase();
}