import { Construct, Stack, StackProps, App } from '@aws-cdk/core';

/// !title ### S004: Do not hardcode env
export default class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
  }
}

() => {
  /// !description Don’t specify env with account and region like below that will generate account/region hardcode in CloudFormation template.
  /// !show
  const app = new App();
  // Don't
  new MyStack(app, 'Stack', {
    env: {
      account: '123456',
      region: 'us-east-1',
    },
  });
  // Do
  new MyStack(app, 'Stack', {
    env: {
      region: process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT,
    },
  });
  /// !hide
};