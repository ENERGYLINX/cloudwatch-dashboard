
var Lambda = require('./resources/lambda');
var MetricFilter = require('./resources/metric-filter');
var SQS = require('./resources/sqs');
var Ec2 = require('./resources/ec2');
var DynamoDb = require('./resources/dynamodb');
var S3 = require('./resources/s3');

class EnergylinxCloudwatchDashboardPlugin {
    constructor(serverless, options) {
      this.serverless = serverless;
      this.options = options;
      this.serverless.getProvider('aws');

      this.resources = {
        lambda: new Lambda(this, {}),
        metricFilter: new MetricFilter(this, {}),
        sqs: new SQS(this, {}),
        ec2: new Ec2(this, {}),
        dynamodb: new DynamoDb(this, {}),
        s3: new S3(this, {})
      } 

      this.resourcemapping = {
          "AWS::Lambda::Function": this.resources.lambda,
          "AWS::Logs::MetricFilter": this.resources.metricFilter,
          "AWS::SQS::Queue": this.resources.sqs,
          "AWS::EC2::Instance": this.resources.ec2,
          "AWS::DynamoDB::Table": this.resources.dynamodb,
          "AWS::S3::Bucket": this.resources.s3
      }

      this.hooks = {
        'before:deploy:deploy': this.injectDashboard.bind(this),
      };


    }

    log(logitem) {
        this.serverless.cli.consoleLog("Cloudwatch Dashboard: "+logitem);
    }

    getServiceName() {
        return this.serverless.service.getServiceName()+"-"+this.serverless.getProvider('aws').getStage();
    }

    getConfig(configItem) {
        if (this.serverless.service.custom && this.serverless.service.custom["energylinx-dashboard"])
            return this.serverless.service.custom["energylinx-dashboard"][configItem];
        else
            return {};

    }

    createWidgets(resources) {
        var widgets = [];
        for (var x in resources) {            
            widgets=widgets.concat(this.createWidget(x,resources[x]));
        }
        return widgets;
    }

    getValidWidgets(resources) {
        var widgets = this.createWidgets(resources);
        widgets=widgets.reduce((list,curVal,index) => {
            if (curVal)
            {
                var delimiter = ",";
                if (curVal.shouldBeDelimited)
                    list.push(`${curVal.value}${delimiter}`);
                else
                    list.push(curVal.value);
            }
            return list;
        },[])
        widgets[widgets.length-1]=widgets[widgets.length-1].slice(0,-1); // Remove trailing comma, not very elegant
        return widgets;
    }

    injectDashboard(args) {
        this.log("Setting up dashboards for "+this.getServiceName());
        var resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources;
        console.log(this.serverless.service.provider);
        this.log("Resources : "+Object.keys(resources).join(","));
        var dashboard = this.getDashboardTemplate();
        dashboard.Properties.DashboardBody["Fn::Join"][1].splice(
                1,
                0,
                ...this.getValidWidgets(resources)
        );
        this.serverless.service.provider.compiledCloudFormationTemplate.Resources["cloudwatchdashboard"] = dashboard;
    }

    createWidget(name, resource) {
        if (name=="ServerlessDeploymentBucket") {
            this.log("Skipping deployment bucket");
            return [];
        }
        else {
            return this.createWidgetByType(name, resource);
        }
    }

    createWidgetByType(name,resource){
        var mapping = this.resourcemapping[resource.Type];
        if (mapping) return mapping.createWidget(name, resource, {
            stackName: this.serverless.service.service,
            stage: this.serverless.service.provider.stage
        });
        else this.log("Skipping "+name+" - unsupported resource type.");
    }

    getDashboardTemplate() {
        return {
            "Type": "AWS::CloudWatch::Dashboard",
            "Properties": {
                "DashboardName": this.getServiceName()+"",
                "DashboardBody": {
                    "Fn::Join": [ "",['{"widgets":[',']}']]
                }
            }
        }
    }
}

module.exports=EnergylinxCloudwatchDashboardPlugin;