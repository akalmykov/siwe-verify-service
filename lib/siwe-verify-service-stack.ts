import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class SiweVerifyServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      env: {
        region: "us-east-1",
      },
      ...props,
    });

    const fn = new NodejsFunction(this, "lambda", {
      entry: "lambda/index.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
    });
    fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ["*"],
      },
    });
    new apigw.LambdaRestApi(this, "siwe-verify-api", {
      handler: fn,
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"], // Allow all origins
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all methods
        allowHeaders: ["*"], // Allow all header
      },
    });
  }
}
