import { Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core';

/// !title ### S001: How to echo value in AWS CloudFormation?
export default class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    /// !show
    new CfnOutput(this, 'output', { value: 'hello world' });
    /// !hide
  }
}