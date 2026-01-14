import { Container } from "inversify";
import express, { Router, Request, Response } from "express";

export function registerAuthRoutes(
  app: express.Application,
  container: Container
): void {
    const router = Router();
    app.use("/api/auth", router);

}