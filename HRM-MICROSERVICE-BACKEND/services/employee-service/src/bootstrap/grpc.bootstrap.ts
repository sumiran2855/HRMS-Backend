import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { Logger } from '../shared/utils/logger.util';

const logger = new Logger('gRPCServer');

export function initializeGrpcServer(): grpc.Server {
  const server = new grpc.Server();
  return server;
}

export function loadProtoDefinition(protoPath: string, protoFile: string) {
  const packageDefinition = protoLoader.loadSync(protoFile, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return grpc.loadPackageDefinition(packageDefinition);
}

export async function startGrpcServer(
  server: grpc.Server,
  port: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (err: Error | null) => {
        if (err) {
          logger.error('Failed to bind gRPC server', err);
          reject(err);
        } else {
          server.start();
          logger.info(`gRPC Server running on port ${port}`);
          resolve();
        }
      }
    );
  });
}

export async function shutdownGrpcServer(server: grpc.Server): Promise<void> {
  return new Promise((resolve) => {
    server.tryShutdown(() => {
      logger.info('gRPC Server shut down');
      resolve();
    });
  });
}
