### S001: How to echo value in AWS CloudFormation?


see details [S001-helloworld.ts](../src/stacks/S001-helloworld.ts)

```ts
new CfnOutput(this, 'output', { value: 'hello world' });
```
---
### S002: How to set `Instance.MachineImage` from `CfnMapping.FindInMap(“MappingName”, Aws.REGION)`?
This is originally discussed at https://stackoverflow.com/q/60645254/4108187
and it's going to be fixed in https://github.com/aws/aws-cdk/pull/12546

see details [S002-Use-CfnMapping-in-an-agnostic-stack-for-GenericMachineImage.ts](../src/stacks/S002-Use-CfnMapping-in-an-agnostic-stack-for-GenericMachineImage.ts)

```ts
class MyImage implements ec2.IMachineImage {
  private mapping: { [k1: string]: { [k2: string]: any } } = {};
  constructor(readonly amiMap: { [region: string]: string }) {
    for (const [region, ami] of Object.entries(amiMap)) {
      this.mapping[region] = { ami };
    }
  }
  public getImage(parent: Construct): ec2.MachineImageConfig {
    const amiMap = new CfnMapping(parent, 'AmiMap', { mapping: this.mapping });
    return {
      imageId: amiMap.findInMap(Aws.REGION, 'ami'),
      userData: ec2.UserData.forLinux(),
      osType: ec2.OperatingSystemType.LINUX,
    };
  }
}
    new ec2.Instance(this, 'Instance', {
      vpc: new ec2.Vpc(this, 'VPC'),
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new MyImage({
        'cn-north-1': 'ami-cn-north-1',
        'cn-northwest-1': 'ami-cn-northwest-1',
      }),
    });
```
---
