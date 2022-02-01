class MetricFilter {
    constructor(serverlesscloudwatchdashboard,config) {
        this.scd = serverlesscloudwatchdashboard;
    }

    createWidget(name, resource, options) {
        this.scd.log("Creating metric filter widgets for "+name);
        
        // Try to remove the stack name and other cruft from the widget title
        let widgetTitle = options.stackName.replace(/[^a-z0-9]/, '').toLowerCase() + "metricfilter";
        widgetTitle = name.toLowerCase().replace(widgetTitle, '');

        // Return the widget
        return [
            {
                shouldBeDelimited: true,
                value: JSON.stringify({
                    "type": "metric",
                    "width": 24,
                    "properties": {
                        "metrics": [[
                            resource.Properties.MetricTransformations[0].MetricNamespace,
                            resource.Properties.MetricTransformations[0].MetricName,
                            {
                                stat: "Sum"
                            }
                        ]],
                        "period": 60,
                        "region": this.scd.options.region,
                        "title": `Metric filter: ${widgetTitle}`
                    }
                })
            }
        ];
    }
}

module.exports = MetricFilter;