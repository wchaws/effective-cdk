import { Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core';

export default class HelloWorldStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    new CfnOutput(this, 'output', { value: 'hello world' });
  }
}