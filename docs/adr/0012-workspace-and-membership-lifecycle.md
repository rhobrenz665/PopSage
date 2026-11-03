# Define workspace deletion and membership ownership lifecycle

Accepted on 3 November 2026 (Q47–Q49). Every workspace has exactly one owner. Ownership transfers only to an active teammate who explicitly accepts; the current owner cannot leave or be removed until transfer completes. Workspace deletion is the alternative to transfer.

Deleting a workspace requires owner reauthentication and explicit workspace-name confirmation. Acceptance immediately disables the workspace and revokes memberships, visitor credentials, invitations, jobs, AI work, and realtime connections. Logically expire its conversations, knowledge, configuration, vectors, objects, and remaining application data, then remove primary copies within 24 hours under ADR 0009. Cleanup is not reversible once it begins; provider backup retention is documented separately.

Removing a teammate immediately revokes that membership and its HTTP/realtime access without deleting the person's account or memberships in other workspaces. Historical accepted messages preserve an immutable sender display-name snapshot and sender type so the transcript remains understandable; the snapshot does not grant access or keep a live membership relationship.

A person may delete their PopSage account only after transferring or deleting every workspace they own. Acceptance immediately revokes authentication sessions, invitations, memberships, and live access, then removes the primary auth profile within 24 hours. Historical accepted message content remains immutable until transcript expiry, but retained sender display-name snapshots become “Deleted teammate” so the deleted account’s name is not retained as attribution. This anonymization is a metadata lifecycle change, not a message edit.

This ADR records planning only and does not authorize implementation or deletion of any data.
