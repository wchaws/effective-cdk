import * as path from 'path';
import * as lambda from '@aws-cdk/aws-lambda';
import { Construct, Stack, StackProps } from '@aws-cdk/core';

/// !title ### S005: Lambda layer
/// !tree
export default class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    /// !show
    const layer = new lambda.LayerVersion(this, 'MyLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/'), {
        bundling: {
          image: lambda.Runtime.NODEJS_12_X.bundlingDockerImage,
          command: [
            'bash', '-xc', [
              'export npm_config_update_notifier=false',
              'export npm_config_cache=$(mktemp -d)', // https://github.com/aws/aws-cdk/issues/8707#issuecomment-757435414
              'cd $(mktemp -d)',
              'cp -v /asset-input/package*.json .',
              'npm i --only=prod',
              'mkdir -p /asset-output/nodejs/',
              'cp -au node_modules /asset-output/nodejs/',
            ].join('&&'),
          ],
        },
      }),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
      description: 'A layer to test the L2 construct',
    });

    new lambda.Function(this, 'MyHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/src')),
      handler: 'index.handler',
      layers: [layer],
    });
    /// !hide
  }
}