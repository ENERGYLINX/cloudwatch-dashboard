# energylinx-cloudwatch-dashboard
A Serverless plugin for generating a CloudWatch Dashboard with widgets for the resources defined in the serverless.yml file.  

Based on https://github.com/vegah/serverless-cloudwatch-dashboard, with a number of modifications to customise the dashboards for Energylinx.

# Install
```
npm install serverless-cloudwatch-dashboard
```
# Usage
## serverless.yml
In the serverless.yml file the plugin needs to be added.  

```yaml
plugins:
  - energylinx-cloudwatch-dashboard
```

# Supported resources

Fully supported:
* Lambda
* CloudWatch Metric Filters
* DynamoDB

These have some implementation, but are untested in the Energylinx environment
* EC2
* S3
