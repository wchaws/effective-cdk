import * as ec2 from '@aws-cdk/aws-ec2';
import { Construct, Stack, StackProps, CfnMapping, Aws } from '@aws-cdk/core';

/// !title ### S002: How to set `Instance.MachineImage` from `CfnMapping.FindInMap(“MappingName”, Aws.REGION)`?
/// !description This is originally discussed at https://stackoverflow.com/q/60645254/4108187
/// !description and it's going to be supported from cdk side https://github.com/aws/aws-cdk/pull/12546

/// !show
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
/// !hide

export class S002 extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    /// !show
    new ec2.Instance(this, 'Instance', {
      vpc: new ec2.Vpc(this, 'VPC'),
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new MyImage({
        'cn-north-1': 'ami-cn-north-1',
        'cn-northwest-1': 'ami-cn-northwest-1',
      }),
    });
    /// !hide
  }
}
