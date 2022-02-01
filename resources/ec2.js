class Ec2 {
    constructor(serverlesscloudwatchdashboard,config) {
        this.scd = serverlesscloudwatchdashboard;
        this.metric_config = config.metrics || ["CPUUtilization"];
        this.validConfigs = [
            "CPUCreditUsage",
            "CPUCreditBalance",
            "CPUSurplusCreditBalance",
            "CPUSurplusCreditsCharged",
            "CPUUtilization",
            "DiskReadOps",
            "DiskWriteOps",
            "DiskReadBytes",
            "DiskWriteBytes",
            "NetworkIn",
            "NetworkOut",
            "NetworkPacketsIn",
            "NetworkPacketsOut",
            "EBSReadOps",
            "EBSWriteOps",
            "EBSReadBytes",
            "EBSWriteBytes",
            "EBSIOBalance%",
            "EBSByteBalance%"            
        ];

    }
    
    validateConfig(configItem) {
        if (this.validConfigs.indexOf(configItem)>-1)
            return true;
        else
            throw new this.scd.serverless.classes.Error(`Error: ${configItem} is not a valid metric for ec2`);
    }

    createWidget(name,resource) {
        this.scd.log(`Creating widgets for ${name}`);
        var widgets = [];
        this.metric_config.forEach(metric=>{
            this.validateConfig(metric);
            var widget = JSON.stringify({
                "type": "metric",
                "properties": {
                    "metrics": [
                        ["AWS/EC2",metric,"InstanceId","###SPLIT###"]
                    ],
                    "period": 300,
                    "region": this.scd.options.region,
                    "title": `${name} ${metric}`
                }
            });
            var arrs = widget.split("###SPLIT###");
            widgets.push({
                shouldBeDelimited: false,
                value: arrs[0]
            }
            ,{
                shouldBeDelimited: false,
                value:{"Ref": name}
            },{
                shouldBeDelimited: true,
                value: arrs[1]
            });
        })
        return widgets;
    }
}

module.exports = Ec2;