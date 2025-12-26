/**
 * Comprehensive SendPost JavaScript SDK Example for Email Service Providers (ESPs)
 * 
 * This example demonstrates a complete workflow that an ESP would typically follow:
 * 1. Create sub-accounts for different clients or use cases
 * 2. Set up webhooks to receive email event notifications
 * 3. Add and verify sending domains
 * 4. Send transactional and marketing emails
 * 5. Retrieve message details for tracking and debugging
 * 6. Monitor statistics via IPs and IP pools
 * 7. Manage IP pools for better deliverability control
 * 
 * To run this example:
 * 1. Set environment variables:
 *    - SENDPOST_SUB_ACCOUNT_API_KEY: Your sub-account API key
 *    - SENDPOST_ACCOUNT_API_KEY: Your account API key
 * 2. Or modify the API_KEY constants below
 * 3. Update email addresses and domain names with your verified values
 * 4. Run: npm start
 */

import {
    ApiClient,
    SubAccountApi,
    WebhookApi,
    DomainApi,
    EmailApi,
    MessageApi,
    StatsApi,
    StatsAApi,
    IPApi,
    IPPoolsApi,
    CreateSubAccountRequest,
    CreateWebhookRequest,
    CreateDomainRequest,
    EmailMessageObject,
    EmailAddress,
    Recipient,
    IPPoolCreateRequest,
    EIP
} from 'sendpost-js-sdk';

// API Configuration
const BASE_PATH = 'https://api.sendpost.io/api/v1';

// API Keys - Set these or use environment variables
const SUB_ACCOUNT_API_KEY = process.env.SENDPOST_SUB_ACCOUNT_API_KEY || 'YOUR_SUB_ACCOUNT_API_KEY_HERE';
const ACCOUNT_API_KEY = process.env.SENDPOST_ACCOUNT_API_KEY || 'YOUR_ACCOUNT_API_KEY_HERE';

// Configuration - Update these with your values
const TEST_FROM_EMAIL = 'sender@yourdomain.com';
const TEST_TO_EMAIL = 'recipient@example.com';
const TEST_DOMAIN_NAME = 'yourdomain.com';
const WEBHOOK_URL = 'https://your-webhook-endpoint.com/webhook';

class ESPExample {
    constructor() {
        // Initialize API client
        this.apiClient = new ApiClient(BASE_PATH);
        this.createdSubAccountId = null;
        this.createdSubAccountApiKey = null;
        this.createdWebhookId = null;
        this.createdDomainId = null;
        this.createdIPPoolId = null;
        this.createdIPPoolName = null;
        this.sentMessageId = null;
    }

    /**
     * Configure sub-account authentication
     */
    configureSubAccountAuth() {
        this.apiClient.authentications['subAccountAuth'].apiKey = SUB_ACCOUNT_API_KEY;
    }

    /**
     * Configure account authentication
     */
    configureAccountAuth() {
        this.apiClient.authentications['accountAuth'].apiKey = ACCOUNT_API_KEY;
    }

    /**
     * Step 1: Create a new sub-account
     * Sub-accounts allow you to segregate email sending by client, product, or use case
     */
    async createSubAccount() {
        console.log('\n=== Step 1: Creating Sub-Account ===');
        
        try {
            this.configureAccountAuth();
            const subAccountApi = new SubAccountApi(this.apiClient);
            
            // Create new sub-account request
            const newSubAccount = new CreateSubAccountRequest();
            newSubAccount.name = `ESP Client - ${Date.now()}`;
            
            console.log(`Creating sub-account: ${newSubAccount.name}`);
            
            const subAccount = await subAccountApi.createSubAccount(newSubAccount);
            
            this.createdSubAccountId = subAccount.id;
            this.createdSubAccountApiKey = subAccount.apiKey;
            
            console.log('✓ Sub-account created successfully!');
            console.log(`  ID: ${this.createdSubAccountId}`);
            console.log(`  Name: ${subAccount.name}`);
            console.log(`  API Key: ${this.createdSubAccountApiKey}`);
            console.log(`  Type: ${subAccount.type?.value === 1 ? 'Plus' : 'Regular'}`);
            
        } catch (error) {
            console.error('✗ Failed to create sub-account:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 2: List all sub-accounts
     * Useful for managing multiple clients or use cases
     */
    async listSubAccounts() {
        console.log('\n=== Step 2: Listing All Sub-Accounts ===');
        
        try {
            this.configureAccountAuth();
            const subAccountApi = new SubAccountApi(this.apiClient);
            
            console.log('Retrieving all sub-accounts...');
            const subAccounts = await subAccountApi.getAllSubAccounts();
            
            console.log(`✓ Retrieved ${subAccounts.length} sub-account(s)`);
            for (const subAccount of subAccounts) {
                console.log(`  - ID: ${subAccount.id}`);
                console.log(`    Name: ${subAccount.name}`);
                console.log(`    API Key: ${subAccount.apiKey}`);
                console.log(`    Type: ${subAccount.type?.value === 1 ? 'Plus' : 'Regular'}`);
                console.log(`    Blocked: ${subAccount.blocked ? 'Yes' : 'No'}`);
                if (subAccount.created) {
                    console.log(`    Created: ${subAccount.created}`);
                }
                console.log();
                
                // Use first sub-account if none selected
                if (!this.createdSubAccountId && subAccount.id) {
                    this.createdSubAccountId = subAccount.id;
                    this.createdSubAccountApiKey = subAccount.apiKey;
                }
            }
            
        } catch (error) {
            console.error('✗ Failed to list sub-accounts:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 3: Create a webhook
     * Webhooks allow you to receive real-time notifications about email events
     */
    async createWebhook() {
        console.log('\n=== Step 3: Creating Webhook ===');
        
        try {
            this.configureAccountAuth();
            const webhookApi = new WebhookApi(this.apiClient);
            
            // Create new webhook
            const newWebhook = new CreateWebhookRequest();
            newWebhook.url = WEBHOOK_URL;
            newWebhook.enabled = true;
            
            // Configure which events to receive
            newWebhook.processed = true;      // Email processed
            newWebhook.delivered = true;       // Email delivered
            newWebhook.dropped = true;        // Email dropped
            newWebhook.softBounced = true;    // Soft bounce
            newWebhook.hardBounced = true;     // Hard bounce
            newWebhook.opened = true;          // Email opened
            newWebhook.clicked = true;         // Link clicked
            newWebhook.unsubscribed = true;    // Unsubscribed
            newWebhook.spam = true;            // Marked as spam
            
            console.log('Creating webhook...');
            console.log(`  URL: ${newWebhook.url}`);
            
            const webhook = await webhookApi.createWebhook(newWebhook);
            this.createdWebhookId = webhook.id;
            
            console.log('✓ Webhook created successfully!');
            console.log(`  ID: ${this.createdWebhookId}`);
            console.log(`  URL: ${webhook.url}`);
            console.log(`  Enabled: ${webhook.enabled}`);
            
        } catch (error) {
            console.error('✗ Failed to create webhook:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 4: List all webhooks
     */
    async listWebhooks() {
        console.log('\n=== Step 4: Listing All Webhooks ===');
        
        try {
            this.configureAccountAuth();
            const webhookApi = new WebhookApi(this.apiClient);
            
            console.log('Retrieving all webhooks...');
            const webhooks = await webhookApi.getAllWebhooks();
            
            console.log(`✓ Retrieved ${webhooks.length} webhook(s)`);
            for (const webhook of webhooks) {
                console.log(`  - ID: ${webhook.id}`);
                console.log(`    URL: ${webhook.url}`);
                console.log(`    Enabled: ${webhook.enabled}`);
                console.log();
            }
            
        } catch (error) {
            console.error('✗ Failed to list webhooks:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 5: Add a sending domain
     * Domains must be verified before they can be used for sending
     */
    async addDomain() {
        console.log('\n=== Step 5: Adding Domain ===');
        
        try {
            this.configureSubAccountAuth();
            const domainApi = new DomainApi(this.apiClient);
            
            // Create domain request
            const domainRequest = new CreateDomainRequest();
            domainRequest.name = TEST_DOMAIN_NAME;
            
            console.log(`Adding domain: ${TEST_DOMAIN_NAME}`);
            
            const domain = await domainApi.subaccountDomainPost(domainRequest);
            this.createdDomainId = domain.id ? domain.id.toString() : null;
            
            console.log('✓ Domain added successfully!');
            console.log(`  ID: ${this.createdDomainId}`);
            console.log(`  Domain: ${domain.name}`);
            console.log(`  Verified: ${domain.verified ? 'Yes' : 'No'}`);
            
            if (domain.dkim) {
                console.log(`  DKIM Record: ${domain.dkim.textValue}`);
            }
            
            console.log('\n⚠️  IMPORTANT: Add the DNS records shown above to your domain\'s DNS settings to verify the domain.');
            
        } catch (error) {
            console.error('✗ Failed to add domain:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 6: List all domains
     */
    async listDomains() {
        console.log('\n=== Step 6: Listing All Domains ===');
        
        try {
            this.configureSubAccountAuth();
            const domainApi = new DomainApi(this.apiClient);
            
            console.log('Retrieving all domains...');
            const domains = await domainApi.getAllDomains();
            
            console.log(`✓ Retrieved ${domains.length} domain(s)`);
            for (const domain of domains) {
                console.log(`  - ID: ${domain.id}`);
                console.log(`    Domain: ${domain.name}`);
                console.log(`    Verified: ${domain.verified ? 'Yes' : 'No'}`);
                console.log();
            }
            
        } catch (error) {
            console.error('✗ Failed to list domains:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 7: Send a transactional email
     * Transactional emails are typically triggered by user actions
     */
    async sendTransactionalEmail() {
        console.log('\n=== Step 7: Sending Transactional Email ===');
        
        try {
            this.configureSubAccountAuth();
            const emailApi = new EmailApi(this.apiClient);
            
            // Create email message
            const emailMessage = new EmailMessageObject();
            
            // Set sender
            const from = new EmailAddress();
            from.email = TEST_FROM_EMAIL;
            from.name = 'Your Company';
            emailMessage.from = from;
            
            // Set recipient
            const recipient = new Recipient();
            recipient.email = TEST_TO_EMAIL;
            recipient.name = 'Customer';
            
            // Add custom fields
            recipient.customFields = {
                customer_id: '67890',
                order_value: '99.99'
            };
            
            emailMessage.to = [recipient];
            
            // Set email content
            emailMessage.subject = 'Order Confirmation - Transactional Email';
            emailMessage.htmlBody = '<h1>Thank you for your order!</h1><p>Your order has been confirmed and will be processed shortly.</p>';
            emailMessage.textBody = 'Thank you for your order! Your order has been confirmed and will be processed shortly.';
            
            // Enable tracking
            emailMessage.trackOpens = true;
            emailMessage.trackClicks = true;
            
            // Add custom headers for tracking
            emailMessage.headers = {
                'X-Order-ID': '12345',
                'X-Email-Type': 'transactional'
            };
            
            // Use IP pool if available
            if (this.createdIPPoolName) {
                emailMessage.ippool = this.createdIPPoolName;
                console.log(`  Using IP Pool: ${this.createdIPPoolName}`);
            }
            
            console.log('Sending transactional email...');
            console.log(`  From: ${TEST_FROM_EMAIL}`);
            console.log(`  To: ${TEST_TO_EMAIL}`);
            console.log(`  Subject: ${emailMessage.subject}`);
            
            const responses = await emailApi.sendEmail(emailMessage);
            
            if (responses && responses.length > 0) {
                const response = responses[0];
                this.sentMessageId = response.messageId;
                
                console.log('✓ Transactional email sent successfully!');
                console.log(`  Message ID: ${this.sentMessageId}`);
                console.log(`  To: ${response.to}`);
            }
            
        } catch (error) {
            console.error('✗ Failed to send email:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 8: Send a marketing email
     * Marketing emails are typically sent to multiple recipients
     */
    async sendMarketingEmail() {
        console.log('\n=== Step 8: Sending Marketing Email ===');
        
        try {
            this.configureSubAccountAuth();
            const emailApi = new EmailApi(this.apiClient);
            
            // Create email message
            const emailMessage = new EmailMessageObject();
            
            // Set sender
            const from = new EmailAddress();
            from.email = TEST_FROM_EMAIL;
            from.name = 'Marketing Team';
            emailMessage.from = from;
            
            // Set recipient
            const recipient = new Recipient();
            recipient.email = TEST_TO_EMAIL;
            recipient.name = 'Customer 1';
            emailMessage.to = [recipient];
            
            // Set email content
            emailMessage.subject = 'Special Offer - 20% Off Everything!';
            emailMessage.htmlBody = `
                <html>
                <body>
                    <h1>Special Offer!</h1>
                    <p>Get 20% off on all products. Use code: <strong>SAVE20</strong></p>
                    <p><a href="https://example.com/shop">Shop Now</a></p>
                </body>
                </html>
            `;
            emailMessage.textBody = 'Special Offer! Get 20% off on all products. Use code: SAVE20. Visit: https://example.com/shop';
            
            // Enable tracking
            emailMessage.trackOpens = true;
            emailMessage.trackClicks = true;
            
            // Add group for analytics
            emailMessage.groups = ['marketing', 'promotional'];
            
            // Add custom headers
            emailMessage.headers = {
                'X-Email-Type': 'marketing',
                'X-Campaign-ID': 'campaign-001'
            };
            
            // Use IP pool if available
            if (this.createdIPPoolName) {
                emailMessage.ippool = this.createdIPPoolName;
                console.log(`  Using IP Pool: ${this.createdIPPoolName}`);
            }
            
            console.log('Sending marketing email...');
            console.log(`  From: ${TEST_FROM_EMAIL}`);
            console.log(`  To: ${TEST_TO_EMAIL}`);
            console.log(`  Subject: ${emailMessage.subject}`);
            
            const responses = await emailApi.sendEmail(emailMessage);
            
            if (responses && responses.length > 0) {
                const response = responses[0];
                if (!this.sentMessageId) {
                    this.sentMessageId = response.messageId;
                }
                
                console.log('✓ Marketing email sent successfully!');
                console.log(`  Message ID: ${response.messageId}`);
                console.log(`  To: ${response.to}`);
            }
            
        } catch (error) {
            console.error('✗ Failed to send email:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 9: Retrieve message details
     * Useful for tracking, debugging, and customer support
     */
    async getMessageDetails() {
        console.log('\n=== Step 9: Retrieving Message Details ===');
        
        if (!this.sentMessageId) {
            console.error('✗ No message ID available. Please send an email first.');
            return;
        }
        
        try {
            this.configureAccountAuth();
            const messageApi = new MessageApi(this.apiClient);
            
            console.log(`Retrieving message with ID: ${this.sentMessageId}`);
            
            const message = await messageApi.getMessageById(this.sentMessageId);
            
            console.log('✓ Message retrieved successfully!');
            console.log(`  Message ID: ${message.messageID}`);
            console.log(`  Account ID: ${message.accountID}`);
            console.log(`  Sub-Account ID: ${message.subAccountID}`);
            console.log(`  IP ID: ${message.ipID}`);
            console.log(`  Public IP: ${message.publicIP}`);
            console.log(`  Local IP: ${message.localIP}`);
            console.log(`  Email Type: ${message.emailType}`);
            
            if (message.submittedAt) {
                console.log(`  Submitted At: ${message.submittedAt}`);
            }
            
            if (message.from) {
                console.log(`  From: ${message.from.email || 'N/A'}`);
            }
            
            if (message.to) {
                console.log(`  To: ${message.to.email || 'N/A'}`);
                if (message.to.name) {
                    console.log(`    Name: ${message.to.name}`);
                }
            }
            
            if (message.subject) {
                console.log(`  Subject: ${message.subject}`);
            }
            
            if (message.ipPool && message.ipPool.length > 0) {
                console.log(`  IP Pool: ${message.ipPool}`);
            }
            
            if (message.attempt) {
                console.log(`  Delivery Attempts: ${message.attempt}`);
            }
            
        } catch (error) {
            console.error('✗ Failed to get message:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 10: Get sub-account statistics
     * Monitor email performance metrics
     */
    async getSubAccountStats() {
        console.log('\n=== Step 10: Getting Sub-Account Statistics ===');
        
        if (!this.createdSubAccountId) {
            console.error('✗ No sub-account ID available. Please create or list sub-accounts first.');
            return;
        }
        
        try {
            this.configureAccountAuth();
            const statsApi = new StatsApi(this.apiClient);
            
            // Get stats for the last 7 days
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 7);
            
            // Format dates as YYYY-MM-DD
            const formatDate = (date) => {
                return date.toISOString().split('T')[0];
            };
            
            console.log(`Retrieving stats for sub-account ID: ${this.createdSubAccountId}`);
            console.log(`  From: ${formatDate(fromDate)}`);
            console.log(`  To: ${formatDate(toDate)}`);
            
            const stats = await statsApi.accountSubaccountStatSubaccountIdGet(
                formatDate(fromDate),
                formatDate(toDate),
                this.createdSubAccountId
            );
            
            console.log('✓ Stats retrieved successfully!');
            console.log(`  Retrieved ${stats.length} stat record(s)`);
            
            let totalProcessed = 0;
            let totalDelivered = 0;
            
            for (const stat of stats) {
                console.log(`\n  Date: ${stat.date}`);
                if (stat.stats) {
                    const statData = stat.stats;
                    console.log(`    Processed: ${statData.processed || 0}`);
                    console.log(`    Delivered: ${statData.delivered || 0}`);
                    console.log(`    Dropped: ${statData.dropped || 0}`);
                    console.log(`    Hard Bounced: ${statData.hardBounced || 0}`);
                    console.log(`    Soft Bounced: ${statData.softBounced || 0}`);
                    console.log(`    Unsubscribed: ${statData.unsubscribed || 0}`);
                    console.log(`    Spam: ${statData.spam || 0}`);
                    
                    totalProcessed += statData.processed || 0;
                    totalDelivered += statData.delivered || 0;
                }
            }
            
            console.log('\n  Summary (Last 7 days):');
            console.log(`    Total Processed: ${totalProcessed}`);
            console.log(`    Total Delivered: ${totalDelivered}`);
            
        } catch (error) {
            console.error('✗ Failed to get stats:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 11: Get aggregate statistics
     * Get overall performance metrics
     */
    async getAggregateStats() {
        console.log('\n=== Step 11: Getting Aggregate Statistics ===');
        
        if (!this.createdSubAccountId) {
            console.error('✗ No sub-account ID available. Please create or list sub-accounts first.');
            return;
        }
        
        try {
            this.configureAccountAuth();
            const statsApi = new StatsApi(this.apiClient);
            
            // Get aggregate stats for the last 7 days
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 7);
            
            // Format dates as YYYY-MM-DD
            const formatDate = (date) => {
                return date.toISOString().split('T')[0];
            };
            
            console.log(`Retrieving aggregate stats for sub-account ID: ${this.createdSubAccountId}`);
            console.log(`  From: ${formatDate(fromDate)}`);
            console.log(`  To: ${formatDate(toDate)}`);
            
            const aggregateStat = await statsApi.accountSubaccountStatSubaccountIdAggregateGet(
                formatDate(fromDate),
                formatDate(toDate),
                this.createdSubAccountId
            );
            
            console.log('✓ Aggregate stats retrieved successfully!');
            console.log(`  Processed: ${aggregateStat.processed || 0}`);
            console.log(`  Delivered: ${aggregateStat.delivered || 0}`);
            console.log(`  Dropped: ${aggregateStat.dropped || 0}`);
            console.log(`  Hard Bounced: ${aggregateStat.hardBounced || 0}`);
            console.log(`  Soft Bounced: ${aggregateStat.softBounced || 0}`);
            console.log(`  Unsubscribed: ${aggregateStat.unsubscribed || 0}`);
            console.log(`  Spam: ${aggregateStat.spam || 0}`);
            
        } catch (error) {
            console.error('✗ Failed to get aggregate stats:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 12: List all IPs
     * Monitor your dedicated IP addresses
     */
    async listIPs() {
        console.log('\n=== Step 12: Listing All IPs ===');
        
        try {
            this.configureAccountAuth();
            const ipApi = new IPApi(this.apiClient);
            
            console.log('Retrieving all IPs...');
            const ips = await ipApi.getAllIps();
            
            console.log(`✓ Retrieved ${ips.length} IP(s)`);
            for (const ip of ips) {
                console.log(`  - ID: ${ip.id}`);
                console.log(`    IP Address: ${ip.publicIP}`);
                if (ip.reverseDNSHostname) {
                    console.log(`    Reverse DNS: ${ip.reverseDNSHostname}`);
                }
                if (ip.created) {
                    console.log(`    Created: ${ip.created}`);
                }
                console.log();
            }
            
        } catch (error) {
            console.error('✗ Failed to list IPs:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 13: Create an IP Pool
     * IP pools allow you to group IPs for better deliverability control
     */
    async createIPPool() {
        console.log('\n=== Step 13: Creating IP Pool ===');
        
        try {
            this.configureAccountAuth();
            const ipPoolsApi = new IPPoolsApi(this.apiClient);
            
            // First, get available IPs
            const ipApi = new IPApi(this.apiClient);
            const ips = await ipApi.getAllIps();
            
            if (!ips || ips.length === 0) {
                console.log('⚠️  No IPs available. Please allocate IPs first.');
                return;
            }
            
            // Create IP pool request
            const poolRequest = new IPPoolCreateRequest();
            poolRequest.name = `Marketing Pool - ${Date.now()}`;
            poolRequest.routingStrategy = 0; // 0 = RoundRobin, 1 = EmailProviderStrategy
            
            // Add IPs to the pool (convert IP to EIP)
            const poolIPs = [];
            // Add first available IP (you can add more)
            if (ips.length > 0) {
                const eip = new EIP();
                eip.publicIP = ips[0].publicIP;
                poolIPs.push(eip);
            }
            poolRequest.ips = poolIPs;
            
            // Set warmup interval (required, must be > 0)
            poolRequest.warmupInterval = 24; // 24 hours
            
            // Set overflow strategy (0 = None, 1 = Use overflow pool)
            poolRequest.overflowStrategy = 0;
            
            console.log(`Creating IP pool: ${poolRequest.name}`);
            console.log('  Routing Strategy: Round Robin');
            console.log(`  IPs: ${poolIPs.length}`);
            console.log(`  Warmup Interval: ${poolRequest.warmupInterval} hours`);
            
            const ipPool = await ipPoolsApi.createIPPool(poolRequest);
            this.createdIPPoolId = ipPool.id;
            if (ipPool.name) {
                this.createdIPPoolName = ipPool.name;
            }
            
            console.log('✓ IP pool created successfully!');
            console.log(`  ID: ${this.createdIPPoolId}`);
            console.log(`  Name: ${ipPool.name}`);
            console.log(`  Routing Strategy: ${ipPool.routingStrategy}`);
            console.log(`  IPs in pool: ${ipPool.ips ? ipPool.ips.length : 0}`);
            
        } catch (error) {
            console.error('✗ Failed to create IP pool:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 14: List all IP Pools
     */
    async listIPPools() {
        console.log('\n=== Step 14: Listing All IP Pools ===');
        
        try {
            this.configureAccountAuth();
            const ipPoolsApi = new IPPoolsApi(this.apiClient);
            
            console.log('Retrieving all IP pools...');
            const ipPools = await ipPoolsApi.getAllIPPools();
            
            console.log(`✓ Retrieved ${ipPools.length} IP pool(s)`);
            for (const ipPool of ipPools) {
                console.log(`  - ID: ${ipPool.id}`);
                console.log(`    Name: ${ipPool.name}`);
                console.log(`    Routing Strategy: ${ipPool.routingStrategy}`);
                console.log(`    IPs in pool: ${ipPool.ips ? ipPool.ips.length : 0}`);
                if (ipPool.ips && ipPool.ips.length > 0) {
                    for (const ip of ipPool.ips) {
                        console.log(`      - ${ip.publicIP}`);
                    }
                }
                console.log();
            }
            
        } catch (error) {
            console.error('✗ Failed to list IP pools:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Step 15: Get account-level statistics
     * Overall statistics across all sub-accounts
     */
    async getAccountStats() {
        console.log('\n=== Step 15: Getting Account-Level Statistics ===');
        
        try {
            this.configureAccountAuth();
            const statsAApi = new StatsAApi(this.apiClient);
            
            // Get stats for the last 7 days
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 7);
            
            // Format dates as YYYY-MM-DD
            const formatDate = (date) => {
                return date.toISOString().split('T')[0];
            };
            
            console.log('Retrieving account-level stats...');
            console.log(`  From: ${formatDate(fromDate)}`);
            console.log(`  To: ${formatDate(toDate)}`);
            
            const accountStats = await statsAApi.getAllAccountStats(
                formatDate(fromDate),
                formatDate(toDate)
            );
            
            console.log('✓ Account stats retrieved successfully!');
            console.log(`  Retrieved ${accountStats.length} stat record(s)`);
            
            for (const stat of accountStats) {
                console.log(`\n  Date: ${stat.date}`);
                if (stat.stat) {
                    const statData = stat.stat;
                    console.log(`    Processed: ${statData.processed || 0}`);
                    console.log(`    Delivered: ${statData.delivered || 0}`);
                    console.log(`    Dropped: ${statData.dropped || 0}`);
                    console.log(`    Hard Bounced: ${statData.hardBounced || 0}`);
                    console.log(`    Soft Bounced: ${statData.softBounced || 0}`);
                    console.log(`    Opens: ${statData.opens || 0}`);
                    console.log(`    Clicks: ${statData.clicks || 0}`);
                    console.log(`    Unsubscribed: ${statData.unsubscribed || 0}`);
                    console.log(`    Spam: ${statData.spam || 0}`);
                }
            }
            
        } catch (error) {
            console.error('✗ Failed to get account stats:');
            if (error.response) {
                console.error(`  Status code: ${error.response.status}`);
                console.error(`  Response body: ${JSON.stringify(error.response.body, null, 2)}`);
            } else {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    /**
     * Run the complete ESP workflow
     */
    async runCompleteWorkflow() {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║   SendPost JavaScript SDK - ESP Example Workflow          ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        
        // Step 1: List existing sub-accounts (or create new one)
        await this.listSubAccounts();
        
        // Step 2: Create webhook for event notifications
        await this.createWebhook();
        await this.listWebhooks();
        
        // Step 3: Add and verify domain
        await this.addDomain();
        await this.listDomains();
        
        // Step 4: Manage IPs and IP pools (before sending emails)
        await this.listIPs();
        await this.createIPPool();
        await this.listIPPools();
        
        // Step 5: Send emails (using the created IP pool)
        await this.sendTransactionalEmail();
        await this.sendMarketingEmail();
        
        // Step 6: Monitor statistics
        await this.getSubAccountStats();
        await this.getAggregateStats();
        
        // Step 7: Get account-level overview
        await this.getAccountStats();
        
        // Step 8: Retrieve message details (at the end to give system time to store data)
        // Add a small delay to ensure message data is stored
        console.log('\n⏳ Waiting a few seconds for message data to be stored...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        await this.getMessageDetails();
        
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║   Workflow Complete!                                          ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
    }
}

/**
 * Main function
 */
async function main() {
    const example = new ESPExample();
    
    // Check if API keys are set
    if (SUB_ACCOUNT_API_KEY === 'YOUR_SUB_ACCOUNT_API_KEY_HERE' || 
        ACCOUNT_API_KEY === 'YOUR_ACCOUNT_API_KEY_HERE') {
        console.error('⚠️  WARNING: Please set your API keys!');
        console.error('   Set environment variables:');
        console.error('   - SENDPOST_SUB_ACCOUNT_API_KEY');
        console.error('   - SENDPOST_ACCOUNT_API_KEY');
        console.error('   Or modify the constants in ESPExample.js');
        console.error();
    }
    
    // Run the complete workflow
    await example.runCompleteWorkflow();
}

// Run the example
main().catch(console.error);

