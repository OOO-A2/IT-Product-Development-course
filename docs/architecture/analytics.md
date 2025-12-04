# Analytics Plan — Peer Feedback & Assessment Platform

## 1. Define the Value

**Core Value Proposition:**  
The platform transforms subjective peer evaluation into structured, actionable feedback that helps students improve their work and develop critical evaluation skills.

**Value Moment:**  
The moment when a student **receives and comprehends constructive peer feedback** that they can apply to improve their work. This happens when:
1. A student reads feedback on their submission  
2. The feedback is perceived as helpful/actionable  
3. The student engages with the feedback (views, saves, implements suggestions)

---

## 2. Brainstorm Metrics

Possible value metrics:
1. **Average feedback quality score** (rated by receivers)  
2. **Feedback implementation rate** (students who revise work based on feedback)  
3. **Active feedback exchanges** (submissions that receive AND give feedback)  
4. **Time spent engaging with feedback**  
5. **Feedback satisfaction score** (survey results)

---

## 3. Select North Star Metric (NSM)

### **NSM: _Weekly Active Feedback Exchanges_**

**Why this metric works:**
- Measures student-perceived value  
- Represents the platform’s core strategy  
- Serves as a leading indicator of retention, learning, and recommendations  
- Immediately influenceable via product features  

### **Counter Metric: _Superficial Feedback Rate_**
Measures feedback under 10 words or marked as low quality.

---

## 4. Metric Tree
Weekly Active Feedback Exchanges (NSM)
├── L1: Feedback Completion Rate (% of assigned feedback completed)
│   └── L2: Feedback Assignment Clarity (clear rubrics, examples)
├── L1: Feedback Quality Score (avg. rating 1-5 from receivers)
│   └── L2: Helpful Feedback Ratio (% of feedback marked "helpful")
├── L1: Feedback Engagement Rate (% of feedback viewed >30 seconds)
│   └── L2: Feedback Response Rate (% of feedback receiving replies)
└── L1: Platform Weekly Active Users
    └── L2: New User Activation (% completing first feedback cycle)


---

## 5. Plan Measurements

### **Events to Collect**
- `feedback_submitted`
- `feedback_viewed`
- `feedback_rated`
- `work_revised`

### **Aggregations**
- Weekly unique givers/receivers  
- Average feedback ratings  
- Feedback cycle completion rates  

### **Data Volume Estimates**
- 2,000–5,000 events/week initially  
- ~100MB/month →

### **Data Pipeline Overview**

[Frontend] → [Event Collection SDK] → [Message Queue] → [Stream Processor] → [Data Warehouse]
     ↑               ↓                      ↓                   ↓                 ↓
[React App]    [Firebase Analytics]    [Apache Kafka]    [Apache Flink]    [PostgreSQL]
     |           [Custom Events]            |                  |                 |
     └──────→ [Backend API Logging] → [Log Shipper] → [ELK Stack for monitoring]


### **Collection Strategy**
- Frontend → Firebase custom events  
- Backend → Structured logs (JSON)  
- DB → CDC for state changes  
- Batch → Daily aggregations  

---

## 6. Plan Code Changes

### **Frontend Instrumentation**
```javascript
// FeedbackViewer.jsx
const trackFeedbackEngagement = (feedbackId, duration) => {
  logAnalyticsEvent('feedback_engagement', {
    feedback_id: feedbackId,
    duration_seconds: Math.floor(duration),
    timestamp: new Date().toISOString()
  });
};

// Using Firebase Analytics
import { getAnalytics, logEvent } from "firebase/analytics";

const logAnalyticsEvent = (eventName, params) => {
  const analytics = getAnalytics();
  logEvent(analytics, {
    platform: 'web',
    user_id: currentUserId, // Hashed/anonymized
    ...params
  });
};

### Backend Instrumentation

# analytics_middleware.py
class AnalyticsMiddleware:
    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        analytics_logger.info({
            "event": "api_request",
            "path": request.url.path,
            "method": request.method,
            "status_code": response.status_code,
            "duration_ms": duration * 1000,
            "user_id": request.user.id if request.user else None,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return response

# feedback_service.py
def submit_feedback(feedback_data):
    # Business logic...
    track_event('feedback_submitted', {
        'feedback_id': feedback.id,
        'giver_id': feedback.giver_id,
        'receiver_id': feedback.receiver_id,
        'word_count': len(feedback.content.split()),
        'assignment_id': feedback.assignment_id,
        'has_rubric': feedback.rubric_id is not None
    })

## Infrastructure Changes
docker-compose

services:
  kafka:
    image: confluentinc/cp-kafka:latest
    ports: ["9092:9092"]
  
  flink-jobmanager:
    image: flink:latest
    ports: ["8081:8081"]
  
  analytics-db:
    image: postgres:14
    environment:
      POSTGRES_DB: analytics
      
## New Dependencies
{
  "dependencies": {
    "firebase": "^10.0.0",
    "winston": "^3.0.0",
    "kafkajs": "^2.0.0"
  }
}

## Implementation Phases

- Phase 1 (Week 1–2): Basic logging
- Phase 2 (Week 3–4): Firebase Analytics
- Phase 3 (Week 5–6): Backend + Kafka pipeline
- Phase 4 (Week 7–8): Dashboard + alerting (Grafana + ELK)
