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
import { buttonInfo, buttonSuccessSoft, lightCard, softCard, tagInfo, tooltipStyle } from "../theme";

export default function PlanSection(props) {
  const {
    selectedPatient,
    patients,
    setSelectedPatient,
    inputBase,
    autoGenerateWeeklyPlan,
    exportWeeklyPlanPdf,
    saveWeeklyPlan,
    loadingWeeklyPlan,
    totalKcal,
    activeMacroPlan,
    macroDistributionData,
    dailyAnalysisData,
    totalAssignedMeals,
    weeklyRecipes,
    totalGroceryItems,
    upcomingAgenda,
    inferredCondition,
    suggestedClinicalTemplate,
    preparationCategory,
    setPreparationCategory,
    recipeSearch,
    setRecipeSearch,
    recipeMealTypeFilter,
    setRecipeMealTypeFilter,
    recipeDishTypeFilter,
    setRecipeDishTypeFilter,
    recipeCuisineTypeFilter,
    setRecipeCuisineTypeFilter,
    recipeClinicalFilter,
    setRecipeClinicalFilter,
    recipeDifficultyFilter,
    setRecipeDifficultyFilter,
    recipeGoalFilter,
    setRecipeGoalFilter,
    recipeViewMode,
    setRecipeViewMode,
    showFavoriteRecipesOnly,
    setShowFavoriteRecipesOnly,
    recommendedDishes,
    clinicalTemplates,
    applyClinicalTemplate,
    preparationTemplates,
    draggedPreparation,
    setDraggedPreparation,
    applyTemplateToWeek,
    recipeCatalog,
    filteredWeeklyRecipes,
    filteredRecipeLibrary,
    favoriteRecipeIds,
    toggleFavoriteRecipe,
    applyRecipeToWeek,
    applyRecipeToCurrentDay,
    groceryList,
    mealPlannerData,
    allFoods,
    mealQuickAdd,
    setMealQuickAdd,
    addFoodToMealFromQuickSelect,
    moveFoodWithinMeal,
    removeFoodFromMeal,
    setSection,
    mealNotes,
    setMealNotes,
    round1,
    globalMealSummary,
    globalMealTarget,
    mealDonutData,
    nutrientReferenceRows,
    duplicateDayToWeek,
    clearWeeklyPlan,
    weekDays,
    weeklyMealSlots,
    weeklyPlan,
    getRecipeCompatibleSlots,
    normalizeTemplateSlot,
    assignPreparationToCell,
    updateWeeklyPlanCell,
    recipeMealTypeOptions,
    recipeDishTypeOptions,
    recipeCuisineOptions,
    clinicalLabelOptions,
    recipeDifficultyOptions,
    recipeGoalOptions,
  } = props;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "#1e293b" }}>Plan Alimenticio</h1>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>Generador visual semanal con una paleta clara, limpia y más parecida a una app clínica moderna.</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={selectedPatient?.id || ""} onChange={e => {
            const patient = patients.find(item => String(item.id) === e.target.value);
            if (patient) setSelectedPatient(patient);
          }} style={{ ...inputBase, width: 220, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>
            {patients.map(patient => <option key={patient.id} value={patient.id}>{patient.nombre} {patient.apellidos}</option>)}
          </select>
          <button onClick={autoGenerateWeeklyPlan} style={{ ...buttonSuccessSoft, padding: "10px 14px" }}>Autogenerar</button>
          <button onClick={exportWeeklyPlanPdf} style={{ ...buttonInfo, padding: "10px 14px", borderRadius: 10 }}>Exportar PDF</button>
          <button onClick={saveWeeklyPlan} disabled={loadingWeeklyPlan} style={{ background: "#22c55e", color: "#052e16", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", opacity: loadingWeeklyPlan ? 0.7 : 1 }}>{loadingWeeklyPlan ? "Guardando..." : "Guardar Plan"}</button>
        </div>
      </div>

      <div style={{ ...lightCard, display: "flex", gap: 24, alignItems: "center", marginBottom: 20, flexWrap: "wrap", background: "linear-gradient(135deg,#f7fbff,#eefbf7)" }}>
        <div>
          <div style={{ fontSize: 38, fontWeight: 900, color: "#16a34a" }}>{totalKcal}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>kcal totales</div>
        </div>
        {[{ label: "Proteína", val: `${Math.round(activeMacroPlan?.proteinG || 0)}g`, pct: `${Math.round(activeMacroPlan?.proteinPct || 0)}%`, c: "#60a5fa" }, { label: "Carbohidratos", val: `${Math.round(activeMacroPlan?.carbsG || 0)}g`, pct: `${Math.round(activeMacroPlan?.carbsPct || 0)}%`, c: "#fb923c" }, { label: "Grasas", val: `${Math.round(activeMacroPlan?.fatG || 0)}g`, pct: `${Math.round(activeMacroPlan?.fatPct || 0)}%`, c: "#fbbf24" }].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", border: `3px solid ${item.c}`, color: item.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, background: "#fff" }}>{item.pct}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{item.val}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={lightCard}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Distribución del plan</div>
          {macroDistributionData.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "center" }}>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={macroDistributionData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={3}>
                      {macroDistributionData.map(item => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {macroDistributionData.map(item => (
                  <div key={item.name} style={softCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800 }}>
                      <span>{item.name}</span>
                      <span style={{ color: item.color }}>{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ fontSize: 12, color: "#64748b" }}>Sin macros suficientes para graficar.</div>}
        </div>
        <div style={lightCard}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Análisis diario del paciente</div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={dailyAnalysisData}>
                <CartesianGrid stroke="#dbe7f1" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {dailyAnalysisData.map(item => <Cell key={item.name} fill={item.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Comidas asignadas", value: totalAssignedMeals, sub: `de ${weekDays.length * weeklyMealSlots.length} espacios semanales` },
          { label: "Recetas activas", value: weeklyRecipes.length, sub: "recetas distintas en la semana" },
          { label: "Items de compra", value: totalGroceryItems, sub: "productos agrupados para compra" },
          { label: "Próximo recordatorio", value: upcomingAgenda[0]?.fecha || "Sin fecha", sub: upcomingAgenda[0]?.titulo || "Sin recordatorios pendientes" },
        ].map(item => (
          <div key={item.label} style={lightCard}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#1e293b" }}>{item.value}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ ...lightCard, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 16 }}>
          <div style={softCard}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Lectura clínica de la semana</div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
              Perfil: {inferredCondition}. Template sugerido: {suggestedClinicalTemplate.nombre}. La semana está pensada para mantener adherencia con opciones repetibles, compras simples y ajustes deportivos cuando aplica.
            </div>
          </div>
          <div style={softCard}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Macros objetivo</div>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8 }}>
              Proteína: {Math.round(activeMacroPlan?.proteinG || 0)} g
              <br />
              Carbohidratos: {Math.round(activeMacroPlan?.carbsG || 0)} g
              <br />
              Lípidos: {Math.round(activeMacroPlan?.fatG || 0)} g
            </div>
          </div>
          <div style={softCard}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Adherencia esperada</div>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8 }}>
              Recetas distintas: {weeklyRecipes.length}
              <br />
              Preparaciones visibles: {preparationTemplates.filter(item => item.categoria === preparationCategory).length}
              <br />
              Lista de compras: {totalGroceryItems} items
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...lightCard, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr repeat(6, minmax(0, 1fr))", gap: 12, marginBottom: 14 }}>
          <input value={recipeSearch} onChange={e => setRecipeSearch(e.target.value)} placeholder="Buscar por receta, ingrediente, tag o condición..." style={{ ...inputBase, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }} />
          <select value={recipeMealTypeFilter} onChange={e => setRecipeMealTypeFilter(e.target.value)} style={{ ...inputBase, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>{recipeMealTypeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={recipeDishTypeFilter} onChange={e => setRecipeDishTypeFilter(e.target.value)} style={{ ...inputBase, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>{recipeDishTypeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={recipeCuisineTypeFilter} onChange={e => setRecipeCuisineTypeFilter(e.target.value)} style={{ ...inputBase, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>{recipeCuisineOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={recipeClinicalFilter} onChange={e => setRecipeClinicalFilter(e.target.value)} style={{ ...inputBase, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>{clinicalLabelOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={recipeDifficultyFilter} onChange={e => setRecipeDifficultyFilter(e.target.value)} style={{ ...inputBase, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>{recipeDifficultyOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={recipeGoalFilter} onChange={e => setRecipeGoalFilter(e.target.value)} style={{ ...inputBase, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>{recipeGoalOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Recomendador clínico-deportivo</div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>Perfil detectado: {selectedPatient ? inferredCondition : "sin paciente"} {selectedPatient?.objetivo ? `· objetivo: ${selectedPatient.objetivo}` : ""}<br />Filtros tipo Edamam: meal type, dish type, cuisine y etiquetas clínicas.</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowFavoriteRecipesOnly(!showFavoriteRecipesOnly)} style={{ background: showFavoriteRecipesOnly ? "#fef3c7" : "#fff", color: showFavoriteRecipesOnly ? "#92400e" : "#64748b", border: "1px solid #fde68a", borderRadius: 999, padding: "8px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              {showFavoriteRecipesOnly ? "Mostrando favoritos" : "Solo favoritos"}
            </button>
            <div style={{ fontSize: 12, color: "#64748b" }}>{recommendedDishes.length} sugerencias · {filteredRecipeLibrary.length}/{recipeCatalog.length} recetas</div>
          </div>
        </div>
        {recommendedDishes.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
            {recommendedDishes.map(dish => (
              <div key={dish.id} style={softCard}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{dish.name}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>{dish.category} · {dish.mealType} · {dish.dishType} · {dish.cuisineType}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {[
                    ["Kcal", String(dish.kcal)],
                    ["Prot", `${dish.protein}g`],
                    ["CHO", `${dish.carbs}g`],
                    ["Grasa", `${dish.fat}g`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 10, padding: "8px 10px", fontSize: 11, fontWeight: 800 }}>
                      {label}: <span style={{ color: "#2563eb" }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {dish.healthLabels.slice(0, 3).map(label => <span key={label} style={{ background: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: 999, padding: "4px 8px", fontSize: 10, color: "#15803d", fontWeight: 700 }}>{label}</span>)}
                </div>
                <div style={{ fontSize: 11, color: "#3b82f6" }}>{dish.tags.join(" · ") || "Sin tags"}</div>
              </div>
            ))}
          </div>
        ) : <div style={{ fontSize: 12, color: "#64748b" }}>No hay sugerencias con los filtros actuales.</div>}
      </div>

      <div style={{ ...lightCard, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Templates clínicos</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Plantillas rápidas inspiradas en el perfil detectado.</div>
          </div>
          <div style={{ fontSize: 12, color: "#16a34a" }}>Sugerido: {suggestedClinicalTemplate.nombre}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {clinicalTemplates.map(template => (
            <div key={template.id} style={{ ...(template.id === suggestedClinicalTemplate.id ? { background: "#ecfdf5", border: "1px solid #bbf7d0" } : softCard), ...(template.id === suggestedClinicalTemplate.id ? { borderRadius: 14, padding: 14 } : {}) }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{template.nombre}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>{template.descripcion}</div>
              <button onClick={() => applyClinicalTemplate(template)} style={{ background: "#22c55e", color: "#052e16", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Aplicar template</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...lightCard, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Preparaciones semanales</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Usa una preparación para llenar automáticamente el tiempo correspondiente en toda la semana o arrástrala al generador visual.</div>
          </div>
          <select value={preparationCategory} onChange={e => setPreparationCategory(e.target.value)} style={{ ...inputBase, width: 220, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>
            <option value="desayunos_mexicanos">Desayunos mexicanos</option>
            <option value="comidas_mexicanas">Comidas mexicanas</option>
            <option value="colaciones">Colaciones</option>
            <option value="cenas_ligeras">Cenas ligeras</option>
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {preparationTemplates.filter(item => item.categoria === preparationCategory).map(template => (
            <div
              key={template.id}
              draggable
              onDragStart={() => setDraggedPreparation(template.nombre)}
              onDragEnd={() => setDraggedPreparation("")}
              style={{ ...softCard, border: draggedPreparation === template.nombre ? "1px solid #86efac" : softCard.border, cursor: "grab" }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{template.nombre}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>{template.nota}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {template.alimentos.slice(0, 4).map(item => <span key={item} style={tagInfo}>{item}</span>)}
              </div>
              <button onClick={() => applyTemplateToWeek(template)} style={{ background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Aplicar a la semana</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={lightCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Biblioteca de recetas</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Recetario estructurado con búsqueda, favoritos, filtros clínicos y aplicación directa al plan.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setRecipeViewMode("tarjetas")} style={{ background: recipeViewMode === "tarjetas" ? "#dbeafe" : "#fff", color: recipeViewMode === "tarjetas" ? "#1d4ed8" : "#64748b", border: "1px solid #bfdbfe", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Tarjetas</button>
              <button onClick={() => setRecipeViewMode("resumen")} style={{ background: recipeViewMode === "resumen" ? "#dbeafe" : "#fff", color: recipeViewMode === "resumen" ? "#1d4ed8" : "#64748b", border: "1px solid #bfdbfe", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Resumen</button>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12, maxHeight: 440, overflowY: "auto" }}>
            {filteredRecipeLibrary.length ? (
              recipeViewMode === "tarjetas" ? filteredRecipeLibrary.map(recipe => (
                <div key={recipe.id} style={softCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{recipe.nombre}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{recipe.descripcion}</div>
                    </div>
                    <button onClick={() => toggleFavoriteRecipe(recipe)} style={{ background: favoriteRecipeIds.includes(String(recipe.id)) ? "#fef3c7" : "#fff", color: favoriteRecipeIds.includes(String(recipe.id)) ? "#92400e" : "#64748b", border: "1px solid #fde68a", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                      {favoriteRecipeIds.includes(String(recipe.id)) ? "★ Favorita" : "☆ Favorita"}
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: "#3b82f6", marginBottom: 8 }}>{recipe.mealType} · {recipe.dishType} · {recipe.cuisineType} · {recipe.difficulty}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {recipe.healthLabels.slice(0, 3).map(label => <span key={label} style={{ background: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: 999, padding: "4px 8px", fontSize: 10, color: "#15803d", fontWeight: 700 }}>{label}</span>)}
                    {recipe.objetivo.slice(0, 2).map(label => <span key={label} style={tagInfo}>{label}</span>)}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Diet labels: {recipe.dietLabels.join(" · ") || "Sin especificar"} · Alergenos: {recipe.allergenLabels.join(" · ") || "Sin especificar"}</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}><strong>Ingredientes:</strong> {recipe.ingredientes.map(item => `${item.item} (${item.cantidad})`).join(" · ")}</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}><strong>Preparación:</strong> {recipe.pasos.join(" ")}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}><strong>Sustituciones:</strong> {recipe.sustituciones?.length ? recipe.sustituciones.map(item => `${item.original || "Alternativa"}: ${(item.opciones || []).join(", ")}`).join(" · ") : "Sin sustituciones cargadas"}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    {["desayuno", "colacion_matutina", "comida", "colacion_vespertina", "cena"].filter(slot => getRecipeCompatibleSlots(recipe).includes(slot)).map(slot => (
                      <button key={slot} onClick={() => applyRecipeToWeek(recipe, slot)} style={{ background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                        Semana · {slot}
                      </button>
                    ))}
                    <button onClick={() => applyRecipeToCurrentDay(recipe)} style={{ background: "#ecfdf5", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                      Asignar hoy
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                    <thead>
                      <tr style={{ background: "#f8fbfe" }}>
                        {["Receta", "Tipo", "Objetivo", "Prep", "Acciones"].map(header => (
                          <th key={header} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 800 }}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecipeLibrary.map(recipe => (
                        <tr key={recipe.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: 800, fontSize: 12 }}>{recipe.nombre}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{recipe.descripcion}</div>
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 11, color: "#475569" }}>{recipe.mealType} · {recipe.dishType}</td>
                          <td style={{ padding: "10px 12px", fontSize: 11, color: "#475569" }}>{recipe.objetivo.join(" · ") || "General"}</td>
                          <td style={{ padding: "10px 12px", fontSize: 11, color: "#475569" }}>{recipe.tiempoPrep} min · {recipe.difficulty}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button onClick={() => toggleFavoriteRecipe(recipe)} style={{ background: favoriteRecipeIds.includes(String(recipe.id)) ? "#fef3c7" : "#fff", color: favoriteRecipeIds.includes(String(recipe.id)) ? "#92400e" : "#64748b", border: "1px solid #fde68a", borderRadius: 999, padding: "5px 8px", fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                {favoriteRecipeIds.includes(String(recipe.id)) ? "★" : "☆"}
                              </button>
                              <button onClick={() => applyRecipeToCurrentDay(recipe)} style={{ background: "#ecfdf5", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 999, padding: "5px 8px", fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Hoy</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : <div style={{ fontSize: 12, color: "#64748b" }}>Ajusta filtros o agrega preparaciones al plan.</div>}
          </div>
        </div>
        <div style={lightCard}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Lista de compras automática</div>
          <div style={{ display: "grid", gap: 12, maxHeight: 380, overflowY: "auto" }}>
            {groceryList.length ? groceryList.map(group => (
              <div key={group.grupo} style={softCard}>
                <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 8, textTransform: "capitalize" }}>{group.grupo}</div>
                <div style={{ display: "grid", gap: 6 }}>{group.items.map(item => <div key={item} style={{ fontSize: 12, color: "#475569" }}>{item}</div>)}</div>
              </div>
            )) : <div style={{ fontSize: 12, color: "#64748b" }}>La lista se genera con las recetas seleccionadas.</div>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr", gap: 18, marginBottom: 20 }}>
        <div style={{ display: "grid", gap: 16 }}>
          {mealPlannerData.map((slot, slotIndex) => {
            const quickOptions = allFoods.filter(food => food.tiempos?.includes(slot.id)).slice(0, 24);
            return (
              <div key={slot.id} style={lightCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#64748b" }}>{["8:30", "11:00", "14:30", "18:00", "21:00"][slotIndex] || "—"}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#1e293b" }}>{slot.label}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {slot.foods.map((food, index) => (
                    <div key={`${slot.id}-${food.name}-${index}`} style={{ display: "grid", gridTemplateColumns: "38px 1fr auto", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 900, background: "#f8fafc", cursor: "grab" }}>⋮</div>
                      <div style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: "#334155" }}>
                        {food.name} ({food.porcion || "1 porción"})
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => moveFoodWithinMeal(slot.id, index, -1)} style={{ background: "#fff", border: "1px solid #e2e8f0", color: "#64748b", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontFamily: "inherit" }}>↑</button>
                        <button onClick={() => moveFoodWithinMeal(slot.id, index, 1)} style={{ background: "#fff", border: "1px solid #e2e8f0", color: "#64748b", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontFamily: "inherit" }}>↓</button>
                        <button onClick={() => removeFoodFromMeal(food.name, slot.id)} style={{ background: "#fff", border: "1px solid #e2e8f0", color: "#ef4444", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontFamily: "inherit" }}>🗑</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                    <select value={mealQuickAdd[slot.id]} onChange={e => setMealQuickAdd(prev => ({ ...prev, [slot.id]: e.target.value }))} style={{ ...inputBase, background: "#fff", color: "#334155", border: "1px solid #dbe7f1" }}>
                      <option value="">Seleccionar alimento</option>
                      {quickOptions.map(food => <option key={`${slot.id}-${food.name}`} value={food.name}>{food.name}</option>)}
                    </select>
                    <button onClick={() => addFoodToMealFromQuickSelect(slot.id)} style={{ background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: 12, padding: "0 18px", fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>Agregar</button>
                  </div>
                  <button onClick={() => setSection("alimentos")} style={{ background: "#e8f1ff", color: "#3b82f6", border: "none", borderRadius: 12, padding: "12px 14px", fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>Agregar nuevo alimento ＋</button>
                </div>
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#64748b", marginBottom: 8 }}>Notas</div>
                  <textarea value={mealNotes[slot.id]} onChange={e => setMealNotes(prev => ({ ...prev, [slot.id]: e.target.value }))} rows={2} style={{ ...inputBase, background: "#fff", color: "#334155", border: "1px solid #dbe7f1", minHeight: 64 }} placeholder="Indicaciones o cambios para esta comida..." />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginTop: 18 }}>
                  {[
                    { label: "Energía", value: `${Math.round(slot.summary.kcal || 0)} kcal`, color: "#c084fc" },
                    { label: "Grasa", value: `${round1(slot.summary.fat || 0)} g`, color: "#fbbf24" },
                    { label: "H. Carbono", value: `${round1(slot.summary.carbs || 0)} g`, color: "#fb923c" },
                    { label: "Proteína", value: `${round1(slot.summary.prot || 0)} g`, color: "#60a5fa" },
                    { label: "Fibra alimentaria", value: `${round1(slot.summary.fiber || 0)} g`, color: "#34d399" },
                  ].map(item => (
                    <div key={item.label} style={{ background: "#fff", borderTop: `3px solid ${item.color}`, borderRadius: 12, padding: "10px 12px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 11, color: item.color, fontWeight: 900, marginBottom: 6 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gap: 16, alignSelf: "start", position: "sticky", top: 20 }}>
          <div style={lightCard}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Análisis global</div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { label: "Energía", actual: Math.round(globalMealSummary.kcal || 0), target: Math.round(globalMealTarget.kcal || 0), color: "#c084fc", unit: "kcal" },
                { label: "Grasa", actual: round1(globalMealSummary.fat || 0), target: round1(globalMealTarget.fat || 0), color: "#fbbf24", unit: "g" },
                { label: "Hidratos de carbono", actual: round1(globalMealSummary.carbs || 0), target: round1(globalMealTarget.carbs || 0), color: "#fb923c", unit: "g" },
                { label: "Proteína", actual: round1(globalMealSummary.prot || 0), target: round1(globalMealTarget.protein || 0), color: "#60a5fa", unit: "g" },
                { label: "Fibra alimentaria", actual: round1(globalMealSummary.fiber || 0), target: round1(globalMealTarget.fiber || 0), color: "#34d399", unit: "g" },
              ].map(item => {
                const ratio = item.target ? Math.min((item.actual / item.target) * 100, 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                      <span>{item.label}</span>
                      <span>{item.actual}/{item.target} {item.unit}</span>
                    </div>
                    <div style={{ height: 10, background: "#edf2f7", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${ratio}%`, height: "100%", background: item.color, borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 16, alignItems: "center", marginTop: 18 }}>
              <div style={{ width: "100%", height: 140 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={macroDistributionData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={58} paddingAngle={3}>
                      {macroDistributionData.map(item => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {macroDistributionData.map(item => (
                  <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, display: "inline-block" }} />{item.name}</span>
                    <strong>{item.value}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={lightCard}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Comidas</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              {mealDonutData.map(slot => (
                <div key={slot.id} style={{ textAlign: "center" }}>
                  <div style={{ width: "100%", height: 90 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={slot.donut} dataKey="value" nameKey="name" innerRadius={20} outerRadius={34} paddingAngle={2}>
                          {slot.donut.map((item, index) => <Cell key={`${slot.id}-${index}`} fill={item.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{slot.label}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{slot.pct}% del día</div>
                </div>
              ))}
            </div>
          </div>

          <div style={lightCard}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Cuantificación de nutrientes</div>
            <div style={{ display: "grid", gap: 12 }}>
              {nutrientReferenceRows.map(item => {
                const ratio = item.ref ? Math.min((item.value / item.ref) * 100, 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 10, fontSize: 13, marginBottom: 4 }}>
                      <strong>{item.label}</strong>
                      <span>{item.value}/{item.ref} {item.unit}</span>
                      <span style={{ color: "#64748b" }}>{item.ref} {item.unit}</span>
                    </div>
                    <div style={{ height: 10, background: "#edf2f7", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${ratio}%`, height: "100%", background: "#a5b4fc" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...lightCard, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Generador visual del plan semanal</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Editor rápido por tarjetas, para armar o corregir la semana con menos clics.</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => duplicateDayToWeek("Lunes")} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Duplicar lunes</button>
            <button onClick={clearWeeklyPlan} style={{ background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa", borderRadius: 8, padding: "8px 12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Limpiar semana</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {weekDays.map(day => (
            <div key={day} style={softCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{day}</div>
                <button onClick={() => duplicateDayToWeek(day)} style={{ background: "transparent", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 999, padding: "5px 8px", fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Duplicar</button>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {weeklyMealSlots.map(slot => {
                  const compatibleTemplates = preparationTemplates.filter(template => normalizeTemplateSlot(template.tiempo) === slot.id);
                  return (
                    <div
                      key={slot.id}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const droppedName = draggedPreparation || e.dataTransfer.getData("text/plain");
                        if (droppedName) assignPreparationToCell(day, slot.id, droppedName);
                        setDraggedPreparation("");
                      }}
                      style={{ background: "#fff", border: `1px solid ${draggedPreparation ? "#86efac" : "#dbe7f1"}`, borderRadius: 12, padding: 10, transition: "border-color .15s ease" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{slot.label}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{weeklyPlan[day][slot.id] ? "Asignado" : "Vacío"}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8, minHeight: 18 }}>{weeklyPlan[day][slot.id] || "Sin preparación"}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        {compatibleTemplates.slice(0, 2).map(template => (
                          <button key={template.id} onClick={() => updateWeeklyPlanCell(day, slot.id, template.nombre)} onDragStart={e => e.dataTransfer.setData("text/plain", template.nombre)} draggable style={{ background: "#ecfdf5", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 999, padding: "4px 8px", fontSize: 10, fontWeight: 800, cursor: "grab", fontFamily: "inherit" }}>
                            {template.nombre}
                          </button>
                        ))}
                      </div>
                      <select value={weeklyPlan[day][slot.id]} onChange={e => updateWeeklyPlanCell(day, slot.id, e.target.value)} style={{ ...inputBase, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>
                        <option value="">Seleccionar</option>
                        {compatibleTemplates.map(template => <option key={template.id} value={template.nombre}>{template.nombre}</option>)}
                      </select>
                      {weeklyPlan[day][slot.id] && (
                        <button onClick={() => updateWeeklyPlanCell(day, slot.id, "")} style={{ marginTop: 8, width: "100%", background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                          Limpiar este tiempo
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...lightCard, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #dbe7f1", fontWeight: 800, fontSize: 13 }}>Plan semanal de lunes a domingo</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1120 }}>
            <thead>
              <tr style={{ background: "#f8fbfe" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#64748b" }}>Día</th>
                {weeklyMealSlots.map(slot => <th key={slot.id} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#64748b" }}>{slot.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {weekDays.map(day => (
                <tr key={day} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: 13, color: "#334155" }}>{day}</td>
                  {weeklyMealSlots.map(slot => {
                    const compatibleTemplates = preparationTemplates.filter(template => normalizeTemplateSlot(template.tiempo) === slot.id);
                    return (
                      <td key={slot.id} style={{ padding: "10px 12px" }}>
                        <select value={weeklyPlan[day][slot.id]} onChange={e => updateWeeklyPlanCell(day, slot.id, e.target.value)} style={{ ...inputBase, background: "#fff", border: "1px solid #dbe7f1", color: "#334155" }}>
                          <option value="">Seleccionar</option>
                          {compatibleTemplates.map(template => <option key={template.id} value={template.nombre}>{template.nombre}</option>)}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
