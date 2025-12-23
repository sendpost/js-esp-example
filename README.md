# SendPost JavaScript SDK - ESP Example

This project provides a comprehensive example demonstrating how Email Service Providers (ESPs) can use the SendPost JavaScript SDK to manage email sending operations.

## Overview

The example demonstrates a complete ESP workflow including:

1. **Sub-Account Management** - Create and manage sub-accounts for different clients or use cases
2. **Webhook Setup** - Configure webhooks to receive real-time email event notifications
3. **Domain Management** - Add and verify sending domains
4. **Email Sending** - Send transactional and marketing emails
5. **Message Tracking** - Retrieve message details for tracking and debugging
6. **Statistics & Analytics** - Monitor email performance via sub-account stats, IP stats, and IP pool stats
7. **IP Pool Management** - Create and manage IP pools for better deliverability control

## Prerequisites

- Node.js 14 or higher
- npm 6 or higher
- SendPost account with:
  - Account API Key (for account-level operations)
  - Sub-Account API Key (for sub-account-level operations)

## Setup

### 1. Clone or Download the Project

```bash
cd example-sdk-js
```

### 2. Install Dependencies

```bash
npm install
```

This will install the SendPost JavaScript SDK (`sendpost-js-sdk`) and all required dependencies from npm.

### 3. Configure API Keys

You can set API keys in two ways:

#### Option A: Environment Variables (Recommended)

```bash
export SENDPOST_ACCOUNT_API_KEY="your_account_api_key_here"
export SENDPOST_SUB_ACCOUNT_API_KEY="your_sub_account_api_key_here"
```

Or on Windows:

```cmd
set SENDPOST_ACCOUNT_API_KEY=your_account_api_key_here
set SENDPOST_SUB_ACCOUNT_API_KEY=your_sub_account_api_key_here
```

#### Option B: Edit the Source Code

Edit `ESPExample.js` and update the constants:

```javascript
const SUB_ACCOUNT_API_KEY = 'your_sub_account_api_key_here';
const ACCOUNT_API_KEY = 'your_account_api_key_here';
```

### 4. Update Configuration Values

Edit `ESPExample.js` and update:

- `TEST_FROM_EMAIL` - Your verified sender email address
- `TEST_TO_EMAIL` - Recipient email address
- `TEST_DOMAIN_NAME` - Your sending domain
- `WEBHOOK_URL` - Your webhook endpoint URL

## Running the Example

### Run the Complete Workflow

```bash
npm start
```

Or directly with Node.js:

```bash
node ESPExample.js
```

This will execute the complete ESP workflow demonstrating all features.

## Project Structure

```
example-sdk-js/
├── package.json                    # npm configuration
├── README.md                       # This file
├── .gitignore                      # Git ignore file
└── ESPExample.js                   # Main example file
```

## Workflow Steps

The example demonstrates the following workflow:

### Step 1: Sub-Account Management
- List all sub-accounts
- Create new sub-accounts for different clients or use cases

### Step 2: Webhook Configuration
- Create webhooks to receive email event notifications
- Configure which events to receive (delivered, opened, clicked, bounced, etc.)

### Step 3: Domain Management
- Add sending domains
- View DNS records needed for domain verification
- List all domains

### Step 4: Email Sending
- Send transactional emails (order confirmations, receipts, etc.)
- Send marketing emails (newsletters, promotions, etc.)
- Configure tracking (opens, clicks)
- Add custom headers and fields

### Step 5: Message Tracking
- Retrieve message details by message ID
- View delivery information, IP used, submission time, etc.

### Step 6: Statistics & Analytics
- Get sub-account statistics (processed, delivered, opens, clicks, bounces, etc.)
- Get aggregate statistics
- Get account-level statistics across all sub-accounts

### Step 7: IP and IP Pool Management
- List all dedicated IPs
- Create IP pools for better deliverability control
- View IP pool configurations

## Key Features Demonstrated

### Email Sending
- **Transactional Emails**: Order confirmations, receipts, notifications
- **Marketing Emails**: Newsletters, promotions, campaigns
- **Tracking**: Open tracking, click tracking
- **Customization**: Custom headers, custom fields, groups

### Statistics & Monitoring
- **Sub-Account Stats**: Daily statistics for a specific sub-account
- **Aggregate Stats**: Overall performance metrics
- **Account Stats**: Statistics across all sub-accounts
- **Performance Metrics**: Open rates, click rates, delivery rates

### Infrastructure Management
- **Sub-Accounts**: Organize sending by client, product, or use case
- **Domains**: Add and verify sending domains
- **IPs**: Monitor dedicated IP addresses
- **IP Pools**: Group IPs for better deliverability control

### Event Handling
- **Webhooks**: Receive real-time notifications for email events
- **Event Types**: Processed, delivered, dropped, bounced, opened, clicked, unsubscribed, spam

## API Keys Explained

### Account API Key (`X-Account-ApiKey`)
Used for account-level operations:
- Creating and managing sub-accounts
- Managing IPs and IP pools
- Creating webhooks
- Getting account-level statistics
- Retrieving messages

### Sub-Account API Key (`X-SubAccount-ApiKey`)
Used for sub-account-level operations:
- Sending emails
- Managing domains
- Managing suppressions
- Getting sub-account statistics

## Example Output

When you run the example, you'll see output like:

```
╔═══════════════════════════════════════════════════════════════╗
║   SendPost JavaScript SDK - ESP Example Workflow              ║
╚═══════════════════════════════════════════════════════════════╝

=== Step 1: Listing All Sub-Accounts ===
Retrieving all sub-accounts...
✓ Retrieved 3 sub-account(s)
  - ID: 50441
    Name: API
    API Key: pR0YIuxYSbVwmQi2Y8Qs
    ...

=== Step 2: Creating Webhook ===
Creating webhook...
  URL: https://your-webhook-endpoint.com/webhook
✓ Webhook created successfully!
  ID: 12345
  ...

...
```

## Error Handling

The example includes comprehensive error handling. If an operation fails, you'll see:
- HTTP status code
- Error response body
- Error message for debugging

Common issues:
- **401 Unauthorized**: Invalid or missing API key
- **403 Forbidden**: Resource already exists or insufficient permissions
- **404 Not Found**: Resource ID doesn't exist
- **422 Unprocessable Entity**: Invalid request body or parameters

## Code Examples

### Sending a Transactional Email

```javascript
const emailMessage = new EmailMessageObject();
const from = new EmailAddress();
from.email = 'sender@yourdomain.com';
from.name = 'Your Company';
emailMessage.from = from;

const recipient = new Recipient();
recipient.email = 'customer@example.com';
recipient.name = 'Customer';
emailMessage.to = [recipient];

emailMessage.subject = 'Order Confirmation';
emailMessage.htmlBody = '<h1>Thank you for your order!</h1>';
emailMessage.trackOpens = true;
emailMessage.trackClicks = true;

const emailApi = new EmailApi(apiClient);
const responses = await emailApi.sendEmail(emailMessage);
```

### Getting Statistics

```javascript
const statsApi = new StatsApi(apiClient);
const fromDate = '2024-01-01';
const toDate = '2024-01-07';
const subAccountId = 12345;

const stats = await statsApi.accountSubaccountStatSubaccountIdGet(
    fromDate,
    toDate,
    subAccountId
);
```

### Creating a Webhook

```javascript
const webhookApi = new WebhookApi(apiClient);
const newWebhook = new CreateWebhookRequest();
newWebhook.url = 'https://your-webhook-endpoint.com/webhook';
newWebhook.enabled = true;
newWebhook.delivered = true;
newWebhook.opened = true;
newWebhook.clicked = true;

const webhook = await webhookApi.createWebhook(newWebhook);
```

## Next Steps

After running the example:

1. **Customize for Your Use Case**: Modify the example to match your specific requirements
2. **Integrate with Your Application**: Use the SDK in your own Node.js application
3. **Set Up Webhooks**: Configure your webhook endpoint to receive email events
4. **Monitor Statistics**: Set up regular monitoring of your email performance
5. **Optimize Deliverability**: Use IP pools and domain verification to improve deliverability

## Using in Your Application

To use the SendPost SDK in your own application:

1. Install the SDK:

```bash
npm install sendpost-js-sdk
```

2. Import the required modules:

```javascript
import {
    ApiClient,
    EmailApi,
    EmailMessageObject,
    EmailAddress,
    Recipient
} from 'sendpost-js-sdk';
```

3. Initialize the API client:

```javascript
const apiClient = new ApiClient('https://api.sendpost.io/api/v1');
apiClient.authentications['subAccountAuth'].apiKey = 'YOUR_SUB_ACCOUNT_API_KEY';
```

4. Use the APIs:

```javascript
const emailApi = new EmailApi(apiClient);
// ... use emailApi methods
```

## Troubleshooting

### Module Not Found Errors

If you get "Cannot find module 'sendpost-js-sdk'":

- Make sure you've run `npm install` to install the SDK from npm
- Verify you're using the correct package name: `sendpost-js-sdk`
- Check that your Node.js version is 14 or higher
- Try clearing your node_modules and reinstalling: `rm -rf node_modules package-lock.json && npm install`

## Additional Resources

- [SendPost API Documentation](https://docs.sendpost.io)
- [SendPost JavaScript SDK on npm](https://www.npmjs.com/package/sendpost-js-sdk)
- [SendPost Developer Portal](https://app.sendpost.io)

## Support

For questions or issues:
- Email: hello@sendpost.io
- Website: https://sendpost.io
- Documentation: https://docs.sendpost.io

## License

This example is provided as-is for demonstration purposes.

