# Registration review: future integration

This interface is a disconnected preview. Registration applications must be stored separately from Client/Patient records. The intended workflow is Submitted → Under Review → Approved → Active Patient, with Rejected and Correction Requested as alternative outcomes.

The future backend must enforce staff role-based authorization for every review decision; public requests must never approve applications. Approval must create or link a patient transactionally, prevent duplicate patient creation, and record the reviewer, time, decision, and reason when appropriate. Preserve an audit history and protect sensitive registration details throughout the workflow. The current UI types are design placeholders, not an approved API contract.

The final registration QR code must point to a permanent, publicly accessible HTTPS URL that works across networks and can be shared through social media, printed posters, flyers, and the clinic website. The existing environment-driven QR configuration is unchanged. No hosting, public submission, or deployment is enabled by this preview.
