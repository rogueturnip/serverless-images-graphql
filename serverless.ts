import type { AWS } from "@serverless/typescript";
import { BUCKET } from "./src/config";
import graphql from "@functions/graphql";
import imageProcessor from "@functions/uploadImageProcessor";

const serverlessConfiguration: AWS = {
  service: "serverless-image-graphql",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline", "serverless-s3-local"],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      REGION: "us-east-1",
      BUCKET,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  // import the function via paths
  functions: {
    imageProcessor,
    graphql,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node20",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    s3: {
      host: "localhost",
      directory: "/tmp/s3",
    },
  },
  resources: {
    Resources: {
      Bucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: BUCKET,
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
