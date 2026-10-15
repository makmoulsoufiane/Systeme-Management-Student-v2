# Staff portal design

Campus gives students, teachers, groups, exams, and scores equal, persistent navigation. Each resource begins with a searchable list and one primary creation action. Row links open details; explicit edit and delete buttons expose supported actions. The authenticated staff identity and sign-out action remain in the shell. Counts describe loaded records rather than invented metrics.

## Layout and visual system

Desktop uses a 246px navigation rail, a quiet workspace header, and spacious content. A page heading explains the current job; a solid white panel contains search and the resource table. Below 760px, navigation becomes an expandable header, content padding narrows, and tables scroll horizontally to preserve fields.

The system uses the platform font, dark slate text (#25334b), muted text (#667389), blue actions (#2859cf), and pale neutral backgrounds. Controls have 44px minimum touch targets. Panels use 16px radii, fine borders, and shallow shadows. Blur is reserved for navigation and modal backdrops; tables and forms remain opaque. Liquid Glass provides visual inspiration without Apple assets or branding. Opaque fallbacks and reduced-transparency and reduced-motion preferences are supported.

## Component contract

- `AppShell({ user, onLogout, children })`: navigation, mobile toggle, skip link, workspace landmarks, account.
- `Icon({ name, size, className })`: decorative SVG. Accessible names belong to the containing controls.
- `.page-heading`, `.eyebrow`, `.page-title`, `.page-description`: page hierarchy.
- `.button`, `.button-primary`, `.button-secondary`, `.button-danger`, `.button-icon`: actions with visible focus.
- `.panel`, `.toolbar`, `.search-field`, `.table-wrap`, `.data-table`: readable resource lists.
- `.table-person`, `.table-primary`, `.table-secondary`, `.avatar`, `.badge`, `.row-actions`: record identity and metadata.
- `.field`, `.form-grid`, `.field-error`, `.field-hint`, `.form-actions`: labeled forms and validation. `.field-full` spans columns.
- `.detail-grid`, `.detail-item`: definition-list details.
- `.empty-state`, `.loading-state`, `.error-banner`, `.status-message`: explicit states. Empty states explain creation; recoverable failures retain input.
- `dialog.modal`, `.modal-header`, `.modal-body`, `.modal-footer`: native dialogs. Callers supply accessible naming, `showModal`, Escape handling, submission state, and focus restoration. Destructive actions need confirmation.
- `.login-page`, `.login-card`, `.login-brand`: focused staff sign-in.

## Accessibility and verification

Navigation uses links with current-page semantics; the mobile toggle exposes expanded state and the controlled region. The shell has a keyboard skip link and a single main landmark. Form owners provide labels, errors, autocomplete, and announced asynchronous results. Table owners provide header cells and accessible icon-action names.

Rendered review must inspect desktop and mobile layout, contrast, keyboard navigation and modal focus, search/no-results, empty data, loading, auth failures, validation, and successful mutations. This document describes intended behavior; source inspection or a build alone does not establish browser accessibility compliance. The task agent records actual verification.

## Rendered review — 2026-10-14

Inspected browser screenshots of desktop sign-in, student list, and student creation, plus mobile sign-in and student list. Desktop screens have clear heading/action hierarchy, consistent panel spacing, visible focus, readable form labels, and no observed clipping or overlap. Mobile sign-in wraps comfortably without clipped content.

The initial mobile list screenshot revealed document-wide horizontal overflow beyond its otherwise correctly constrained table. The absolutely positioned, visually hidden last-column header needed a containing block inside the scroll viewport. Added `position: relative` to `.table-wrap`. The refreshed 390px-wide mobile screenshot now fits the viewport, and the browser document-width assertion passed. The table remains horizontally scrollable within its panel.

Also inspected the mobile student form: fields stack cleanly in one column, labels and values remain readable, focus is visible, and cancel/save actions fit within the panel. No remaining layout defects were observed in the six reviewed login, list, and form screenshots across desktop and mobile. The task agent separately confirmed the desktop dialog focus-restoration test passed; functional browser test evidence is tracked in the backlog.

## Login refinement — 2026-10-14

The requested Liquid Glass treatment is isolated in `features/auth/presentation/login.css`
under `.glass-login`. The centered sign-in flow retains its labels, copy, error
feedback, and submission behavior. A translucent surface with bright inset edges
sits above soft blue/peach light and gently floating glass shapes. Hover feedback
adds a reflected highlight to the primary button; entrance motion runs once.

Ambient motion has an explicit pause/resume control and turns off with reduced
motion. Reduced transparency and unsupported backdrop filtering use an opaque
card. Decorative elements are hidden from assistive technology and ignore pointer
events. Inputs use 16px text on mobile. Reviewed the refreshed desktop/mobile
screenshots and verified no page overflow at 390px and 320px.

## Role workspaces — 2026-10-15

The existing readable system typography and glass login are retained. Admin,
teacher and student sidebars expose their supported destinations. Dashboard cards
link directly to role-specific tasks; no invented statistics are displayed.

Admin account lists distinguish login usernames, linked school records, active
status and required password changes. Create-account forms link an existing record;
missing records provide a direct creation link. Deactivation uses a confirmation
that explains record preservation. Teacher/student lists and details omit write
controls. First-login password change provides persistent labels and validation.

Reviewed the rendered desktop teacher dashboard, mobile student dashboard and
desktop account list: navigation, text hierarchy, wrapping and action controls
remain readable. Browser verification is recorded separately in the test report.

### Teacher URL navigation
Teacher dashboard, sidebar and record links include the stable account ID. Existing bookmarks redirect with query/hash preserved. A mismatched ID displays the existing access-denied page with a link to the signed-in teacher’s workspace. Visual layout is unchanged.

### Teacher exam and score entry
Class exams and Student scores now have Add buttons and creation empty states. Teacher forms omit teacher/administrator selectors. Exam group and score exam are required; options come from scoped endpoints. Missing class/student options direct teachers to their administrator; missing exams instruct them to create an exam first.
