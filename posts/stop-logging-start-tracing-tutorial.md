---
title: "Stop Logging Everything: Why Tracing is Your On-Call Superpower"
date: "2026-02-26"
tags: ['DevOps','Backend','Tutorial']

---
You are 15 minutes into your on-call shift. PagerDuty fires: "High Latency on Checkout Service." You open the logs. It’s a wall of text. `INFO: Request started`, `INFO: User validated`, `ERROR: Connection timeout`. Thousands of lines scrolling by per second.

Which request failed? Why did it timeout? Was it the database or the payment gateway? In a log-heavy world, you have to grep, correlate timestamps, and pray for a unique request ID. 

Observability is shifting. The industry is moving away from "log everything" to "trace the request lifecycle." For junior and mid-level developers, this is a career accelerant. You are often the one debugging systems you didn't build. A good trace turns "I can't reproduce it" into "I see exactly where it stalled."

This isn't a vendor pitch. We are going to build a tiny Python service, instrument it with **OpenTelemetry**, and debug a specific bug using a trace, not logs.

## The Shift: Why Traces Beat Logs

Logs are isolated events. Traces are stories. 

A **Trace** is a tree of **Spans**. Each span represents a unit of work (e.g., "query database", "call external API"). When you look at a trace, you see a waterfall view of exactly how long each step took and where the error occurred relative to everything else.

## The Tutorial: 3 Spans, 2 Attributes, 1 Bug

We will create a simple payment processor. It has a hidden bug: it's incredibly slow, but only for specific users. We will use Docker Compose to spin up the app and **Jaeger** (a UI to view traces).

### Step 1: The Setup

Create a folder named `tracing-demo`. Inside, create a `docker-compose.yaml` file. This spins up our app and a local Jaeger instance.

```yaml
version: "3.8"
services:
  jaeger:
    image: jaegertracing/all-in-one:1.50
    ports:
      - "16686:16686" # The UI port
      - "4317:4317"   # OTLP gRPC receiver

  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317
      - OTEL_SERVICE_NAME=payment-service
    depends_on:
      - jaeger
```

### Step 2: The Dependencies

Create a `requirements.txt`:

```text
fastapi
uvicorn
opentelemetry-api
opentelemetry-sdk
opentelemetry-exporter-otlp
opentelemetry-instrumentation-fastapi
```

### Step 3: The Code (The Interesting Part)

Create `main.py`. We will manually instrument this to show you exactly how spans work. We are creating **3 spans** and adding **2 attributes**.

```python
import time
import random
from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

# 1. Boilerplate Setup (Standard OpenTelemetry setup)
resource = Resource.create({"service.name": "payment-service"})
tracer_provider = TracerProvider(resource=resource)
exporter = OTLPSpanExporter(endpoint="http://jaeger:4317", insecure=True)
tracer_provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(tracer_provider)

tracer = trace.get_tracer(__name__)
app = FastAPI()

@app.get("/checkout")
def checkout(user_id: str, currency: str):
    # SPAN 1: The Parent Span (The entire request)
    with tracer.start_as_current_span("process_checkout") as parent_span:
        
        # ATTRIBUTE 1: Context is King
        parent_span.set_attribute("user.id", user_id)
        parent_span.set_attribute("payment.currency", currency)

        # Simulate step 1: Validate User
        with tracer.start_as_current_span("validate_user"):
            time.sleep(0.1) # Fast operation

        # Simulate step 2: Charge Card (The Buggy Part)
        with tracer.start_as_current_span("charge_credit_card"):
            process_payment(currency)
            
    return {"status": "processed"}

def process_payment(currency):
    # THE BUG: Legacy system is slow for GBP, fast for USD
    if currency == "GBP":
        time.sleep(2.0)
    else:
        time.sleep(0.1)
```

### Step 4: The Dockerfile

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY main.py .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Debugging the Bug

Run the stack:

```bash
docker-compose up --build
```

Now, generate some traffic. 

1.  Visit: `http://localhost:8000/checkout?user_id=123&currency=USD` (Fast response)
2.  Visit: `http://localhost:8000/checkout?user_id=456&currency=GBP` (Slow response)

In a log file, you might just see `200 OK` for both. If you had thousands of requests, you wouldn't know why some users are complaining about slowness.

**Open Jaeger at http://localhost:16686**.

Select `payment-service` and click **Find Traces**.

### What you see

You will see a visual timeline. 

1.  Click the trace for the **GBP** request.
2.  You immediately see the `process_checkout` bar is long.
3.  Below it, `validate_user` is tiny.
4.  `charge_credit_card` takes up the entire timeline.

Without looking at a single line of code, you know the bottleneck is in the charging logic, not the user validation.

### The Power of Attributes

Now, imagine you have 10,000 traces. In Jaeger, look at the **Tags** query box. Search for `payment.currency=GBP`.

Suddenly, you see that **100%** of the slow requests share this attribute. You have just diagnosed a currency-specific latency bug without grepping text files. 

## Conclusion

Logs are for *details* (the exact error message). Traces are for *flow* (where did the time go?). By instrumenting just the boundaries of your application (entry, database, external calls) and adding high-cardinality attributes (User IDs, transaction types), you stop guessing and start seeing.
