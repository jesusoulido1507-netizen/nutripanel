export const colors = {
  page: "#ffffff",
  pageSoft: "#f6fafc",
  surface: "#ffffff",
  surfaceSoft: "#f8fbfe",
  border: "#dbe7f1",
  borderInfo: "#bfdbfe",
  borderSuccess: "#bbf7d0",
  borderWarning: "#fed7aa",
  borderDanger: "#fecaca",
  text: "#334155",
  textStrong: "#1e293b",
  textMuted: "#64748b",
  infoBg: "#eff6ff",
  infoText: "#2563eb",
  successBg: "#eefbf3",
  successText: "#15803d",
  warningBg: "#fff7ed",
  warningText: "#c2410c",
  dangerBg: "#fef2f2",
  dangerText: "#dc2626",
};

export const shadows = {
  card: "0 12px 30px rgba(148,163,184,0.10)",
  cardLg: "0 16px 40px rgba(148,163,184,0.12)",
  active: "0 10px 24px rgba(148,163,184,0.10)",
};

export const lightCard = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 18,
  padding: 18,
  color: colors.text,
};

export const softCard = {
  background: colors.surfaceSoft,
  border: `1px solid ${colors.border}`,
  borderRadius: 14,
  padding: 14,
  color: colors.text,
};

export const buildCard = (radius = 14, extra = {}) => ({
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius,
  color: colors.text,
  ...extra,
});

export const panelSoft = {
  background: colors.surfaceSoft,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
};

export const buildSoftPanel = (radius = 12, extra = {}) => ({
  ...panelSoft,
  borderRadius: radius,
  ...extra,
});

export const tooltipStyle = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  color: colors.text,
};

export const buttonNeutral = {
  background: colors.surface,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const buttonInfo = {
  background: colors.infoBg,
  color: colors.infoText,
  border: `1px solid ${colors.borderInfo}`,
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const buttonSuccessSoft = {
  background: colors.successBg,
  color: colors.successText,
  border: `1px solid ${colors.borderSuccess}`,
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const buttonWarningSoft = {
  background: colors.warningBg,
  color: colors.warningText,
  border: `1px solid ${colors.borderWarning}`,
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const buttonDangerSoft = {
  background: colors.dangerBg,
  color: colors.dangerText,
  border: `1px solid ${colors.borderDanger}`,
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const tagInfo = {
  background: colors.infoBg,
  border: `1px solid ${colors.borderInfo}`,
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 10,
  color: colors.infoText,
  fontWeight: 700,
};

export const sectionTitleWrap = {
  marginBottom: 12,
  marginTop: 6,
};

export const sectionTitleMain = {
  fontSize: 12,
  fontWeight: 800,
  color: "#475569",
  letterSpacing: 0.3,
};

export const sectionTitleSub = {
  fontSize: 11,
  color: colors.textMuted,
  marginTop: 4,
};

export const chipWrap = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: "6px 12px",
  display: "flex",
  gap: 6,
  alignItems: "center",
};

export const chipLabel = {
  fontSize: 10,
  color: colors.textMuted,
  fontWeight: 700,
};

export const chipValue = {
  fontSize: 12,
  color: colors.text,
  fontWeight: 700,
};

export const tableBase = {
  width: "100%",
  borderCollapse: "collapse",
};

export const tableHeadRow = {
  background: colors.surfaceSoft,
};

export const tableHeadCell = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 11,
  color: colors.textMuted,
};

export const tableBodyRow = {
  borderTop: `1px solid ${colors.border}`,
};

export const buildInputLight = (base, extra = {}) => ({
  ...base,
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  color: colors.text,
  ...extra,
});

export const compactInput = {
  width: "100%",
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: "8px 10px",
  fontSize: 13,
  color: colors.text,
  background: colors.surface,
  fontFamily: "inherit",
  boxSizing: "border-box",
};
