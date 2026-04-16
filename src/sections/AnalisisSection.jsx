import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buttonInfo, colors, lightCard, panelSoft, shadows, tooltipStyle } from "../theme";

export default function AnalisisSection({
  selectedPatient,
  patients,
  onSelectPatient,
  onGoPlan,
  inputBase,
  EmptyState,
  totalKcal,
  activeMacroPlan,
  totalAssignedMeals,
  macroDistributionData,
  bodyCompositionSplitData,
  mealCoverageData,
  dailyAnalysisData,
  analysisComparisonData,
  coverageCompletionPct,
  readinessScore,
  adherenceScore,
  clinicalRiskScore,
  suggestedClinicalTemplate,
  biomarkerSummaryData,
  inferredCondition,
  latestYuhasz,
  latestMatiegka,
  weeklyRecipes,
  totalGroceryItems,
  latestCheckin,
}) {
  return (
    <div style={{ padding: 32, background: colors.pageSoft, minHeight: "100vh", color: colors.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#1e293b" }}>Analisis Nutricional</h1>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Vista analítica del paciente con distribución, composición, cobertura del plan y marcadores clínicos.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={selectedPatient?.id || ""} onChange={e => onSelectPatient(e.target.value)} style={{ ...inputBase, width: 220 }}>
            {patients.map(patient => <option key={patient.id} value={patient.id}>{patient.nombre} {patient.apellidos}</option>)}
          </select>
          <button onClick={onGoPlan} style={{ ...buttonInfo, padding: "10px 14px", fontWeight: 700, borderRadius: 10 }}>Ir al plan</button>
        </div>
      </div>
      {!selectedPatient ? <EmptyState icon="◍" title="Sin paciente" sub="Selecciona un paciente para ver su análisis nutricional." /> : (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {[
              { label: "Energía", value: `${totalKcal || 0}`, sub: "kcal objetivo", tone: "#84b7f6" },
              { label: "Proteína", value: `${Math.round(activeMacroPlan?.proteinG || 0)}g`, sub: `${Math.round(activeMacroPlan?.proteinPct || 0)}%`, tone: "#60a5fa" },
              { label: "Carbohidratos", value: `${Math.round(activeMacroPlan?.carbsG || 0)}g`, sub: `${Math.round(activeMacroPlan?.carbsPct || 0)}%`, tone: "#fb923c" },
              { label: "Grasas", value: `${Math.round(activeMacroPlan?.fatG || 0)}g`, sub: `${Math.round(activeMacroPlan?.fatPct || 0)}%`, tone: "#fbbf24" },
              { label: "Cobertura del plan", value: `${totalAssignedMeals}`, sub: "espacios llenados", tone: "#34d399" },
            ].map(item => (
              <div key={item.label} style={{ ...lightCard, padding: 16, boxShadow: shadows.card }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: item.tone }}>{item.value}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ ...lightCard, boxShadow: shadows.card }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#1e293b" }}>Distribución de macronutrientes</div>
              {macroDistributionData.length ? (
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={macroDistributionData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3}>
                        {macroDistributionData.map(item => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 12, color: "#334155" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Sin datos para distribución de macros.</div>}
            </div>
            <div style={{ ...lightCard, boxShadow: shadows.card }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#1e293b" }}>Resumen de composición corporal</div>
              {bodyCompositionSplitData.length ? (
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={bodyCompositionSplitData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3}>
                        {bodyCompositionSplitData.map(item => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 12, color: "#334155" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Sin composición corporal disponible aún.</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
            <div style={{ ...lightCard, boxShadow: shadows.card }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#1e293b" }}>Cobertura por tiempo de comida</div>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={mealCoverageData}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 7]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 12, color: "#334155" }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {mealCoverageData.map(item => <Cell key={item.name} fill={item.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ ...lightCard, boxShadow: shadows.card }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#1e293b" }}>Análisis diario del paciente</div>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={dailyAnalysisData} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <XAxis type="number" domain={[0, 5]} hide />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} width={82} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 12, color: "#334155" }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {dailyAnalysisData.map(item => <Cell key={item.name} fill={item.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
            <div style={{ ...lightCard, boxShadow: shadows.card }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#1e293b" }}>Comparación de macros vs objetivo</div>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={analysisComparisonData}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 12, color: "#334155" }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                    <Bar dataKey="actual" fill="#84b7f6" radius={[8, 8, 0, 0]} name="Actual %" />
                    <Bar dataKey="target" fill="#cbd5e1" radius={[8, 8, 0, 0]} name="Meta %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 18, padding: 18, boxShadow: "0 12px 30px rgba(148,163,184,0.10)" }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#1e293b" }}>Prioridades de cuidado</div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ ...panelSoft, padding: 12, fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                  Cobertura semanal: <strong style={{ color: "#334155" }}>{coverageCompletionPct}%</strong>
                  <br />
                  Readiness deportiva: <strong style={{ color: "#334155" }}>{readinessScore}%</strong>
                  <br />
                  Adherencia: <strong style={{ color: "#334155" }}>{adherenceScore}%</strong>
                </div>
                <div style={{ ...panelSoft, padding: 12, fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                  Riesgo cardiometabólico estimado: <strong style={{ color: clinicalRiskScore >= 60 ? "#f59e0b" : "#16a34a" }}>{clinicalRiskScore}%</strong>
                  <br />
                  Próxima acción sugerida: <strong style={{ color: "#334155" }}>{clinicalRiskScore >= 60 ? "revisar biomarcadores y cintura" : readinessScore < 60 ? "priorizar recuperación" : "progresar plan actual"}</strong>
                  <br />
                  Template clínico activo: <strong style={{ color: "#334155" }}>{suggestedClinicalTemplate.nombre}</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ ...lightCard, boxShadow: shadows.card }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#1e293b" }}>Marcadores bioquímicos</div>
              {biomarkerSummaryData.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {biomarkerSummaryData.map(item => (
                    <div key={item.name} style={{ ...panelSoft, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 800 }}>{item.name}</div>
                        <div style={{ color: item.fill, fontWeight: 900 }}>{item.value}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Referencia: {item.ref} · {item.ok ? "Dentro de rango objetivo" : "Revisar"}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Sin marcadores bioquímicos recientes.</div>}
            </div>
            <div style={{ ...lightCard, boxShadow: shadows.card }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#1e293b" }}>Interpretación clínica</div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ ...panelSoft, padding: 12, fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                  Perfil detectado: <strong style={{ color: "#334155" }}>{inferredCondition}</strong>
                  <br />
                  Objetivo: <strong style={{ color: "#334155" }}>{selectedPatient.objetivo || "General"}</strong>
                  <br />
                  Yuhasz actual: <strong style={{ color: "#334155" }}>{latestYuhasz?.grasaPct != null ? `${latestYuhasz.grasaPct}%` : "Sin dato"}</strong>
                  <br />
                  Matiegka actual: <strong style={{ color: "#334155" }}>{latestMatiegka?.muscularPct != null ? `${latestMatiegka.muscularPct}% muscular` : "Sin dato"}</strong>
                </div>
                <div style={{ ...panelSoft, padding: 12, fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                  Cobertura del plan: <strong style={{ color: "#334155" }}>{totalAssignedMeals} espacios</strong>
                  <br />
                  Recetas activas: <strong style={{ color: "#334155" }}>{weeklyRecipes.length}</strong>
                  <br />
                  Lista de compras: <strong style={{ color: "#334155" }}>{totalGroceryItems} items</strong>
                  <br />
                  Estado reciente: <strong style={{ color: "#334155" }}>{latestCheckin ? `${latestCheckin.adherencia}/5 adherencia` : "Sin check-in"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
