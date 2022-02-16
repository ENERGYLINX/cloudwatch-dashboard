class DynamoDb {
    constructor(serverlesscloudwatchdashboard,config) {
        this.scd = serverlesscloudwatchdashboard;
        this.metric_config = config.metrics || [["ConsumedReadCapacityUnits","ConsumedWriteCapacityUnits"], ["SuccessfulRequestLatency"], ["ReadThrottleEvents", "WriteThrottleEvents"]];
        this.validConfigs = {
            "ConditionalCheckFailedRequests": {},
            "ConsumedReadCapacityUnits": {},
            "ConsumedWriteCapacityUnits": {
                yAxis: "right"
            },
            "ReadThrottleEvents": {},
            "ReturnedBytes": {},
            "ReturnedItemCount": {},
            "ReturnedRecordsCount": {},
            "SuccessfulRequestLatency": {},
            "SystemErrors": {},
            "TimeToLiveDeletedItemCount": {},
            "ThrottledRequests": {
                stat: "Sum"
            },
            "UserErrors": {},
            "WriteThrottleEvents": {
                stat: "Sum"
            }
        };

    }
    
    validateConfig(configItem) {
        if (configItem in this.validConfigs)
            return true;
        else
            throw new this.scd.serverless.classes.Error(`Error: ${configItem} is not a valid metric for dynamodb`);
    }

    createWidget(name,resource) {
        if (!resource.Properties || !resource.Properties.TableName)
            throw new this.scd.serverless.classes.Error(`Error: The serverless-cloudwatch-dashboard plugin currently requires TableName to be specified. For table ${name} this is undefined.`)
        this.scd.log("Creating widgets for "+name+" "+resource.Properties.TableName);
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
                    "AWS/DynamoDB",
                    metric[i],
                    "TableName",
                    resource.Properties.TableName,
                    this.validConfigs[metric[i]]
                ]);
            }
            
            widgets.push({
                shouldBeDelimited: true,
                value: JSON.stringify({
                    "type": "metric",
                    "width": 8,
                    "properties": {
                        "metrics": metricData,
                        "period": 60,
                        "region": this.scd.options.region,
                        "title": `${resource.Properties.TableName} ${metric}`
                    }
                })
            });
        })
        return widgets;
    }
}

module.exports = DynamoDb;

