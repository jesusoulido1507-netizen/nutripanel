import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildInputLight, colors, compactInput, lightCard, softCard } from "../theme";

function getRowKey(row, fallback) {
  return row?.id || row?.label || fallback;
}

function mergeReferenceRows(referenceRows, savedRows, prefix) {
  const safeReferenceRows = referenceRows || [];
  const safeSavedRows = savedRows || [];
  const referenceKeySet = new Set(safeReferenceRows.map((row, index) => getRowKey(row, `${prefix}-${index}`)));

  const mergedReferenceRows = safeReferenceRows.map((row, index) => {
    const rowKey = getRowKey(row, `${prefix}-${index}`);
    const savedRow =
      safeSavedRows.find(item => item?.id === rowKey) ||
      safeSavedRows.find(item => !item?.id && item?.label === row?.label) ||
      null;

    return {
      id: rowKey,
      label: row?.label || "",
      formula: row?.formula || "",
      actual: row?.actual || "",
      objective: savedRow?.objective ?? row?.objective ?? "",
      reference: savedRow?.reference ?? row?.reference ?? "",
      note: savedRow?.note ?? row?.note ?? "",
      formulaOptions: row?.formulaOptions || null,
      formulaSelection: row?.formulaSelection || "",
      formulaControl: row?.formulaControl || "",
      custom: false,
    };
  });

  const customRows = safeSavedRows
    .filter(row => row?.custom || !referenceKeySet.has(getRowKey(row, `${prefix}-custom`)))
    .map((row, index) => ({
      id: getRowKey(row, `${prefix}-custom-${index}`),
      label: row?.label || "",
      formula: row?.formula || "",
      actual: row?.actual || "",
      objective: row?.objective || "",
      reference: row?.reference || "",
      note: row?.note || "",
      formulaOptions: row?.formulaOptions || null,
      formulaSelection: row?.formulaSelection || "",
      formulaControl: row?.formulaControl || "",
      custom: true,
    }));

  return [...mergedReferenceRows, ...customRows];
}

export default function CalculoSection({
  selectedPatient,
  patients,
  onSelectPatient,
  inputBase,
  lbl,
  activityFactor,
  setActivityFactor,
  activityLevelKey,
  setActivityLevelKey,
  saveDietCalculation,
  latestDietCalculation,
  planScope,
  setPlanScope,
  selectedDietGet,
  savingDietCalc,
  harrisBenedict,
  mifflinStJeor,
  katchMcArdle,
  schofield,
  omsFaoUnu,
  dietSex,
  dietAge,
  dietWeight,
  dietHeight,
  bodyCompositionReferenceRows,
  idealWeight,
  adjustedWeight,
  Chip,
  dietFormula,
  setDietFormula,
  dailyEnergyFormula,
  setDailyEnergyFormula,
  dietFormulas,
  selectedDietFormulaData,
  selectedLeeRace,
  leeRaceKey,
  setLeeRaceKey,
  activity,
  inferredCondition,
  bodyFatFormula,
  setBodyFatFormula,
  muscleFormula,
  setMuscleFormula,
  activeMacroPlan,
  macroEditMode,
  setMacroEditMode,
  normalizeMacroPercentages,
  convertPercentToGkg,
  convertGkgToPercent,
  macroTargets,
  setMacroField,
  totalKcal,
  macroBreakdownRows,
  nutrientQuantificationRows,
  planDurationRows,
  EmptyState,
  round1,
}) {
  const [editableBodyRows, setEditableBodyRows] = useState([]);
  const [editableNutrientRows, setEditableNutrientRows] = useState([]);
  const [editableDurationRows, setEditableDurationRows] = useState([]);

  const bodyRowsSignature = JSON.stringify(bodyCompositionReferenceRows);
  const nutrientRowsSignature = JSON.stringify(nutrientQuantificationRows);
  const durationRowsSignature = JSON.stringify(planDurationRows);
  const selectedActivityOption = bodyCompositionReferenceRows.find(row => row.formulaControl === "activity");
  const weightRow = bodyCompositionReferenceRows.find(row => row.id === "weight");
  const bodyFatRow = bodyCompositionReferenceRows.find(row => row.id === "body_fat_pct");
  const muscleRow = bodyCompositionReferenceRows.find(row => row.id === "muscle_mass");
  const basalRow = bodyCompositionReferenceRows.find(row => row.id === "basal_metabolism");
  const energyRow = bodyCompositionReferenceRows.find(row => row.id === "daily_energy");
  const macroPercentageTotal =
    Number(macroTargets?.percentage?.protein || 0) +
    Number(macroTargets?.percentage?.carbs || 0) +
    Number(macroTargets?.percentage?.fat || 0);
  const macroPercentageStatus =
    macroPercentageTotal > 100
      ? {
          tone: "#dc2626",
          background: "#fff1f2",
          border: "#fecdd3",
          label: `Distribución excedida: ${round1(macroPercentageTotal)}%`,
          note: `Te pasaste por ${round1(macroPercentageTotal - 100)}%. Ajusta uno o más macros para regresar a 100%.`,
        }
      : macroPercentageTotal < 100
        ? {
            tone: "#b45309",
            background: "#fffbeb",
            border: "#fde68a",
            label: `Distribución incompleta: ${round1(macroPercentageTotal)}%`,
            note: `Todavía faltan ${round1(100 - macroPercentageTotal)}% por asignar.`,
          }
        : {
            tone: "#15803d",
            background: "#ecfdf5",
            border: "#bbf7d0",
            label: "Distribución equilibrada: 100%",
            note: "La suma de proteínas, carbohidratos y lípidos está correctamente balanceada.",
          };

  useEffect(() => {
    setEditableBodyRows(mergeReferenceRows(bodyCompositionReferenceRows, latestDietCalculation?.custom_body_rows, "body"));
  }, [bodyRowsSignature, latestDietCalculation?.id]);

  useEffect(() => {
    const sourceRows = latestDietCalculation?.custom_nutrient_rows?.length ? latestDietCalculation.custom_nutrient_rows : nutrientQuantificationRows;
    setEditableNutrientRows((sourceRows || []).map((row, index) => ({
      id: row.id || `nutrient-${index}`,
      label: row.label || "",
      source: row.source || "",
      value: row.value ?? "",
      reference: row.reference ?? "",
      unit: row.unit || "",
      custom: false,
    })));
  }, [nutrientRowsSignature, latestDietCalculation?.id]);

  useEffect(() => {
    const sourceRows = latestDietCalculation?.custom_duration_rows?.length ? latestDietCalculation.custom_duration_rows : planDurationRows;
    setEditableDurationRows((sourceRows || []).map((row, index) => ({
      id: row.id || `duration-${index}`,
      label: row.label || "",
      value: row.value || "",
      custom: false,
    })));
  }, [durationRowsSignature, latestDietCalculation?.id]);

  function updateBodyRow(id, field, value) {
    setEditableBodyRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  }

  function updateNutrientRow(id, field, value) {
    setEditableNutrientRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  }

  function updateDurationRow(id, field, value) {
    setEditableDurationRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  }

  function addBodyRow() {
    setEditableBodyRows(prev => [
      ...prev,
      {
        id: `body-custom-${Date.now()}`,
        label: "Nuevo indicador",
        formula: "Personalizada",
        actual: "",
        objective: "",
        reference: "",
        note: "",
        custom: true,
      },
    ]);
  }

  function addNutrientRow() {
    setEditableNutrientRows(prev => [
      ...prev,
      {
        id: `nutrient-custom-${Date.now()}`,
        label: "Nuevo nutriente",
        source: "Referencia propia",
        value: "",
        reference: "",
        unit: "g",
        custom: true,
      },
    ]);
  }

  function addDurationRow() {
    setEditableDurationRows(prev => [
      ...prev,
      {
        id: `duration-custom-${Date.now()}`,
        label: "Nueva fecha",
        value: "",
        custom: true,
      },
    ]);
  }

  function removeRow(setter, id) {
    setter(prev => prev.filter(row => row.id !== id));
  }

  function handleFormulaSelection(control, value) {
    if (control === "activity") {
      setActivityLevelKey(value);
      return;
    }
    if (control === "basal") {
      setDietFormula(value);
      return;
    }
    if (control === "energy") {
      setDailyEnergyFormula(value);
      return;
    }
    if (control === "fat") {
      setBodyFatFormula(value);
      return;
    }
    if (control === "muscle") {
      setMuscleFormula(value);
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#1e293b" }}>Calculo Dietetico</h1>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>Ahora puedes cambiar fórmula de grasa corporal, masa muscular, TMB y necesidades energéticas desde la tabla principal.</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={selectedPatient?.id || ""} onChange={e => onSelectPatient(e.target.value)} style={buildInputLight(inputBase, { width: 220 })}>
            {patients.map(patient => <option key={patient.id} value={patient.id}>{patient.nombre} {patient.apellidos}</option>)}
          </select>
          <select value={leeRaceKey} onChange={e => setLeeRaceKey(e.target.value)} style={buildInputLight(inputBase, { width: 190 })}>
            <option value="general">Lee · Blanco / Hispano</option>
            <option value="afro">Lee · Afrodescendiente</option>
            <option value="asian">Lee · Asiático</option>
          </select>
          <select value={planScope} onChange={e => setPlanScope(e.target.value)} style={buildInputLight(inputBase, { width: 160 })}>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
          </select>
          <button onClick={() => saveDietCalculation({ bodyRows: editableBodyRows, nutrientRows: editableNutrientRows, durationRows: editableDurationRows, planScope })} disabled={!selectedPatient || !selectedDietGet || savingDietCalc} style={{ background: "#22c55e", color: "#052e16", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", opacity: !selectedPatient || !selectedDietGet ? 0.6 : 1 }}>{savingDietCalc ? "Guardando..." : "Guardar calculo"}</button>
        </div>
      </div>
      <div style={{ ...lightCard, marginBottom: 18, background: "linear-gradient(135deg,#f7fbff,#eefbf7)" }}>
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
          {selectedPatient ? `Paciente: ${selectedPatient.nombre} ${selectedPatient.apellidos || ""} · Sexo: ${dietSex || "sin dato"} · Edad: ${dietAge || "sin dato"} · Peso: ${dietWeight || "sin dato"} kg · Talla: ${dietHeight || "sin dato"} cm` : "Selecciona un paciente para calcular requerimientos."}
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>Se usa la consulta antropometrica más reciente. Ajusta el nivel de actividad física dentro de la tabla de cálculos. Perfil Lee: {selectedLeeRace?.label || "General"}.</div>
      </div>
      {(harrisBenedict || mifflinStJeor || katchMcArdle?.geb || schofield || omsFaoUnu) ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div style={{ ...lightCard, background: "linear-gradient(180deg,#ffffff,#f8fbff)" }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8 }}>Peso usado en cálculos</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{weightRow?.actual || "Sin dato"}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>Se toma automáticamente de la última consulta antropométrica guardada.</div>
            </div>
            <div style={{ ...lightCard, background: "linear-gradient(180deg,#ffffff,#fbfcff)" }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8 }}>Actividad física</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>{selectedActivityOption?.actual || "No definido"}</div>
              <div style={{ fontSize: 11, color: "#2563eb", marginTop: 8, fontWeight: 800 }}>{selectedActivityOption?.objective || "PAL no definido"}</div>
            </div>
            <div style={{ ...lightCard, background: "linear-gradient(180deg,#ffffff,#fefcfb)" }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8 }}>Metabolismo basal</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{basalRow?.actual || "Sin dato"}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>{basalRow?.formula || "Sin fórmula"}</div>
            </div>
            <div style={{ ...lightCard, background: "linear-gradient(180deg,#ffffff,#fefdf7)" }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8 }}>GET seleccionado</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{energyRow?.actual || "Sin dato"}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>{energyRow?.formula || "Sin fórmula"}</div>
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 20, color: "#334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Cálculos</div>
                <div style={{ fontSize: 12, color: "#64748b", maxWidth: 760 }}>Aquí centralizamos los indicadores clínicos y energéticos. Las filas base se actualizan con la última consulta, y puedes seguir agregando indicadores personalizados cuando los necesites.</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {bodyFatRow?.actual ? <span style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800 }}>Grasa {bodyFatRow.actual}</span> : null}
                {muscleRow?.actual ? <span style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800 }}>Muscular {muscleRow.actual}</span> : null}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 12px", minWidth: 960 }}>
                <thead>
                  <tr>
                    {["Indicador", "Fórmula", "Actual", "Objetivo", "Valor de referencia"].map(header => (
                      <th key={header} style={{ textAlign: "left", padding: "14px 16px", fontSize: 13, color: "#64748b", background: "#f1f5f9", fontWeight: 900 }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {editableBodyRows.map(row => (
                    <tr key={row.id}>
                      <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14, fontWeight: 900, minWidth: 220 }}>
                        {row.custom ? (
                          <input value={row.label} onChange={e => updateBodyRow(row.id, "label", e.target.value)} style={compactInput} />
                        ) : (
                          <div style={{ display: "grid", gap: 6 }}>
                            <div style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}>{row.label}</div>
                            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                              {row.formulaControl === "activity"
                                ? "Ajusta el PAL dentro de esta misma fila."
                                : row.formulaControl === "fat"
                                  ? "Puedes cambiar la ecuación para ver otra estimación."
                                  : row.formulaControl === "muscle"
                                    ? "Compara el componente muscular con distintas fórmulas."
                                    : row.formulaControl === "basal"
                                      ? "Selecciona la ecuación metabólica que prefieras."
                                      : row.formulaControl === "energy"
                                        ? "Cambia entre cálculo factorial y EER."
                                        : "Indicador base del cálculo dietético."}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>
                        {row.formulaOptions?.length ? (
                          <select
                            value={row.formulaSelection || row.formulaOptions[0]?.value || ""}
                            onChange={e => handleFormulaSelection(row.formulaControl, e.target.value)}
                            style={compactInput}
                          >
                            {row.formulaOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        ) : (
                          <input value={row.formula} onChange={e => updateBodyRow(row.id, "formula", e.target.value)} style={compactInput} />
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>
                        <input value={row.actual} onChange={e => updateBodyRow(row.id, "actual", e.target.value)} style={{ ...compactInput, marginBottom: 6, fontWeight: 800 }} />
                        <textarea value={row.note} onChange={e => updateBodyRow(row.id, "note", e.target.value)} placeholder="Observación o interpretación" rows={2} style={{ ...compactInput, fontSize: 11, resize: "vertical", minHeight: 56, paddingTop: 8 }} />
                      </td>
                      <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>
                        <input value={row.objective} onChange={e => updateBodyRow(row.id, "objective", e.target.value)} style={compactInput} />
                      </td>
                      <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>
                        <div style={{ display: "grid", gridTemplateColumns: row.custom ? "1fr auto" : "1fr", gap: 8, alignItems: "center" }}>
                          <input value={row.reference} onChange={e => updateBodyRow(row.id, "reference", e.target.value)} style={compactInput} />
                          {row.custom ? (
                            <button onClick={() => removeRow(setEditableBodyRows, row.id)} style={{ background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", borderRadius: 10, padding: "8px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>×</button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 14 }}>
              <button onClick={addBodyRow} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 10, padding: "9px 12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Agregar indicador</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={lightCard}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Peso de referencia</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Chip label="Peso ideal" value={idealWeight ? `${idealWeight} kg` : "Sin dato"} />
                <Chip label="Peso ajustado" value={adjustedWeight ? `${adjustedWeight} kg` : "Sin dato"} />
              </div>
            </div>
            <div style={lightCard}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Ecuación de referencia</div>
              <select value={dietFormula} onChange={e => setDietFormula(e.target.value)} style={buildInputLight(inputBase, { marginBottom: 12 })}>
                {dietFormulas.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Chip label="GEB base" value={selectedDietFormulaData?.geb ? `${selectedDietFormulaData.geb} kcal` : "Sin dato"} />
                <Chip label="GET usado" value={selectedDietGet ? `${selectedDietGet} kcal` : "Sin dato"} />
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {dietFormulas.map(item => (
              <div key={item.id} style={lightCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</div>
                  <span style={{ background: "#ecfdf5", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 800 }}>AF {activity.toFixed(3)}</span>
                </div>
                {item.geb ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                      <Chip label="GEB" value={`${item.geb} kcal`} />
                      <Chip label="GET" value={`${round1(item.geb * activity)} kcal`} />
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{item.note}</div>
                  </>
                ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Faltan datos de sexo, edad, peso o talla.</div>}
              </div>
            ))}
          </div>
          <div style={lightCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Distribucion de macros</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Perfil detectado: {inferredCondition} {selectedPatient?.objetivo ? `· objetivo: ${selectedPatient.objetivo}` : ""}</div>
              </div>
              <span style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 800 }}>Basado en {selectedDietFormulaData.title}</span>
            </div>
            {activeMacroPlan && (
              <>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: 18, color: "#334155", marginBottom: 14 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 14 }}>Análisis global</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Energía", actual: totalKcal, target: selectedDietGet || totalKcal, color: "#c084fc", unit: "kcal" },
                      { label: "Proteínas", actual: round1(activeMacroPlan.proteinG), target: round1((selectedDietGet || totalKcal) * 0.25 / 4), color: "#60a5fa", unit: "g" },
                      { label: "Carbohidratos", actual: round1(activeMacroPlan.carbsG), target: round1((selectedDietGet || totalKcal) * 0.45 / 4), color: "#fb923c", unit: "g" },
                      { label: "Lípidos", actual: round1(activeMacroPlan.fatG), target: round1((selectedDietGet || totalKcal) * 0.30 / 9), color: "#fbbf24", unit: "g" },
                    ].map(item => {
                      const pct = item.target ? Math.min((item.actual / item.target) * 100, 100) : 0;
                      return (
                        <div key={item.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8, fontSize: 12, fontWeight: 800 }}>
                            <span>{item.label}</span>
                            <span>{item.actual}/{round1(item.target)} {item.unit}</span>
                          </div>
                          <div style={{ height: 10, background: "#edf2f7", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: item.color, borderRadius: 999 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                    {macroBreakdownRows.map(item => (
                      <div key={`${item.key}-global`} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 900 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: item.color, fontWeight: 900 }}>{item.reference}</div>
                        </div>
                        <div style={{ width: "100%", height: 12, background: "#f8fafc", borderRadius: 999, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(item.pct, 100)}%`, height: "100%", background: item.color, borderRadius: 999 }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#64748b" }}>
                          <span>{item.pct}%</span>
                          <span>{item.grams} g</span>
                          <span>{item.gkg} g/kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {[{ id: "suggested", label: "Sugerido" }, { id: "percentage", label: "Porcentaje" }, { id: "gkg", label: "g/kg peso" }].map(mode => (
                    <button key={mode.id} onClick={() => setMacroEditMode(mode.id)} style={{ background: macroEditMode === mode.id ? "#dbeafe" : "#fff", color: macroEditMode === mode.id ? "#1d4ed8" : "#64748b", border: `1px solid ${macroEditMode === mode.id ? "#93c5fd" : "#dbe7f1"}`, borderRadius: 999, padding: "7px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{mode.label}</button>
                  ))}
                </div>
                {macroEditMode !== "gkg" ? (
                  <div style={{ background: macroPercentageStatus.background, color: macroPercentageStatus.tone, border: `1px solid ${macroPercentageStatus.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 900 }}>{macroPercentageStatus.label}</div>
                    <div style={{ fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>{macroPercentageStatus.note}</div>
                  </div>
                ) : null}
                <div style={{ ...softCard, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {macroEditMode === "suggested" ? "Puedes revisar la propuesta automática o cambiar a Porcentaje / g/kg para editar." : macroEditMode === "percentage" ? "Modifica porcentajes del GET." : `Modifica gramos por kilo con peso base ${activeMacroPlan.weightBase} kg.`}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {macroEditMode === "percentage" && <button onClick={normalizeMacroPercentages} style={{ background: "#ecfdf5", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Repartir a 100%</button>}
                        {macroEditMode === "percentage" && <button onClick={convertPercentToGkg} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Convertir a g/kg</button>}
                        {macroEditMode === "gkg" && <button onClick={convertGkgToPercent} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Convertir a %</button>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                      {["protein", "carbs", "fat"].map(field => (
                        <div key={field}>
                          <label style={lbl}>{field === "protein" ? "Proteina" : field === "carbs" ? "Carbohidratos" : "Lipidos"}</label>
                          <input value={macroTargets[macroEditMode === "suggested" ? "percentage" : macroEditMode][field]} onChange={e => setMacroField(macroEditMode === "suggested" ? "percentage" : macroEditMode, field, e.target.value)} type="number" style={buildInputLight(inputBase)} />
                          <div style={{ marginTop: 8, height: 10, background: "#fff", borderRadius: 999, border: "1px solid #dbe7f1", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${Math.min(Number(macroTargets[macroEditMode === "suggested" ? "percentage" : macroEditMode][field] || 0), (macroEditMode === "gkg" ? 6 : 100)) / (macroEditMode === "gkg" ? 6 : 100) * 100}%`,
                                height: "100%",
                                background: field === "protein" ? "#60a5fa" : field === "carbs" ? "#fb923c" : "#fbbf24",
                                borderRadius: 999,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 10 }}>
                      {macroEditMode === "gkg" ? `Kcal asignadas: ${activeMacroPlan.assignedKcal} de ${activeMacroPlan.kcalTarget}` : `Suma actual: ${round1(macroPercentageTotal)}%`}
                    </div>
                  </div>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: 18, color: "#334155", marginTop: 6 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#c084fc", marginBottom: 16 }}>Distribución de los macronutrientes</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 12px", minWidth: 940 }}>
                      <thead>
                        <tr>
                          {["Macronutriente", "Porcentaje", "Cantidad total", "Cantidad en g/kg de peso", "Valor de referencia"].map(header => (
                            <th key={header} style={{ textAlign: "left", padding: "14px 16px", fontSize: 13, color: "#64748b", background: "#f5eefe", fontWeight: 900 }}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {macroBreakdownRows.map(item => (
                          <tr key={item.key}>
                            <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14, fontWeight: 900 }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                                <span style={{ width: 12, height: 12, borderRadius: "50%", border: `3px solid ${item.color}`, display: "inline-block" }} />
                                {item.label}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                                <span style={{ minWidth: 56, border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 10px", textAlign: "center", fontWeight: 800 }}>{item.pct} %</span>
                                <div style={{ width: 76, height: 34, background: "#f8fafc", borderRadius: 999, border: "1px solid #e2e8f0", padding: 3 }}>
                                  <div style={{ width: `${Math.min(item.pct, 100)}%`, height: "100%", borderRadius: 999, background: item.color }} />
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>{item.grams} g</td>
                            <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>{item.gkg} g/kg</td>
                            <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>{item.reference}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16, marginTop: 18 }}>
                    <div style={{ display: "grid", gap: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                        {macroBreakdownRows.map(item => (
                          <div key={item.key} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
                            <div style={{ width: "100%", height: 110 }}>
                              <ResponsiveContainer>
                                <PieChart>
                                  <Pie data={item.donut} dataKey="value" nameKey="name" innerRadius={22} outerRadius={36} paddingAngle={2}>
                                    {item.donut.map((slice, index) => <Cell key={`${item.key}-${index}`} fill={slice.color} />)}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "#475569" }}>{item.label}</div>
                            <div style={{ textAlign: "center", fontSize: 11, color: item.color, fontWeight: 900, marginTop: 4 }}>{item.pct}%</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                        {macroBreakdownRows.map(item => (
                          <div key={`${item.key}-chart`} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 900, color: item.color, marginBottom: 10 }}>{item.label}</div>
                            <div style={{ width: "100%", height: 120 }}>
                              <ResponsiveContainer>
                                <BarChart data={[
                                  { name: "%", value: item.pct, fill: item.color },
                                  { name: "g/kg", value: item.gkg, fill: item.color },
                                ]}>
                                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, color: "#334155" }} />
                                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {[0, 1].map(index => <Cell key={`${item.key}-bar-${index}`} fill={item.color} />)}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#14b8a6", marginBottom: 12 }}>Cuantificación de nutrientes</div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", minWidth: 420 }}>
                          <thead>
                            <tr>
                              {["Nutriente", "Fuente", "Cantidad", "Valor de referencia"].map(header => (
                                <th key={header} style={{ textAlign: "left", padding: "12px 14px", fontSize: 12, color: "#64748b", background: "#def7f3", fontWeight: 900 }}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {editableNutrientRows.map(item => (
                              <tr key={item.id}>
                                <td style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 14, fontWeight: 800 }}><input value={item.label} onChange={e => updateNutrientRow(item.id, "label", e.target.value)} style={compactInput} /></td>
                                <td style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 13 }}><input value={item.source} onChange={e => updateNutrientRow(item.id, "source", e.target.value)} style={compactInput} /></td>
                                <td style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 13 }}>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 8 }}>
                                    <input value={item.value} onChange={e => updateNutrientRow(item.id, "value", e.target.value)} style={compactInput} />
                                    <input value={item.unit} onChange={e => updateNutrientRow(item.id, "unit", e.target.value)} style={compactInput} />
                                  </div>
                                </td>
                                <td style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 13 }}>
                                  <div style={{ display: "grid", gridTemplateColumns: item.custom ? "1fr auto" : "1fr", gap: 8, alignItems: "center" }}>
                                    <input value={item.reference} onChange={e => updateNutrientRow(item.id, "reference", e.target.value)} style={compactInput} />
                                    {item.custom ? (
                                      <button onClick={() => removeRow(setEditableNutrientRows, item.id)} style={{ background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", borderRadius: 10, padding: "8px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>×</button>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <button onClick={addNutrientRow} style={{ background: "#ecfeff", color: "#0f766e", border: "1px solid #a5f3fc", borderRadius: 10, padding: "9px 12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Agregar nutriente</button>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#fb923c", margin: "18px 0 12px" }}>Duración</div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", minWidth: 420 }}>
                          <thead>
                            <tr>
                              {["Campo", "Valor"].map(header => (
                                <th key={header} style={{ textAlign: "left", padding: "12px 14px", fontSize: 12, color: "#64748b", background: "#fdebdc", fontWeight: 900 }}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {editableDurationRows.map(item => (
                              <tr key={item.id}>
                                <td style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 700 }}>
                                  <input value={item.label} onChange={e => updateDurationRow(item.id, "label", e.target.value)} style={compactInput} />
                                </td>
                                <td style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 700 }}>
                                  <div style={{ display: "grid", gridTemplateColumns: item.custom ? "1fr auto" : "1fr", gap: 8, alignItems: "center" }}>
                                    <input value={item.value} onChange={e => updateDurationRow(item.id, "value", e.target.value)} style={compactInput} />
                                    {item.custom ? (
                                      <button onClick={() => removeRow(setEditableDurationRows, item.id)} style={{ background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", borderRadius: 10, padding: "8px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>×</button>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <button onClick={addDurationRow} style={{ background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa", borderRadius: 10, padding: "9px 12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Agregar campo de duración</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : <EmptyState icon="◍" title="Sin datos suficientes" sub="Necesitas una consulta con peso, talla, edad y sexo." />}
    </div>
  );
}
