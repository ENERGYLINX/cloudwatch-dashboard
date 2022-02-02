class SQS {
    constructor(serverlesscloudwatchdashboard,config) {
        this.scd = serverlesscloudwatchdashboard;
        this.config = config.metrics || [["NumberOfMessagesSent","NumberOfMessagesReceived","NumberOfMessagesDeleted"],"ApproximateNumberOfMessagesVisible"];
    }
    

    createWidget(name, resource, options) {
        this.scd.log("Creating sqs widgets for "+name+" "+resource.Properties.QueueName);
        var widgets = [];
        this.config.forEach(metric=>{

            // Make sure the metrics we're dealing with are arrays
            let metricData = [];
            if (!Array.isArray(metric)) {
                metric = [metric];
            }

            // Add each metric to this graph
            for (var i in metric) {
                metricData.push([
                    "AWS/SQS",
                    metric[i],
                    "QueueName",
                    resource.Properties.QueueName
                ]);
            }

            // And add the widget to the dashboard
            widgets.push({
                shouldBeDelimited: true,
                value: JSON.stringify({
                "type": "metric",
                "width": 12,
                "properties": {
                    "metrics": metricData,
                    "period": 60,
                    "region": this.scd.options.region,
                    "title": `${resource.Properties.QueueName} ${metric.join(", ")}`
                }
            })});
        })

        return widgets;
    }
}

module.exports = SQS;
