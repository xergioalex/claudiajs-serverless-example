# claudiajs-serverless-example
Dummy serverless service using ClaudiaJs follow this guide: https://claudiajs.com/tutorials/lambda-api-dynamo-db.html



Happy Path
---

### 1. Create IAM user

- Go to IAM.
- Create user with existing policies
  - AWSLambdaFullAccess
  - AmazonDynamoDBFullAccess
  - IAMFullAccess
  - custom_ApiGatewayFullAccess

- Create role for api gateway

```
custom_ApiGatewayFullAccess

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "apigateway:*"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```


### 2. Install aws CLI

https://docs.aws.amazon.com/cli/latest/userguide/cli-install-macos.html#awscli-install-osx-path

### 3. Configure aws CLI

```
$ aws configure

AWS Access Key ID [****************]:
AWS Secret Access Key [****************]:
Default region name [eu-west-1]: us-east-1
Default output format [json]:
```

### 4. Install dependencies

```
$ yarn add aws-sdk claudia-api-builder --save
```

### 5. Add code to index.js

```
const ApiBuilder = require('claudia-api-builder')
const AWS = require('aws-sdk')

let api = new ApiBuilder()
let dynamoDb = new AWS.DynamoDB.DocumentClient()

api.post('/icecreams', function (request) { // SAVE your icecream
  let params = {
    TableName: 'icecreams',
    Item: {
      icecreamid: request.body.icecreamId,
      name: request.body.name // your icecream name
    }
  }
  return dynamoDb.put(params).promise(); // returns dynamo result
}, { success: 201 }) // returns HTTP status 201 - Created if successful

api.get('/icecreams', function (request) { // GET all users
  return dynamoDb.scan({ TableName: 'icecreams' }).promise()
    .then(response => response.Items)
})

module.exports = api
```

### 6. Setup DynamoDB database

aws dynamodb create-table --table-name icecreams \
  --attribute-definitions AttributeName=icecreamid,AttributeType=S \
  --key-schema AttributeName=icecreamid,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --region us-east-1 \
  --query TableDescription.TableArn --output text


### 7. Setup DynamoDB policy

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Scan"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
```


### 8. Deploy project

```
$ claudia create --name icecream-lambda-xergioalex --region us-east-1 --api-module index --policies policy
```

Output
```
$ claudia create --name icecream-lambda-xergioalex --region us-east-1 --api-module index --policies policy
packaging files npm install -q --no-audit --production
saving configuration
{
  "lambda": {
    "role": "icecream-lambda-xergioalex-executor",
    "name": "icecream-lambda-xergioalex",
    "region": "us-east-1"
  },
  "api": {
    "id": "p37kygzp1i",
    "module": "index",
    "url": "https://p37kygzp1i.execute-api.us-east-1.amazonaws.com/latest"
  }
}
```


### 9. Test Lambda

Get all icecreams
```
curl https://p37kygzp1i.execute-api.us-east-1.amazonaws.com/latest/icecreams
```

Save an icecream
```
curl -H "Content-Type: application/json" -X POST \
-d '{"icecreamId":"123", "name":"chocolate"}' \
https://p37kygzp1i.execute-api.us-east-1.amazonaws.com/latest/icecreams
```
```
curl -H "Content-Type: application/json" -X POST \
-d '{"icecreamId":"5", "name":"lemon"}' \
https://p37kygzp1i.execute-api.us-east-1.amazonaws.com/latest/icecreams
```


### 10. Update lambda

```
$ claudia update
```