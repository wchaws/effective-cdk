import { Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core';

export default class HelloWorldStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    /// !title HelloWorld
    /// !description This is a hello world
    /// !show
    // This is a comment
    new CfnOutput(this, 'output', { value: 'hello world' });
    /// !hide
  }
}