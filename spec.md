# Accountability Buddy

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Goal management: create goals with category (work/personal), description, target date
- Check-in system: scheduled check-ins per goal with progress tracking (on track / struggling / completed)
- Hurdle assistant: a conversational AI-like assistant panel where users can describe a problem they're facing on a goal and get structured guidance (tips, reframing, action steps)
- Dashboard: overview of all active goals, upcoming check-ins, and streak/progress indicators
- Notifications/reminders: in-app reminders for upcoming check-ins
- Goal completion and archiving

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: goals store (id, title, category, description, targetDate, status, createdAt), check-ins store (id, goalId, scheduledDate, completedDate, status, note), hurdle logs (id, goalId, problem, guidance, createdAt)
2. Backend APIs: CRUD for goals, add/update check-ins, log hurdles and return structured guidance, get dashboard summary
3. Frontend: Dashboard page, Goals list/detail, Add Goal form, Check-in modal, Hurdle assistant panel
