### S001: How to echo value in AWS CloudFormation?
```ts
new CfnOutput(this, 'output', { value: 'hello world' });
```
<small>more details [S001-Hello-World.ts](../src/stacks/S001-Hello-World.ts)</small>

### S002: How to set `Instance.MachineImage` from `CfnMapping.FindInMap(“MappingName”, Aws.REGION)`?
This is originally discussed at https://stackoverflow.com/q/60645254/4108187
and it's going to be supported from cdk side https://github.com/aws/aws-cdk/pull/12546
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
<small>more details [S002-Use-CfnMapping-in-an-agnostic-stack-for-GenericMachineImage.ts](../src/stacks/S002-Use-CfnMapping-in-an-agnostic-stack-for-GenericMachineImage.ts)</small>

### S003: Create VPC on demand
```ts
/**
 * Create or import VPC
 * @param scope the cdk scope
 */
function getOrCreateVpc(scope: Construct): ec2.IVpc {
  // use an existing vpc or create a new one
  return scope.node.tryGetContext('use_default_vpc') === '1' ?
    ec2.Vpc.fromLookup(scope, 'Vpc', { isDefault: true }) :
    scope.node.tryGetContext('use_vpc_id') ?
      ec2.Vpc.fromLookup(scope, 'Vpc', { vpcId: scope.node.tryGetContext('use_vpc_id') }) :
      new ec2.Vpc(scope, 'Vpc', { maxAzs: 3, natGateways: 1 });
}
```
<small>more details [S003-Create-VPC-on-demand.ts](../src/stacks/S003-Create-VPC-on-demand.ts)</small>

### S004: Do not hardcode env
Don’t specify env with account and region like below that will generate account/region hardcode in CloudFormation template.
```ts
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
```
<small>more details [S004-Do-not-hardcode-env.ts](../src/stacks/S004-Do-not-hardcode-env.ts)</small>

### S005: Lambda layer
```
.
├── index.ts
└── lambda/
    ├── package-lock.json
    ├── package.json
    └── src/
        └── index.js*

2 directories, 4 files
```
```ts
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
```
<small>more details [index.ts](../src/stacks/S005-Lambda-layer/index.ts)</small>

