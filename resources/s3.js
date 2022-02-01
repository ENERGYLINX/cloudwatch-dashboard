class S3 {
    constructor(serverlesscloudwatchdashboard,config) {
        this.scd = serverlesscloudwatchdashboard;
        this.metric_config = config.metrics || ["GetRequests","PutRequests"];
        this.validConfigs = [
            "BucketSizeBytes",
            "NumberOfObjects",
            "AllRequests",
            "GetRequests",
            "PutRequests",
            "DeleteRequests",
            "HeadRequests",
            "PostRequests",
            "SelectRequests",
            "ListRequests",
            "BytesDownloaded",
            "BytesUploaded",
            "4xxErrors",
            "5xxErrors",
            "FirstByteLatency",
            "TotalRequestLatency"
        ];
    }
    
    validateConfig(configItem) {
        if (this.validConfigs.indexOf(configItem)>-1)
            return true;
        else
            throw new this.scd.serverless.classes.Error(`Error: ${configItem} is not a valid metric for s3`);
    }

    createWidget(name,resource) {
        if (!resource.Properties || !resource.Properties.BucketName)
            throw new this.scd.serverless.classes.Error(`Error: The serverless-cloudwatch-dashboard plugin currently requires BucketName to be specified. For S3 bucket ${name} this is undefined.`)
        this.scd.log("Creating widgets for "+name+" "+resource.Properties.BucketName);
        var widgets = [];
        this.metric_config.forEach(metric=>{
            this.validateConfig(metric);
            widgets.push({
                shouldBeDelimited: true,
                value: JSON.stringify({
                "type": "metric",
                "properties": {
                    "metrics": [
                        ["AWS/Lambda",metric,"FunctionName",resource.Properties.BucketName]
                    ],
                    "period": 300,
                    "region": this.scd.options.region,
                    "title": `${resource.Properties.BucketName} ${metric}`
                }
            })});
        })
        return widgets;
    }
}

module.exports = S3;