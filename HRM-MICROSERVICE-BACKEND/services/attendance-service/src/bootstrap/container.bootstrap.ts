import "reflect-metadata";
import { Container } from "inversify";

export function buildContainer(): Container {
  const container = new Container();
    // Bind your services, repositories, and controllers here
    return container;
}

export const container = buildContainer();