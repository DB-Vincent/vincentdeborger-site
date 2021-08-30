---
title: "Deploying a Lambda function with API gateway using Terraform"
date: 2021-01-09T16:26:28+02:00
draft: false
---

![](/images/deploying-a-lambda-function-with-api-gateway-using-terraform/DSC_3321.jpg)

For one of the courses I follow, I had to deploy an AWS Lambda function with an HTTP API gateway using Terraform. After a few hours of trial and error, searching the web and drinking coffee, I finally came to a working solution. Because there weren't many clear posts about how you can add an HTTP API gateway to a Lambda function, I decided to create a post here so maybe I can help someone who's having the same difficulties as I had.

<!-- more -->

---

## The lambda function

First of all we'll create a small Python program which we'll access using the HTTP API gateway. For the sake of demoing it, I wrote a little program that just returns the "X-Forwarded-For" header to the user. Sending a request to the API gateway will return your IP address. It's important to note that the function in the Python code is called 'lambda_handler', we'll use this name when deploying the function with Terraform.

```python
import json

def lambda_handler(event, context):
    return {
        'statusCode': 200,
        'body': json.dumps(event["headers"]["X-Forwarded-For"])
    }
```

We'll put this code in a file named 'lambda.py', in a directory called 'lambda'. We'll use this in Terraform when we're creating a .ZIP of that directory and sending it to AWS in order to get the code in the lambda function.

## Deploying the lambda function

After we've coded our [Serverless](https://en.wikipedia.org/wiki/Serverless_computing) application, it's time for us to deploy it to the cloud. Before we do this, we'll have to put all our application files in a .ZIP file. While it is possible to just do this by hand, I prefer to do it a bit more fancy. Terraform in fact has a Data Source which allows us to archive a folder/file. Using this we'll be able to automatically create our .ZIP file which we'll use to deploy our application to AWS Lambda.

In the code below you can see the code we'll be using for this. First of all we'll define what type of archive we want generate. After that we need to give it a source directory (starting from the directory your .tf file is located in) and an output path. This output path will be used for sending the application code to AWS Lambda.

```HCL
data "archive_file" "lambda-zip" {
    type        = "zip"
    source_dir  = "lambda-function"
    output_path = "lambda.zip"
}
```

Once our application's code has been zipped, it's time for us to send it to AWS using the _aws_lambda_function_ resource. But before we can do that, we need to create an [IAM](https://aws.amazon.com/iam/) (Identity & Access Management) role. This role will just allow us to create a Lambda function and use it.


```HCL
resource "aws_iam_role" "lambda-iam" {
    name = "lambda-iam"

    assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
```

Now that we've created an IAM role and created a .ZIP file from our application's directory, we can create the Lambda function itself. We can do this by using the aws_lambda_function in Terraform. 

First we'll have to give the 'filename' argument, which defines what code Terraform needs to upload to AWS. This will be the _output_path_ we defined in the _archive_file_ Data Source. In this example it's 'lambda.zip'. After we've set the filename, we have to define the name of the function. This will be the title of the Lambda function you'll see in the AWS Dashboard. Once this has been set we need to define which IAM role we'll be using. We've already created a role so we'll just use the ARN (Amazon Resource Name) of the role. The next thing we'll set is the handler. This will be the part behind 'def' in our Python code, so in this example it's 'lambda_handler'. When we've done all the basics, we need to put the hash of our source code so it can be validated when it's done uploading. Luckily we can enter this dynamically, using the _archive_file_ Data Source. Once this is all done, the last thing we need to do is enter the runtime, this will be the name of the programming language we used. In our case we've created our application using Python so we'll be using the _python3.8_ runtime.

```HCL
resource "aws_lambda_function" "lambda" {
    filename      = "lambda.zip"
    function_name = "lambda-function"
    role          = aws_iam_role.lambda-iam.arn
    handler       = "lambda.lambda_handler"

    source_code_hash = data.archive_file.lambda-zip.output_base64sha256

    runtime = "python3.8"
}
```

We can try out this first part of our code already, by executing `terraform apply -auto-approve` we can apply our Lambda function and deploy it to AWS. Once this has finished you'll see something like the following picture in your AWS dashboard. Once you've verified that our Lambda function has been created and that the code is available, you can remove it again by executing `terraform destroy -auto-approve`.

![](/images/deploying-a-lambda-function-with-api-gateway-using-terraform/Screenshot_4.jpg)

## Deploying the API gateway

Now that we've tried out our Lambda function deployment, it's time for us to create the API gateway so that we can access our application from the internet. This is the part where things get a little bit tricky and what I've been searching the longest for. The issue here is that we need to create the API gateway and somehow attach it to the Lambda function.

After searching for a while I found that it works best if we do it the following way. We'll first create our API gateway. This is fairly easily done by using the aws_apigatewayv2_api resource. We'll just need to tell Terraform we want an HTTP api and it'll create it for us. Next on the list is the stage, we'll need this in order for the API gateway to work. This has to get linked to our API gateway using its id. 

Once our gateway and the stage has been created, we can continue by creating an API integration. This will be used to integrate our API gateway into our Lambda function we created earlier. Now that our API gateway has been created and it has been integrated into our Lambda function, we can create a route which routes the incoming traffic .

```HCL
resource "aws_apigatewayv2_api" "lambda-api" {
    name          = "v2-http-api"
    protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "lambda-stage" {
    api_id      = aws_apigatewayv2_api.lambda-api.id
    name        = "$default"
    auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda-integration" {
    api_id           = aws_apigatewayv2_api.lambda-api.id
    integration_type = "AWS_PROXY"

    integration_method   = "POST"
    integration_uri      = aws_lambda_function.lambda.invoke_arn
    passthrough_behavior = "WHEN_NO_MATCH"
}

resource "aws_apigatewayv2_route" "lambda-route" {
    api_id             = aws_apigatewayv2_api.lambda-api.id
    route_key          = "GET /{proxy+}"
    target             = "integrations/${aws_apigatewayv2_integration.lambda-integration.id}"
}
```

Now that we have an API gateway and a Lambda function, you'd think we'd be able to access the API gateway and see our application reply with our own public IP. Well, if you thought that, you forgot a very important part. Before we'll be able to access the API, we'll need to create a Lambda permission and allow traffic to our API gateway. Adding this permission is fairly easy, using the code below we can achieve this functionality.

```HCL
resource "aws_lambda_permission" "api-gw" {
    statement_id  = "AllowExecutionFromAPIGateway"
    action        = "lambda:InvokeFunction"
    function_name = aws_lambda_function.lambda.arn
    principal     = "apigateway.amazonaws.com"

    source_arn = "${aws_apigatewayv2_api.lambda-api.execution_arn}/*/*/*"
}
```

## Conclusion

After everything has successfully been deployed, you should be able to access the API gateway using the API endpoint. As you can see in the image below, the API returns the public IP from where you're connecting. While the functionality of this Lambda function is limited here, there is so much more you can do with Lambda. Going from resizing images when they get uploaded to an S3 bucket, to reading/writing data to a DynamoDB database using an API gateway like we created in this tutorial. 

![](/images/deploying-a-lambda-function-with-api-gateway-using-terraform/Screenshot_6.jpg)

You can access the full Terraform code from [my Github repository](https://github.com/DB-Vincent/Terraform-Lambda).