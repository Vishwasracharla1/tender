# File Upload CDN Integration Setup

## Overview
The file upload feature has been integrated with the Mobius Content Service API. When users upload files, they are automatically uploaded to the CDN and the CDN URL is stored with the document.

## Environment Variables

Add the following to your `.env` file:

```env
# Content Service Token (for file uploads)
# You can use the same token as VITE_API_AUTHORIZATION_TOKEN or set a separate one
VITE_CONTENT_SERVICE_TOKEN=your_bearer_token_here

# If VITE_CONTENT_SERVICE_TOKEN is not set, it will fall back to VITE_API_AUTHORIZATION_TOKEN
VITE_API_AUTHORIZATION_TOKEN=your_bearer_token_here
```

**Important Notes:**
- The token should be the **full Bearer token** (the long JWT string)
- Do NOT include the word "Bearer" in the token value
- Do NOT wrap the token in quotes
- Example: `VITE_CONTENT_SERVICE_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3Ny1NUVdFRTNHZE5adGlsWU5IYmpsa2dVSkpaWUJWVmN1UmFZdHl5ejFjIn0...`

## API Endpoint

- **URL**: `https://ig.gov-cloud.ai/mobius-content-service/v1.0/content/upload?filePath=CMS`
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Authorization**: Bearer token (from environment variable)

## Features

1. **Automatic Upload**: Files are automatically uploaded to CDN when selected
2. **Progress Indicator**: Shows a loading spinner while uploading
3. **CDN URL Storage**: The CDN URL is stored in the `cdn_url` field of the document
4. **Error Handling**: Failed uploads are marked with error status
5. **View Link**: Successfully uploaded files show a "View" link to open the CDN URL

## File Upload Flow

1. User selects/drops files
2. Files are immediately added to the list with "uploading" status
3. Each file is uploaded to the CDN API
4. On success:
   - Status changes to "validated"
   - CDN URL is stored
   - "View" link appears
5. On error:
   - Status changes to "error"
   - Error is logged to console
   - User can remove and retry

## Response Format

The API should return a response with the CDN URL. The function handles multiple response formats:

- `{ cdn_url: "https://..." }`
- `{ url: "https://..." }`
- Direct URL string
- Any other format with URL fields

## Testing

1. Make sure your `.env` file has the token set
2. Restart your dev server (`npm run dev`)
3. Navigate to Tender Intake page
4. Select a department and category
5. Upload a file (PDF, XLS, or ZIP)
6. Check the browser console for upload logs
7. Verify the CDN URL appears in the file list

## Troubleshooting

### Upload fails with "token not set" error
- Check that `.env` file exists in the project root
- Verify the token variable name is correct
- Restart the dev server after adding the token

### Upload fails with 401/403 error
- Verify the token is valid and not expired
- Check that the token doesn't include "Bearer" prefix
- Ensure the token has proper permissions for the content service

### CDN URL not showing
- Check browser console for the API response
- Verify the response format matches expected structure
- The function tries multiple field names: `cdn_url`, `url`, `cdnUrl`, `fileUrl`

## Network Tab

You can monitor the upload in the browser's Network tab:
- Look for requests to `mobius-content-service/v1.0/content/upload`
- Check the request payload (FormData)
- Verify the response contains the CDN URL

