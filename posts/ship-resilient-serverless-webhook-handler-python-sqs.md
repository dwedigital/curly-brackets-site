---
title: "Ship a resilient, cheap serverless webhook handler in a weekend (Python + SQS + Lambda)"
date: "2026-01-27"
tags: ['Python','Serverless','Backend']

---
Handling webhooks sounds easy until it isn't. It starts with a simple endpoint to catch a payment confirmation from Stripe or a deployment event from GitHub. But then, the traffic spikes. The third-party service retries aggressively. Your database locks up. Events get processed twice, charging a customer double.

By the end of this weekend, you can solve these problems permanently. We are going to architect a production-ready webhook consumer using **Python**, **AWS Lambda**, and **Amazon SQS**. This stack is incredibly cheap (often free for low volumes), scales to zero, and handles bursts automatically.

Here is your roadmap to shipping this in 48 hours.

## The Architecture: Decouple Everything

The most common mistake developers make is processing the webhook logic *synchronously*.

**The Bad Way:**
Webhook Request -> API Gateway -> Lambda (Process Logic + DB Write) -> Return 200 OK.

If your logic takes too long, the webhook provider times out and retries. If you get 1,000 requests in a second, you might exhaust your database connection pool.

**The Resilient Way (The Weekend Build):**
Webhook Request -> API Gateway -> **SQS** -> Lambda (Worker).

1.  **Ingest:** Receive the hook and immediately dump it into a queue. Return `200 OK` instantly.
2.  **Buffer:** SQS holds the messages. If traffic spikes, the queue grows, but your downstream systems don't crash.
3.  **Process:** A Lambda function pulls messages from the queue at a controlled rate.

## Saturday: Infrastructure and Ingestion

Your goal for Saturday is to get the infrastructure up and the events flowing into a queue.

### 1. The Setup
We need an SQS Queue and a Lambda function. While you can use Terraform or CDK, for a weekend project, the `Serverless Framework` or AWS SAM is fastest.

Ensure your SQS queue is configured with a **Visibility Timeout**. This is the amount of time a message is "hidden" from other workers while one worker processes it. 

*   **Rule of thumb:** Set SQS Visibility Timeout to 6x your Lambda function timeout.

### 2. The Ingestion Layer
You have two choices here:

1.  **API Gateway Direct Integration:** API Gateway writes directly to SQS. No Lambda involved at the entry point. This is the cheapest and most robust method.
2.  **The "Validator" Lambda:** API Gateway triggers a lightweight Lambda that verifies the webhook signature (security first!) and *then* pushes to SQS.

For production, **Option 2** is usually preferred because you don't want to fill your queue with junk requests.

## Sunday: The Consumer Logic

Now for the Python code. This is where the resilience lives. We will use the [AWS Lambda Powertools for Python](https://github.com/aws-powertools/powertools-lambda-python) library, which handles a lot of the boilerplate for us.

### 1. Idempotency
Webhook providers deliver messages "at least once." This means you *will* eventually receive the same message twice. You must ensure that processing the same event ID twice doesn't corrupt your data.

We can use DynamoDB to track processed IDs.

### 2. Batch Processing & Partial Failures
Lambda reads from SQS in batches (e.g., 10 messages at a time). If message #5 fails but the others succeed, you don't want to fail the whole batch, or the successful 9 will be retried (and duplicated).

Powertools handles this gracefully.

```python
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.utilities.batch import BatchProcessor, EventType
from aws_lambda_powertools.utilities.data_classes.sqs_event import SQSRecord
from aws_lambda_powertools.utilities.typing import LambdaContext

processor = BatchProcessor(event_type=EventType.SQS)
logger = Logger()
tracer = Tracer()

def record_handler(record: SQSRecord):
    payload = record.body_as_json
    event_id = payload.get("id")
    
    # Idempotency Check (Pseudo-code)
    # if is_processed(event_id): 
    #     return

    logger.info(f"Processing webhook: {event_id}")
    
    # Your Business Logic Here
    # process_payment(payload)
    
    # Mark as processed in DB
    # save_processed_id(event_id)

@logger.inject_lambda_context
@tracer.capture_lambda_handler
def lambda_handler(event, context: LambdaContext):
    # This automatically handles partial failures.
    # If 1 out of 10 fails, only that 1 returns to the queue.
    return processor.process(event, context, record_handler=record_handler)
```

### 3. The Dead Letter Queue (DLQ)
Configure your SQS queue to send messages to a **Dead Letter Queue** after 3 failed attempts. This prevents a "poison pill" message (a malformed webhook that always crashes your code) from blocking your pipeline forever. You can set up a CloudWatch alarm on the DLQ to email you when something goes wrong.

## Testing Strategy

Don't deploy until you've tested locally. Since this is just Python, you can write a simple test harness using `pytest`.

```python
# test_handler.py
import json
from src.app import record_handler
from aws_lambda_powertools.utilities.data_classes.sqs_event import SQSRecord

def test_webhook_processing():
    # Mock an SQS record
    mock_event = {
        "body": json.dumps({"id": "evt_123", "type": "payment_success"}),
        "messageId": "msg_abc",
        "receiptHandle": "r_123"
    }
    record = SQSRecord(mock_event)
    
    # Run the handler logic directly
    record_handler(record)
    
    # Assertions: Check if your DB was updated or email sent
    assert True
```

## Why This Wins

By Sunday evening, you will have a system that:

1.  **Survives Bursts:** SQS absorbs the traffic spike.
2.  **Saves Money:** You only pay for the compute time you use. No idle servers.
3.  **Self-Heals:** Failed messages retry automatically and eventually move to a DLQ for inspection.

This architecture is the gold standard for asynchronous event processing. Once you build it once, you will use it for every webhook integration in your career.
