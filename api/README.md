# API configuration

## Encrypting chat text at rest

Set `CHAT_MESSAGE_ENCRYPTION_KEY` before starting the API. Generate a random secret locally:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Keep the key in the server's environment or secret manager, separate from database backups. Losing it makes encrypted message text unreadable. Rotating it requires decrypting and re-encrypting messages with a dedicated migration; changing the variable alone is not a rotation.

Existing plaintext messages remain readable until migrated. Before enabling the new API, set the key and run `node scripts/encrypt-existing-messages.js` from the `api` directory. Run the migration once, preferably during a maintenance window. It is safe to rerun: messages already encrypted with this format are skipped.

Only message text is encrypted in MongoDB. Chat attachments remain files on disk and are not encrypted by this feature. The API can read message text after decryption, so this is not end-to-end encryption. HTTPS must still be enforced by the web server or reverse proxy for protection in transit.
