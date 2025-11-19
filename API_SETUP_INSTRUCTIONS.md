# API Integration Setup

## Environment Variables

1. **Create a `.env` file** in the root directory of the project (same level as `package.json`)

2. **Add the following content** to `.env`:

```
VITE_API_AUTHORIZATION_TOKEN=your_authorization_token_here
```

Replace `your_authorization_token_here` with your actual Bearer token from the curl command.

**Important:** The `.env` file is already in `.gitignore`, so it won't be committed to version control.

## What's Integrated

The API integration is now complete for the **Active Tenders** card on the Leadership Dashboard:

- ✅ API service created at `src/services/api.ts`
- ✅ Fetches data on page load
- ✅ Displays `active_tenders` count in the KPI card
- ✅ Shows detailed breakdown in the modal when clicking the card:
  - Intake Phase (with pending validation and normalized counts)
  - Evaluation Phase (with scoring and review counts)
  - Benchmark Phase (with market analysis and outlier review counts)
  - Award Phase (with final approval and contract prep counts)
  - Justification Phase
  - Total Estimated Value (formatted as AED X.XXM)
  - Average Time in System (formatted as X days)

## API Response Mapping

The following fields from the API response are displayed:

| API Field | Display Location |
|-----------|-----------------|
| `active_tenders` | Main KPI card value |
| `intake_total` | Modal: Intake Phase value |
| `intake_pending_validation` | Modal: Intake Phase description |
| `intake_normalized` | Modal: Intake Phase description |
| `evaluation_scoring` | Modal: Evaluation Phase description |
| `evaluation_review` | Modal: Evaluation Phase description |
| `benchmark_total` | Modal: Benchmark Phase value |
| `benchmark_market_analysis` | Modal: Benchmark Phase description |
| `benchmark_outlier_review` | Modal: Benchmark Phase description |
| `award_total` | Modal: Award Phase value |
| `award_final_approval` | Modal: Award Phase description |
| `award_contract_prep` | Modal: Award Phase description |
| `justification_total` | Modal: Justification Phase value |
| `total_estimated_value` | Modal: Total Value (formatted) |
| `avg_time_in_system` | Modal: Avg Time in System (formatted) |

## Testing

After setting up the `.env` file:

1. Restart your development server (`npm run dev`)
2. Navigate to the Leadership Dashboard
3. The Active Tenders card should show the data from the API
4. Click the card to see the detailed breakdown in the modal

## Error Handling

If the API call fails:
- The card will show "Error loading data" in the subtitle
- Check the browser console for detailed error messages
- Verify that `VITE_API_AUTHORIZATION_TOKEN` is set correctly in `.env`

