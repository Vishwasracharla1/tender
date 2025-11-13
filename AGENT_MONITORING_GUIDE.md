# Agent Monitoring Console - User Guide

## Overview

The Agent Monitoring Console provides real-time visibility into all 7 AI agents powering the RAK Tender Evaluation System. This page allows system administrators and technical staff to monitor agent performance, track task execution, and identify issues.

---

## Features

### 1. Real-Time Agent Status
- **7 AI Agents** monitored continuously
- **Status indicators**: Active, Idle, Error, Paused
- **Current task** visibility for active agents
- **Last activity** timestamp for each agent

### 2. Performance Metrics
- **Tasks Processed**: Total count per agent
- **Average Processing Time**: Seconds per task
- **Success Rate**: Percentage of successful completions
- **Error Count**: Failed tasks requiring attention

### 3. Activity Log
- **Real-time feed** of agent actions
- **Filterable by agent**: Click any agent to see only its logs
- **Status colors**: Success (green), Warning (yellow), Error (red)
- **Detailed information**: Task duration, timestamps, descriptions

### 4. Performance Table
- **Consolidated view** of all agents
- **Sortable columns** for analysis
- **Quick status overview** at a glance
- **Error highlighting** for attention items

---

## The 7 AI Agents

### 1. DataValidation.Agent
- **Purpose**: Document intake and validation
- **Tasks**: BOQ extraction, specification parsing, format verification
- **Typical Processing Time**: 2.3 seconds
- **Success Rate**: 98.5%

### 2. EvalAI.Agent
- **Purpose**: Vendor evaluation and scoring
- **Tasks**: Multi-criteria scoring, AI-assisted evaluation, consistency checks
- **Typical Processing Time**: 5.8 seconds
- **Success Rate**: 96.2%

### 3. TenderIQ.Agent
- **Purpose**: Market benchmarking and intelligence
- **Tasks**: Price analysis, outlier detection, trend identification
- **Typical Processing Time**: 3.1 seconds
- **Success Rate**: 94.7%

### 4. IntegrityBot.Agent
- **Purpose**: Fraud detection and bias analysis
- **Tasks**: Pattern recognition, network analysis, collusion detection
- **Typical Processing Time**: 4.2 seconds
- **Success Rate**: 99.1%

### 5. JustifyAI.Agent
- **Purpose**: Award justification generation
- **Tasks**: Professional narrative creation, section composition
- **Typical Processing Time**: 8.5 seconds
- **Success Rate**: 97.8%

### 6. ScenarioSim.Agent
- **Purpose**: Award scenario simulation
- **Tasks**: What-if analysis, risk assessment, recommendation generation
- **Typical Processing Time**: 6.3 seconds
- **Success Rate**: 95.4%

### 7. GovernAI.Agent
- **Purpose**: Executive dashboards and compliance
- **Tasks**: KPI aggregation, trend analysis, compliance tracking
- **Typical Processing Time**: 1.8 seconds
- **Success Rate**: 99.6%

---

## How to Use

### Viewing Agent Status
1. Navigate to **Agent Monitoring** in the sidebar (last menu item)
2. View the status overview showing all 7 agents
3. Check the **4 KPI widgets** at the top:
   - Active Agents count
   - Total Tasks Processed
   - Average Success Rate
   - Total Errors

### Filtering Activity Log
1. **Click on any agent card** in the left panel
2. The activity log on the right **filters to show only that agent**
3. Click **"Show All"** button to reset the filter
4. View detailed logs with timestamps and durations

### Time Range Selection
1. Use the **time range buttons** (1H, 24H, 7D, 30D)
2. Currently displays data for selected time period
3. Default view: **Last 24 hours**

### Interpreting Status Colors

**Agent Status:**
- 🟢 **Active** (Green) - Currently processing tasks
- ⚪ **Idle** (Gray) - Waiting for work
- 🔴 **Error** (Red) - Encountered problems
- 🟡 **Paused** (Yellow) - Temporarily stopped

**Activity Log Status:**
- 🟢 **Success** (Green) - Task completed successfully
- 🟡 **Warning** (Yellow) - Completed with warnings
- 🔴 **Error** (Red) - Task failed

---

## Key Metrics Explained

### Tasks Processed
Total number of tasks completed by each agent in the selected time period. Higher numbers indicate more activity.

### Avg Processing Time
Average duration in seconds to complete a task. Lower is better, but some agents naturally take longer (e.g., JustifyAI generates entire documents).

### Success Rate
Percentage of tasks completed without errors. Rates above 95% are excellent. Below 90% requires investigation.

### Error Count
Number of failed tasks. A few errors are normal (bad input data, network issues). High counts (>10) need attention.

---

## Common Scenarios

### Scenario 1: Agent Showing Errors
**Symptoms:** Red status, increasing error count
**Actions:**
1. Click the agent to view its activity log
2. Review error details in recent logs
3. Check if errors are consistent (same type)
4. Contact system administrator if errors persist

### Scenario 2: Slow Processing Times
**Symptoms:** Higher than typical processing times
**Actions:**
1. Check if multiple agents are affected (system issue)
2. Review current tasks - some are naturally slower
3. Check overall system load in KPI widgets
4. Consider workload distribution

### Scenario 3: Agent is Idle
**Symptoms:** Status shows "Idle", no recent activity
**Actions:**
1. This is **normal** when no tenders are being processed
2. Check "Last Activity" timestamp
3. If idle for hours during business hours, verify input pipeline

### Scenario 4: Low Success Rate
**Symptoms:** Success rate drops below 90%
**Actions:**
1. Review activity log for error patterns
2. Check if specific vendors/tenders causing issues
3. Verify input data quality
4. May need model retraining or data cleanup

---

## Activity Log Details

Each log entry shows:
- **Agent Name**: Which agent performed the action
- **Action**: What the agent did
- **Status**: Success, Warning, or Error
- **Timestamp**: When the action occurred
- **Duration**: How long it took in seconds
- **Details**: Specific information about the action

### Example Log Entry Interpretation

```
IntegrityBot.Agent
Detect Evaluator Bias
⚠️ Warning
10:45:32 AM
Duration: 3.8s

High bias score detected for Michael Ross (78/100)
```

**Meaning:** The IntegrityBot agent analyzed evaluator patterns and found potential bias. This isn't an error but a warning that requires human review.

---

## Performance Benchmarks

### Excellent Performance
- ✅ Success Rate: >95%
- ✅ Avg Processing Time: Within typical range
- ✅ Error Count: <5 per day
- ✅ Status: Active or Idle (not Error)

### Needs Attention
- ⚠️ Success Rate: 90-95%
- ⚠️ Avg Processing Time: 1.5x typical
- ⚠️ Error Count: 5-10 per day
- ⚠️ Frequent warnings in logs

### Critical Issues
- 🔴 Success Rate: <90%
- 🔴 Avg Processing Time: 2x typical
- 🔴 Error Count: >10 per day
- 🔴 Status: Error or Paused

---

## Troubleshooting

### Q: All agents show "Idle"
**A:** This is normal when no tenders are being processed. Check during business hours when tenders are active.

### Q: One agent has high error count, others are fine
**A:** Likely an issue with that specific agent's model or data. Review its activity log for patterns. Contact support if needed.

### Q: Processing times suddenly increased
**A:** Could be system load, network issues, or increased task complexity. Check if pattern is temporary or persistent.

### Q: Activity log is empty
**A:** Either no agent activity in selected time range, or system just started. Try expanding time range (7D or 30D).

### Q: Can't see specific agent details
**A:** Ensure you've clicked the agent card in the left panel. The activity log will filter to show only that agent.

---

## Best Practices

### Daily Monitoring
- Check the dashboard once per day
- Review active agent count
- Scan for error increases
- Look for success rate drops

### Weekly Review
- Analyze trends over 7-day period
- Compare agent performance week-over-week
- Identify any degradation patterns
- Plan capacity if task counts growing

### Monthly Analysis
- Review 30-day metrics
- Calculate uptime percentages
- Assess model accuracy trends
- Plan improvements or retraining

### Alert Thresholds
Set up alerts (if available) for:
- Success rate drops below 90%
- Error count exceeds 10 in 24h
- Agent stuck in Error status
- Processing time increases 2x

---

## Integration with Other Pages

The Agent Monitoring Console helps you understand what's happening "behind the scenes" on other pages:

- **Tender Intake** → DataValidation.Agent processing
- **Evaluation Matrix** → EvalAI.Agent scoring
- **Benchmark Dashboard** → TenderIQ.Agent analyzing
- **Integrity Analytics** → IntegrityBot.Agent detecting
- **Justification Composer** → JustifyAI.Agent generating
- **Award Simulation** → ScenarioSim.Agent simulating
- **Leadership Dashboard** → GovernAI.Agent aggregating

When users report issues on any page, check the corresponding agent's status and logs here.

---

## Technical Details

### Data Refresh
- **Real-time**: Status updates every 30 seconds
- **Log entries**: Appear within 5 seconds of occurrence
- **Metrics**: Calculated on-demand from time range

### Data Retention
- **Activity logs**: 30 days
- **Performance metrics**: 90 days
- **Historical trends**: 1 year

### Access Control
- **Required Role**: System Administrator or Tech Support
- **Read-only**: Cannot start/stop agents from this page
- **Audit logged**: All views recorded for compliance

---

## Summary

The Agent Monitoring Console is your window into the AI brain of the tender evaluation system. Use it to:

✅ Monitor agent health and performance
✅ Track task execution in real-time
✅ Identify and troubleshoot issues
✅ Ensure optimal system operation
✅ Plan capacity and improvements

**Regular monitoring ensures the 7 AI agents continue delivering accurate, fast, and reliable tender evaluation support!**
