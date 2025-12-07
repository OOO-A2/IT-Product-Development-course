# Observability Plan

## 1. Brainstorm: Top Technical Risks

### Database Performance Degradation
- Slow queries impacting user experience
- Connection pool exhaustion during peak usage
- Deadlocks from concurrent feedback submissions

### Feedback Submission Failures
- Network timeouts between microservices
- File upload failures for assignment attachments
- Real-time WebSocket disconnections during peer review sessions

### Scaling Issues During Course Deadlines
- Surge in submissions at assignment deadlines
- Bursty traffic patterns overwhelming auto-scaling
- Resource contention in shared course environments

### Data Inconsistency in Distributed System
- Eventual consistency delays in feedback visibility
- Cache invalidation failures showing stale data
- Duplicate feedback submissions due to retry logic

### Third-Party Service Dependencies
- OAuth provider outages locking users out
- File storage service (S3/Azure Blob) availability
- Email service failures for notifications

---

## 2. Define Objectives & SLOs

### Critical Risk 1: Database Performance Degradation

**SLO 1:**  
"To monitor database query performance, we will track P95 query latency. It must remain below 500ms for 99% of queries over any 5-minute rolling window."

**SLO 2:**  
"To monitor database availability, we will track database connection success rate. It must remain above 99.9% for 99% of connection attempts over any 1-hour window."

### Critical Risk 2: Feedback Submission Failures

**SLO 3:**  
"To monitor feedback submission reliability, we will track feedback submission success rate. It must remain above 99.5% for 99% of submission attempts over any 15-minute window."

**SLO 4:**  
"To monitor end-to-end system performance, we will track API endpoint P95 response time. It must remain below 2 seconds for 95% of requests over any 5-minute window."

---

## 3. Plan Instrumentation
### SLO 3: Feedback Submission Success Rate
**Calculation**:

Frontend: feedback_submission_success_total (Firebase Analytics)
Backend: HTTP status codes from API gateway
Calculate: sum(rate(feedback_submission_success_total[15m])) / sum(rate(feedback_submission_attempts_total[15m]))

#### SLO 4: API P95 Response Time
**Calculation**:

Use OpenTelemetry distributed tracing
Instrument all HTTP endpoints with automatic instrumentation
Calculate: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

## 4. Observability Pipeline Architecture
<img width="1125" height="730" alt="image" src="https://github.com/user-attachments/assets/b9183466-adee-4e0c-a471-3c83fe1aaf67" />
### Implementation Details

#### Metrics Collection
- Prometheus with 15s scrape intervals
- Custom exporters for business metrics
- 30-day retention in Prometheus, 2 years in long-term storage

#### Tracing
- OpenTelemetry auto-instrumentation for Python/JavaScript
- 100% sampling for errors, 10% for successful requests
- 7-day retention in Jaeger

#### Logging
- JSON-structured logs with correlation IDs
- Centralized in Elasticsearch with 30-day hot storage
- Archived to S3 after 30 days, retained for 2 years

---

## 5. Plan Alerts

### Alert Thresholds

**Critical – Database Latency**
- Trigger: P95 query latency > 500ms for 3 consecutive minutes
- Severity: P1

**Critical – Submission Failures**
- Trigger: Success rate < 95% for 5 consecutive minutes
- Severity: P1

**Warning – API Performance**
- Trigger: P95 response time > 1.5s for 10 minutes
- Severity: P2

**Warning – Connection Pool**
- Trigger: Connection pool utilization > 80% for 15 minutes
- Severity: P3

---

### Alert Delivery

- **P1 (Critical):** Opsgenie → Phone call + SMS + Slack  
- **P2 (Warning):** Opsgenie → Slack + Email  
- **P3 (Info):** Slack channel only  
### Alert Message Format
[SEVERITY] [SERVICE] Alert: [TITLE]
Description: [DESCRIPTION]
SLO: [AFFECTED_SLO]
Time: [TIMESTAMP]
Dashboard: [GRAFANA_LINK]
Runbook: [RUNBOOK_LINK]

---

## 6. Plan Response: Alert Scenario

### Scenario: "Database P95 Latency > 500ms" alert triggered

### Who gets notified?
- Primary: Database Engineer (on-call rotation)
- Secondary: Backend Team Lead
- Informational: #platform-alerts Slack channel

---

### First Steps

#### Step 1: Acknowledge & Assess (5 minutes)
- Acknowledge alert in Opsgenie
- Check Grafana dashboard for:
  - Which queries are slow? (pg_stat_statements)
  - Is it read or write heavy?
  - Concurrent connection count
  - Lock wait times
  - CPU/Memory usage on database host

#### Step 2: Immediate Mitigation (10 minutes)

Check for long-running transactions:
```sql
SELECT pid, query, now() - pg_stat_activity.query_start AS duration
FROM pg_stat_activity 
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 minutes';

**Actions**:

Kill problematic query if safe
If general slowness: scale read replicas or increase connection pool

#### Step 3: Root Cause Analysis (15 minutes)

Check application logs for recent deployments
Review slow query logs for patterns
Examine Jaeger traces for full call chain
Check for lock contention:
```sql
SELECT * FROM pg_locks WHERE granted = false;


#### Step 4: Communication & Resolution

Update #platform-status with current situation
If impact > 15 minutes, post to #engineering
Document incident in post-mortem template
Create follow-up ticket for permanent fix
