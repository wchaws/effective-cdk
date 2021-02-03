### S001: How to echo value in AWS CloudFormation?


see details [S001-helloworld.ts](../src/stacks/S001-helloworld.ts)

```ts
new CfnOutput(this, 'output', { value: 'hello world' });
```
---