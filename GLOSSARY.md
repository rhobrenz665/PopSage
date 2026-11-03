# PopSage

PopSage connects website visitors with business support through AI answers and human conversations.

## Language

**Workspace**:
A business support operation with a shared team, knowledge base, and conversation inbox, potentially serving multiple websites. Brands needing distinct support knowledge use separate workspaces.
_Avoid_: Website, account, brand as interchangeable names for a workspace

**Workspace owner**:
The business member responsible for workspace setup, knowledge, team membership, and overriding conversation assignments.
_Avoid_: Platform operator, conversation assignee

**Ownership transfer**:
An accepted change that makes an existing active teammate the workspace’s sole owner.
_Avoid_: Reassignment of a conversation, adding a second owner

**Workspace invitation**:
A single-use, expiring authorization from a workspace owner allowing a specified person to become a teammate after authentication.
_Avoid_: Public signup, authentication as membership

**Conversation assignee**:
The teammate currently responsible for replying to a particular conversation.
_Avoid_: Workspace owner

**Conversation**:
An ordered support exchange between one visitor and a workspace, with its own ownership and lifecycle state.
_Avoid_: Ticket, email thread

**Accepted message**:
An immutable visitor, teammate, or AI message that PopSage has durably added to a conversation.
_Avoid_: Unsent draft, delivery attempt

**Platform operator**:
The person responsible for running PopSage and controlling access to the training environment or a future business pilot. This role does not confer permission to read workspace transcripts.
_Avoid_: Workspace owner

**Visitor**:
A person seeking support through a business’s website widget, whose identity as a customer has not necessarily been verified.
_Avoid_: Authenticated customer, account holder

**Visitor session**:
An anonymous, workspace-and-origin-scoped identity that gives one browser access only to its own visitor conversations.
_Avoid_: Customer account, cross-device identity

**Teammate**:
A business support team member who handles visitor conversations.
_Avoid_: Agent when it is unclear whether the responder is human or AI

**AI support agent**:
The automated responder that answers business support questions using the business’s approved knowledge.
_Avoid_: Teammate, general-purpose assistant

**Visitor-safe knowledge**:
Business information approved for disclosure to any website visitor, including people who are not customers.
_Avoid_: Internal knowledge, staff-only knowledge

**Handoff**:
A transfer of a conversation from AI support to the human support queue; it does not mean a teammate has responded.
_Avoid_: Resolution, completed support

**Takeover**:
A teammate assuming responsibility for replying to a conversation.
_Avoid_: Handoff when referring only to joining the waiting queue

**Resolution**:
A support outcome in which the visitor’s request has been addressed, rather than merely queued, abandoned, or closed.
_Avoid_: Closure as evidence of success

**Training workspace**:
A workspace representing a fictional business, populated with approved test documents and test identities for learning and evaluation.
_Avoid_: Customer pilot, production customer

**Business pilot**:
A controlled evaluation with real business participants whose representatives validate the support answers.
_Avoid_: Training environment, fictional test scenario

**Inactivity**:
The absence of new conversational messages in a conversation; reading it or changing administrative metadata is not conversational activity.
_Avoid_: Visitor offline, unread

**Closure**:
The end of an active conversation, whether initiated by a teammate or caused by inactivity. Closure alone says nothing about whether the visitor's request was resolved.
_Avoid_: Resolution

**Abandonment**:
An outcome recorded when an unanswered conversation closes due to inactivity.
_Avoid_: Successful deflection, resolution

**Transcript expiry**:
The end of the period during which a conversation's history is available to application users.
_Avoid_: Immediate deletion from every backup

**Troubleshooting authorization**:
A workspace owner's explicit, limited permission for a named operator to inspect specified conversations for a recorded support purpose.
_Avoid_: Blanket administrator access, workspace membership
