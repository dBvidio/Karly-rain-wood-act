/**
 * Google Apps Script Web App — receives self-endorsement submissions from
 * the site's "Endorse This Campaign" form, appends each one as a row in
 * this spreadsheet, and emails a confirmation to StandForKarlyRain@gmail.com.
 *
 * SETUP (no coding needed beyond pasting this file):
 * 1. Create a new Google Sheet (or open the one you want submissions to
 *    land in). Add a header row to the first sheet:
 *    Timestamp | Name | City | Group/Business | Email | Phone | How they want to help
 * 2. In that Sheet: Extensions -> Apps Script.
 * 3. Delete anything in the editor and paste this entire file.
 * 4. Replace SHARED_SECRET below with a long random string of your choice
 *    (letters/numbers, no spaces) — this stops random people who ever
 *    discover the deployed URL from spamming your sheet/inbox. Anything
 *    works as long as it matches ENDORSEMENT_WEBHOOK_SECRET in Vercel
 *    (see the README section "How the self-endorsement flow works").
 * 5. Deploy -> New deployment -> gear icon -> "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    Click Deploy, authorize the permissions Google asks for (this is
 *    your own script accessing your own sheet + sending mail as you —
 *    normal for Apps Script, not a third party).
 * 6. Copy the "Web app URL" it gives you — that's ENDORSEMENT_WEBHOOK_URL.
 * 7. In Vercel: Project Settings -> Environment Variables, add
 *    ENDORSEMENT_WEBHOOK_URL (the URL from step 6) and
 *    ENDORSEMENT_WEBHOOK_SECRET (the string from step 4). Redeploy.
 *
 * Whenever someone submits the form, a new row appears in this sheet
 * within a few seconds, and an email lands in StandForKarlyRain@gmail.com.
 * No further maintenance needed — if you ever redeploy this script (e.g.
 * after editing it), Apps Script gives you a new URL each time you create
 * a *new* deployment, so update ENDORSEMENT_WEBHOOK_URL in Vercel again in
 * that case. Editing this file and using "Manage deployments" -> pencil
 * icon -> "New version" on the *same* deployment keeps the same URL.
 */

var NOTIFY_EMAIL = "StandForKarlyRain@gmail.com";
var SHARED_SECRET = "REPLACE_WITH_YOUR_OWN_RANDOM_STRING";

function doPost(e) {
  var result = { ok: false };
  try {
    var data = JSON.parse(e.postData.contents);

    if (SHARED_SECRET && data.secret !== SHARED_SECRET) {
      result.error = "Unauthorized";
      return jsonOutput(result);
    }

    var name = String(data.name || "").trim();
    var city = String(data.city || "").trim();
    var group = String(data.group || "").trim();
    var email = String(data.email || "").trim();
    var phone = String(data.phone || "").trim();
    var helpType = String(data.helpType || "").trim();

    if (!name || !city || !email || !helpType) {
      result.error = "Missing required fields";
      return jsonOutput(result);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    sheet.appendRow([new Date(), name, city, group, email, phone, helpType]);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "New Karly Rain Wood Act endorsement: " + name,
      body: [
        "A new endorsement was submitted on the site.",
        "",
        "Name: " + name,
        "City: " + city,
        "Group/Business: " + (group || "(none given)"),
        "Email: " + email,
        "Phone: " + (phone || "(none given)"),
        "How they want to help: " + helpType,
        "",
        "Submitted: " + new Date().toString(),
      ].join("\n"),
    });

    result.ok = true;
    return jsonOutput(result);
  } catch (err) {
    result.error = String(err);
    return jsonOutput(result);
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
