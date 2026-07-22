/* ============================================================
   CLIENT OFFBOARDING CHECKLIST — DATA
   Mirrors the "Offboarding Checklist" at the end of the Client
   Offboarding SOP (SOP Wiki > Client Journey).
   ============================================================ */

const OFFBOARDING_CATEGORIES = [
  {
    category: "Confirmation",
    items: [
      { id: "ob-confirmed-writing", label: "Offboarding confirmed in writing with client" },
      { id: "ob-crm-status", label: "Deal Onboarding Status updated to Offboarding in CRM" },
      { id: "ob-termination-agreement", label: "Early Termination Agreement issued if applicable" }
    ]
  },
  {
    category: "Final Audits & Delivery",
    items: [
      { id: "ob-final-audits", label: "Final Hub audits run and scores exported" },
      { id: "ob-deliverables-done", label: "All in-flight deliverables completed or cancelled — client notified" },
      { id: "ob-qc-passed", label: "All remaining deliverables passed QC before delivery" }
    ]
  },
  {
    category: "Access Handoff",
    items: [
      { id: "ob-access-transferred", label: "All platform access transferred back to client" },
      { id: "ob-access-removed", label: "All Revital team access removed from client platforms" },
      { id: "ob-access-log-updated", label: "All access removals logged in Access & Logins Tracker" },
      { id: "ob-hub-profile-removed", label: "Client Hub profile removed" }
    ]
  },
  {
    category: "Final Reporting",
    items: [
      { id: "ob-final-report-built", label: "Final performance report built, QC passed, and delivered" },
      { id: "ob-report-uploaded", label: "Report uploaded to client portal" }
    ]
  },
  {
    category: "CRM & Workspace Cleanup",
    items: [
      { id: "ob-deal-moved", label: "Deal moved to Closed Won or Inactive in CRM" },
      { id: "ob-inactive-reason", label: "Inactive Reason logged" },
      { id: "ob-folder-archived", label: "Client delivery folder archived in ClickUp" },
      { id: "ob-shared-links-archived", label: "All Master Shared Links Tracker tasks set to Archived status" },
      { id: "ob-tag-deleted", label: "Client ClickUp tag deleted from workspace Settings → Tags" }
    ]
  }
];
