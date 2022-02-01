class Lambda {
    constructor(serverlesscloudwatchdashboard,config) {
        this.scd = serverlesscloudwatchdashboard;
        this.metric_config = config.metrics || [["Invocations","Errors"],"Duration"];
        this.validConfigs = {
            "Invocations": {
                stat: "Sum"
            },
            "Errors": {
                yAxis: "right",
                stat: "Sum"
            },
            "Dead Letter Errors": {},
            "Duration": {},
            "Throttles": {
                yAxis: "right",
                stat: "Sum"
            },
            "IteratorAge": {},
            "ConcurrentExceptions": {},
            "UnreservedConcurrentExceptions": {}
        };

    }
    
    validateConfig(configItem) {
        if (configItem in this.validConfigs)
            return true;
        else
            throw new this.scd.serverless.classes.Error(`Error: ${configItem} is not a valid metric for lambda`);
    }

    createWidget(name, resource, options) {
        this.scd.log("Creating function widgets for "+name+" "+resource.Properties.FunctionName);
        var widgets = [];
        this.metric_config.forEach(metric=>{

            // Make sure the metrics we're dealing with are arrays
            let metricData = [];
            if (!Array.isArray(metric)) {
                metric = [metric];
            }

            // Add each metric to this graph
            for (var i in metric) {
                this.validateConfig(metric[i]);
                metricData.push([
                    "AWS/Lambda",
                    metric[i],
                    "FunctionName",
                    resource.Properties.FunctionName,
                    this.validConfigs[metric[i]]
                ]);
            }

            // And add the widget to the dashboard
            widgets.push({
                shouldBeDelimited: true,
                value: JSON.stringify({
                "type": "metric",
                "width": 8,
                "properties": {
                    "metrics": metricData,
                    "period": 60,
                    "region": this.scd.options.region,
                    "title": `${resource.Properties.FunctionName.replace(options.stackName+'-'+options.stage+'-', '')} ${metric.join(", ")}`
                }
            })});
        })

        // Add logs
        widgets.push({
            shouldBeDelimited: true,
            value: JSON.stringify({
                "type": "log",
                "width": 8,
                "properties": {
                    "region": this.scd.options.region,
                    "query": "SOURCE '/aws/lambda/"+resource.Properties.FunctionName+"' | fields @timestamp, @message\n| sort @timestamp desc\n| limit 50",
                }
            })
        });
        return widgets;
    }
}

module.exports = Lambda;