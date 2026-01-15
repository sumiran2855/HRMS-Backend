import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { Logger } from '../shared/utils/logger.util';

const logger = new Logger('gRPCServer');

let grpcServer: grpc.Server;

export function initializeGrpcServer(): grpc.Server {
  grpcServer = new grpc.Server();
  logger.info("✓ gRPC server initialized");
  return grpcServer;
}

export function loadProtoDefinition(protoFileName: string) {
  try {
    const protoPath = path.join(
      __dirname,
      "../../..",
      "proto",
      protoFileName
    );

    logger.info(`Loading proto definition from ${protoPath}`);

    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(packageDefinition);
    logger.info(`✓ Proto loaded: ${protoFileName}`);

    return proto;
  } catch (error) {
    logger.error("Error loading proto definition", error);
    throw error;
  }
}

export async function startGrpcServer(
  port: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      grpcServer.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (error: Error | null) => {
          if (error) {
            logger.error("Failed to bind gRPC server", error);
            reject(error);
          } else {
            grpcServer.start();
            logger.info(`✓ gRPC server listening on port ${port}`);
            resolve();
          }
        }
      );
    } catch (error) {
      logger.error("Error starting gRPC server", error);
      reject(error);
    }
  });
}

export async function shutdownGrpcServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (grpcServer) {
      grpcServer.tryShutdown((error?: Error) => {
        if (error) {
          logger.error("Error shutting down gRPC server", error);
          reject(error);
        } else {
          logger.info("✓ gRPC server shutdown gracefully");
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

export function getGrpcServer(): grpc.Server {
  return grpcServer;
}

export function registerService(
  grpcServer: grpc.Server,
  proto: any,
  serviceName: string,
  implementation: any
): void {
  try {
    const parts = serviceName.split('.');
    let ServiceClass = proto;
    
    for (const part of parts) {
      ServiceClass = ServiceClass[part];
      if (!ServiceClass) {
        throw new Error(`Service ${serviceName} not found in proto`);
      }
    }

    grpcServer.addService(ServiceClass.service, implementation);
    logger.info(`✓ Service ${serviceName} registered`);
  } catch (error) {
    logger.error("Error registering service", error);
    throw error;
  }
}
