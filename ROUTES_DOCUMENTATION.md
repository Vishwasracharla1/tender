# Routes Documentation

This document describes all the routes available in the Tender Evaluation application.

## Route Structure

The application uses React Router for client-side routing. All routes are defined in `src/routes/index.tsx`.

## Available Routes

### 1. Leadership Dashboard
- **Path**: `/`
- **Component**: `LeadershipDashboardPage`
- **Description**: Executive overview dashboard with KPIs and analytics
- **Access**: Default route (home page)

### 2. Tender Intake
- **Path**: `/intake`
- **Component**: `TenderIntakePage`
- **Description**: Upload and validate tender documents
- **Access**: Public

### 3. Tender Overview
- **Path**: `/tender-overview`
- **Component**: `TenderOverviewPage`
- **Description**: Evaluation framework overview with tabs (Overview, Financial, Technical, Compliance, Support)
- **Access**: Public

### 4. Tender Article
- **Path**: `/tender-article`
- **Component**: `TenderArticlePage`
- **Description**: Procurement dashboard
- **Access**: Public

### 5. Evaluation Matrix
- **Path**: `/evaluation`
- **Component**: `EvaluationMatrixPage`
- **Description**: Score and compare tender evaluations
- **Access**: Public

### 6. Benchmark Dashboard
- **Path**: `/benchmark`
- **Component**: `BenchmarkDashboardPage`
- **Description**: Market analysis and benchmarking
- **Access**: Public

### 7. Integrity Analytics
- **Path**: `/integrity`
- **Component**: `IntegrityAnalyticsPage`
- **Description**: Fraud detection and integrity analysis
- **Access**: Public

### 8. Justification Composer
- **Path**: `/justification`
- **Component**: `JustificationComposerPage`
- **Description**: Report writing and justification composition
- **Access**: Public

### 9. Award Simulation
- **Path**: `/award`
- **Component**: `AwardSimulationPage`
- **Description**: Scenario analysis for award decisions
- **Access**: Public

### 10. Agent Monitoring
- **Path**: `/monitoring`
- **Component**: `AgentMonitoringPage`
- **Description**: AI performance monitoring
- **Access**: Public

### 11. Integration Management
- **Path**: `/integration`
- **Component**: `IntegrationManagementPage`
- **Description**: System integrations management
- **Access**: Public

## Route Order in Sidebar

The sidebar navigation displays routes in the following order:

1. Leadership Dashboard (`/`)
2. Tender Intake (`/intake`)
3. Tender Overview (`/tender-overview`)
4. Tender Article (`/tender-article`)
5. Evaluation Matrix (`/evaluation`)
6. Benchmark Dashboard (`/benchmark`)
7. Integrity Analytics (`/integrity`)
8. Justification Composer (`/justification`)
9. Award Simulation (`/award`)
10. Agent Monitoring (`/monitoring`)
11. Integration Management (`/integration`)

## Navigation

Navigation is handled through:
- **Sidebar**: Click on menu items to navigate
- **Programmatic**: Use React Router's `useNavigate` hook
- **Direct URLs**: Users can directly access any route via URL

## 404 Handling

Any undefined route will redirect to the home page (`/`) using a catch-all route.

## Implementation Details

- All routes use wrapper components that handle navigation state
- The `Sidebar` component uses `useLocation` to detect the current route
- Navigation handlers map page IDs to route paths
- All routes are client-side rendered (SPA)

## Example Usage

### Direct Navigation
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/intake');
```

### Link Component
```tsx
import { Link } from 'react-router-dom';

<Link to="/evaluation">Go to Evaluation</Link>
```

### Programmatic Navigation from Sidebar
The sidebar automatically handles navigation when menu items are clicked.

