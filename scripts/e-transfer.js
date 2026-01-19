// ==========================================
// CONFIGURATION
// ==========================================
// Replace this with your actual Verification API URL
// NOTE: Ensure this URL is accessible from the internet (e.g. deployed to Vercel)
const API_ENDPOINT = "https://meatballs.up.railway.app/api/verify-transfer";

const API_SECRET = "test-secret-token"; // MUST match ETRANSFER_VERIFY_TOKEN in .env

// The search query to find Interac emails. 
// "is:unread" is CRITICAL to prevent infinite loops.
const SEARCH_QUERY = 'from:payments.interac.ca is:unread newer_than:1d';

// ==========================================
// MAIN FUNCTION
// ==========================================
function processInteracEmails() {
    try {
        // 1. Find all unread thread matching the query
        // limits to 10 threads per run to prevent timeout issues
        var threads = GmailApp.search(SEARCH_QUERY, 0, 10);

        if (threads.length === 0) {
            console.log("No new Interac emails found.");
            return;
        }

        console.log("Found " + threads.length + " threads to process.");

        // 2. Loop through each thread
        for (var i = 0; i < threads.length; i++) {
            var thread = threads[i];
            var messages = thread.getMessages();

            // Usually, we only care about the last message in the thread if it's a conversation,
            // but for notifications, there is usually only one message.
            // We process all unread messages in the thread just in case.
            for (var j = 0; j < messages.length; j++) {
                var message = messages[j];

                if (message.isUnread()) {
                    var result = sendToBackend(message);

                    if (result.success) {
                        // 3. Mark as read ONLY if API confirmed receipt/success
                        message.markRead();
                        console.log("Success: " + result.message);
                    } else {
                        // Log error but don't crash loop
                        console.error("Failure processing message " + message.getId() + ": " + result.message);
                    }
                }
            }
        }
    } catch (e) {
        console.error("Critical Error in script: " + e.toString());
    }
}

// ==========================================
// HELPER FUNCTION
// ==========================================
function sendToBackend(message) {
    // Construct the payload
    var payload = {
        "gmail_message_id": message.getId(),
        "sender": message.getFrom(),
        "subject": message.getSubject(),
        "date": message.getDate(),
        "body_plain": message.getPlainBody()
    };

    var options = {
        "method": "post",
        "contentType": "application/json",
        "headers": {
            "Authorization": "Bearer " + API_SECRET
        },
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
    };

    try {
        var response = UrlFetchApp.fetch(API_ENDPOINT, options);
        var responseCode = response.getResponseCode();
        var responseBody = response.getContentText();

        var jsonResponse;
        try {
            jsonResponse = JSON.parse(responseBody);
        } catch (e) {
            jsonResponse = { error: responseBody };
        }

        // Check for success (200 OK)
        if (responseCode >= 200 && responseCode < 300) {
            return { success: true, message: "Order verified. " + (jsonResponse.message || "") };
        } else {
            // If 404 (Order not found) or 400 (No ref found), we might still want to mark as read to verify manually? 
            // For now, let's return false so it stays unread and we can check logs.
            // OR maybe we should log it and mark as read if it's a "No Ref Found" case to avoid stuck emails.
            // Let's keep it simple: API error = retry later (keep unread).
            return { success: false, message: "API Error " + responseCode + ": " + (jsonResponse.error || responseBody) };
        }
    } catch (error) {
        return { success: false, message: "Network error: " + error.toString() };
    }
}