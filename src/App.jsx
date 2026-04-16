import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import {
  buttonDangerSoft,
  buttonInfo,
  buttonNeutral,
  buttonSuccessSoft,
  buttonWarningSoft,
  chipLabel,
  chipValue,
  chipWrap,
  colors,
  panelSoft,
  sectionTitleMain,
  sectionTitleSub,
  sectionTitleWrap,
  tagInfo,
  tableBase,
  tableBodyRow,
  tableHeadCell,
  tableHeadRow,
} from "./theme";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CalculoSection = lazy(() => import("./sections/CalculoSection"));
const AnalisisSection = lazy(() => import("./sections/AnalisisSection"));
const PlanSection = lazy(() => import("./sections/PlanSection"));

const WEEK_DAYS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
const MEAL_SLOTS = [
  { id: "desayuno", label: "Desayuno" },
  { id: "colacion_am", label: "Colacion AM" },
  { id: "comida", label: "Comida" },
  { id: "colacion_pm", label: "Colacion PM" },
  { id: "cena", label: "Cena" },
];
const WEEKLY_MEAL_SLOTS = [
  { id: "desayuno", label: "Desayuno" },
  { id: "colacion_matutina", label: "Colacion matutina" },
  { id: "comida", label: "Comida" },
  { id: "colacion_vespertina", label: "Colacion vespertina" },
  { id: "cena", label: "Cena" },
];
const FOOD_GROUPS = [
  { id: "todos", label: "Todos" },
  { id: "proteinas", label: "Proteinas" },
  { id: "cereales", label: "Cereales" },
  { id: "leguminosas", label: "Leguminosas" },
  { id: "frutas", label: "Frutas" },
  { id: "verduras", label: "Verduras" },
  { id: "grasas", label: "Grasas" },
  { id: "lacteos", label: "Lacteos" },
  { id: "otros", label: "Otros" },
];
const RECIPE_MEAL_TYPE_OPTIONS = [
  { value: "todos", label: "Todos los tiempos" },
  { value: "breakfast", label: "Breakfast / Desayuno" },
  { value: "snack", label: "Snack / Colacion" },
  { value: "lunch/dinner", label: "Lunch / Dinner" },
];
const RECIPE_DISH_TYPE_OPTIONS = [
  { value: "todos", label: "Todos los platillos" },
  { value: "egg", label: "Huevo / breakfast plate" },
  { value: "porridge", label: "Avena / porridge" },
  { value: "main course", label: "Main course" },
  { value: "salad", label: "Salad" },
  { value: "snack", label: "Snack" },
];
const RECIPE_CUISINE_OPTIONS = [
  { value: "todos", label: "Todas las cocinas" },
  { value: "mexican", label: "Mexicana" },
  { value: "mediterranean", label: "Mediterranea" },
  { value: "general", label: "General / Clinica" },
];
const CLINICAL_LABEL_OPTIONS = [
  { value: "todos", label: "Sin filtro clinico" },
  { value: "diabetes-friendly", label: "Diabetes-friendly" },
  { value: "high-protein", label: "Alta proteina" },
  { value: "high-fiber", label: "Alta fibra" },
  { value: "weight-management", label: "Control de peso" },
  { value: "heart-healthy", label: "Cardiometabolico" },
  { value: "post-workout", label: "Post-entreno" },
  { value: "performance", label: "Rendimiento" },
];
const RECIPE_DIFFICULTY_OPTIONS = [
  { value: "todos", label: "Todas las dificultades" },
  { value: "facil", label: "Fácil" },
  { value: "media", label: "Media" },
  { value: "avanzada", label: "Avanzada" },
];
const RECIPE_GOAL_OPTIONS = [
  { value: "todos", label: "Todos los objetivos" },
  { value: "diabetes", label: "Diabetes" },
  { value: "control_peso", label: "Control de peso" },
  { value: "obesidad", label: "Obesidad" },
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "resistencia", label: "Resistencia" },
  { value: "cardiometabolico", label: "Cardiometabólico" },
  { value: "vegetariano", label: "Vegetariano" },
  { value: "general", label: "General" },
];
const PORTAL_MEAL_STATUS_OPTIONS = [
  { value: "hecho", label: "Hecho", bg: "#dcfce7", color: "#166534" },
  { value: "sustitui", label: "Sustituí", bg: "#dbeafe", color: "#1d4ed8" },
  { value: "no_comi", label: "No comí", bg: "#fee2e2", color: "#b91c1c" },
];
const SECTION_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◌" },
  { id: "pacientes", label: "Pacientes", icon: "◎" },
  { id: "analisis", label: "Analisis Nutricional", icon: "◍" },
  { id: "calculo", label: "Calculo Dietetico", icon: "◍" },
  { id: "plan", label: "Plan Alimenticio", icon: "◈" },
  { id: "clinicos", label: "Datos Clinicos", icon: "◐" },
  { id: "deporte", label: "Deporte Adaptado", icon: "◉" },
  { id: "alimentos", label: "Alimentos", icon: "◆" },
  { id: "seguimiento", label: "Seguimiento", icon: "◔" },
  { id: "portal", label: "Portal Paciente", icon: "▣" },
  { id: "agenda", label: "Agenda", icon: "◷" },
];

const foodDatabase = [
  { name: "Pechuga de pollo", kcal: 165, prot: 31, carbs: 0, fat: 3.6, porcion: "100g", grupo: "proteinas", intercambio: "1 porcion AOA muy bajo en grasa", tiempos: ["comida", "cena"], tags: ["high-protein", "meal-prep"] },
  { name: "Salmon", kcal: 208, prot: 20, carbs: 0, fat: 13, porcion: "100g", grupo: "proteinas", intercambio: "1 porcion AOA moderado en grasa", tiempos: ["comida", "cena"], tags: ["heart-healthy", "omega-3"] },
  { name: "Huevo entero", kcal: 155, prot: 13, carbs: 1.1, fat: 11, porcion: "2 piezas", grupo: "proteinas", intercambio: "2 AOA moderado en grasa", tiempos: ["desayuno", "cena"], tags: ["high-protein", "breakfast"] },
  { name: "Yogur griego natural", kcal: 97, prot: 10, carbs: 3.6, fat: 5, porcion: "170g", grupo: "lacteos", intercambio: "1 leche + 1/2 AOA", tiempos: ["desayuno", "colacion_am", "colacion_pm"], tags: ["high-protein", "post-workout"] },
  { name: "Atun en agua", kcal: 116, prot: 26, carbs: 0, fat: 1, porcion: "100g", grupo: "proteinas", intercambio: "1 porcion AOA muy bajo en grasa", tiempos: ["comida", "cena"], tags: ["high-protein", "weight-management"] },
  { name: "Queso panela", kcal: 265, prot: 18, carbs: 2, fat: 20, porcion: "60g", grupo: "proteinas", intercambio: "2 AOA moderado", tiempos: ["desayuno", "cena"], tags: ["mexican", "simple-dinner"] },
  { name: "Tofu firme", kcal: 144, prot: 17, carbs: 3, fat: 9, porcion: "100g", grupo: "proteinas", intercambio: "2 AOA bajo en grasa", tiempos: ["comida", "cena"], tags: ["vegetariano", "high-protein"] },
  { name: "Frijoles negros cocidos", kcal: 114, prot: 7.6, carbs: 20.4, fat: 0.5, porcion: "1/2 taza", grupo: "leguminosas", intercambio: "1 equivalente de leguminosa", tiempos: ["comida", "cena"], tags: ["high-fiber", "mexican"] },
  { name: "Lentejas cocidas", kcal: 116, prot: 9, carbs: 20, fat: 0.4, porcion: "1/2 taza", grupo: "leguminosas", intercambio: "1 equivalente de leguminosa", tiempos: ["comida"], tags: ["high-fiber", "heart-healthy"] },
  { name: "Arroz integral", kcal: 216, prot: 5, carbs: 45, fat: 1.8, porcion: "1 taza cocida", grupo: "cereales", intercambio: "3 equivalentes de cereal", tiempos: ["comida"], tags: ["performance", "high-fiber"] },
  { name: "Avena", kcal: 389, prot: 17, carbs: 66, fat: 7, porcion: "1/2 taza cruda", grupo: "cereales", intercambio: "2 equivalentes de cereal", tiempos: ["desayuno", "colacion_am"], tags: ["high-fiber", "diabetes-friendly", "performance"] },
  { name: "Tortilla de maiz", kcal: 64, prot: 1.7, carbs: 13.4, fat: 0.7, porcion: "1 pieza", grupo: "cereales", intercambio: "1 equivalente de cereal", tiempos: ["comida", "cena"], tags: ["mexican", "simple"] },
  { name: "Pan integral", kcal: 69, prot: 3.6, carbs: 12, fat: 1.1, porcion: "1 rebanada", grupo: "cereales", intercambio: "1 equivalente de cereal", tiempos: ["desayuno", "colacion_am"], tags: ["high-fiber", "simple"] },
  { name: "Aguacate", kcal: 160, prot: 2, carbs: 9, fat: 15, porcion: "1/3 pieza", grupo: "grasas", intercambio: "2 equivalentes de grasa", tiempos: ["comida", "cena"], tags: ["heart-healthy", "satiety"] },
  { name: "Nueces", kcal: 654, prot: 15, carbs: 14, fat: 65, porcion: "15g", grupo: "grasas", intercambio: "2 equivalentes de grasa", tiempos: ["colacion_am", "colacion_pm"], tags: ["heart-healthy", "tree-nuts"] },
  { name: "Semillas de chia", kcal: 58, prot: 2, carbs: 5, fat: 4, porcion: "1 cucharada", grupo: "grasas", intercambio: "1 equivalente de grasa", tiempos: ["desayuno", "colacion_am", "colacion_pm"], tags: ["high-fiber", "omega-3"] },
  { name: "Espinaca", kcal: 23, prot: 2.9, carbs: 3.6, fat: 0.4, porcion: "2 tazas", grupo: "verduras", intercambio: "libre", tiempos: ["comida", "cena"], tags: ["high-fiber", "weight-management"] },
  { name: "Lechuga", kcal: 15, prot: 1.4, carbs: 2.9, fat: 0.2, porcion: "2 tazas", grupo: "verduras", intercambio: "libre", tiempos: ["comida", "cena"], tags: ["weight-management", "salad"] },
  { name: "Pepino", kcal: 15, prot: 0.7, carbs: 3.6, fat: 0.1, porcion: "1 taza", grupo: "verduras", intercambio: "libre", tiempos: ["comida", "cena", "colacion_am"], tags: ["weight-management", "refreshing"] },
  { name: "Jitomate", kcal: 18, prot: 0.9, carbs: 3.9, fat: 0.2, porcion: "1 taza", grupo: "verduras", intercambio: "libre", tiempos: ["desayuno", "comida", "cena"], tags: ["mexican", "fresh"] },
  { name: "Calabacita", kcal: 17, prot: 1.2, carbs: 3.1, fat: 0.3, porcion: "1 taza", grupo: "verduras", intercambio: "1 equivalente de verdura", tiempos: ["comida", "cena"], tags: ["weight-management", "simple"] },
  { name: "Nopales", kcal: 16, prot: 1.3, carbs: 3.3, fat: 0.1, porcion: "1 taza", grupo: "verduras", intercambio: "libre", tiempos: ["desayuno", "comida", "cena"], tags: ["diabetes-friendly", "mexican", "high-fiber"] },
  { name: "Manzana", kcal: 95, prot: 0.5, carbs: 25, fat: 0.3, porcion: "1 pieza", grupo: "frutas", intercambio: "1 equivalente fruta", tiempos: ["desayuno", "colacion_am", "colacion_pm"], tags: ["portable", "high-fiber"] },
  { name: "Platano", kcal: 105, prot: 1.3, carbs: 27, fat: 0.4, porcion: "1 pieza", grupo: "frutas", intercambio: "1 equivalente fruta", tiempos: ["desayuno", "colacion_am", "colacion_pm"], tags: ["performance", "pre-workout"] },
  { name: "Fresas", kcal: 32, prot: 0.7, carbs: 7.7, fat: 0.3, porcion: "1 taza", grupo: "frutas", intercambio: "1 equivalente fruta", tiempos: ["desayuno", "colacion_am", "colacion_pm"], tags: ["weight-management", "post-workout"] },
  { name: "Papaya", kcal: 43, prot: 0.5, carbs: 11, fat: 0.3, porcion: "1 taza", grupo: "frutas", intercambio: "1 equivalente fruta", tiempos: ["desayuno", "colacion_am"], tags: ["diabetes-friendly", "digestive"] },
  { name: "Leche descremada", kcal: 34, prot: 3.4, carbs: 5, fat: 0.1, porcion: "240ml", grupo: "lacteos", intercambio: "1 leche descremada", tiempos: ["desayuno"], tags: ["dairy", "low-fat"] },
  { name: "Kefir natural", kcal: 63, prot: 3.5, carbs: 7, fat: 2.3, porcion: "240ml", grupo: "lacteos", intercambio: "1 leche", tiempos: ["desayuno", "colacion_pm"], tags: ["dairy", "digestive"] },
];

const PREPARATION_TEMPLATES = [
  { id: "des1", categoria: "desayunos_mexicanos", nombre: "Huevos con nopales", tiempo: "desayuno", alimentos: ["Huevo entero", "Nopales", "Tortilla de maiz", "Papaya"], nota: "Desayuno clasico, saciante y muy util para consulta." },
  { id: "des2", categoria: "desayunos_mexicanos", nombre: "Avena con fruta y chia", tiempo: "desayuno", alimentos: ["Avena", "Papaya", "Fresas", "Semillas de chia", "Leche descremada"], nota: "Opcion visual y practica para pacientes con poco tiempo." },
  { id: "des3", categoria: "desayunos_mexicanos", nombre: "Molletes ligeros", tiempo: "desayuno", alimentos: ["Pan integral", "Frijoles negros cocidos", "Queso panela", "Jitomate"], nota: "Version de buena adherencia familiar." },
  { id: "des4", categoria: "desayunos_mexicanos", nombre: "Tazon de kefir con avena", tiempo: "desayuno", alimentos: ["Kefir natural", "Avena", "Fresas", "Semillas de chia"], nota: "Desayuno rapido con enfoque digestivo y de saciedad." },
  { id: "des5", categoria: "desayunos_mexicanos", nombre: "Sandwich integral con panela", tiempo: "desayuno", alimentos: ["Pan integral", "Queso panela", "Jitomate", "Aguacate"], nota: "Preparacion de alta adherencia para pacientes con poco tiempo." },
  { id: "com1", categoria: "comidas_mexicanas", nombre: "Pollo con arroz y nopales", tiempo: "comida", alimentos: ["Pechuga de pollo", "Arroz integral", "Nopales", "Aguacate"], nota: "Plato fuerte equilibrado." },
  { id: "com2", categoria: "comidas_mexicanas", nombre: "Tostadas de atun", tiempo: "comida", alimentos: ["Atun en agua", "Tortilla de maiz", "Lechuga", "Jitomate", "Aguacate"], nota: "Comida rapida, fresca y con porciones claras." },
  { id: "com3", categoria: "comidas_mexicanas", nombre: "Bowl de lentejas", tiempo: "comida", alimentos: ["Lentejas cocidas", "Arroz integral", "Jitomate", "Aguacate"], nota: "Alternativa vegetariana con buena saciedad." },
  { id: "com4", categoria: "comidas_mexicanas", nombre: "Panela con nopales y tortillas", tiempo: "comida", alimentos: ["Queso panela", "Nopales", "Tortilla de maiz", "Pepino"], nota: "Comida simple para dias de poca preparacion." },
  { id: "com5", categoria: "comidas_mexicanas", nombre: "Bowl deportivo de pollo", tiempo: "comida", alimentos: ["Pechuga de pollo", "Arroz integral", "Aguacate", "Jitomate"], nota: "Comida util para rendimiento e hipertrofia." },
  { id: "col1", categoria: "colaciones", nombre: "Fruta con nueces", tiempo: "colacion_am", alimentos: ["Manzana", "Nueces"], nota: "Portable y facil de sostener." },
  { id: "col2", categoria: "colaciones", nombre: "Yogur con fresa", tiempo: "colacion_pm", alimentos: ["Yogur griego natural", "Fresas", "Semillas de chia"], nota: "Alta en proteina para tarde o post-entreno." },
  { id: "col3", categoria: "colaciones", nombre: "Platano con yogur", tiempo: "colacion_am", alimentos: ["Platano", "Yogur griego natural"], nota: "Colacion enfocada en rendimiento o pre-entreno." },
  { id: "col4", categoria: "colaciones", nombre: "Manzana con crema de cacahuate", tiempo: "colacion_pm", alimentos: ["Manzana", "Nueces"], nota: "Colacion simple para mejorar adherencia y saciedad." },
  { id: "col5", categoria: "colaciones", nombre: "Kefir con papaya", tiempo: "colacion_pm", alimentos: ["Kefir natural", "Papaya"], nota: "Colacion ligera con enfoque digestivo." },
  { id: "cena1", categoria: "cenas_ligeras", nombre: "Ensalada con salmon", tiempo: "cena", alimentos: ["Salmon", "Lechuga", "Pepino", "Jitomate", "Aguacate"], nota: "Cena ligera con buena saciedad." },
  { id: "cena2", categoria: "cenas_ligeras", nombre: "Queso panela con verduras", tiempo: "cena", alimentos: ["Queso panela", "Calabacita", "Jitomate", "Tortilla de maiz"], nota: "Cena simple y muy facil de adherir." },
  { id: "cena3", categoria: "cenas_ligeras", nombre: "Tofu con calabacita", tiempo: "cena", alimentos: ["Tofu firme", "Calabacita", "Jitomate", "Aguacate"], nota: "Cena vegetal y ligera para rotar proteinas." },
  { id: "cena4", categoria: "cenas_ligeras", nombre: "Tacos de atun con verduras", tiempo: "cena", alimentos: ["Atun en agua", "Tortilla de maiz", "Lechuga", "Pepino"], nota: "Cena practica y alta en proteina." },
];

const STRUCTURED_RECIPES = [
  {
    id: "recipe_huevos_nopales",
    nombre: "Huevos con nopales",
    categoria: "desayuno",
    mealType: "breakfast",
    dishType: "egg",
    cuisineType: "mexican",
    porciones: 1,
    yield: 1,
    tiempoPrep: 15,
    objetivo: ["diabetes", "control_peso", "general"],
    healthLabels: ["diabetes-friendly", "high-protein", "high-fiber"],
    dietLabels: ["moderate-carb", "mexican-breakfast"],
    allergenLabels: ["egg"],
    ingredientes: [
      { item: "Huevo entero", cantidad: "2 pzas", grupo: "proteina" },
      { item: "Nopales", cantidad: "1 taza", grupo: "verdura" },
      { item: "Tortilla de maiz", cantidad: "2 piezas", grupo: "cereal" },
    ],
    pasos: ["Asar o cocer los nopales.", "Cocinar los huevos al gusto.", "Servir con tortillas y salsa fresca."],
    tags: ["mexicano", "alto_proteina", "bajo_ig"],
  },
  {
    id: "recipe_avena_chia",
    nombre: "Avena con fruta y chia",
    categoria: "desayuno",
    mealType: "breakfast",
    dishType: "porridge",
    cuisineType: "general",
    porciones: 1,
    yield: 1,
    tiempoPrep: 10,
    objetivo: ["resistencia", "diabetes", "general"],
    healthLabels: ["high-fiber", "diabetes-friendly", "performance"],
    dietLabels: ["oat-based", "moderate-fat"],
    allergenLabels: ["dairy"],
    ingredientes: [
      { item: "Avena", cantidad: "1/2 taza", grupo: "cereal" },
      { item: "Leche descremada", cantidad: "240 ml", grupo: "lacteo" },
      { item: "Papaya", cantidad: "1 taza", grupo: "fruta" },
      { item: "Semillas de chia", cantidad: "1 cucharada", grupo: "grasa" },
    ],
    pasos: ["Cocer la avena con leche.", "Agregar papaya y chia.", "Servir tibia o fria."],
    tags: ["fibra", "desayuno", "pre_entreno"],
  },
  {
    id: "recipe_pollo_arroz",
    nombre: "Pollo con arroz y nopales",
    categoria: "comida",
    mealType: "lunch/dinner",
    dishType: "main course",
    cuisineType: "mexican",
    porciones: 1,
    yield: 1,
    tiempoPrep: 25,
    objetivo: ["hipertrofia", "general", "obesidad"],
    healthLabels: ["high-protein", "performance", "high-fiber"],
    dietLabels: ["balanced-plate", "meal-prep"],
    allergenLabels: [],
    ingredientes: [
      { item: "Pechuga de pollo", cantidad: "150 g", grupo: "proteina" },
      { item: "Arroz integral", cantidad: "1 taza", grupo: "cereal" },
      { item: "Nopales", cantidad: "1 taza", grupo: "verdura" },
      { item: "Aguacate", cantidad: "1/3 pieza", grupo: "grasa" },
    ],
    pasos: ["Cocinar el pollo a la plancha.", "Servir con arroz integral.", "Agregar nopales y aguacate."],
    tags: ["alto_proteina", "mexicano", "meal_prep"],
  },
  {
    id: "recipe_tostadas_atun",
    nombre: "Tostadas de atun",
    categoria: "comida",
    mealType: "lunch/dinner",
    dishType: "main course",
    cuisineType: "mexican",
    porciones: 1,
    yield: 1,
    tiempoPrep: 12,
    objetivo: ["control_peso", "diabetes", "general"],
    healthLabels: ["high-protein", "weight-management", "diabetes-friendly"],
    dietLabels: ["light-lunch", "mexican"],
    allergenLabels: ["fish"],
    ingredientes: [
      { item: "Atun en agua", cantidad: "1 lata", grupo: "proteina" },
      { item: "Tortilla de maiz", cantidad: "3 piezas", grupo: "cereal" },
      { item: "Lechuga", cantidad: "2 tazas", grupo: "verdura" },
      { item: "Jitomate", cantidad: "1 taza", grupo: "verdura" },
    ],
    pasos: ["Preparar tostadas horneadas.", "Mezclar atun con jitomate.", "Montar sobre lechuga y servir."],
    tags: ["rapido", "alto_proteina", "ligero"],
  },
  {
    id: "recipe_fruta_nueces",
    nombre: "Fruta con nueces",
    categoria: "colacion",
    mealType: "snack",
    dishType: "snack",
    cuisineType: "general",
    porciones: 1,
    yield: 1,
    tiempoPrep: 5,
    objetivo: ["general", "resistencia", "portal"],
    healthLabels: ["performance", "high-fiber"],
    dietLabels: ["portable", "whole-food"],
    allergenLabels: ["tree-nuts"],
    ingredientes: [
      { item: "Manzana", cantidad: "1 pieza", grupo: "fruta" },
      { item: "Nueces", cantidad: "15 g", grupo: "grasa" },
    ],
    pasos: ["Lavar y cortar la fruta.", "Acompanar con nueces."],
    tags: ["portable", "colacion"],
  },
  {
    id: "recipe_yogur_fresa",
    nombre: "Yogur con fresa",
    categoria: "colacion",
    mealType: "snack",
    dishType: "snack",
    cuisineType: "general",
    porciones: 1,
    yield: 1,
    tiempoPrep: 5,
    objetivo: ["hipertrofia", "general", "portal"],
    healthLabels: ["high-protein", "post-workout"],
    dietLabels: ["easy-snack", "recovery"],
    allergenLabels: ["dairy"],
    ingredientes: [
      { item: "Yogur griego natural", cantidad: "170 g", grupo: "proteina" },
      { item: "Fresas", cantidad: "1 taza", grupo: "fruta" },
      { item: "Semillas de chia", cantidad: "1 cucharada", grupo: "grasa" },
    ],
    pasos: ["Colocar yogur en un tazon.", "Agregar fresas y chia."],
    tags: ["alto_proteina", "post_entreno"],
  },
  {
    id: "recipe_salmon_ensalada",
    nombre: "Ensalada con salmon",
    categoria: "cena",
    mealType: "lunch/dinner",
    dishType: "salad",
    cuisineType: "mediterranean",
    porciones: 1,
    yield: 1,
    tiempoPrep: 20,
    objetivo: ["control_peso", "cardiometabolico", "general"],
    healthLabels: ["heart-healthy", "high-protein", "weight-management"],
    dietLabels: ["omega-3", "light-dinner"],
    allergenLabels: ["fish"],
    ingredientes: [
      { item: "Salmon", cantidad: "120 g", grupo: "proteina" },
      { item: "Lechuga", cantidad: "2 tazas", grupo: "verdura" },
      { item: "Pepino", cantidad: "1 taza", grupo: "verdura" },
      { item: "Aguacate", cantidad: "1/3 pieza", grupo: "grasa" },
    ],
    pasos: ["Hornear el salmon.", "Preparar la ensalada.", "Servir y agregar aguacate."],
    tags: ["omega_3", "cena_ligera"],
  },
  {
    id: "recipe_panela_verduras",
    nombre: "Queso panela con verduras",
    categoria: "cena",
    mealType: "lunch/dinner",
    dishType: "main course",
    cuisineType: "mexican",
    porciones: 1,
    yield: 1,
    tiempoPrep: 15,
    objetivo: ["general", "control_peso"],
    healthLabels: ["weight-management", "vegetable-forward"],
    dietLabels: ["simple-dinner", "mexican"],
    allergenLabels: ["dairy"],
    ingredientes: [
      { item: "Queso panela", cantidad: "60 g", grupo: "proteina" },
      { item: "Calabacita", cantidad: "1 taza", grupo: "verdura" },
      { item: "Jitomate", cantidad: "1 taza", grupo: "verdura" },
      { item: "Tortilla de maiz", cantidad: "2 piezas", grupo: "cereal" },
    ],
    pasos: ["Asar el queso panela.", "Saltear verduras.", "Servir con tortillas."],
    tags: ["mexicano", "simple"],
  },
  {
    id: "recipe_bowl_deportivo_pollo",
    nombre: "Bowl deportivo de pollo",
    categoria: "comida",
    mealType: "lunch/dinner",
    dishType: "main course",
    cuisineType: "general",
    porciones: 1,
    yield: 1,
    tiempoPrep: 20,
    objetivo: ["hipertrofia", "resistencia", "general"],
    healthLabels: ["high-protein", "performance"],
    dietLabels: ["training-meal", "balanced-plate"],
    allergenLabels: [],
    ingredientes: [
      { item: "Pechuga de pollo", cantidad: "150 g", grupo: "proteina" },
      { item: "Arroz integral", cantidad: "1 taza", grupo: "cereal" },
      { item: "Aguacate", cantidad: "1/3 pieza", grupo: "grasa" },
      { item: "Jitomate", cantidad: "1 taza", grupo: "verdura" },
    ],
    pasos: ["Cocinar el pollo.", "Servir con arroz integral.", "Agregar jitomate y aguacate al final."],
    tags: ["hipertrofia", "rendimiento", "meal_prep"],
  },
  {
    id: "recipe_kefir_papaya",
    nombre: "Kefir con papaya",
    categoria: "colacion",
    mealType: "snack",
    dishType: "snack",
    cuisineType: "general",
    porciones: 1,
    yield: 1,
    tiempoPrep: 5,
    objetivo: ["general", "diabetes", "portal"],
    healthLabels: ["diabetes-friendly", "digestive"],
    dietLabels: ["light-snack"],
    allergenLabels: ["dairy"],
    ingredientes: [
      { item: "Kefir natural", cantidad: "240 ml", grupo: "lacteo" },
      { item: "Papaya", cantidad: "1 taza", grupo: "fruta" },
    ],
    pasos: ["Servir el kefir frio.", "Agregar papaya en cubos."],
    tags: ["digestivo", "ligero"],
  },
  {
    id: "recipe_tacos_atun_verduras",
    nombre: "Tacos de atun con verduras",
    categoria: "cena",
    mealType: "lunch/dinner",
    dishType: "main course",
    cuisineType: "mexican",
    porciones: 1,
    yield: 1,
    tiempoPrep: 10,
    objetivo: ["control_peso", "general", "diabetes"],
    healthLabels: ["high-protein", "weight-management"],
    dietLabels: ["quick-dinner", "mexican"],
    allergenLabels: ["fish"],
    ingredientes: [
      { item: "Atun en agua", cantidad: "1 lata", grupo: "proteina" },
      { item: "Tortilla de maiz", cantidad: "2 piezas", grupo: "cereal" },
      { item: "Lechuga", cantidad: "1 taza", grupo: "verdura" },
      { item: "Pepino", cantidad: "1 taza", grupo: "verdura" },
    ],
    pasos: ["Preparar el atun.", "Servir en tortillas.", "Agregar verduras frescas al momento."],
    tags: ["cena_rapida", "mexicano", "alto_proteina"],
  },
];

const CLINICAL_TEMPLATES = [
  {
    id: "tpl_diabetes",
    nombre: "Template Diabetes",
    perfil: "diabetes",
    descripcion: "Prioriza fibra, proteina y carbohidrato moderado distribuido en el dia.",
    weekAssignments: {
      desayuno: "Huevos con nopales",
      colacion_matutina: "Fruta con nueces",
      comida: "Tostadas de atun",
      colacion_vespertina: "Yogur con fresa",
      cena: "Ensalada con salmon",
    },
  },
  {
    id: "tpl_obesidad",
    nombre: "Template Perdida de Grasa",
    perfil: "obesidad",
    descripcion: "Enfocado en densidad nutricional alta, volumen y saciedad.",
    weekAssignments: {
      desayuno: "Huevos con nopales",
      colacion_matutina: "Fruta con nueces",
      comida: "Tostadas de atun",
      colacion_vespertina: "Yogur con fresa",
      cena: "Queso panela con verduras",
    },
  },
  {
    id: "tpl_hipertrofia",
    nombre: "Template Hipertrofia",
    perfil: "hipertrofia",
    descripcion: "Mayor densidad energetica y proteica con colaciones estrategicas.",
    weekAssignments: {
      desayuno: "Avena con fruta y chia",
      colacion_matutina: "Yogur con fresa",
      comida: "Pollo con arroz y nopales",
      colacion_vespertina: "Fruta con nueces",
      cena: "Queso panela con verduras",
    },
  },
  {
    id: "tpl_resistencia",
    nombre: "Template Resistencia",
    perfil: "resistencia",
    descripcion: "Sostiene carbohidrato funcional para entrenamiento y recuperacion.",
    weekAssignments: {
      desayuno: "Avena con fruta y chia",
      colacion_matutina: "Fruta con nueces",
      comida: "Pollo con arroz y nopales",
      colacion_vespertina: "Yogur con fresa",
      cena: "Ensalada con salmon",
    },
  },
];

const EXPANDED_RECIPE_BLUEPRINTS = [
  {
    nombre: "Overnight oats tropical",
    categoria: "desayunos_mexicanos",
    tiempo: "desayuno",
    mealType: "breakfast",
    dishType: "porridge",
    cuisineType: "general",
    porciones: 1,
    tiempoPrep: 8,
    objetivo: ["general", "resistencia", "control_peso"],
    healthLabels: ["high-fiber", "meal-prep"],
    dietLabels: ["breakfast", "easy-prep"],
    allergenLabels: ["dairy"],
    alimentos: ["Avena", "Kefir natural", "Papaya", "Semillas de chia"],
    ingredientes: [
      { item: "Avena", cantidad: "1/2 taza", grupo: "cereal" },
      { item: "Kefir natural", cantidad: "240 ml", grupo: "lacteo" },
      { item: "Papaya", cantidad: "1 taza", grupo: "fruta" },
      { item: "Semillas de chia", cantidad: "1 cucharada", grupo: "grasa" },
    ],
    pasos: ["Mezclar avena con kefir.", "Reposar en refrigeración.", "Agregar papaya y chía antes de servir."],
    tags: ["desayuno", "meal_prep", "fibra"],
    nota: "Desayuno frío, rápido y con muy buena adherencia.",
  },
  {
    nombre: "Tacos de huevo con espinaca",
    categoria: "desayunos_mexicanos",
    tiempo: "desayuno",
    mealType: "breakfast",
    dishType: "egg",
    cuisineType: "mexican",
    porciones: 1,
    tiempoPrep: 12,
    objetivo: ["diabetes", "general", "hipertrofia"],
    healthLabels: ["high-protein", "diabetes-friendly"],
    dietLabels: ["mexican-breakfast"],
    allergenLabels: ["egg"],
    alimentos: ["Huevo entero", "Tortilla de maiz", "Espinaca", "Jitomate"],
    ingredientes: [
      { item: "Huevo entero", cantidad: "2 piezas", grupo: "proteina" },
      { item: "Tortilla de maiz", cantidad: "2 piezas", grupo: "cereal" },
      { item: "Espinaca", cantidad: "1 taza", grupo: "verdura" },
      { item: "Jitomate", cantidad: "1/2 taza", grupo: "verdura" },
    ],
    pasos: ["Saltear espinaca y jitomate.", "Agregar huevo y cocinar.", "Servir en tortillas."],
    tags: ["mexicano", "alto_proteina"],
    nota: "Desayuno caliente y muy sencillo de preparar.",
  },
  {
    nombre: "Hot cakes de avena con yogur",
    categoria: "desayunos_mexicanos",
    tiempo: "desayuno",
    mealType: "breakfast",
    dishType: "pancakes",
    cuisineType: "general",
    porciones: 1,
    tiempoPrep: 15,
    objetivo: ["general", "rendimiento", "portal"],
    healthLabels: ["high-fiber", "family-friendly"],
    dietLabels: ["breakfast", "easy"],
    allergenLabels: ["egg", "dairy"],
    alimentos: ["Avena", "Huevo entero", "Yogur griego natural", "Fresas"],
    ingredientes: [
      { item: "Avena", cantidad: "1/2 taza", grupo: "cereal" },
      { item: "Huevo entero", cantidad: "1 pieza", grupo: "proteina" },
      { item: "Yogur griego natural", cantidad: "120 g", grupo: "proteina" },
      { item: "Fresas", cantidad: "1 taza", grupo: "fruta" },
    ],
    pasos: ["Licuar avena y huevo.", "Cocinar en sartén.", "Servir con yogur y fresas."],
    tags: ["familiar", "desayuno"],
    nota: "Opción visual para pacientes que buscan variedad.",
  },
  {
    nombre: "Bowl mediterráneo de pollo",
    categoria: "comidas_mexicanas",
    tiempo: "comida",
    mealType: "lunch/dinner",
    dishType: "bowl",
    cuisineType: "mediterranean",
    porciones: 1,
    tiempoPrep: 20,
    objetivo: ["general", "hipertrofia", "cardiometabolico"],
    healthLabels: ["high-protein", "heart-healthy"],
    dietLabels: ["balanced-plate", "meal-prep"],
    allergenLabels: [],
    alimentos: ["Pechuga de pollo", "Arroz integral", "Pepino", "Jitomate", "Aguacate"],
    ingredientes: [
      { item: "Pechuga de pollo", cantidad: "150 g", grupo: "proteina" },
      { item: "Arroz integral", cantidad: "3/4 taza", grupo: "cereal" },
      { item: "Pepino", cantidad: "1 taza", grupo: "verdura" },
      { item: "Jitomate", cantidad: "1 taza", grupo: "verdura" },
      { item: "Aguacate", cantidad: "1/4 pieza", grupo: "grasa" },
    ],
    pasos: ["Cocinar el pollo.", "Servir con arroz y verduras frescas.", "Agregar aguacate al final."],
    tags: ["meal_prep", "alto_proteina"],
    nota: "Comida completa con perfil cardiometabólico favorable.",
  },
  {
    nombre: "Salmón con papa y ensalada",
    categoria: "comidas_mexicanas",
    tiempo: "comida",
    mealType: "lunch/dinner",
    dishType: "main course",
    cuisineType: "general",
    porciones: 1,
    tiempoPrep: 25,
    objetivo: ["cardiometabolico", "general", "control_peso"],
    healthLabels: ["heart-healthy", "omega-3"],
    dietLabels: ["balanced-plate"],
    allergenLabels: ["fish"],
    alimentos: ["Salmon", "Papa cocida", "Lechuga", "Pepino"],
    ingredientes: [
      { item: "Salmon", cantidad: "120 g", grupo: "proteina" },
      { item: "Papa cocida", cantidad: "1 pieza mediana", grupo: "cereal" },
      { item: "Lechuga", cantidad: "2 tazas", grupo: "verdura" },
      { item: "Pepino", cantidad: "1 taza", grupo: "verdura" },
    ],
    pasos: ["Hornear el salmón.", "Cocer la papa.", "Acompañar con ensalada fresca."],
    tags: ["omega_3", "comida"],
    nota: "Plato muy útil para pacientes con foco cardiovascular.",
  },
  {
    nombre: "Pasta integral con pavo",
    categoria: "comidas_mexicanas",
    tiempo: "comida",
    mealType: "lunch/dinner",
    dishType: "pasta",
    cuisineType: "italian",
    porciones: 1,
    tiempoPrep: 20,
    objetivo: ["hipertrofia", "resistencia", "general"],
    healthLabels: ["high-protein", "performance"],
    dietLabels: ["training-meal"],
    allergenLabels: ["gluten"],
    alimentos: ["Pechuga de pollo", "Pasta integral", "Jitomate", "Espinaca"],
    ingredientes: [
      { item: "Pasta integral", cantidad: "1 taza", grupo: "cereal" },
      { item: "Pechuga de pollo", cantidad: "140 g", grupo: "proteina" },
      { item: "Jitomate", cantidad: "1 taza", grupo: "verdura" },
      { item: "Espinaca", cantidad: "1 taza", grupo: "verdura" },
    ],
    pasos: ["Cocer la pasta.", "Cocinar el pollo en cubos.", "Integrar con jitomate y espinaca."],
    tags: ["rendimiento", "alto_proteina"],
    nota: "Útil en pacientes que necesitan más carbohidrato funcional.",
  },
  {
    nombre: "Lentejas con arroz y aguacate",
    categoria: "comidas_mexicanas",
    tiempo: "comida",
    mealType: "lunch/dinner",
    dishType: "main course",
    cuisineType: "mexican",
    porciones: 1,
    tiempoPrep: 18,
    objetivo: ["vegetariano", "general", "control_peso"],
    healthLabels: ["high-fiber", "plant-protein"],
    dietLabels: ["vegetarian", "balanced-plate"],
    allergenLabels: [],
    alimentos: ["Lentejas cocidas", "Arroz integral", "Aguacate", "Jitomate"],
    ingredientes: [
      { item: "Lentejas cocidas", cantidad: "1 taza", grupo: "leguminosas" },
      { item: "Arroz integral", cantidad: "1/2 taza", grupo: "cereal" },
      { item: "Aguacate", cantidad: "1/4 pieza", grupo: "grasa" },
      { item: "Jitomate", cantidad: "1 taza", grupo: "verdura" },
    ],
    pasos: ["Calentar lentejas.", "Servir con arroz y jitomate.", "Agregar aguacate."],
    tags: ["vegetariano", "fibra"],
    nota: "Plantilla vegetal muy práctica para consulta diaria.",
  },
  {
    nombre: "Wrap integral de atún",
    categoria: "comidas_mexicanas",
    tiempo: "comida",
    mealType: "lunch/dinner",
    dishType: "wrap",
    cuisineType: "general",
    porciones: 1,
    tiempoPrep: 10,
    objetivo: ["general", "control_peso", "portal"],
    healthLabels: ["high-protein", "portable"],
    dietLabels: ["quick-lunch"],
    allergenLabels: ["fish", "gluten"],
    alimentos: ["Atun en agua", "Pan integral", "Lechuga", "Pepino"],
    ingredientes: [
      { item: "Atun en agua", cantidad: "1 lata", grupo: "proteina" },
      { item: "Pan integral", cantidad: "2 rebanadas", grupo: "cereal" },
      { item: "Lechuga", cantidad: "1 taza", grupo: "verdura" },
      { item: "Pepino", cantidad: "1/2 taza", grupo: "verdura" },
    ],
    pasos: ["Preparar el relleno de atún.", "Montar con vegetales.", "Servir como wrap o sándwich."],
    tags: ["portable", "rapido"],
    nota: "Buena opción para oficina o escuela.",
  },
  {
    nombre: "Plátano con crema de cacahuate",
    categoria: "colaciones",
    tiempo: "colacion_am",
    mealType: "snack",
    dishType: "snack",
    cuisineType: "general",
    porciones: 1,
    tiempoPrep: 5,
    objetivo: ["rendimiento", "hipertrofia", "general"],
    healthLabels: ["pre-workout", "energy-support"],
    dietLabels: ["portable"],
    allergenLabels: ["peanut"],
    alimentos: ["Platano", "Nueces"],
    ingredientes: [
      { item: "Platano", cantidad: "1 pieza", grupo: "fruta" },
      { item: "Nueces", cantidad: "15 g", grupo: "grasa" },
    ],
    pasos: ["Servir plátano en rebanadas.", "Acompañar con grasa saludable."],
    tags: ["pre_entreno", "colacion"],
    nota: "Colación rápida para antes de entrenar.",
  },
  {
    nombre: "Yogur con mango y avena",
    categoria: "colaciones",
    tiempo: "colacion_pm",
    mealType: "snack",
    dishType: "snack",
    cuisineType: "general",
    porciones: 1,
    tiempoPrep: 5,
    objetivo: ["general", "resistencia", "portal"],
    healthLabels: ["high-protein", "easy-snack"],
    dietLabels: ["recovery"],
    allergenLabels: ["dairy"],
    alimentos: ["Yogur griego natural", "Mango", "Avena"],
    ingredientes: [
      { item: "Yogur griego natural", cantidad: "170 g", grupo: "proteina" },
      { item: "Mango", cantidad: "1/2 taza", grupo: "fruta" },
      { item: "Avena", cantidad: "1/4 taza", grupo: "cereal" },
    ],
    pasos: ["Colocar yogur en tazón.", "Agregar mango y avena."],
    tags: ["colacion", "post_entreno"],
    nota: "Muy fácil de replicar y bien aceptada por pacientes.",
  },
  {
    nombre: "Queso cottage con pera",
    categoria: "colaciones",
    tiempo: "colacion_pm",
    mealType: "snack",
    dishType: "snack",
    cuisineType: "general",
    porciones: 1,
    tiempoPrep: 4,
    objetivo: ["control_peso", "general", "portal"],
    healthLabels: ["high-protein", "light-snack"],
    dietLabels: ["easy-snack"],
    allergenLabels: ["dairy"],
    alimentos: ["Queso cottage", "Pera"],
    ingredientes: [
      { item: "Queso cottage", cantidad: "120 g", grupo: "proteina" },
      { item: "Pera", cantidad: "1 pieza pequeña", grupo: "fruta" },
    ],
    pasos: ["Servir queso cottage.", "Agregar pera en cubos."],
    tags: ["ligero", "saciedad"],
    nota: "Colación ligera útil en control de peso.",
  },
  {
    nombre: "Jícama con limón y semillas",
    categoria: "colaciones",
    tiempo: "colacion_am",
    mealType: "snack",
    dishType: "snack",
    cuisineType: "mexican",
    porciones: 1,
    tiempoPrep: 5,
    objetivo: ["control_peso", "diabetes", "general"],
    healthLabels: ["high-fiber", "volume-eating"],
    dietLabels: ["light-snack", "mexican"],
    allergenLabels: [],
    alimentos: ["Jicama", "Semillas de chia"],
    ingredientes: [
      { item: "Jicama", cantidad: "1 taza", grupo: "verdura" },
      { item: "Semillas de chia", cantidad: "1 cucharadita", grupo: "grasa" },
    ],
    pasos: ["Cortar la jícama.", "Servir con limón y semillas."],
    tags: ["mexicano", "fibra"],
    nota: "Gran opción de volumen y frescura.",
  },
  {
    nombre: "Tostadas de pollo con ensalada",
    categoria: "cenas_ligeras",
    tiempo: "cena",
    mealType: "lunch/dinner",
    dishType: "main course",
    cuisineType: "mexican",
    porciones: 1,
    tiempoPrep: 15,
    objetivo: ["general", "control_peso", "hipertrofia"],
    healthLabels: ["high-protein", "light-dinner"],
    dietLabels: ["mexican", "quick-dinner"],
    allergenLabels: [],
    alimentos: ["Pechuga de pollo", "Tortilla de maiz", "Lechuga", "Jitomate"],
    ingredientes: [
      { item: "Pechuga de pollo", cantidad: "120 g", grupo: "proteina" },
      { item: "Tortilla de maiz", cantidad: "2 piezas", grupo: "cereal" },
      { item: "Lechuga", cantidad: "1 taza", grupo: "verdura" },
      { item: "Jitomate", cantidad: "1/2 taza", grupo: "verdura" },
    ],
    pasos: ["Preparar tostadas horneadas.", "Agregar pollo deshebrado.", "Servir con ensalada fresca."],
    tags: ["cena_rapida", "mexicano"],
    nota: "Cena con buena adherencia familiar.",
  },
  {
    nombre: "Sopa de verduras con panela",
    categoria: "cenas_ligeras",
    tiempo: "cena",
    mealType: "lunch/dinner",
    dishType: "soup",
    cuisineType: "general",
    porciones: 1,
    tiempoPrep: 18,
    objetivo: ["control_peso", "general", "digestivo"],
    healthLabels: ["light-dinner", "high-volume"],
    dietLabels: ["comfort-food"],
    allergenLabels: ["dairy"],
    alimentos: ["Calabacita", "Jitomate", "Queso panela"],
    ingredientes: [
      { item: "Calabacita", cantidad: "1 taza", grupo: "verdura" },
      { item: "Jitomate", cantidad: "1 taza", grupo: "verdura" },
      { item: "Queso panela", cantidad: "60 g", grupo: "proteina" },
    ],
    pasos: ["Preparar sopa de verduras.", "Agregar panela al servir."],
    tags: ["ligero", "cena"],
    nota: "Muy útil cuando el paciente busca una cena reconfortante.",
  },
  {
    nombre: "Tofu con arroz y verduras",
    categoria: "cenas_ligeras",
    tiempo: "cena",
    mealType: "lunch/dinner",
    dishType: "main course",
    cuisineType: "asian",
    porciones: 1,
    tiempoPrep: 18,
    objetivo: ["vegetariano", "general", "control_peso"],
    healthLabels: ["plant-protein", "balanced-plate"],
    dietLabels: ["vegetarian"],
    allergenLabels: ["soy"],
    alimentos: ["Tofu firme", "Arroz integral", "Calabacita", "Jitomate"],
    ingredientes: [
      { item: "Tofu firme", cantidad: "120 g", grupo: "proteina" },
      { item: "Arroz integral", cantidad: "1/2 taza", grupo: "cereal" },
      { item: "Calabacita", cantidad: "1 taza", grupo: "verdura" },
      { item: "Jitomate", cantidad: "1 taza", grupo: "verdura" },
    ],
    pasos: ["Saltear tofu.", "Agregar verduras.", "Servir con arroz."],
    tags: ["vegetariano", "cena"],
    nota: "Alternativa vegetal útil para variar proteína.",
  },
  {
    nombre: "Ensalada tibia de lentejas",
    categoria: "cenas_ligeras",
    tiempo: "cena",
    mealType: "lunch/dinner",
    dishType: "salad",
    cuisineType: "general",
    porciones: 1,
    tiempoPrep: 15,
    objetivo: ["vegetariano", "cardiometabolico", "general"],
    healthLabels: ["high-fiber", "plant-protein"],
    dietLabels: ["vegetarian", "light-dinner"],
    allergenLabels: [],
    alimentos: ["Lentejas cocidas", "Lechuga", "Pepino", "Aguacate"],
    ingredientes: [
      { item: "Lentejas cocidas", cantidad: "3/4 taza", grupo: "leguminosas" },
      { item: "Lechuga", cantidad: "2 tazas", grupo: "verdura" },
      { item: "Pepino", cantidad: "1 taza", grupo: "verdura" },
      { item: "Aguacate", cantidad: "1/4 pieza", grupo: "grasa" },
    ],
    pasos: ["Calentar ligeramente las lentejas.", "Montar sobre ensalada.", "Agregar aguacate."],
    tags: ["fibra", "vegetariano"],
    nota: "Cena muy útil para pacientes con apetito nocturno moderado.",
  },
];

const GENERATED_PREPARATION_TEMPLATES = EXPANDED_RECIPE_BLUEPRINTS.map((recipe, index) => ({
  id: `prep_auto_${index + 1}`,
  categoria: recipe.categoria,
  nombre: recipe.nombre,
  tiempo: recipe.tiempo,
  alimentos: recipe.alimentos,
  nota: recipe.nota,
}));

const GENERATED_STRUCTURED_RECIPES = EXPANDED_RECIPE_BLUEPRINTS.map((recipe, index) => ({
  id: `recipe_auto_${index + 1}`,
  nombre: recipe.nombre,
  categoria: recipe.tiempo === "desayuno" ? "desayuno" : recipe.tiempo.includes("colacion") ? "colacion" : recipe.tiempo,
  mealType: recipe.mealType,
  dishType: recipe.dishType,
  cuisineType: recipe.cuisineType,
  porciones: recipe.porciones,
  yield: recipe.porciones,
  tiempoPrep: recipe.tiempoPrep,
  objetivo: recipe.objetivo,
  healthLabels: recipe.healthLabels,
  dietLabels: recipe.dietLabels,
  allergenLabels: recipe.allergenLabels,
  ingredientes: recipe.ingredientes,
  pasos: recipe.pasos,
  tags: recipe.tags,
}));

const EXPANDED_CLINICAL_TEMPLATES = [
  {
    id: "tpl_hipertension",
    nombre: "Template Hipertensión",
    perfil: "cardiometabolico",
    descripcion: "Bajo en sodio, alto en potasio y con preparaciones simples de alta adherencia.",
    weekAssignments: {
      desayuno: "Overnight oats tropical",
      colacion_matutina: "Jícama con limón y semillas",
      comida: "Salmón con papa y ensalada",
      colacion_vespertina: "Queso cottage con pera",
      cena: "Sopa de verduras con panela",
    },
  },
  {
    id: "tpl_sindrome_metabolico",
    nombre: "Template Síndrome metabólico",
    perfil: "diabetes",
    descripcion: "Distribución conservadora de carbohidrato y énfasis en fibra y proteína.",
    weekAssignments: {
      desayuno: "Tacos de huevo con espinaca",
      colacion_matutina: "Jícama con limón y semillas",
      comida: "Bowl mediterráneo de pollo",
      colacion_vespertina: "Queso cottage con pera",
      cena: "Ensalada tibia de lentejas",
    },
  },
  {
    id: "tpl_glp1",
    nombre: "Template GLP-1 / baja tolerancia",
    perfil: "obesidad",
    descripcion: "Preparaciones pequeñas, digestivas y fáciles de sostener con menor volumen por tiempo.",
    weekAssignments: {
      desayuno: "Overnight oats tropical",
      colacion_matutina: "Queso cottage con pera",
      comida: "Wrap integral de atún",
      colacion_vespertina: "Yogur con mango y avena",
      cena: "Sopa de verduras con panela",
    },
  },
  {
    id: "tpl_vegetariano",
    nombre: "Template Vegetariano alto en proteína",
    perfil: "general",
    descripcion: "Rotación vegetal con leguminosas, tofu y lácteos altos en proteína.",
    weekAssignments: {
      desayuno: "Hot cakes de avena con yogur",
      colacion_matutina: "Jícama con limón y semillas",
      comida: "Lentejas con arroz y aguacate",
      colacion_vespertina: "Queso cottage con pera",
      cena: "Tofu con arroz y verduras",
    },
  },
  {
    id: "tpl_portal_rapido",
    nombre: "Template Adherencia rápida",
    perfil: "general",
    descripcion: "Pensado para pacientes que necesitan velocidad, practicidad y comidas repetibles.",
    weekAssignments: {
      desayuno: "Overnight oats tropical",
      colacion_matutina: "Plátano con crema de cacahuate",
      comida: "Wrap integral de atún",
      colacion_vespertina: "Yogur con mango y avena",
      cena: "Tostadas de pollo con ensalada",
    },
  },
];

const ALL_PREPARATION_TEMPLATES = [...PREPARATION_TEMPLATES, ...GENERATED_PREPARATION_TEMPLATES];
const ALL_STRUCTURED_RECIPES = [...STRUCTURED_RECIPES, ...GENERATED_STRUCTURED_RECIPES];
const ALL_CLINICAL_TEMPLATES = [...CLINICAL_TEMPLATES, ...EXPANDED_CLINICAL_TEMPLATES];

const SMART_DISHES_FALLBACK = [
  { id: "1", name: "Avena clinica", category: "desayuno", mealType: "breakfast", dishType: "porridge", cuisineType: "general", protein: 20, carbs: 40, fat: 10, kcal: 330, tags: ["diabetes", "fibra"], healthLabels: ["diabetes-friendly", "high-fiber"], dietLabels: ["breakfast"], allergenLabels: ["dairy"] },
  { id: "2", name: "Huevos con nopales", category: "desayuno", mealType: "breakfast", dishType: "egg", cuisineType: "mexican", protein: 24, carbs: 18, fat: 14, kcal: 290, tags: ["desayuno_mexicano", "alto_proteina"], healthLabels: ["diabetes-friendly", "high-protein"], dietLabels: ["mexican-breakfast"], allergenLabels: ["egg"] },
  { id: "3", name: "Pollo con quinoa", category: "comida", mealType: "lunch/dinner", dishType: "main course", cuisineType: "general", protein: 42, carbs: 35, fat: 12, kcal: 420, tags: ["diabetes", "alto_proteina", "resistencia"], healthLabels: ["high-protein", "performance"], dietLabels: ["balanced-plate"], allergenLabels: [] },
  { id: "4", name: "Ensalada clinica", category: "comida", mealType: "lunch/dinner", dishType: "salad", cuisineType: "general", protein: 35, carbs: 10, fat: 12, kcal: 250, tags: ["bajo_calorias", "obesidad"], healthLabels: ["weight-management"], dietLabels: ["light-lunch"], allergenLabels: [] },
  { id: "5", name: "Bowl hipertrofia", category: "comida", mealType: "lunch/dinner", dishType: "main course", cuisineType: "general", protein: 55, carbs: 45, fat: 20, kcal: 600, tags: ["ganancia_musculo", "hipertrofia"], healthLabels: ["high-protein", "performance"], dietLabels: ["bulk"], allergenLabels: [] },
  { id: "6", name: "Smoothie recovery", category: "snack", mealType: "snack", dishType: "snack", cuisineType: "general", protein: 30, carbs: 40, fat: 5, kcal: 300, tags: ["post_entreno", "rendimiento"], healthLabels: ["post-workout", "performance"], dietLabels: ["recovery"], allergenLabels: ["dairy"] },
  { id: "7", name: "Ensalada con salmon", category: "cena", mealType: "lunch/dinner", dishType: "salad", cuisineType: "mediterranean", protein: 32, carbs: 10, fat: 18, kcal: 330, tags: ["cena_ligera", "omega_3"], healthLabels: ["heart-healthy", "weight-management"], dietLabels: ["light-dinner"], allergenLabels: ["fish"] },
];

const EMPTY_PATIENT = {
  nombre: "",
  apellidos: "",
  edad: "",
  sexo: "femenino",
  fecha_nac: "",
  telefono: "",
  email: "",
  objetivo: "",
  discapacidad: "",
  notas: "",
  motivo_consulta: "",
  antecedentes_personales: "",
  antecedentes_familiares: "",
  medicamentos: "",
  alergias: "",
  suplementacion: "",
  actividad_fisica_base: "",
};

const EMPTY_FORM = {
  paciente_id: "",
  fecha: new Date().toISOString().split("T")[0],
  hora: "10:00",
  tipo_cita: "seguimiento",
  motivo: "",
  peso: "",
  talla: "",
  cintura: "",
  cadera: "",
  brazo: "",
  circunferencia_brazo_relajado: "",
  circunferencia_brazo_flexionado: "",
  circunferencia_muslo: "",
  circunferencia_pantorrilla: "",
  perimetro_torax: "",
  perimetro_muslo: "",
  perimetro_pantorrilla: "",
  diametro_humero: "",
  diametro_biestiloideo: "",
  diametro_rodilla: "",
  pliegue_triceps: "",
  pliegue_biceps: "",
  pliegue_subescapular: "",
  pliegue_cresta_iliaca: "",
  pliegue_supraespinal: "",
  pliegue_abdominal: "",
  pliegue_muslo: "",
  pliegue_pantorrilla: "",
  antrop_obs: "",
  glucosa: "",
  hba1c: "",
  colesterol_total: "",
  trigliceridos: "",
  hdl: "",
  ldl: "",
  vit_d: "",
  ferritina: "",
  bio_obs: "",
  adherencia: "buena",
  recordatorio_24h: "",
  desayuno_24h: "",
  colacion_am_24h: "",
  comida_24h: "",
  colacion_pm_24h: "",
  cena_24h: "",
  bebidas_24h: "",
  observaciones_24h: "",
  hambre: "3",
  saciedad: "3",
  hidratacion: "3",
  dieta_obs: "",
  diagnostico_nutricional: "",
  adime_valoracion: "",
  adime_diagnostico: "",
  adime_intervencion: "",
  adime_monitoreo: "",
  objetivos: "",
  indicaciones: "",
  proxima_cita: "",
  estado: "completada",
};

const inputBase = {
  width: "100%",
  boxSizing: "border-box",
  background: colors.surfaceSoft,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  color: colors.text,
  padding: "10px 14px",
  fontSize: 13,
  outline: "none",
  fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
};
const lbl = { fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: 0.4, marginBottom: 6, display: "block" };

function round1(value) {
  return Math.round((Number(value) + Number.EPSILON) * 10) / 10;
}
function numOrNull(value) {
  return value === "" || value === null || value === undefined ? null : Number(value);
}
function createEmptyWeeklyPlan() {
  return Object.fromEntries(
    WEEK_DAYS.map(day => [day, Object.fromEntries(WEEKLY_MEAL_SLOTS.map(slot => [slot.id, ""]))])
  );
}
function createEmptyWeeklyRecipeRefs() {
  return Object.fromEntries(
    WEEK_DAYS.map(day => [day, Object.fromEntries(WEEKLY_MEAL_SLOTS.map(slot => [slot.id, ""]))])
  );
}
function normalizeTemplateSlot(slotId) {
  if (slotId === "colacion_am") return "colacion_matutina";
  if (slotId === "colacion_pm") return "colacion_vespertina";
  return slotId;
}
function getAvatar(nombre = "", apellidos = "") {
  return ((nombre[0] || "") + (apellidos[0] || "")).toUpperCase() || "LJ";
}
function normalizeLabelList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "").split(/[|;,]/).map(item => item.trim()).filter(Boolean);
}
function normalizeFoodRow(item, source = "custom") {
  return {
    name: item.name,
    kcal: Number(item.kcal || 0),
    prot: Number(item.prot || 0),
    carbs: Number(item.carbs || 0),
    fat: Number(item.fat || 0),
    porcion: item.porcion || "",
    grupo: item.grupo || "otros",
    intercambio: item.intercambio || "",
    tiempos: item.tiempos || ["comida"],
    tags: item.tags || [],
    source,
  };
}
function inferRecipeDifficulty(recipe) {
  const prepTime = Number(recipe.tiempoPrep || recipe.tiempo_prep || 0);
  if (prepTime && prepTime <= 12) return "facil";
  if (prepTime && prepTime <= 25) return "media";
  return "avanzada";
}
function slugifyRecipe(text = "") {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function normalizeRecipeRecord(recipe, source = "local") {
  const objetivos = normalizeLabelList(recipe.objetivos || recipe.objetivo);
  const condiciones = normalizeLabelList(recipe.condiciones_compatibles || recipe.condicionesCompatibles || recipe.condiciones || objetivos);
  const tags = normalizeLabelList(recipe.tags);
  const ingredientes = Array.isArray(recipe.ingredientes) ? recipe.ingredientes.map(item => ({
    item: item.item || item.nombre || item.name || "",
    cantidad: item.cantidad || item.amount || item.qty || "",
    grupo: item.grupo || item.group || "otros",
  })).filter(item => item.item) : [];
  const pasos = Array.isArray(recipe.pasos) ? recipe.pasos : normalizeLabelList(recipe.pasos);
  const sustituciones = Array.isArray(recipe.sustituciones)
    ? recipe.sustituciones
    : normalizeLabelList(recipe.sustituciones).map(item => ({ original: "", opciones: [item] }));
  return {
    ...recipe,
    id: String(recipe.id || recipe.recipe_uid || slugifyRecipe(recipe.nombre || recipe.name)),
    nombre: recipe.nombre || recipe.name || "Receta",
    descripcion: recipe.descripcion || recipe.descripcion_corta || `Preparación ${recipe.nombre || recipe.name || "sin nombre"} orientada a ${objetivos.join(", ") || "consulta nutricional"}.`,
    categoria: recipe.categoria || recipe.category || "comida",
    mealType: recipe.meal_type || recipe.mealType || "lunch/dinner",
    dishType: recipe.dish_type || recipe.dishType || "main course",
    cuisineType: recipe.cuisine_type || recipe.cuisineType || "general",
    porciones: Number(recipe.porciones || recipe.yield || 1),
    yield: Number(recipe.yield || recipe.porciones || 1),
    tiempoPrep: Number(recipe.tiempoPrep || recipe.tiempo_prep || 15),
    difficulty: recipe.difficulty || inferRecipeDifficulty(recipe),
    objetivo: objetivos,
    condicionesCompatibles: condiciones,
    healthLabels: normalizeLabelList(recipe.health_labels || recipe.healthLabels),
    dietLabels: normalizeLabelList(recipe.diet_labels || recipe.dietLabels),
    allergenLabels: normalizeLabelList(recipe.allergen_labels || recipe.allergenLabels),
    ingredientes,
    pasos,
    sustituciones,
    macros: recipe.macros || {
      kcal: Number(recipe.kcal || 0),
      protein: Number(recipe.protein || recipe.proteina || 0),
      carbs: Number(recipe.carbs || recipe.carbohidratos || 0),
      fat: Number(recipe.fat || recipe.grasas || 0),
    },
    micros: recipe.micros || recipe.micronutrientes || {},
    tags,
    source,
  };
}
function normalizeClinicalTemplateRecord(template, source = "local") {
  return {
    ...template,
    id: String(template.id || slugifyRecipe(template.nombre)),
    nombre: template.nombre || "Template clínico",
    perfil: template.perfil || "general",
    descripcion: template.descripcion || "Template clínico personalizado.",
    weekAssignments: template.week_assignments || template.weekAssignments || {},
    recommendedRecipeUids: normalizeLabelList(template.recommended_recipe_uids || template.recommendedRecipeUids),
    allowedTags: normalizeLabelList(template.allowed_tags || template.allowedTags),
    blockedAllergens: normalizeLabelList(template.blocked_allergens || template.blockedAllergens),
    source,
  };
}
function getStructuredRecipeByName(name, recipeCatalog = ALL_STRUCTURED_RECIPES) {
  return recipeCatalog.find(recipe => recipe.nombre === name) || null;
}
function getStructuredRecipeByUid(uid, recipeCatalog = ALL_STRUCTURED_RECIPES) {
  if (!uid) return null;
  return recipeCatalog.find(recipe => String(recipe.id) === String(uid)) || null;
}
function getRecipeCompatibleSlots(recipe) {
  const category = String(recipe?.categoria || "").toLowerCase();
  const mealType = String(recipe?.mealType || "").toLowerCase();
  if (category.includes("desay")) return ["desayuno"];
  if (category.includes("colacion")) return ["colacion_matutina", "colacion_vespertina"];
  if (category.includes("cena")) return ["cena"];
  if (mealType === "breakfast") return ["desayuno"];
  if (mealType === "snack") return ["colacion_matutina", "colacion_vespertina"];
  return ["comida", "cena"];
}
function buildWeeklyRecipes(weeklyPlan, recipeCatalog = ALL_STRUCTURED_RECIPES, weeklyRecipeRefs = null) {
  const resolved = [];
  const seen = new Set();
  WEEK_DAYS.forEach(day => {
    WEEKLY_MEAL_SLOTS.forEach(slot => {
      const recipeUid = weeklyRecipeRefs?.[day]?.[slot.id];
      const recipeName = weeklyPlan?.[day]?.[slot.id];
      const recipe = (recipeUid ? getStructuredRecipeByUid(recipeUid, recipeCatalog) : null) || getStructuredRecipeByName(recipeName, recipeCatalog);
      if (recipe && !seen.has(recipe.id)) {
        seen.add(recipe.id);
        resolved.push(recipe);
      }
    });
  });
  return resolved;
}
function buildGroceryList(recipes = []) {
  const grouped = {};
  recipes.forEach(recipe => {
    recipe.ingredientes.forEach(ingredient => {
      if (!grouped[ingredient.grupo]) grouped[ingredient.grupo] = [];
      grouped[ingredient.grupo].push(`${ingredient.item} · ${ingredient.cantidad}`);
    });
  });
  return Object.entries(grouped).map(([grupo, items]) => ({ grupo, items: [...new Set(items)] }));
}
function countAssignedMeals(weeklyPlan) {
  return WEEK_DAYS.reduce((total, day) => (
    total + WEEKLY_MEAL_SLOTS.filter(slot => weeklyPlan?.[day]?.[slot.id]).length
  ), 0);
}
function getFoodRecipe(food) {
  const recipes = {
    "Pechuga de pollo": "Bowl con pollo a la plancha, arroz y verduras salteadas.",
    "Salmon": "Salmon al horno con ensalada fresca y aguacate.",
    "Huevo entero": "Huevos revueltos con espinaca y tortillas de maiz.",
    "Yogur griego natural": "Parfait con yogur, avena y fruta fresca.",
    "Atun en agua": "Ensalada de atun con verduras frescas y tostadas horneadas.",
    "Queso panela": "Queso panela asado con salsa, verduras o en ensalada.",
    "Tofu firme": "Tofu salteado con verduras y salsa ligera.",
    "Frijoles negros cocidos": "Tostadas con frijoles, nopales y queso panela.",
    "Lentejas cocidas": "Sopa de lentejas con verduras y limon.",
    "Arroz integral": "Tazon de arroz integral con proteina magra y verduras.",
    "Avena": "Avena cocida con canela, fruta y semillas.",
    "Tortilla de maiz": "Tacos caseros con proteina y vegetales.",
    "Aguacate": "Tostada o ensalada con aguacate y limon.",
    "Nueces": "Colacion con nueces y una fruta.",
    "Semillas de chia": "Chia hidratada con yogur, fruta o avena.",
    "Nopales": "Nopales asados o en ensalada con jitomate y cebolla.",
  };
  return recipes[food?.name] || `Preparacion simple con ${String(food?.name || "").toLowerCase()} segun objetivo del paciente.`;
}
function getFoodSubstitutions(food, catalog = foodDatabase) {
  return catalog
    .filter(item => item.grupo === food.grupo && item.name !== food.name)
    .slice(0, 3)
    .map(item => item.name);
}
function getFoodMicronutrients(food) {
  const defaultsByGroup = {
    proteinas: { fiber: 0, calcium: 40, zinc: 1.8, copper: 0.08, choline: 70, pantothenic: 0.6 },
    cereales: { fiber: 3, calcium: 25, zinc: 1.1, copper: 0.12, choline: 24, pantothenic: 0.4 },
    leguminosas: { fiber: 7, calcium: 35, zinc: 1.2, copper: 0.2, choline: 38, pantothenic: 0.5 },
    frutas: { fiber: 3, calcium: 18, zinc: 0.1, copper: 0.07, choline: 10, pantothenic: 0.2 },
    verduras: { fiber: 2.5, calcium: 30, zinc: 0.2, copper: 0.06, choline: 12, pantothenic: 0.15 },
    grasas: { fiber: 1.5, calcium: 15, zinc: 0.3, copper: 0.15, choline: 6, pantothenic: 0.1 },
    lacteos: { fiber: 0, calcium: 180, zinc: 0.9, copper: 0.02, choline: 18, pantothenic: 0.35 },
    otros: { fiber: 0.5, calcium: 10, zinc: 0.1, copper: 0.03, choline: 5, pantothenic: 0.1 },
  };
  const overrides = {
    "Avena": { fiber: 5, calcium: 54, zinc: 1.6, copper: 0.2, choline: 14, pantothenic: 0.9 },
    "Leche descremada": { fiber: 0, calcium: 300, zinc: 1, copper: 0.02, choline: 43, pantothenic: 0.8 },
    "Platano": { fiber: 3.1, calcium: 6, zinc: 0.2, copper: 0.09, choline: 12, pantothenic: 0.4 },
    "Manzana": { fiber: 4.4, calcium: 11, zinc: 0.1, copper: 0.05, choline: 6, pantothenic: 0.1 },
    "Yogur griego natural": { fiber: 0, calcium: 110, zinc: 0.9, copper: 0.02, choline: 15, pantothenic: 0.5 },
    "Frijoles negros cocidos": { fiber: 7.5, calcium: 23, zinc: 1, copper: 0.2, choline: 32, pantothenic: 0.4 },
    "Lentejas cocidas": { fiber: 7.8, calcium: 19, zinc: 1.3, copper: 0.25, choline: 33, pantothenic: 0.6 },
    "Pechuga de pollo": { fiber: 0, calcium: 15, zinc: 1, copper: 0.04, choline: 85, pantothenic: 1.2 },
    "Salmon": { fiber: 0, calcium: 12, zinc: 0.6, copper: 0.05, choline: 90, pantothenic: 1.4 },
    "Huevo entero": { fiber: 0, calcium: 56, zinc: 1.3, copper: 0.04, choline: 147, pantothenic: 1.4 },
  };
  return overrides[food?.name] || defaultsByGroup[food?.grupo] || defaultsByGroup.otros;
}
function summarizeFoods(foods = []) {
  return foods.reduce((acc, food) => {
    const micronutrients = getFoodMicronutrients(food);
    return {
      kcal: acc.kcal + Number(food.kcal || 0),
      prot: acc.prot + Number(food.prot || 0),
      carbs: acc.carbs + Number(food.carbs || 0),
      fat: acc.fat + Number(food.fat || 0),
      fiber: acc.fiber + Number(micronutrients.fiber || 0),
      calcium: acc.calcium + Number(micronutrients.calcium || 0),
      zinc: acc.zinc + Number(micronutrients.zinc || 0),
      copper: acc.copper + Number(micronutrients.copper || 0),
      choline: acc.choline + Number(micronutrients.choline || 0),
      pantothenic: acc.pantothenic + Number(micronutrients.pantothenic || 0),
    };
  }, { kcal: 0, prot: 0, carbs: 0, fat: 0, fiber: 0, calcium: 0, zinc: 0, copper: 0, choline: 0, pantothenic: 0 });
}
function getClinicalTemplateByCondition(condition, templateCatalog = ALL_CLINICAL_TEMPLATES) {
  return templateCatalog.find(template => template.perfil === condition) || templateCatalog[0];
}
function normalizeSmartDish(dish) {
  return {
    ...dish,
    tags: normalizeLabelList(dish.tags),
    healthLabels: normalizeLabelList(dish.health_labels || dish.healthLabels),
    dietLabels: normalizeLabelList(dish.diet_labels || dish.dietLabels),
    allergenLabels: normalizeLabelList(dish.allergen_labels || dish.allergenLabels),
    mealType: dish.meal_type || dish.mealType || "lunch/dinner",
    dishType: dish.dish_type || dish.dishType || "main course",
    cuisineType: dish.cuisine_type || dish.cuisineType || "general",
    protein: Number(dish.protein || 0),
    carbs: Number(dish.carbs || 0),
    fat: Number(dish.fat || 0),
    kcal: Number(dish.kcal || 0),
  };
}
function recipeMatchesEdamamFilters(recipe, filters) {
  if (filters.mealType !== "todos" && recipe.mealType !== filters.mealType) return false;
  if (filters.dishType !== "todos" && recipe.dishType !== filters.dishType) return false;
  if (filters.cuisineType !== "todos" && recipe.cuisineType !== filters.cuisineType) return false;
  if (filters.clinicalLabel !== "todos" && !normalizeLabelList(recipe.healthLabels).includes(filters.clinicalLabel)) return false;
  return true;
}
function foodMatchesExtendedFilters(food, filters) {
  if (filters.mealSlot !== "todos" && !food.tiempos?.includes(filters.mealSlot)) return false;
  if (filters.clinicalLabel !== "todos") {
    const needle = filters.clinicalLabel.toLowerCase().replaceAll("-", "_");
    const tags = normalizeLabelList(food.tags).map(tag => String(tag).toLowerCase().replaceAll("-", "_").replaceAll(" ", "_"));
    if (!tags.some(tag => tag.includes(needle) || needle.includes(tag))) return false;
  }
  return true;
}
function getYuhaszData({ sexo, peso, pliegue_triceps, pliegue_subescapular, pliegue_cresta_iliaca, pliegue_abdominal, pliegue_muslo, pliegue_pantorrilla }) {
  const sum = [pliegue_triceps, pliegue_subescapular, pliegue_cresta_iliaca, pliegue_abdominal, pliegue_muslo, pliegue_pantorrilla].map(Number).filter(v => !Number.isNaN(v));
  const bodyWeight = Number(peso);
  if (!sexo || !bodyWeight || sum.length !== 6) return null;
  const total = sum.reduce((acc, value) => acc + value, 0);
  const female = String(sexo).toLowerCase().includes("fem");
  const grasaPct = female ? 4.56 + (0.143 * total) : 3.64 + (0.097 * total);
  const grasaKg = bodyWeight * (grasaPct / 100);
  return {
    grasaPct: round1(grasaPct),
    grasaKg: round1(grasaKg),
    libreGrasaPct: round1(100 - grasaPct),
    libreGrasaKg: round1(bodyWeight - grasaKg),
  };
}
function getFaulknerData({ peso, pliegue_triceps, pliegue_subescapular, pliegue_cresta_iliaca, pliegue_abdominal }) {
  const sum = [pliegue_triceps, pliegue_subescapular, pliegue_cresta_iliaca, pliegue_abdominal].map(Number).filter(v => !Number.isNaN(v));
  const bodyWeight = Number(peso);
  if (!bodyWeight || sum.length !== 4) return null;
  const grasaPct = 5.783 + 0.153 * sum.reduce((acc, value) => acc + value, 0);
  const grasaKg = bodyWeight * (grasaPct / 100);
  return {
    grasaPct: round1(grasaPct),
    grasaKg: round1(grasaKg),
    libreGrasaPct: round1(100 - grasaPct),
    libreGrasaKg: round1(bodyWeight - grasaKg),
  };
}
function getBodyFatInterpretation(sexo, grasaPct) {
  const pct = Number(grasaPct);
  if (!pct) return null;
  const female = String(sexo || "").toLowerCase().includes("fem");
  if (female) {
    if (pct < 14) return { label: "Muy baja", note: "Lectura muy baja para grasa corporal; revisar contexto clínico y objetivo." };
    if (pct < 21) return { label: "Atlética", note: "Rango bajo/atlético con buen control de grasa corporal." };
    if (pct < 25) return { label: "Adecuada", note: "Rango funcional y clínicamente adecuado para muchas pacientes." };
    if (pct < 32) return { label: "Moderadamente elevada", note: "Sugiere reserva adiposa aumentada; interpretar junto con IMC y cintura." };
    return { label: "Elevada", note: "Reserva adiposa alta; conviene integrarlo con riesgo cardiometabólico." };
  }
  if (pct < 6) return { label: "Muy baja", note: "Lectura muy baja para grasa corporal; revisar contexto clínico y objetivo." };
  if (pct < 14) return { label: "Atlética", note: "Rango bajo/atlético con buen control de grasa corporal." };
  if (pct < 18) return { label: "Adecuada", note: "Rango funcional y clínicamente adecuado para muchos pacientes." };
  if (pct < 25) return { label: "Moderadamente elevada", note: "Sugiere reserva adiposa aumentada; interpretar junto con IMC y cintura." };
  return { label: "Elevada", note: "Reserva adiposa alta; conviene integrarlo con riesgo cardiometabólico." };
}
function getMuscleInterpretation(musclePct) {
  const pct = Number(musclePct);
  if (!pct) return null;
  if (pct < 30) return { label: "Baja", note: "La masa muscular estimada es baja y puede limitar rendimiento o funcionalidad." };
  if (pct < 38) return { label: "Moderada", note: "Masa muscular presente pero con margen de mejora según objetivo clínico-deportivo." };
  if (pct < 46) return { label: "Buena", note: "Componente muscular adecuado para mantenimiento o progreso." };
  return { label: "Alta", note: "Masa muscular elevada para la lectura antropométrica actual." };
}
function getSkinfoldBand(value) {
  const numeric = Number(value);
  if (!numeric && numeric !== 0) return null;
  if (numeric < 8) return "Muy bajo";
  if (numeric < 15) return "Bajo";
  if (numeric < 25) return "Moderado";
  if (numeric < 35) return "Elevado";
  return "Muy elevado";
}
function getSkinfoldBandTone(band) {
  if (band === "Muy bajo") return { text: "#60a5fa", bg: "rgba(59, 130, 246, 0.14)", border: "rgba(96, 165, 250, 0.35)" };
  if (band === "Bajo") return { text: "#93c5fd", bg: "rgba(96, 165, 250, 0.12)", border: "rgba(147, 197, 253, 0.28)" };
  if (band === "Moderado") return { text: "#4ade80", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(74, 222, 128, 0.28)" };
  if (band === "Elevado") return { text: "#fbbf24", bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.28)" };
  if (band === "Muy elevado") return { text: "#f87171", bg: "rgba(248, 113, 113, 0.12)", border: "rgba(248, 113, 113, 0.28)" };
  return { text: "#64748b", bg: "rgba(148, 163, 184, 0.08)", border: "rgba(148, 163, 184, 0.18)" };
}
function getSkinfoldDistributionInterpretation(consulta) {
  if (!consulta) return null;
  const central = [
    Number(consulta.pliegue_subescapular),
    Number(consulta.pliegue_cresta_iliaca),
    Number(consulta.pliegue_supraespinal),
    Number(consulta.pliegue_abdominal),
  ].filter(value => !Number.isNaN(value));
  const peripheral = [
    Number(consulta.pliegue_triceps),
    Number(consulta.pliegue_biceps),
    Number(consulta.pliegue_muslo),
    Number(consulta.pliegue_pantorrilla),
  ].filter(value => !Number.isNaN(value));
  if (!central.length || !peripheral.length) return null;
  const centralAvg = central.reduce((acc, value) => acc + value, 0) / central.length;
  const peripheralAvg = peripheral.reduce((acc, value) => acc + value, 0) / peripheral.length;
  const ratio = centralAvg / peripheralAvg;
  if (ratio >= 1.18) {
    return {
      label: "Predominio central",
      note: "Los pliegues del tronco se observan proporcionalmente mayores que los periféricos; conviene correlacionarlo con cintura, IMC y riesgo cardiometabólico.",
      tone: "#fbbf24",
      ratio: round1(ratio),
      centralAvg: round1(centralAvg),
      peripheralAvg: round1(peripheralAvg),
    };
  }
  if (ratio <= 0.85) {
    return {
      label: "Predominio periférico",
      note: "La acumulación relativa se concentra más en extremidades que en tronco; interpretar según contexto deportivo, sexo y etapa clínica.",
      tone: "#60a5fa",
      ratio: round1(ratio),
      centralAvg: round1(centralAvg),
      peripheralAvg: round1(peripheralAvg),
    };
  }
  return {
    label: "Distribución equilibrada",
    note: "La relación tronco-extremidades se mantiene relativamente balanceada en esta medición.",
    tone: "#4ade80",
    ratio: round1(ratio),
    centralAvg: round1(centralAvg),
    peripheralAvg: round1(peripheralAvg),
  };
}
function getCentralAdiposityAlert({ sexo, cintura, yuhaszPct, distributionLabel }) {
  const waist = Number(cintura);
  const fatPct = Number(yuhaszPct);
  const female = String(sexo || "").toLowerCase().includes("fem");
  const waistRisk = waist ? (female ? waist >= 88 : waist >= 102) : false;
  const waistModerate = waist ? (female ? waist >= 80 : waist >= 94) : false;
  const fatHigh = fatPct ? (female ? fatPct >= 32 : fatPct >= 25) : false;
  const centralPattern = distributionLabel === "Predominio central";
  if (waistRisk || (centralPattern && fatHigh)) {
    return {
      level: "Alta prioridad",
      tone: "#f87171",
      note: "Se observan señales de adiposidad central aumentada; conviene revisarlo junto con cintura, IMC, glucosa y riesgo cardiometabólico.",
    };
  }
  if (waistModerate || centralPattern || fatHigh) {
    return {
      level: "Vigilancia",
      tone: "#fbbf24",
      note: "Hay datos que sugieren revisar distribución troncal y control metabólico en seguimiento.",
    };
  }
  return {
    level: "Sin alerta mayor",
    tone: "#4ade80",
    note: "La lectura actual no sugiere una alerta central dominante; mantener seguimiento clínico habitual.",
  };
}
function getObjectiveSemaphores({ objetivo, yuhasz, matiegka, distribution }) {
  const objective = String(objetivo || "").toLowerCase();
  const fatPct = Number(yuhasz?.grasaPct);
  const musclePct = Number(matiegka?.muscularPct);
  const central = distribution?.label === "Predominio central";
  const buildItem = (label, status, tone, note) => ({ label, status, tone, note });
  if (objective.includes("hipertrofia") || objective.includes("musculo")) {
    return [
      buildItem("Masa muscular", musclePct >= 38 ? "Favorable" : musclePct >= 32 ? "Intermedio" : "A reforzar", musclePct >= 38 ? "#4ade80" : musclePct >= 32 ? "#fbbf24" : "#f87171", "Basado en el porcentaje muscular estimado por Matiegka."),
      buildItem("Reserva adiposa", fatPct && fatPct <= 22 ? "Favorable" : fatPct && fatPct <= 28 ? "Intermedio" : "A vigilar", fatPct && fatPct <= 22 ? "#4ade80" : fatPct && fatPct <= 28 ? "#fbbf24" : "#f87171", "Conviene mantener un rango que permita progresar sin exceso de grasa."),
      buildItem("Distribucion", !central ? "Favorable" : "A vigilar", !central ? "#4ade80" : "#fbbf24", "Un patrón menos central suele acompañar mejor la progresión clínica-deportiva."),
    ];
  }
  if (objective.includes("grasa") || objective.includes("obes") || objective.includes("peso")) {
    return [
      buildItem("Grasa corporal", fatPct && fatPct < 25 ? "Favorable" : fatPct && fatPct < 32 ? "Intermedio" : "A reforzar", fatPct && fatPct < 25 ? "#4ade80" : fatPct && fatPct < 32 ? "#fbbf24" : "#f87171", "Lectura orientada al objetivo de reducción de grasa."),
      buildItem("Distribucion central", central ? "A reforzar" : "Favorable", central ? "#f87171" : "#4ade80", "Si predomina el tronco, conviene priorizar cintura, adherencia y seguimiento metabólico."),
      buildItem("Masa muscular", musclePct >= 30 ? "Sostenida" : "A vigilar", musclePct >= 30 ? "#4ade80" : "#fbbf24", "Importa preservar masa muscular durante el déficit energético."),
    ];
  }
  if (objective.includes("rendimiento") || objective.includes("resistencia") || objective.includes("sprint") || objective.includes("potencia")) {
    return [
      buildItem("Masa muscular", musclePct >= 34 ? "Favorable" : "Intermedio", musclePct >= 34 ? "#4ade80" : "#fbbf24", "Apoya la capacidad funcional y la tolerancia al entrenamiento."),
      buildItem("Grasa corporal", fatPct && fatPct <= 24 ? "Favorable" : "A vigilar", fatPct && fatPct <= 24 ? "#4ade80" : "#fbbf24", "La interpretación depende de disciplina, fase de entrenamiento y sexo."),
      buildItem("Distribucion", central ? "A vigilar" : "Favorable", central ? "#fbbf24" : "#4ade80", "La distribución menos central suele acompañar mejor el perfil cardiometabólico."),
    ];
  }
  return [
    buildItem("Grasa corporal", fatPct && fatPct <= 28 ? "Estable" : "A vigilar", fatPct && fatPct <= 28 ? "#4ade80" : "#fbbf24", "Lectura general para seguimiento nutricional."),
    buildItem("Masa muscular", musclePct >= 32 ? "Estable" : "A reforzar", musclePct >= 32 ? "#4ade80" : "#fbbf24", "Conviene interpretar junto con edad, funcionalidad y objetivo."),
    buildItem("Distribucion", central ? "A vigilar" : "Estable", central ? "#fbbf24" : "#4ade80", "Apoyo para lectura rápida en consulta."),
  ];
}
function getMatiegkaData({ peso, talla, brazo, perimetro_torax, perimetro_muslo, perimetro_pantorrilla, pliegue_triceps, pliegue_subescapular, pliegue_muslo, pliegue_pantorrilla }) {
  const values = [peso, talla, brazo, perimetro_torax, perimetro_muslo, perimetro_pantorrilla, pliegue_triceps, pliegue_subescapular, pliegue_muslo, pliegue_pantorrilla].map(Number);
  if (values.some(value => Number.isNaN(value) || value <= 0)) return null;
  const [bodyWeight, height, arm, thorax, thigh, calf, triceps, subesc, thighSkin, calfSkin] = values;
  const correctedArm = arm - (Math.PI * (triceps / 10));
  const correctedThigh = thigh - (Math.PI * (thighSkin / 10));
  const correctedCalf = calf - (Math.PI * (calfSkin / 10));
  const correctedThorax = thorax - (Math.PI * (subesc / 10));
  const muscularKg = ((height * (correctedArm + correctedThigh + correctedCalf + correctedThorax)) / 10000) * 0.12;
  return {
    muscularKg: round1(muscularKg),
    muscularPct: round1((muscularKg / bodyWeight) * 100),
  };
}
function getPetersonData({ sexo, edad, peso, pliegue_triceps, pliegue_subescapular, cintura, circunferencia_pantorrilla, circunferencia_brazo_relajado, circunferencia_muslo }) {
  const s = String(sexo || "").toLowerCase();
  const female = s.includes("fem");
  const age = Number(edad);
  const bodyWeight = Number(peso);
  const triceps = Number(pliegue_triceps);
  const subscap = Number(pliegue_subescapular);
  const waist = Number(cintura);
  const calf = Number(circunferencia_pantorrilla);
  const arm = Number(circunferencia_brazo_relajado);
  const thigh = Number(circunferencia_muslo);
  if (!bodyWeight || !age || !triceps || !waist || !calf) return null;
  let grasaPct = null;
  if (female && !Number.isNaN(subscap)) {
    grasaPct = 17.44 + (0.178 * triceps) + (0.664 * subscap) + (0.137 * age) + (0.162 * waist) + (0.092 * calf) - (0.1 * bodyWeight);
  } else if (!female && !Number.isNaN(arm) && !Number.isNaN(thigh)) {
    grasaPct = -15.8 + (0.26 * age) + (0.12 * triceps) + (0.568 * waist) + (0.101 * calf) - (0.07 * arm) - (0.098 * thigh);
  }
  if (grasaPct == null) return null;
  const grasaKg = bodyWeight * (grasaPct / 100);
  return {
    grasaPct: round1(grasaPct),
    grasaKg: round1(grasaKg),
    libreGrasaKg: round1(bodyWeight - grasaKg),
    libreGrasaPct: round1(100 - grasaPct),
  };
}
function getEvansBodyFatData({ sexo, peso, pliegue_triceps, pliegue_abdominal, pliegue_muslo, raceFactor = 0 }) {
  const bodyWeight = Number(peso);
  const triceps = Number(pliegue_triceps);
  const abdominal = Number(pliegue_abdominal);
  const thigh = Number(pliegue_muslo);
  if (!bodyWeight || !triceps || !abdominal || !thigh) return null;
  const sexFactor = String(sexo || "").toLowerCase().includes("masc") ? 1 : 0;
  const grasaPct = 8.997 + (0.24658 * (abdominal + thigh + triceps)) - (6.343 * sexFactor) - (1.998 * Number(raceFactor || 0));
  const grasaKg = bodyWeight * (grasaPct / 100);
  return {
    grasaPct: round1(grasaPct),
    grasaKg: round1(grasaKg),
    libreGrasaKg: round1(bodyWeight - grasaKg),
    libreGrasaPct: round1(100 - grasaPct),
    raceFactor: Number(raceFactor || 0),
  };
}
function getRfmData({ sexo, peso, talla, cintura }) {
  const bodyWeight = Number(peso);
  const height = Number(talla);
  const waist = Number(cintura);
  if (!bodyWeight || !height || !waist) return null;
  const sexFactor = String(sexo || "").toLowerCase().includes("fem") ? 1 : 0;
  const grasaPct = 64 - (20 * (height / waist)) + (12 * sexFactor);
  const grasaKg = bodyWeight * (grasaPct / 100);
  return {
    grasaPct: round1(grasaPct),
    grasaKg: round1(grasaKg),
    libreGrasaKg: round1(bodyWeight - grasaKg),
    libreGrasaPct: round1(100 - grasaPct),
  };
}
function getDeurenbergData({ sexo, edad, peso, talla }) {
  const age = Number(edad);
  const bodyWeight = Number(peso);
  const height = Number(talla);
  if (!age || !bodyWeight || !height) return null;
  const imc = bodyWeight / Math.pow(height / 100, 2);
  const sexFactor = String(sexo || "").toLowerCase().includes("masc") ? 1 : 0;
  const grasaPct = (1.2 * imc) + (0.23 * age) - (10.8 * sexFactor) - 5.4;
  const grasaKg = bodyWeight * (grasaPct / 100);
  return {
    grasaPct: round1(grasaPct),
    grasaKg: round1(grasaKg),
    libreGrasaKg: round1(bodyWeight - grasaKg),
    libreGrasaPct: round1(100 - grasaPct),
    imc: round1(imc),
  };
}
function getLeeAnthropometricMuscleData({
  sexo,
  edad,
  talla,
  circunferencia_brazo_relajado,
  circunferencia_muslo,
  circunferencia_pantorrilla,
  pliegue_triceps,
  pliegue_muslo,
  pliegue_pantorrilla,
  peso,
  raceFactor = 0,
}) {
  const age = Number(edad);
  const heightM = Number(talla) / 100;
  const arm = Number(circunferencia_brazo_relajado);
  const thigh = Number(circunferencia_muslo);
  const calf = Number(circunferencia_pantorrilla);
  const triceps = Number(pliegue_triceps);
  const thighSkin = Number(pliegue_muslo);
  const calfSkin = Number(pliegue_pantorrilla);
  const bodyWeight = Number(peso);
  if (!age || !heightM || !arm || !thigh || !calf || !triceps || !thighSkin || !calfSkin) return null;
  const correctedArm = arm - (Math.PI * (triceps / 10));
  const correctedThigh = thigh - (Math.PI * (thighSkin / 10));
  const correctedCalf = calf - (Math.PI * (calfSkin / 10));
  const sexFactor = String(sexo || "").toLowerCase().includes("masc") ? 1 : 0;
  const muscularKg = (heightM * ((0.00744 * correctedArm * correctedArm) + (0.00088 * correctedThigh * correctedThigh) + (0.00441 * correctedCalf * correctedCalf))) + (2.4 * sexFactor) - (0.048 * age) + Number(raceFactor || 0) + 7.8;
  return {
    muscularKg: round1(muscularKg),
    muscularPct: bodyWeight ? round1((muscularKg / bodyWeight) * 100) : null,
  };
}
function getLeeWeightHeightMuscleData({ sexo, edad, talla, peso, raceFactor = 0 }) {
  const age = Number(edad);
  const heightM = Number(talla) / 100;
  const bodyWeight = Number(peso);
  if (!age || !heightM || !bodyWeight) return null;
  const sexFactor = String(sexo || "").toLowerCase().includes("masc") ? 1 : 0;
  const muscularKg = (0.244 * bodyWeight) + (7.8 * heightM) + (6.6 * sexFactor) - (0.098 * age) + Number(raceFactor || 0) - 3.3;
  return {
    muscularKg: round1(muscularKg),
    muscularPct: round1((muscularKg / bodyWeight) * 100),
  };
}
function getVonDobelnBoneMass({ talla, diametro_biestiloideo, diametro_rodilla }) {
  const heightM = Number(talla) / 100;
  const biestyloidM = Number(diametro_biestiloideo) / 100;
  const femurM = Number(diametro_rodilla) / 100;
  if (!heightM || !biestyloidM || !femurM) return null;
  const boneKg = 3.02 * Math.pow((heightM * heightM * biestyloidM * femurM * 400), 0.712);
  return round1(boneKg);
}
function getWurchResidualMass({ peso, sexo }) {
  const bodyWeight = Number(peso);
  if (!bodyWeight) return null;
  const factor = String(sexo || "").toLowerCase().includes("masc") ? 24.1 : 20.9;
  return round1(bodyWeight * (factor / 100));
}
function getDerivedMuscleMass({ peso, fatKg, boneKg, residualKg }) {
  const bodyWeight = Number(peso);
  if (!bodyWeight || fatKg == null || boneKg == null || residualKg == null) return null;
  const muscularKg = bodyWeight - Number(fatKg) - Number(boneKg) - Number(residualKg);
  return {
    muscularKg: round1(muscularKg),
    muscularPct: round1((muscularKg / bodyWeight) * 100),
  };
}
function resolveFatMassResult({ peso, storedPct, storedKg, storedLeanPct, storedLeanKg, fallback }) {
  const bodyWeight = Number(peso);
  const fallbackPct = fallback?.grasaPct != null ? Number(fallback.grasaPct) : null;
  const fallbackKg = fallback?.grasaKg != null ? Number(fallback.grasaKg) : null;
  const fallbackLeanPct = fallback?.libreGrasaPct != null ? Number(fallback.libreGrasaPct) : null;
  const fallbackLeanKg = fallback?.libreGrasaKg != null ? Number(fallback.libreGrasaKg) : null;

  let grasaPct = storedPct != null ? Number(storedPct) : null;
  let grasaKg = storedKg != null ? Number(storedKg) : null;

  if (grasaPct != null && Number.isNaN(grasaPct)) grasaPct = null;
  if (grasaKg != null && Number.isNaN(grasaKg)) grasaKg = null;

  const expectedKg = bodyWeight && grasaPct != null ? round1(bodyWeight * (grasaPct / 100)) : null;
  const mismatch = bodyWeight && grasaPct != null && grasaKg != null && expectedKg != null && Math.abs(grasaKg - expectedKg) > 0.6;

  if ((mismatch || grasaPct == null || grasaKg == null) && fallbackPct != null) {
    grasaPct = fallbackPct;
    grasaKg = fallbackKg;
  } else if (grasaPct != null && grasaKg == null && expectedKg != null) {
    grasaKg = expectedKg;
  } else if (grasaKg != null && grasaPct == null && bodyWeight) {
    grasaPct = round1((grasaKg / bodyWeight) * 100);
  }

  if (grasaPct == null || grasaKg == null) return null;

  const libreGrasaPct = storedLeanPct != null ? Number(storedLeanPct) : (fallbackLeanPct != null ? fallbackLeanPct : round1(100 - grasaPct));
  const libreGrasaKg = storedLeanKg != null ? Number(storedLeanKg) : (fallbackLeanKg != null ? fallbackLeanKg : bodyWeight ? round1(bodyWeight - grasaKg) : null);

  return {
    grasaPct: round1(grasaPct),
    grasaKg: round1(grasaKg),
    libreGrasaPct: libreGrasaPct != null ? round1(libreGrasaPct) : null,
    libreGrasaKg: libreGrasaKg != null ? round1(libreGrasaKg) : null,
  };
}
function resolveMuscleMassResult({ peso, storedPct, storedKg, fallback }) {
  const bodyWeight = Number(peso);
  const fallbackPct = fallback?.muscularPct != null ? Number(fallback.muscularPct) : null;
  const fallbackKg = fallback?.muscularKg != null ? Number(fallback.muscularKg) : null;

  let muscularPct = storedPct != null ? Number(storedPct) : null;
  let muscularKg = storedKg != null ? Number(storedKg) : null;

  if (muscularPct != null && Number.isNaN(muscularPct)) muscularPct = null;
  if (muscularKg != null && Number.isNaN(muscularKg)) muscularKg = null;

  const expectedKg = bodyWeight && muscularPct != null ? round1(bodyWeight * (muscularPct / 100)) : null;
  const mismatch = bodyWeight && muscularPct != null && muscularKg != null && expectedKg != null && Math.abs(muscularKg - expectedKg) > 0.6;

  if ((mismatch || muscularPct == null || muscularKg == null) && fallbackPct != null) {
    muscularPct = fallbackPct;
    muscularKg = fallbackKg;
  } else if (muscularPct != null && muscularKg == null && expectedKg != null) {
    muscularKg = expectedKg;
  } else if (muscularKg != null && muscularPct == null && bodyWeight) {
    muscularPct = round1((muscularKg / bodyWeight) * 100);
  }

  if (muscularPct == null || muscularKg == null) return null;

  return {
    muscularPct: round1(muscularPct),
    muscularKg: round1(muscularKg),
  };
}
function getHarrisBenedict({ sexo, peso, talla, edad }) {
  const s = String(sexo || "").toLowerCase();
  const w = Number(peso), h = Number(talla), a = Number(edad);
  if (!w || !h || !a) return null;
  return round1(s.includes("masc") ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a) : 447.593 + (9.247 * w) + (3.098 * h) - (4.33 * a));
}
function getMifflinStJeor({ sexo, peso, talla, edad }) {
  const s = String(sexo || "").toLowerCase();
  const w = Number(peso), h = Number(talla), a = Number(edad);
  if (!w || !h || !a) return null;
  return round1((10 * w) + (6.25 * h) - (5 * a) + (s.includes("masc") ? 5 : -161));
}
function getKatchMcArdle({ peso, grasaPct }) {
  const bodyWeight = Number(peso);
  const fatPct = Number(grasaPct);
  if (!bodyWeight || !fatPct || fatPct <= 0 || fatPct >= 75) return null;
  const freeMassKg = bodyWeight * (1 - (fatPct / 100));
  return {
    geb: round1(370 + (21.6 * freeMassKg)),
    freeMassKg: round1(freeMassKg),
  };
}
function getSchofield({ sexo, peso, edad }) {
  const s = String(sexo || "").toLowerCase();
  const w = Number(peso), a = Number(edad);
  if (!w || !a) return null;
  if (s.includes("masc")) {
    if (a < 30) return round1((15.057 * w) + 692.2);
    if (a <= 60) return round1((11.472 * w) + 873.1);
    return round1((11.711 * w) + 587.7);
  }
  if (a < 30) return round1((14.818 * w) + 486.6);
  if (a <= 60) return round1((8.126 * w) + 845.6);
  return round1((9.082 * w) + 658.5);
}
function getOmsFaoUnu({ sexo, peso, edad }) {
  return getSchofield({ sexo, peso, edad });
}
const ACTIVITY_LEVEL_OPTIONS = [
  { id: "sedentario", label: "Sedentario", factor: "1.2", palRange: "PAL 1.0–1.39", paMale: 1.0, paFemale: 1.0 },
  { id: "ligero", label: "Ligero", factor: "1.375", palRange: "PAL 1.4–1.59", paMale: 1.11, paFemale: 1.12 },
  { id: "activo", label: "Activo", factor: "1.55", palRange: "PAL 1.6–1.89", paMale: 1.25, paFemale: 1.27 },
  { id: "muy_activo", label: "Muy activo", factor: "1.725", palRange: "PAL 1.9–2.50", paMale: 1.48, paFemale: 1.45 },
];
function getIomEer({ sexo, peso, talla, edad, activityLevelKey }) {
  const age = Number(edad);
  const bodyWeight = Number(peso);
  const heightM = Number(talla) / 100;
  if (!age || !bodyWeight || !heightM) return null;
  const option = ACTIVITY_LEVEL_OPTIONS.find(item => item.id === activityLevelKey) || ACTIVITY_LEVEL_OPTIONS[2];
  const male = String(sexo || "").toLowerCase().includes("masc");
  const pa = male ? option.paMale : option.paFemale;
  return round1(
    male
      ? 662 - (9.53 * age) + (pa * ((15.91 * bodyWeight) + (539.6 * heightM)))
      : 354 - (6.91 * age) + (pa * ((9.36 * bodyWeight) + (726 * heightM)))
  );
}
function getIdealWeight({ sexo, talla }) {
  const h = Number(talla);
  if (!h) return null;
  const inches = h / 2.54;
  const base = String(sexo || "").toLowerCase().includes("masc") ? 50 : 45.5;
  return round1(base + (Math.max(inches - 60, 0) * 2.3));
}
function getAdjustedWeight({ pesoActual, pesoIdeal }) {
  const actual = Number(pesoActual);
  const ideal = Number(pesoIdeal);
  if (!actual || !ideal) return null;
  if (actual <= ideal) return round1(actual);
  return round1(ideal + ((actual - ideal) * 0.25));
}
function getImcCategory(imc) {
  const value = Number(imc);
  if (!value) return "Sin referencia";
  if (value < 18.5) return "Bajo peso";
  if (value < 25) return "Eutrofia";
  if (value < 30) return "Sobrepeso";
  if (value < 35) return "Obesidad I";
  if (value < 40) return "Obesidad II";
  return "Obesidad III";
}
function getMacroDistribution({ kcalTarget, pesoActual, pesoIdeal, pesoAjustado, objetivo, condition }) {
  const kcal = Number(kcalTarget);
  if (!kcal) return null;
  const objective = String(objetivo || "").toLowerCase();
  const weightBase = Number(pesoAjustado || pesoIdeal || pesoActual || 0);
  let proteinPct = 25;
  let carbsPct = 45;
  let fatPct = 30;
  let note = "Distribucion sugerida base.";
  if (condition === "diabetes" || objective.includes("diabetes")) {
    proteinPct = 30;
    carbsPct = 35;
    fatPct = 35;
    note = "Ajuste con carbohidrato moderado y mayor fibra/proteina.";
  } else if (condition === "obesidad" || objective.includes("grasa") || objective.includes("peso")) {
    proteinPct = 30;
    carbsPct = 35;
    fatPct = 35;
    note = "Ajuste para saciedad y control de energia.";
  } else if (condition === "hipertrofia" || objective.includes("musculo") || objective.includes("hipertrofia")) {
    proteinPct = 25;
    carbsPct = 50;
    fatPct = 25;
    note = "Ajuste para volumen y recuperacion.";
  } else if (condition === "resistencia" || objective.includes("resistencia")) {
    proteinPct = 20;
    carbsPct = 55;
    fatPct = 25;
    note = "Ajuste para sostener entrenamiento y glucogeno.";
  }
  const proteinG = round1((kcal * (proteinPct / 100)) / 4);
  const carbsG = round1((kcal * (carbsPct / 100)) / 4);
  const fatG = round1((kcal * (fatPct / 100)) / 9);
  return {
    proteinG, carbsG, fatG,
    proteinPct, carbsPct, fatPct,
    proteinGkg: weightBase ? round1(proteinG / weightBase) : 0,
    carbsGkg: weightBase ? round1(carbsG / weightBase) : 0,
    fatGkg: weightBase ? round1(fatG / weightBase) : 0,
    kcalTarget: round1(kcal),
    assignedKcal: round1(kcal),
    assignedPct: 100,
    weightBase: round1(weightBase),
    sourceMode: "suggested",
    strategy: note,
  };
}
function getEditedMacroPlan({ mode, kcalTarget, weightBase, targets, fallbackPlan }) {
  const kcal = Number(kcalTarget);
  const weight = Number(weightBase);
  if (!fallbackPlan || !kcal) return null;
  if (mode === "suggested") return fallbackPlan;
  if (mode === "percentage") {
    const proteinPct = Number(targets?.protein) || 0;
    const carbsPct = Number(targets?.carbs) || 0;
    const fatPct = Number(targets?.fat) || 0;
    const proteinG = round1((kcal * (proteinPct / 100)) / 4);
    const carbsG = round1((kcal * (carbsPct / 100)) / 4);
    const fatG = round1((kcal * (fatPct / 100)) / 9);
    return {
      proteinG,
      carbsG,
      fatG,
      proteinPct: round1(proteinPct),
      carbsPct: round1(carbsPct),
      fatPct: round1(fatPct),
      proteinGkg: weight ? round1(proteinG / weight) : 0,
      carbsGkg: weight ? round1(carbsG / weight) : 0,
      fatGkg: weight ? round1(fatG / weight) : 0,
      kcalTarget: round1(kcal),
      assignedKcal: round1((proteinG * 4) + (carbsG * 4) + (fatG * 9)),
      assignedPct: round1(proteinPct + carbsPct + fatPct),
      weightBase: round1(weight),
      strategy: "Macros ajustados manualmente por porcentaje.",
      sourceMode: "percentage",
    };
  }
  const proteinGkg = Number(targets?.protein) || 0;
  const carbsGkg = Number(targets?.carbs) || 0;
  const fatGkg = Number(targets?.fat) || 0;
  const proteinG = round1(proteinGkg * weight);
  const carbsG = round1(carbsGkg * weight);
  const fatG = round1(fatGkg * weight);
  const assignedKcal = round1((proteinG * 4) + (carbsG * 4) + (fatG * 9));
  return {
    proteinG,
    carbsG,
    fatG,
    proteinPct: kcal ? round1(((proteinG * 4) / kcal) * 100) : 0,
    carbsPct: kcal ? round1(((carbsG * 4) / kcal) * 100) : 0,
    fatPct: kcal ? round1(((fatG * 9) / kcal) * 100) : 0,
    proteinGkg: round1(proteinGkg),
    carbsGkg: round1(carbsGkg),
    fatGkg: round1(fatGkg),
    kcalTarget: round1(kcal),
    assignedKcal,
    assignedPct: kcal ? round1((assignedKcal / kcal) * 100) : 0,
    weightBase: round1(weight),
    strategy: "Macros ajustados manualmente por gramos por kilo de peso.",
    sourceMode: "gkg",
  };
}

function FInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={inputBase} />
    </div>
  );
}
function FTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={lbl}>{label}</label>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }} />
    </div>
  );
}
function FSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={lbl}>{label}</label>
      <select value={value} onChange={onChange} style={inputBase}>
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}
function SectionTitle({ title, sub }) {
  return (
    <div style={sectionTitleWrap}>
      <div style={sectionTitleMain}>{title}</div>
      {sub ? <div style={sectionTitleSub}>{sub}</div> : null}
    </div>
  );
}
function Chip({ label, value }) {
  return (
    <div style={chipWrap}>
      <span style={chipLabel}>{label}</span>
      <span style={chipValue}>{value}</span>
    </div>
  );
}
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #dbe7f1", borderTopColor: "#22c55e", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 20px", color: "#6b7280", gap: 10 }}>
      <div style={{ fontSize: 40 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{sub}</div>
    </div>
  );
}

function NuevoPacienteModal({ onClose, onSaved, initialData = null, tableName = "pacientes", modalTitle, successCreateLabel, successEditLabel }) {
  const [form, setForm] = useState(() => initialData ? {
    nombre: initialData.nombre || "",
    apellidos: initialData.apellidos || "",
    edad: initialData.edad || "",
    sexo: initialData.sexo || "femenino",
    fecha_nac: initialData.fecha_nac || "",
    telefono: initialData.telefono || "",
    email: initialData.email || "",
    objetivo: initialData.objetivo || "",
    discapacidad: initialData.discapacidad || "",
    notas: initialData.notas || "",
    motivo_consulta: initialData.motivo_consulta || "",
    antecedentes_personales: initialData.antecedentes_personales || "",
    antecedentes_familiares: initialData.antecedentes_familiares || "",
    medicamentos: initialData.medicamentos || "",
    alergias: initialData.alergias || "",
    suplementacion: initialData.suplementacion || "",
    actividad_fisica_base: initialData.actividad_fisica_base || "",
  } : EMPTY_PATIENT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const bind = key => ({ value: form[key], onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })) });
  const isEditing = Boolean(initialData?.id);

  async function handleSave() {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      nombre: form.nombre,
      apellidos: form.apellidos,
      edad: form.edad ? parseInt(form.edad, 10) : null,
      sexo: form.sexo,
      fecha_nac: form.fecha_nac || null,
      telefono: form.telefono,
      email: form.email,
      objetivo: form.objetivo,
      discapacidad: form.discapacidad,
      notas: form.notas,
      motivo_consulta: form.motivo_consulta,
      antecedentes_personales: form.antecedentes_personales,
      antecedentes_familiares: form.antecedentes_familiares,
      medicamentos: form.medicamentos,
      alergias: form.alergias,
      suplementacion: form.suplementacion,
      actividad_fisica_base: form.actividad_fisica_base,
    };
    const { error: saveError } = isEditing
      ? await supabase.from(tableName).update(payload).eq("id", initialData.id)
      : await supabase.from(tableName).insert([payload]);
    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }
    onSaved(isEditing ? (successEditLabel || "✓ Paciente actualizado correctamente") : (successCreateLabel || "✓ Paciente registrado correctamente"));
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", zIndex: 2200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 18, width: "100%", maxWidth: 520 }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #dbe7f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{modalTitle || (isEditing ? "Editar Paciente" : "Nuevo Paciente")}</div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", color: "#64748b", width: 30, height: 30, borderRadius: 8, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
          {error && <div style={{ background: "#451a1a", color: "#fca5a5", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 12px", fontSize: 12, marginBottom: 16 }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FInput label="Nombre *" {...bind("nombre")} placeholder="Jesus" />
            <FInput label="Apellidos" {...bind("apellidos")} placeholder="Perez" />
            <FInput label="Edad" type="number" {...bind("edad")} placeholder="32" />
            <FSelect label="Sexo" {...bind("sexo")} options={[{ value: "femenino", label: "Femenino" }, { value: "masculino", label: "Masculino" }, { value: "otro", label: "Otro" }]} />
            <FInput label="Telefono" {...bind("telefono")} placeholder="664-000-0000" />
            <FInput label="Email" type="email" {...bind("email")} placeholder="correo@ejemplo.com" />
          </div>
          <FInput label="Objetivo nutricional" {...bind("objetivo")} placeholder="Perdida de grasa, hipertrofia, diabetes..." />
          <FInput label="Discapacidad / condición de adaptación" {...bind("discapacidad")} placeholder="Amputación, talla pequeña, síndrome de Down, silla de ruedas..." />
          <FTextarea label="Motivo de consulta" {...bind("motivo_consulta")} placeholder="Qué busca el paciente, síntomas, derivación, meta principal..." rows={2} />
          <FTextarea label="Antecedentes personales" {...bind("antecedentes_personales")} placeholder="Diagnósticos, cirugías, hábitos, contexto clínico..." rows={2} />
          <FTextarea label="Antecedentes familiares" {...bind("antecedentes_familiares")} placeholder="Diabetes, hipertensión, obesidad, dislipidemia..." rows={2} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FTextarea label="Medicamentos" {...bind("medicamentos")} placeholder="Metformina, antihipertensivos, etc." rows={2} />
            <FTextarea label="Alergias / intolerancias" {...bind("alergias")} placeholder="Lácteos, mariscos, gluten..." rows={2} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FTextarea label="Suplementación" {...bind("suplementacion")} placeholder="Proteína, creatina, omega-3..." rows={2} />
            <FTextarea label="Actividad física base" {...bind("actividad_fisica_base")} placeholder="Frecuencia, tipo, horario, nivel actual..." rows={2} />
          </div>
          <FTextarea label="Notas" {...bind("notas")} placeholder="Alergias, antecedentes, observaciones..." rows={3} />
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #dbe7f1", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #dbe7f1", background: "transparent", color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#22c55e", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar paciente"}</button>
        </div>
      </div>
    </div>
  );
}

function ConsultaModal({ patients, defaultPatientId, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, paciente_id: defaultPatientId || (patients[0]?.id ?? "") });
  const [evansRaceFactor, setEvansRaceFactor] = useState("0");
  const [consultaTab, setConsultaTab] = useState("persona");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const bind = key => ({ value: form[key], onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })) });
  const pat = patients.find(p => p.id === Number(form.paciente_id)) || patients[0];
  const imc = form.peso && form.talla ? round1(Number(form.peso) / ((Number(form.talla) / 100) ** 2)) : null;
  const icc = form.cintura && form.cadera ? round1(Number(form.cintura) / Number(form.cadera)) : null;
  const yuhaszData = getYuhaszData({ sexo: pat?.sexo, peso: form.peso, pliegue_triceps: form.pliegue_triceps, pliegue_subescapular: form.pliegue_subescapular, pliegue_cresta_iliaca: form.pliegue_cresta_iliaca, pliegue_abdominal: form.pliegue_abdominal, pliegue_muslo: form.pliegue_muslo, pliegue_pantorrilla: form.pliegue_pantorrilla });
  const faulknerData = getFaulknerData({ peso: form.peso, pliegue_triceps: form.pliegue_triceps, pliegue_subescapular: form.pliegue_subescapular, pliegue_cresta_iliaca: form.pliegue_cresta_iliaca, pliegue_abdominal: form.pliegue_abdominal });
  const matiegkaData = getMatiegkaData({ peso: form.peso, talla: form.talla, brazo: form.brazo, perimetro_torax: form.perimetro_torax, perimetro_muslo: form.perimetro_muslo, perimetro_pantorrilla: form.perimetro_pantorrilla, pliegue_triceps: form.pliegue_triceps, pliegue_subescapular: form.pliegue_subescapular, pliegue_muslo: form.pliegue_muslo, pliegue_pantorrilla: form.pliegue_pantorrilla });
  const petersonData = getPetersonData({
    sexo: pat?.sexo,
    edad: pat?.edad,
    peso: form.peso,
    pliegue_triceps: form.pliegue_triceps,
    pliegue_subescapular: form.pliegue_subescapular,
    cintura: form.cintura,
    circunferencia_pantorrilla: form.circunferencia_pantorrilla || form.perimetro_pantorrilla,
    circunferencia_brazo_relajado: form.circunferencia_brazo_relajado || form.brazo,
    circunferencia_muslo: form.circunferencia_muslo || form.perimetro_muslo,
  });
  const evansData = getEvansBodyFatData({
    sexo: pat?.sexo,
    peso: form.peso,
    pliegue_triceps: form.pliegue_triceps,
    pliegue_abdominal: form.pliegue_abdominal,
    pliegue_muslo: form.pliegue_muslo,
    raceFactor: Number(evansRaceFactor || 0),
  });
  const rfmData = getRfmData({ sexo: pat?.sexo, peso: form.peso, talla: form.talla, cintura: form.cintura });
  const deurenbergData = getDeurenbergData({ sexo: pat?.sexo, edad: pat?.edad, peso: form.peso, talla: form.talla });
  const vonDobelnBoneKg = getVonDobelnBoneMass({ talla: form.talla, diametro_biestiloideo: form.diametro_biestiloideo, diametro_rodilla: form.diametro_rodilla });
  const wurchResidualKg = getWurchResidualMass({ peso: form.peso, sexo: pat?.sexo });
  const derivedMuscleMass = getDerivedMuscleMass({
    peso: form.peso,
    fatKg: (petersonData || evansData || yuhaszData || faulknerData)?.grasaKg,
    boneKg: vonDobelnBoneKg,
    residualKg: wurchResidualKg,
  });
  const leeAnthroData = getLeeAnthropometricMuscleData({
    sexo: pat?.sexo,
    edad: pat?.edad,
    talla: form.talla,
    peso: form.peso,
    circunferencia_brazo_relajado: form.circunferencia_brazo_relajado || form.brazo,
    circunferencia_muslo: form.circunferencia_muslo || form.perimetro_muslo,
    circunferencia_pantorrilla: form.circunferencia_pantorrilla || form.perimetro_pantorrilla,
    pliegue_triceps: form.pliegue_triceps,
    pliegue_muslo: form.pliegue_muslo,
    pliegue_pantorrilla: form.pliegue_pantorrilla,
  });
  const leeWeightHeightData = getLeeWeightHeightMuscleData({ sexo: pat?.sexo, edad: pat?.edad, talla: form.talla, peso: form.peso });
  const consultaTabs = [
    { id: "persona", label: "Persona" },
    { id: "consulta", label: "Consulta" },
    { id: "antropometria", label: "Antropometría" },
    { id: "bioquimicos", label: "Bioquímicos y 24h" },
    { id: "diagnostico", label: "Diagnóstico / ADIME" },
  ];
  const currentConsultaTabIndex = consultaTabs.findIndex(tab => tab.id === consultaTab);
  const structured24h = [
    ["Desayuno", form.desayuno_24h],
    ["Colación AM", form.colacion_am_24h],
    ["Comida", form.comida_24h],
    ["Colación PM", form.colacion_pm_24h],
    ["Cena", form.cena_24h],
    ["Bebidas", form.bebidas_24h],
    ["Observaciones", form.observaciones_24h],
  ].filter(([, value]) => String(value || "").trim()).map(([label, value]) => `${label}: ${value}`).join(" | ");

  async function handleSave() {
    if (!form.paciente_id) {
      setError("Selecciona un paciente");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      paciente_id: Number(form.paciente_id),
      fecha: form.fecha,
      hora: form.hora || null,
      tipo_cita: form.tipo_cita,
      motivo: form.motivo || null,
      peso: numOrNull(form.peso),
      talla: numOrNull(form.talla),
      imc: imc || null,
      cintura: numOrNull(form.cintura),
      cadera: numOrNull(form.cadera),
      icc: icc || null,
      brazo: numOrNull(form.brazo),
      circunferencia_brazo_relajado: numOrNull(form.circunferencia_brazo_relajado),
      circunferencia_brazo_flexionado: numOrNull(form.circunferencia_brazo_flexionado),
      circunferencia_muslo: numOrNull(form.circunferencia_muslo),
      circunferencia_pantorrilla: numOrNull(form.circunferencia_pantorrilla),
      perimetro_torax: numOrNull(form.perimetro_torax),
      perimetro_muslo: numOrNull(form.perimetro_muslo),
      perimetro_pantorrilla: numOrNull(form.perimetro_pantorrilla),
      diametro_humero: numOrNull(form.diametro_humero),
      diametro_biestiloideo: numOrNull(form.diametro_biestiloideo),
      diametro_rodilla: numOrNull(form.diametro_rodilla),
      pliegue_triceps: numOrNull(form.pliegue_triceps),
      pliegue_biceps: numOrNull(form.pliegue_biceps),
      pliegue_subescapular: numOrNull(form.pliegue_subescapular),
      pliegue_cresta_iliaca: numOrNull(form.pliegue_cresta_iliaca),
      pliegue_supraespinal: numOrNull(form.pliegue_supraespinal),
      pliegue_abdominal: numOrNull(form.pliegue_abdominal),
      pliegue_muslo: numOrNull(form.pliegue_muslo),
      pliegue_pantorrilla: numOrNull(form.pliegue_pantorrilla),
      yuhasz_grasa_pct: yuhaszData?.grasaPct ?? null,
      yuhasz_grasa_kg: yuhaszData?.grasaKg ?? null,
      yuhasz_libre_grasa_pct: yuhaszData?.libreGrasaPct ?? null,
      yuhasz_libre_grasa_kg: yuhaszData?.libreGrasaKg ?? null,
      peterson_grasa_pct: petersonData?.grasaPct ?? null,
      peterson_grasa_kg: petersonData?.grasaKg ?? null,
      evans_grasa_pct: evansData?.grasaPct ?? null,
      evans_grasa_kg: evansData?.grasaKg ?? null,
      von_dobeln_osea_kg: vonDobelnBoneKg ?? null,
      wurch_residual_kg: wurchResidualKg ?? null,
      muscular_derivada_kg: derivedMuscleMass?.muscularKg ?? null,
      muscular_derivada_pct: derivedMuscleMass?.muscularPct ?? null,
      matiegka_muscular_kg: matiegkaData?.muscularKg ?? null,
      matiegka_muscular_pct: matiegkaData?.muscularPct ?? null,
      antrop_obs: form.antrop_obs || null,
      glucosa: numOrNull(form.glucosa),
      hba1c: numOrNull(form.hba1c),
      colesterol_total: numOrNull(form.colesterol_total),
      trigliceridos: numOrNull(form.trigliceridos),
      hdl: numOrNull(form.hdl),
      ldl: numOrNull(form.ldl),
      vit_d: numOrNull(form.vit_d),
      ferritina: numOrNull(form.ferritina),
      bio_obs: form.bio_obs || null,
      adherencia: form.adherencia,
      recordatorio_24h: structured24h || form.recordatorio_24h || null,
      desayuno_24h: form.desayuno_24h || null,
      colacion_am_24h: form.colacion_am_24h || null,
      comida_24h: form.comida_24h || null,
      colacion_pm_24h: form.colacion_pm_24h || null,
      cena_24h: form.cena_24h || null,
      bebidas_24h: form.bebidas_24h || null,
      observaciones_24h: form.observaciones_24h || null,
      hambre: parseInt(form.hambre, 10),
      saciedad: parseInt(form.saciedad, 10),
      hidratacion: parseInt(form.hidratacion, 10),
      dieta_obs: form.dieta_obs || null,
      diagnostico_nutricional: form.diagnostico_nutricional || null,
      adime_valoracion: form.adime_valoracion || null,
      adime_diagnostico: form.adime_diagnostico || null,
      adime_intervencion: form.adime_intervencion || null,
      adime_monitoreo: form.adime_monitoreo || null,
      objetivos: form.objetivos || null,
      indicaciones: form.indicaciones || null,
      proxima_cita: form.proxima_cita || null,
      estado: form.estado,
    };
    const { error: saveError } = await supabase.from("consultas").insert([payload]);
    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 18, width: "100%", maxWidth: 920, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #dbe7f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Nueva Consulta</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{pat ? `${pat.nombre} ${pat.apellidos || ""}` : "Selecciona paciente"}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", color: "#64748b", width: 30, height: 30, borderRadius: 8, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 24, overflowY: "auto" }}>
          {error && <div style={{ background: "#451a1a", color: "#fca5a5", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 12px", fontSize: 12, marginBottom: 16 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18, position: "sticky", top: 0, zIndex: 3, background: "#ffffff", paddingBottom: 8 }}>
            {consultaTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setConsultaTab(tab.id)}
                style={{
                  background: consultaTab === tab.id ? "#eff6ff" : "#f8fbfe",
                  color: consultaTab === tab.id ? "#2563eb" : "#64748b",
                  border: `1px solid ${consultaTab === tab.id ? "#bfdbfe" : "#dbe7f1"}`,
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {consultaTab === "persona" && <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16, marginBottom: 18 }}>
            <SectionTitle title="Datos de la persona" sub="Referencia rápida del paciente para no mezclar la ficha con la captura clínica." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
              <Chip label="Paciente" value={pat ? `${pat.nombre} ${pat.apellidos || ""}` : "Sin seleccionar"} />
              <Chip label="Edad / sexo" value={pat ? `${pat.edad || "-"} años · ${pat.sexo || "-"}` : "Sin dato"} />
              <Chip label="Objetivo" value={pat?.objetivo || "Sin objetivo"} />
              <Chip label="Email / teléfono" value={pat ? `${pat.email || "Sin email"} · ${pat.telefono || "Sin teléfono"}` : "Sin dato"} />
            </div>
            {(pat?.motivo_consulta || pat?.antecedentes_personales || pat?.antecedentes_familiares || pat?.medicamentos || pat?.alergias || pat?.suplementacion || pat?.actividad_fisica_base) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#6b7280", marginBottom: 6 }}>Historia inicial</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
                    {pat?.motivo_consulta ? <div><strong>Motivo:</strong> {pat.motivo_consulta}</div> : null}
                    {pat?.antecedentes_personales ? <div><strong>Antecedentes personales:</strong> {pat.antecedentes_personales}</div> : null}
                    {pat?.antecedentes_familiares ? <div><strong>Antecedentes familiares:</strong> {pat.antecedentes_familiares}</div> : null}
                  </div>
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#6b7280", marginBottom: 6 }}>Contexto clínico</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
                    {pat?.medicamentos ? <div><strong>Medicamentos:</strong> {pat.medicamentos}</div> : null}
                    {pat?.alergias ? <div><strong>Alergias:</strong> {pat.alergias}</div> : null}
                    {pat?.suplementacion ? <div><strong>Suplementación:</strong> {pat.suplementacion}</div> : null}
                    {pat?.actividad_fisica_base ? <div><strong>Actividad física:</strong> {pat.actividad_fisica_base}</div> : null}
                  </div>
                </div>
              </div>
            )}
          </div>}
          {consultaTab === "consulta" && <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16, marginBottom: 18 }}>
            <SectionTitle title="Datos de la consulta" sub="Información general de esta sesión antes de entrar a mediciones." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
            <FSelect label="Paciente" {...bind("paciente_id")} options={patients.map(patient => ({ value: patient.id, label: `${patient.nombre} ${patient.apellidos || ""}` }))} />
            <FInput label="Fecha" type="date" {...bind("fecha")} />
            <FInput label="Hora" type="time" {...bind("hora")} />
            <FInput label="Peso (kg)" type="number" {...bind("peso")} placeholder="72.5" />
            <FInput label="Talla (cm)" type="number" {...bind("talla")} placeholder="168" />
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>IMC calculado</label>
              <div style={{ ...inputBase, display: "flex", alignItems: "center", minHeight: 42 }}>{imc || "Ingresa peso y talla"}</div>
            </div>
            <FInput label="Cintura (cm)" type="number" {...bind("cintura")} />
            <FInput label="Cadera (cm)" type="number" {...bind("cadera")} />
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>ICC calculado</label>
              <div style={{ ...inputBase, display: "flex", alignItems: "center", minHeight: 42 }}>{icc || "Ingresa cintura y cadera"}</div>
            </div>
          </div>
          </div>}
          {consultaTab === "antropometria" && <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <SectionTitle title="Antropometría" sub="Circunferencias, diámetros, pliegues y estimaciones de composición corporal." />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 10, marginTop: 6 }}>Circunferencias</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            <FInput label="Brazo" type="number" {...bind("brazo")} />
            <FInput label="Brazo relajado" type="number" {...bind("circunferencia_brazo_relajado")} />
            <FInput label="Brazo flexionado" type="number" {...bind("circunferencia_brazo_flexionado")} />
            <FInput label="Muslo" type="number" {...bind("circunferencia_muslo")} />
            <FInput label="Pantorrilla" type="number" {...bind("circunferencia_pantorrilla")} />
            <FInput label="Tórax" type="number" {...bind("perimetro_torax")} />
            <FInput label="Muslo medio" type="number" {...bind("perimetro_muslo")} />
            <FInput label="Pantorrilla Matiegka" type="number" {...bind("perimetro_pantorrilla")} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 10, marginTop: 6 }}>Diametros oseos</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
            <FInput label="Humero" type="number" {...bind("diametro_humero")} />
            <FInput label="Biestiloideo" type="number" {...bind("diametro_biestiloideo")} />
            <FInput label="Rodilla" type="number" {...bind("diametro_rodilla")} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 10, marginTop: 6 }}>Pliegues cutaneos</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            <FInput label="Triceps" type="number" {...bind("pliegue_triceps")} />
            <FInput label="Biceps" type="number" {...bind("pliegue_biceps")} />
            <FInput label="Subescapular" type="number" {...bind("pliegue_subescapular")} />
            <FInput label="Cresta iliaca" type="number" {...bind("pliegue_cresta_iliaca")} />
            <FInput label="Supraespinal" type="number" {...bind("pliegue_supraespinal")} />
            <FInput label="Abdominal" type="number" {...bind("pliegue_abdominal")} />
            <FInput label="Muslo" type="number" {...bind("pliegue_muslo")} />
            <FInput label="Pantorrilla" type="number" {...bind("pliegue_pantorrilla")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <FSelect label="Factor raza Evans" value={evansRaceFactor} onChange={e => setEvansRaceFactor(e.target.value)} options={[{ value: "0", label: "0 · General" }, { value: "1", label: "1 · Afrodescendiente" }]} />
            <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#6b7280", marginBottom: 6 }}>Cálculos avanzados</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8 }}>
                Peterson: {petersonData?.grasaPct != null ? `${petersonData.grasaPct}%` : "Sin dato"}
                <br />
                RFM: {rfmData?.grasaPct != null ? `${rfmData.grasaPct}%` : "Sin dato"}
                <br />
                Deurenberg: {deurenbergData?.grasaPct != null ? `${deurenbergData.grasaPct}%` : "Sin dato"}
                <br />
                Evans: {evansData?.grasaPct != null ? `${evansData.grasaPct}%` : "Sin dato"}
                <br />
                Lee antropométrica: {leeAnthroData?.muscularKg != null ? `${leeAnthroData.muscularKg} kg` : "Sin dato"}
                <br />
                Lee peso-talla: {leeWeightHeightData?.muscularKg != null ? `${leeWeightHeightData.muscularKg} kg` : "Sin dato"}
                <br />
                Von Döbeln: {vonDobelnBoneKg != null ? `${vonDobelnBoneKg} kg ósea` : "Sin dato"}
                <br />
                Würch: {wurchResidualKg != null ? `${wurchResidualKg} kg residual` : "Sin dato"}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, marginBottom: 16 }}>
            <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#15803d", marginBottom: 8 }}>Yuhasz</div>
              {yuhaszData ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <Chip label="% grasa" value={`${yuhaszData.grasaPct}%`} />
                  <Chip label="Grasa kg" value={`${yuhaszData.grasaKg} kg`} />
                  <Chip label="Libre de grasa" value={`${yuhaszData.libreGrasaKg} kg`} />
                </div>
              ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Requiere sexo, peso y 6 pliegues.</div>}
            </div>
            <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#15803d", marginBottom: 8 }}>Faulkner</div>
              {faulknerData ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <Chip label="% grasa" value={`${faulknerData.grasaPct}%`} />
                  <Chip label="Grasa kg" value={`${faulknerData.grasaKg} kg`} />
                  <Chip label="Libre de grasa" value={`${faulknerData.libreGrasaKg} kg`} />
                </div>
              ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Requiere peso y 4 pliegues.</div>}
            </div>
            <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#15803d", marginBottom: 8 }}>Matiegka</div>
              {matiegkaData ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <Chip label="Masa muscular" value={`${matiegkaData.muscularKg} kg`} />
                  <Chip label="% muscular" value={`${matiegkaData.muscularPct}%`} />
                </div>
              ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Requiere talla, peso, perimetros y pliegues.</div>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
            <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#15803d", marginBottom: 8 }}>RFM</div>
              {rfmData ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <Chip label="% grasa" value={`${rfmData.grasaPct}%`} />
                  <Chip label="Grasa kg" value={`${rfmData.grasaKg} kg`} />
                </div>
              ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Requiere peso, talla y cintura.</div>}
            </div>
            <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#15803d", marginBottom: 8 }}>Deurenberg</div>
              {deurenbergData ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <Chip label="% grasa" value={`${deurenbergData.grasaPct}%`} />
                  <Chip label="Grasa kg" value={`${deurenbergData.grasaKg} kg`} />
                </div>
              ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Requiere edad, peso y talla.</div>}
            </div>
            <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#15803d", marginBottom: 8 }}>Lee</div>
              {(leeAnthroData || leeWeightHeightData) ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <Chip label="Antrop." value={leeAnthroData?.muscularKg != null ? `${leeAnthroData.muscularKg} kg` : "Sin dato"} />
                  <Chip label="Peso-talla" value={leeWeightHeightData?.muscularKg != null ? `${leeWeightHeightData.muscularKg} kg` : "Sin dato"} />
                </div>
              ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Requiere edad, peso, talla y perímetros.</div>}
            </div>
          </div>
          </div>}
          {consultaTab === "bioquimicos" && <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <SectionTitle title="Bioquímicos y conducta alimentaria" sub="Laboratorios, adherencia, recordatorio de 24 horas y señales del día a día." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            <FInput label="Glucosa" type="number" {...bind("glucosa")} />
            <FInput label="HbA1c" type="number" {...bind("hba1c")} />
            <FInput label="Colesterol total" type="number" {...bind("colesterol_total")} />
            <FInput label="Trigliceridos" type="number" {...bind("trigliceridos")} />
            <FInput label="HDL" type="number" {...bind("hdl")} />
            <FInput label="LDL" type="number" {...bind("ldl")} />
            <FInput label="Vitamina D" type="number" {...bind("vit_d")} />
            <FInput label="Ferritina" type="number" {...bind("ferritina")} />
          </div>
          <FTextarea label="Observaciones antropometricas" {...bind("antrop_obs")} rows={2} />
          <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Recordatorio de 24 horas</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FTextarea label="Desayuno" {...bind("desayuno_24h")} rows={2} />
              <FTextarea label="Colación AM" {...bind("colacion_am_24h")} rows={2} />
              <FTextarea label="Comida" {...bind("comida_24h")} rows={2} />
              <FTextarea label="Colación PM" {...bind("colacion_pm_24h")} rows={2} />
              <FTextarea label="Cena" {...bind("cena_24h")} rows={2} />
              <FTextarea label="Bebidas" {...bind("bebidas_24h")} rows={2} />
            </div>
            <FTextarea label="Observaciones 24h" {...bind("observaciones_24h")} rows={2} placeholder="Horarios, contexto, antojos, fin de semana, omisiones..." />
            <FTextarea label="Resumen libre 24h" {...bind("recordatorio_24h")} rows={2} placeholder="Opcional: texto libre adicional." />
          </div>
          </div>}
          {consultaTab === "diagnostico" && <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <SectionTitle title="Diagnóstico e intervención" sub="Síntesis clínica de la consulta, nota ADIME y plan de seguimiento." />
          <FTextarea label="Diagnostico nutricional" {...bind("diagnostico_nutricional")} rows={3} />
          <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Nota ADIME</div>
            <div style={{ display: "grid", gap: 10 }}>
              <FTextarea label="A · Valoración" {...bind("adime_valoracion")} rows={3} placeholder="Contexto clínico, antropometría, bioquímicos, dieta y conducta alimentaria." />
              <FTextarea label="D · Diagnóstico" {...bind("adime_diagnostico")} rows={2} placeholder="Problema nutricional priorizado con enfoque PES." />
              <FTextarea label="I · Intervención" {...bind("adime_intervencion")} rows={3} placeholder="Plan de acción, educación, ajustes dietéticos y estrategias." />
              <FTextarea label="M/E · Monitoreo y evaluación" {...bind("adime_monitoreo")} rows={2} placeholder="Qué se revaluará en la siguiente consulta y con qué indicadores." />
            </div>
          </div>
          <FTextarea label="Objetivos" {...bind("objetivos")} rows={3} />
          <FTextarea label="Indicaciones" {...bind("indicaciones")} rows={3} />
          </div>}
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #dbe7f1", display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConsultaTab(consultaTabs[Math.max(currentConsultaTabIndex - 1, 0)].id)} disabled={currentConsultaTabIndex <= 0} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #dbe7f1", background: "#f8fbfe", color: "#64748b", cursor: currentConsultaTabIndex <= 0 ? "default" : "pointer", fontFamily: "inherit", opacity: currentConsultaTabIndex <= 0 ? 0.5 : 1 }}>Anterior</button>
            <button onClick={() => setConsultaTab(consultaTabs[Math.min(currentConsultaTabIndex + 1, consultaTabs.length - 1)].id)} disabled={currentConsultaTabIndex >= consultaTabs.length - 1} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", cursor: currentConsultaTabIndex >= consultaTabs.length - 1 ? "default" : "pointer", fontFamily: "inherit", opacity: currentConsultaTabIndex >= consultaTabs.length - 1 ? 0.5 : 1 }}>Siguiente</button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #dbe7f1", background: "transparent", color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#22c55e", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{saving ? "Guardando..." : "Guardar consulta"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NutriPanel() {
  const [section, setSection] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [inactivePatients, setInactivePatients] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [adaptedSportPatients, setAdaptedSportPatients] = useState([]);
  const [selectedAdaptedSportPatient, setSelectedAdaptedSportPatient] = useState(null);
  const [patientConsultas, setPatientConsultas] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [smaeCatalog, setSmaeCatalog] = useState([]);
  const [smartDishes, setSmartDishes] = useState([]);
  const [structuredRecipes, setStructuredRecipes] = useState([]);
  const [clinicalTemplatesCatalog, setClinicalTemplatesCatalog] = useState([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState([]);
  const [loadingPats, setLoadingPats] = useState(true);
  const [loadingCons, setLoadingCons] = useState(false);
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showEditPacienteModal, setShowEditPacienteModal] = useState(false);
  const [showAdaptedSportModal, setShowAdaptedSportModal] = useState(false);
  const [showEditAdaptedSportModal, setShowEditAdaptedSportModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientStatusFilter, setPatientStatusFilter] = useState("activos");
  const [activeTab, setActiveTab] = useState("antropometria");
  const [foodSearch, setFoodSearch] = useState("");
  const [foodGroup, setFoodGroup] = useState("todos");
  const [foodMealFilter, setFoodMealFilter] = useState("todos");
  const [foodClinicalFilter, setFoodClinicalFilter] = useState("todos");
  const [foodVisibleCount, setFoodVisibleCount] = useState(80);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [mealAssignments, setMealAssignments] = useState(() => Object.fromEntries(MEAL_SLOTS.map(slot => [slot.id, []])));
  const [mealNotes, setMealNotes] = useState(() => Object.fromEntries(MEAL_SLOTS.map(slot => [slot.id, ""])));
  const [mealQuickAdd, setMealQuickAdd] = useState(() => Object.fromEntries(MEAL_SLOTS.map(slot => [slot.id, ""])));
  const [customFoodForm, setCustomFoodForm] = useState({ name: "", grupo: "proteinas", porcion: "", intercambio: "", kcal: "", prot: "", carbs: "", fat: "", tags: "", tiempos: ["comida"] });
  const [csvText, setCsvText] = useState("");
  const [loadingFoodPlan, setLoadingFoodPlan] = useState(false);
  const [preparationCategory, setPreparationCategory] = useState("desayunos_mexicanos");
  const [weeklyPlan, setWeeklyPlan] = useState(createEmptyWeeklyPlan);
  const [weeklyRecipeRefs, setWeeklyRecipeRefs] = useState(createEmptyWeeklyRecipeRefs);
  const [draggedPreparation, setDraggedPreparation] = useState("");
  const [loadingWeeklyPlan, setLoadingWeeklyPlan] = useState(false);
  const [dashboardActivityTab, setDashboardActivityTab] = useState("canceladas");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeMealTypeFilter, setRecipeMealTypeFilter] = useState("todos");
  const [recipeDishTypeFilter, setRecipeDishTypeFilter] = useState("todos");
  const [recipeCuisineTypeFilter, setRecipeCuisineTypeFilter] = useState("todos");
  const [recipeClinicalFilter, setRecipeClinicalFilter] = useState("todos");
  const [recipeDifficultyFilter, setRecipeDifficultyFilter] = useState("todos");
  const [recipeGoalFilter, setRecipeGoalFilter] = useState("todos");
  const [recipeViewMode, setRecipeViewMode] = useState("tarjetas");
  const [showFavoriteRecipesOnly, setShowFavoriteRecipesOnly] = useState(false);
  const [activityFactor, setActivityFactor] = useState("1.55");
  const [activityLevelKey, setActivityLevelKey] = useState("activo");
  const [dietFormula, setDietFormula] = useState("mifflin");
  const [dailyEnergyFormula, setDailyEnergyFormula] = useState("factorial");
  const [bodyFatFormula, setBodyFatFormula] = useState("peterson");
  const [muscleFormula, setMuscleFormula] = useState("matiegka");
  const [leeRaceKey, setLeeRaceKey] = useState("general");
  const [latestDietCalculation, setLatestDietCalculation] = useState(null);
  const [planScope, setPlanScope] = useState("semanal");
  const [portalMealStatuses, setPortalMealStatuses] = useState({});
  const [savingDietCalc, setSavingDietCalc] = useState(false);
  const [macroEditMode, setMacroEditMode] = useState("percentage");
  const [macroTargets, setMacroTargets] = useState({ percentage: { protein: "", carbs: "", fat: "" }, gkg: { protein: "", carbs: "", fat: "" } });
  const [patientCheckins, setPatientCheckins] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [agendaItems, setAgendaItems] = useState([]);
  const [editingCheckinId, setEditingCheckinId] = useState(null);
  const [editingJournalId, setEditingJournalId] = useState(null);
  const [editingAgendaId, setEditingAgendaId] = useState(null);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);
  const [savingAgenda, setSavingAgenda] = useState(false);
  const [checkinForm, setCheckinForm] = useState({ fecha: new Date().toISOString().split("T")[0], energia: "3", sueno: "3", digestion: "3", adherencia: "3", entrenamiento: "3", notas: "" });
  const [journalForm, setJournalForm] = useState({ fecha: new Date().toISOString().split("T")[0], hambre: "3", saciedad: "3", sintomas: "", sueno_horas: "7.0", entrenamiento: "", adherencia: "3", agua_litros: "2.0", notas: "" });
  const [agendaForm, setAgendaForm] = useState({ titulo: "", fecha: new Date().toISOString().split("T")[0], hora: "09:00", tipo: "consulta", canal: "interno", nota: "" });

  const showToast = useCallback(message => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    const option = ACTIVITY_LEVEL_OPTIONS.find(item => item.id === activityLevelKey);
    if (option && option.factor !== activityFactor) setActivityFactor(option.factor);
  }, [activityLevelKey]);

  const fetchPatients = useCallback(async () => {
    setLoadingPats(true);
    const { data: activeData } = await supabase.from("pacientes").select("*").eq("activo", true).order("nombre");
    const { data: inactiveData } = await supabase.from("pacientes").select("*").eq("activo", false).order("nombre");
    const nextPatients = activeData || [];
    setPatients(nextPatients);
    setInactivePatients(inactiveData || []);
    setSelectedPatient(current => {
      if (current) return nextPatients.find(item => item.id === current.id) || nextPatients[0] || null;
      return nextPatients[0] || null;
    });
    setLoadingPats(false);
  }, []);
  const fetchAdaptedSportPatients = useCallback(async () => {
    const { data } = await supabase.from("deporte_adaptado_pacientes").select("*").order("nombre");
    const rows = data || [];
    setAdaptedSportPatients(rows);
    setSelectedAdaptedSportPatient(current => {
      if (current) return rows.find(item => item.id === current.id) || rows[0] || null;
      return rows[0] || null;
    });
  }, []);
  const fetchConsultas = useCallback(async () => {
    const { data } = await supabase.from("consultas").select("*, pacientes(nombre, apellidos)").order("created_at", { ascending: false }).limit(20);
    setConsultas(data || []);
  }, []);
  const fetchPatientConsultas = useCallback(async patientId => {
    if (!patientId) {
      setPatientConsultas([]);
      return;
    }
    setLoadingCons(true);
    const { data } = await supabase.from("consultas").select("*").eq("paciente_id", patientId).order("fecha", { ascending: true });
    setPatientConsultas(data || []);
    setLoadingCons(false);
  }, []);
  const fetchCustomFoods = useCallback(async () => {
    const { data } = await supabase.from("alimentos_personalizados").select("*").order("created_at", { ascending: false });
    setCustomFoods((data || []).map(item => normalizeFoodRow(item, "custom")));
  }, []);
  const fetchSmaeFoods = useCallback(async () => {
    const { data } = await supabase.from("smae_alimentos").select("*").order("name", { ascending: true });
    setSmaeCatalog((data || []).map(item => normalizeFoodRow(item, "smae")));
  }, []);
  const fetchSmartDishes = useCallback(async () => {
    const { data, error } = await supabase.from("platillos_inteligentes").select("*").order("category", { ascending: true });
    if (!error && data?.length) {
      setSmartDishes(data.map(normalizeSmartDish));
      return;
    }
    setSmartDishes(SMART_DISHES_FALLBACK.map(normalizeSmartDish));
  }, []);
  const fetchStructuredRecipes = useCallback(async () => {
    const { data, error } = await supabase.from("recetas_estructuradas").select("*").order("categoria", { ascending: true }).order("nombre", { ascending: true });
    if (!error && data?.length) {
      setStructuredRecipes(data.map(item => normalizeRecipeRecord(item, "supabase")));
      return;
    }
    setStructuredRecipes([]);
  }, []);
  const fetchClinicalTemplatesCatalog = useCallback(async () => {
    const { data, error } = await supabase.from("plantillas_clinicas").select("*").order("nombre", { ascending: true });
    if (!error && data?.length) {
      setClinicalTemplatesCatalog(data.map(item => normalizeClinicalTemplateRecord(item, "supabase")));
      return;
    }
    setClinicalTemplatesCatalog([]);
  }, []);
  const fetchFavoriteRecipes = useCallback(async patientId => {
    if (!patientId) {
      setFavoriteRecipeIds([]);
      return;
    }
    const { data, error } = await supabase.from("paciente_recetas_favoritas").select("recipe_uid").eq("paciente_id", patientId);
    if (error) {
      setFavoriteRecipeIds([]);
      return;
    }
    setFavoriteRecipeIds((data || []).map(item => String(item.recipe_uid)));
  }, []);
  const fetchPortalMealStatuses = useCallback(async patientId => {
    if (!patientId) {
      setPortalMealStatuses({});
      return;
    }
    const todayIso = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("paciente_plan_adherencia")
      .select("*")
      .eq("paciente_id", patientId)
      .eq("fecha", todayIso);
    if (error) {
      setPortalMealStatuses({});
      return;
    }
    const next = {};
    (data || []).forEach(row => {
      if (row.estado && row.estado !== "pendiente") {
        next[`${row.dia_semana}-${row.tiempo_comida}`] = row.estado;
      }
    });
    setPortalMealStatuses(next);
  }, []);
  const fetchPatientFoodPlan = useCallback(async patientId => {
    if (!patientId) {
      setSelectedFoods([]);
      setMealAssignments(Object.fromEntries(MEAL_SLOTS.map(slot => [slot.id, []])));
      return;
    }
    setLoadingFoodPlan(true);
    const { data } = await supabase.from("paciente_plan_alimentos").select("*").eq("paciente_id", patientId).order("orden", { ascending: true });
    const rows = data || [];
    const assignments = Object.fromEntries(MEAL_SLOTS.map(slot => [slot.id, []]));
    rows.forEach(row => {
      if (assignments[row.tiempo_comida]) assignments[row.tiempo_comida].push(row.alimento_nombre);
    });
    setSelectedFoods([...new Set(rows.map(row => row.alimento_nombre))]);
    setMealAssignments(assignments);
    setLoadingFoodPlan(false);
  }, []);
  const fetchWeeklyPlan = useCallback(async patientId => {
    if (!patientId) {
      setWeeklyPlan(createEmptyWeeklyPlan());
      setWeeklyRecipeRefs(createEmptyWeeklyRecipeRefs());
      return;
    }
    setLoadingWeeklyPlan(true);
    const { data } = await supabase.from("paciente_plan_semanal").select("*").eq("paciente_id", patientId);
    const next = createEmptyWeeklyPlan();
    const nextRefs = createEmptyWeeklyRecipeRefs();
    (data || []).forEach(row => {
      if (next[row.dia_semana]) next[row.dia_semana][row.tiempo_comida] = row.preparacion || "";
      if (nextRefs[row.dia_semana]) nextRefs[row.dia_semana][row.tiempo_comida] = String(row.recipe_uid || row.receta_id || "");
    });
    setWeeklyPlan(next);
    setWeeklyRecipeRefs(nextRefs);
    setLoadingWeeklyPlan(false);
  }, []);
  const fetchDietCalculation = useCallback(async patientId => {
    if (!patientId) {
      setLatestDietCalculation(null);
      return;
    }
    const { data } = await supabase.from("paciente_calculo_dietetico").select("*").eq("paciente_id", patientId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) {
      setLatestDietCalculation(data);
      if (data.formula_referencia) setDietFormula(data.formula_referencia);
      if (data.factor_actividad) setActivityFactor(String(data.factor_actividad));
      if (data.plan_scope) setPlanScope(data.plan_scope);
    } else {
      setLatestDietCalculation(null);
      setPlanScope("semanal");
    }
  }, []);
  const fetchPatientCheckins = useCallback(async patientId => {
    if (!patientId) {
      setPatientCheckins([]);
      return;
    }
    const { data } = await supabase.from("paciente_checkins").select("*").eq("paciente_id", patientId).order("fecha", { ascending: false });
    setPatientCheckins(data || []);
  }, []);
  const fetchJournalEntries = useCallback(async patientId => {
    if (!patientId) {
      setJournalEntries([]);
      return;
    }
    const { data } = await supabase.from("paciente_journal_entries").select("*").eq("paciente_id", patientId).order("fecha", { ascending: false });
    setJournalEntries(data || []);
  }, []);
  const fetchAgendaItems = useCallback(async patientId => {
    if (!patientId) {
      setAgendaItems([]);
      return;
    }
    const { data } = await supabase.from("agenda_recordatorios").select("*").eq("paciente_id", patientId).order("fecha", { ascending: true });
    setAgendaItems(data || []);
  }, []);

  useEffect(() => {
    fetchPatients();
    fetchConsultas();
    fetchCustomFoods();
    fetchSmaeFoods();
    fetchSmartDishes();
    fetchStructuredRecipes();
    fetchClinicalTemplatesCatalog();
    fetchAdaptedSportPatients();
  }, [fetchPatients, fetchConsultas, fetchCustomFoods, fetchSmaeFoods, fetchSmartDishes, fetchStructuredRecipes, fetchClinicalTemplatesCatalog, fetchAdaptedSportPatients]);
  useEffect(() => { fetchPatientConsultas(selectedPatient?.id); }, [selectedPatient, fetchPatientConsultas]);
  useEffect(() => { fetchPatientFoodPlan(selectedPatient?.id); }, [selectedPatient, fetchPatientFoodPlan]);
  useEffect(() => { fetchWeeklyPlan(selectedPatient?.id); }, [selectedPatient, fetchWeeklyPlan]);
  useEffect(() => { fetchDietCalculation(selectedPatient?.id); }, [selectedPatient, fetchDietCalculation]);
  useEffect(() => { fetchPatientCheckins(selectedPatient?.id); }, [selectedPatient, fetchPatientCheckins]);
  useEffect(() => { fetchJournalEntries(selectedPatient?.id); }, [selectedPatient, fetchJournalEntries]);
  useEffect(() => { fetchAgendaItems(selectedPatient?.id); }, [selectedPatient, fetchAgendaItems]);
  useEffect(() => { fetchFavoriteRecipes(selectedPatient?.id); }, [selectedPatient, fetchFavoriteRecipes]);
  useEffect(() => { fetchPortalMealStatuses(selectedPatient?.id); }, [selectedPatient, fetchPortalMealStatuses]);
  useEffect(() => { setFoodVisibleCount(80); }, [foodSearch, foodGroup, foodMealFilter, foodClinicalFilter]);

  function onConsultaSaved() {
    fetchConsultas();
    fetchPatientConsultas(selectedPatient?.id);
    showToast("✓ Consulta guardada");
  }
  function onPacienteSaved(message = "✓ Paciente guardado") {
    fetchPatients();
    showToast(message);
  }
  function onAdaptedSportPatientSaved(message = "✓ Registro de deporte adaptado guardado") {
    fetchAdaptedSportPatients();
    showToast(message);
  }
  async function deleteAdaptedSportPatient() {
    if (!selectedAdaptedSportPatient) return;
    if (!window.confirm(`¿Seguro que quieres borrar a ${selectedAdaptedSportPatient.nombre} ${selectedAdaptedSportPatient.apellidos || ""} del registro de Deporte Adaptado?`)) return;
    const { error } = await supabase.from("deporte_adaptado_pacientes").delete().eq("id", selectedAdaptedSportPatient.id);
    if (error) return showToast(`Error al borrar registro: ${error.message}`);
    showToast("✓ Registro de deporte adaptado borrado");
    fetchAdaptedSportPatients();
  }

  const allFoods = useMemo(() => (
    [...foodDatabase, ...smaeCatalog, ...customFoods].filter((food, index, array) =>
      array.findIndex(item => item.name.toLowerCase() === food.name.toLowerCase()) === index
    )
  ), [customFoods, smaeCatalog]);
  const recipeCatalog = useMemo(() => {
    const base = [...ALL_STRUCTURED_RECIPES.map(item => normalizeRecipeRecord(item, "local")), ...structuredRecipes];
    return base.filter((recipe, index, array) => array.findIndex(item => String(item.id) === String(recipe.id)) === index);
  }, [structuredRecipes]);
  const clinicalTemplateCatalog = useMemo(() => {
    const base = [...ALL_CLINICAL_TEMPLATES.map(item => normalizeClinicalTemplateRecord(item, "local")), ...clinicalTemplatesCatalog];
    return base.filter((template, index, array) => array.findIndex(item => String(item.id) === String(template.id)) === index);
  }, [clinicalTemplatesCatalog]);
  const favoriteRecipeSet = useMemo(() => new Set(favoriteRecipeIds.map(String)), [favoriteRecipeIds]);

  const filteredFoods = useMemo(() => (
    allFoods.filter(food => {
      const query = foodSearch.toLowerCase();
      const matchesSearch = !query || food.name.toLowerCase().includes(query) || normalizeLabelList(food.tags).some(tag => tag.toLowerCase().includes(query));
      const matchesGroup = foodGroup === "todos" || food.grupo === foodGroup;
      const matchesExtended = foodMatchesExtendedFilters(food, { mealSlot: foodMealFilter, clinicalLabel: foodClinicalFilter });
      return matchesSearch && matchesGroup && matchesExtended;
    })
  ), [allFoods, foodSearch, foodGroup, foodMealFilter, foodClinicalFilter]);
  const visibleFoods = filteredFoods.slice(0, foodVisibleCount);
  const suggestedFoods = filteredFoods.slice(0, 6);
  const selectedFoodItems = allFoods.filter(food => selectedFoods.includes(food.name));
  const selectedFoodsSummary = selectedFoodItems.reduce((acc, food) => ({
    kcal: acc.kcal + Number(food.kcal || 0),
    prot: acc.prot + Number(food.prot || 0),
    carbs: acc.carbs + Number(food.carbs || 0),
    fat: acc.fat + Number(food.fat || 0),
  }), { kcal: 0, prot: 0, carbs: 0, fat: 0 });
  const mealPlannerData = MEAL_SLOTS.map(slot => {
    const foods = (mealAssignments[slot.id] || []).map(name => allFoods.find(food => food.name === name)).filter(Boolean);
    return {
      ...slot,
      foods,
      summary: summarizeFoods(foods),
      note: mealNotes[slot.id] || "",
    };
  });
  const globalMealSummary = summarizeFoods(mealPlannerData.flatMap(slot => slot.foods));
  const mealDonutData = mealPlannerData.map(slot => {
    const slotTotal = Number(slot.summary.kcal || 0);
    const total = Number(globalMealSummary.kcal || 0);
    return {
      ...slot,
      pct: total ? round1((slotTotal / total) * 100) : 0,
      donut: [
        { name: "Energía", value: slotTotal || 0, color: ["#c4b5fd", "#fbbf24", "#fb923c", "#60a5fa", "#34d399"][MEAL_SLOTS.findIndex(item => item.id === slot.id)] || "#64748b" },
        { name: "Restante", value: Math.max((total || 1) - slotTotal, 0.1), color: "#334155" },
      ],
    };
  });
  const nutrientReferenceRows = [
    { label: "Ácido pantoténico", value: round1(globalMealSummary.pantothenic), ref: 5.0, unit: "mg" },
    { label: "Calcio", value: round1(globalMealSummary.calcium), ref: 1000, unit: "mg" },
    { label: "Zinc", value: round1(globalMealSummary.zinc), ref: 8.0, unit: "mg" },
    { label: "Cobre", value: round1(globalMealSummary.copper), ref: 0.9, unit: "mg" },
    { label: "Colina", value: round1(globalMealSummary.choline), ref: 425, unit: "mg" },
  ];

  const patientSearchValue = patientSearch.trim().toLowerCase();
  const filteredActivePatients = patients.filter(patient => {
    if (!patientSearchValue) return true;
    return `${patient.nombre || ""} ${patient.apellidos || ""} ${patient.objetivo || ""}`.toLowerCase().includes(patientSearchValue);
  });
  const filteredInactivePatients = inactivePatients.filter(patient => {
    if (!patientSearchValue) return true;
    return `${patient.nombre || ""} ${patient.apellidos || ""} ${patient.objetivo || ""}`.toLowerCase().includes(patientSearchValue);
  });

  const inferredCondition = useMemo(() => {
    const objective = String(selectedPatient?.objetivo || "").toLowerCase();
    const latest = patientConsultas.at(-1);
    if (objective.includes("diabetes") || (latest?.glucosa || 0) > 100 || (latest?.hba1c || 0) > 5.7) return "diabetes";
    if (objective.includes("obes") || objective.includes("grasa") || (latest?.imc || 0) >= 30) return "obesidad";
    if (objective.includes("tca") || objective.includes("bulimia")) return "tca";
    if (objective.includes("musculo") || objective.includes("hipertrofia")) return "hipertrofia";
    if (objective.includes("resistencia")) return "resistencia";
    if (objective.includes("sprint") || objective.includes("potencia")) return "sprint";
    return "general";
  }, [selectedPatient, patientConsultas]);

  const recommendedDishes = useMemo(() => (
    smartDishes.filter(dish => {
      const objective = String(selectedPatient?.objetivo || "").toLowerCase();
      const tags = normalizeLabelList(dish.tags).map(tag => tag.toLowerCase());
      if (inferredCondition === "diabetes" && dish.carbs >= 40) return false;
      if (inferredCondition === "obesidad" && dish.kcal > 420) return false;
      if ((objective.includes("musculo") || inferredCondition === "hipertrofia") && dish.protein < 25) return false;
      if ((objective.includes("resistencia") || inferredCondition === "resistencia") && !tags.some(tag => tag.includes("resistencia") || tag.includes("rendimiento"))) return false;
      if ((objective.includes("sprint") || inferredCondition === "sprint") && !tags.some(tag => tag.includes("sprint") || tag.includes("potencia"))) return false;
      if (inferredCondition === "tca" && !tags.some(tag => tag.includes("tca") || tag.includes("balanceado"))) return false;
      if (!recipeMatchesEdamamFilters(dish, { mealType: recipeMealTypeFilter, dishType: recipeDishTypeFilter, cuisineType: recipeCuisineTypeFilter, clinicalLabel: recipeClinicalFilter })) return false;
      return true;
    }).slice(0, 8)
  ), [smartDishes, selectedPatient, inferredCondition, recipeMealTypeFilter, recipeDishTypeFilter, recipeCuisineTypeFilter, recipeClinicalFilter]);

  const latestAnthroConsulta = [...patientConsultas].reverse().find(c => c.peso || c.imc || c.pliegue_triceps || c.pliegue_biceps || c.pliegue_subescapular || c.pliegue_cresta_iliaca || c.pliegue_supraespinal || c.pliegue_abdominal || c.pliegue_muslo || c.pliegue_pantorrilla);
  const latestYuhaszFallback = latestAnthroConsulta ? getYuhaszData({ sexo: selectedPatient?.sexo, peso: latestAnthroConsulta.peso, pliegue_triceps: latestAnthroConsulta.pliegue_triceps, pliegue_subescapular: latestAnthroConsulta.pliegue_subescapular, pliegue_cresta_iliaca: latestAnthroConsulta.pliegue_cresta_iliaca, pliegue_abdominal: latestAnthroConsulta.pliegue_abdominal, pliegue_muslo: latestAnthroConsulta.pliegue_muslo, pliegue_pantorrilla: latestAnthroConsulta.pliegue_pantorrilla }) : null;
  const latestYuhasz = latestAnthroConsulta ? resolveFatMassResult({
    peso: latestAnthroConsulta.peso,
    storedPct: latestAnthroConsulta.yuhasz_grasa_pct,
    storedKg: latestAnthroConsulta.yuhasz_grasa_kg,
    storedLeanPct: latestAnthroConsulta.yuhasz_libre_grasa_pct,
    storedLeanKg: latestAnthroConsulta.yuhasz_libre_grasa_kg,
    fallback: latestYuhaszFallback,
  }) : null;
  const latestFaulkner = latestAnthroConsulta ? getFaulknerData({ peso: latestAnthroConsulta.peso, pliegue_triceps: latestAnthroConsulta.pliegue_triceps, pliegue_subescapular: latestAnthroConsulta.pliegue_subescapular, pliegue_cresta_iliaca: latestAnthroConsulta.pliegue_cresta_iliaca, pliegue_abdominal: latestAnthroConsulta.pliegue_abdominal }) : null;
  const latestMatiegkaFallback = latestAnthroConsulta ? getMatiegkaData({ peso: latestAnthroConsulta.peso, talla: latestAnthroConsulta.talla, brazo: latestAnthroConsulta.brazo, perimetro_torax: latestAnthroConsulta.perimetro_torax, perimetro_muslo: latestAnthroConsulta.perimetro_muslo, perimetro_pantorrilla: latestAnthroConsulta.perimetro_pantorrilla, pliegue_triceps: latestAnthroConsulta.pliegue_triceps, pliegue_subescapular: latestAnthroConsulta.pliegue_subescapular, pliegue_muslo: latestAnthroConsulta.pliegue_muslo, pliegue_pantorrilla: latestAnthroConsulta.pliegue_pantorrilla }) : null;
  const latestMatiegka = latestAnthroConsulta ? resolveMuscleMassResult({
    peso: latestAnthroConsulta.peso,
    storedPct: latestAnthroConsulta.matiegka_muscular_pct,
    storedKg: latestAnthroConsulta.matiegka_muscular_kg,
    fallback: latestMatiegkaFallback,
  }) : null;
  const yuhaszInterpretation = latestYuhasz ? getBodyFatInterpretation(selectedPatient?.sexo, latestYuhasz.grasaPct) : null;
  const faulknerInterpretation = latestFaulkner ? getBodyFatInterpretation(selectedPatient?.sexo, latestFaulkner.grasaPct) : null;
  const muscleInterpretation = latestMatiegka ? getMuscleInterpretation(latestMatiegka.muscularPct) : null;
  const latestSkinfoldRows = latestAnthroConsulta ? [
    { label: "Triceps", value: latestAnthroConsulta.pliegue_triceps },
    { label: "Biceps", value: latestAnthroConsulta.pliegue_biceps },
    { label: "Subescapular", value: latestAnthroConsulta.pliegue_subescapular },
    { label: "Cresta iliaca", value: latestAnthroConsulta.pliegue_cresta_iliaca },
    { label: "Supraespinal", value: latestAnthroConsulta.pliegue_supraespinal },
    { label: "Abdominal", value: latestAnthroConsulta.pliegue_abdominal },
    { label: "Muslo", value: latestAnthroConsulta.pliegue_muslo },
    { label: "Pantorrilla", value: latestAnthroConsulta.pliegue_pantorrilla },
  ].filter(item => item.value != null).map(item => ({ ...item, band: getSkinfoldBand(item.value) })) : [];
  const skinfoldDistribution = getSkinfoldDistributionInterpretation(latestAnthroConsulta);
  const skinfoldHistoryRows = patientConsultas
    .filter(consulta => consulta.fecha && (
      consulta.pliegue_triceps != null ||
      consulta.pliegue_biceps != null ||
      consulta.pliegue_subescapular != null ||
      consulta.pliegue_cresta_iliaca != null ||
      consulta.pliegue_supraespinal != null ||
      consulta.pliegue_abdominal != null ||
      consulta.pliegue_muslo != null ||
      consulta.pliegue_pantorrilla != null
    ))
    .map(consulta => ({
      id: consulta.id,
      fecha: consulta.fecha,
      triceps: consulta.pliegue_triceps,
      biceps: consulta.pliegue_biceps,
      subescapular: consulta.pliegue_subescapular,
      crestaIliaca: consulta.pliegue_cresta_iliaca,
      supraespinal: consulta.pliegue_supraespinal,
      abdominal: consulta.pliegue_abdominal,
      muslo: consulta.pliegue_muslo,
      pantorrilla: consulta.pliegue_pantorrilla,
      yuhasz: resolveFatMassResult({
        peso: consulta.peso,
        storedPct: consulta.yuhasz_grasa_pct,
        storedKg: consulta.yuhasz_grasa_kg,
        storedLeanPct: consulta.yuhasz_libre_grasa_pct,
        storedLeanKg: consulta.yuhasz_libre_grasa_kg,
        fallback: getYuhaszData({
          sexo: selectedPatient?.sexo,
          peso: consulta.peso,
          pliegue_triceps: consulta.pliegue_triceps,
          pliegue_subescapular: consulta.pliegue_subescapular,
          pliegue_cresta_iliaca: consulta.pliegue_cresta_iliaca,
          pliegue_abdominal: consulta.pliegue_abdominal,
          pliegue_muslo: consulta.pliegue_muslo,
          pliegue_pantorrilla: consulta.pliegue_pantorrilla,
        }),
      })?.grasaPct,
      distribution: getSkinfoldDistributionInterpretation(consulta),
    }));
  const centralAdiposityAlert = getCentralAdiposityAlert({
    sexo: selectedPatient?.sexo,
    cintura: latestAnthroConsulta?.cintura,
    yuhaszPct: latestYuhasz?.grasaPct,
    distributionLabel: skinfoldDistribution?.label,
  });
  const anthropometrySemaphores = getObjectiveSemaphores({
    objetivo: selectedPatient?.objetivo,
    yuhasz: latestYuhasz,
    matiegka: latestMatiegka,
    distribution: skinfoldDistribution,
  });
  const skinfoldEvolutionData = skinfoldHistoryRows.map(row => ({
    fecha: new Date(row.fecha).toLocaleDateString("es-MX", { month: "short", day: "numeric" }),
    triceps: row.triceps != null ? Number(row.triceps) : null,
    subescapular: row.subescapular != null ? Number(row.subescapular) : null,
    abdominal: row.abdominal != null ? Number(row.abdominal) : null,
    muslo: row.muslo != null ? Number(row.muslo) : null,
  }));
  const bodyCompositionEvolutionData = patientConsultas
    .filter(consulta => consulta.fecha && (
      consulta.yuhasz_grasa_pct != null ||
      consulta.matiegka_muscular_pct != null ||
      consulta.peso != null
    ))
    .map(consulta => {
      const yuhaszResolved = resolveFatMassResult({
        peso: consulta.peso,
        storedPct: consulta.yuhasz_grasa_pct,
        storedKg: consulta.yuhasz_grasa_kg,
        storedLeanPct: consulta.yuhasz_libre_grasa_pct,
        storedLeanKg: consulta.yuhasz_libre_grasa_kg,
        fallback: getYuhaszData({
          sexo: selectedPatient?.sexo,
          peso: consulta.peso,
          pliegue_triceps: consulta.pliegue_triceps,
          pliegue_subescapular: consulta.pliegue_subescapular,
          pliegue_cresta_iliaca: consulta.pliegue_cresta_iliaca,
          pliegue_abdominal: consulta.pliegue_abdominal,
          pliegue_muslo: consulta.pliegue_muslo,
          pliegue_pantorrilla: consulta.pliegue_pantorrilla,
        }),
      });
      const faulkner = getFaulknerData({
        peso: consulta.peso,
        pliegue_triceps: consulta.pliegue_triceps,
        pliegue_subescapular: consulta.pliegue_subescapular,
        pliegue_cresta_iliaca: consulta.pliegue_cresta_iliaca,
        pliegue_abdominal: consulta.pliegue_abdominal,
      })?.grasaPct;
      const matiegkaResolved = resolveMuscleMassResult({
        peso: consulta.peso,
        storedPct: consulta.matiegka_muscular_pct,
        storedKg: consulta.matiegka_muscular_kg,
        fallback: getMatiegkaData({
          peso: consulta.peso,
          talla: consulta.talla,
          brazo: consulta.brazo,
          perimetro_torax: consulta.perimetro_torax,
          perimetro_muslo: consulta.perimetro_muslo,
          perimetro_pantorrilla: consulta.perimetro_pantorrilla,
          pliegue_triceps: consulta.pliegue_triceps,
          pliegue_subescapular: consulta.pliegue_subescapular,
          pliegue_muslo: consulta.pliegue_muslo,
          pliegue_pantorrilla: consulta.pliegue_pantorrilla,
        }),
      });
      return {
        id: consulta.id,
        fecha: new Date(consulta.fecha).toLocaleDateString("es-MX", { month: "short", day: "numeric" }),
        fechaRaw: consulta.fecha,
        yuhasz: yuhaszResolved?.grasaPct != null ? Number(yuhaszResolved.grasaPct) : null,
        yuhaszKg: yuhaszResolved?.grasaKg != null ? Number(yuhaszResolved.grasaKg) : null,
        faulkner: faulkner != null ? Number(faulkner) : null,
        faulknerKg: getFaulknerData({
          peso: consulta.peso,
          pliegue_triceps: consulta.pliegue_triceps,
          pliegue_subescapular: consulta.pliegue_subescapular,
          pliegue_cresta_iliaca: consulta.pliegue_cresta_iliaca,
          pliegue_abdominal: consulta.pliegue_abdominal,
        })?.grasaKg ?? null,
        matiegka: matiegkaResolved?.muscularPct != null ? Number(matiegkaResolved.muscularPct) : null,
        muscularKg: matiegkaResolved?.muscularKg != null ? Number(matiegkaResolved.muscularKg) : null,
      };
    })
    .filter(row => row.yuhasz != null || row.faulkner != null || row.matiegka != null);

  const dietWeight = latestAnthroConsulta?.peso;
  const dietHeight = latestAnthroConsulta?.talla;
  const dietAge = selectedPatient?.edad;
  const dietSex = selectedPatient?.sexo;
  const activity = Number(activityFactor);
  const leeRaceFactors = {
    general: { anthropometric: 0, weightHeight: 0, label: "Blanco / Hispano" },
    afro: { anthropometric: 1.1, weightHeight: 1.4, label: "Afrodescendiente" },
    asian: { anthropometric: -2.0, weightHeight: -1.2, label: "Asiático" },
  };
  const selectedLeeRace = leeRaceFactors[leeRaceKey] || leeRaceFactors.general;
  const harrisBenedict = getHarrisBenedict({ sexo: dietSex, peso: dietWeight, talla: dietHeight, edad: dietAge });
  const mifflinStJeor = getMifflinStJeor({ sexo: dietSex, peso: dietWeight, talla: dietHeight, edad: dietAge });
  const schofield = getSchofield({ sexo: dietSex, peso: dietWeight, edad: dietAge });
  const omsFaoUnu = getOmsFaoUnu({ sexo: dietSex, peso: dietWeight, edad: dietAge });
  const iomEer = getIomEer({ sexo: dietSex, peso: dietWeight, talla: dietHeight, edad: dietAge, activityLevelKey });
  const petersonData = getPetersonData({
    sexo: dietSex,
    edad: dietAge,
    peso: dietWeight,
    pliegue_triceps: latestAnthroConsulta?.pliegue_triceps,
    pliegue_subescapular: latestAnthroConsulta?.pliegue_subescapular,
    cintura: latestAnthroConsulta?.cintura,
    circunferencia_pantorrilla: latestAnthroConsulta?.circunferencia_pantorrilla || latestAnthroConsulta?.perimetro_pantorrilla,
    circunferencia_brazo_relajado: latestAnthroConsulta?.circunferencia_brazo_relajado || latestAnthroConsulta?.brazo,
    circunferencia_muslo: latestAnthroConsulta?.circunferencia_muslo || latestAnthroConsulta?.perimetro_muslo,
  });
  const evansData = getEvansBodyFatData({
    sexo: dietSex,
    peso: dietWeight,
    pliegue_triceps: latestAnthroConsulta?.pliegue_triceps,
    pliegue_abdominal: latestAnthroConsulta?.pliegue_abdominal,
    pliegue_muslo: latestAnthroConsulta?.pliegue_muslo,
  });
  const rfmData = getRfmData({ sexo: dietSex, peso: dietWeight, talla: dietHeight, cintura: latestAnthroConsulta?.cintura });
  const deurenbergData = getDeurenbergData({ sexo: dietSex, edad: dietAge, peso: dietWeight, talla: dietHeight });
  const leeAnthroData = getLeeAnthropometricMuscleData({
    sexo: dietSex,
    edad: dietAge,
    talla: dietHeight,
    peso: dietWeight,
    circunferencia_brazo_relajado: latestAnthroConsulta?.circunferencia_brazo_relajado || latestAnthroConsulta?.brazo,
    circunferencia_muslo: latestAnthroConsulta?.circunferencia_muslo || latestAnthroConsulta?.perimetro_muslo,
    circunferencia_pantorrilla: latestAnthroConsulta?.circunferencia_pantorrilla || latestAnthroConsulta?.perimetro_pantorrilla,
    pliegue_triceps: latestAnthroConsulta?.pliegue_triceps,
    pliegue_muslo: latestAnthroConsulta?.pliegue_muslo,
    pliegue_pantorrilla: latestAnthroConsulta?.pliegue_pantorrilla,
    raceFactor: selectedLeeRace.anthropometric,
  });
  const leeWeightHeightData = getLeeWeightHeightMuscleData({
    sexo: dietSex,
    edad: dietAge,
    talla: dietHeight,
    peso: dietWeight,
    raceFactor: selectedLeeRace.weightHeight,
  });
  const bodyFatFormulaOptions = [
    { id: "peterson", label: "Peterson", data: petersonData, note: "Útil cuando hay cintura, edad y circunferencias." },
    { id: "rfm", label: "RFM", data: rfmData, note: "Muy práctica y validada con talla y cintura." },
    { id: "evans", label: "Evans", data: evansData, note: "Enfoque antropométrico basado en pliegues." },
    { id: "yuhasz", label: "Yuhasz", data: latestYuhasz, note: "Clásica en contexto deportivo con 6 pliegues." },
    { id: "faulkner", label: "Faulkner", data: latestFaulkner, note: "Estimación simple con 4 pliegues." },
    { id: "deurenberg", label: "Deurenberg", data: deurenbergData, note: "Alternativa útil con IMC, edad y sexo." },
  ];
  const selectedBodyFatFormula = bodyFatFormulaOptions.find(item => item.id === bodyFatFormula && item.data) || bodyFatFormulaOptions.find(item => item.data) || null;
  const selectedFatForAdvanced = selectedBodyFatFormula?.data || petersonData || rfmData || evansData || latestYuhasz || latestFaulkner || null;
  const katchMcArdle = getKatchMcArdle({ peso: dietWeight, grasaPct: selectedFatForAdvanced?.grasaPct });
  const vonDobelnBoneKg = getVonDobelnBoneMass({
    talla: latestAnthroConsulta?.talla,
    diametro_biestiloideo: latestAnthroConsulta?.diametro_biestiloideo,
    diametro_rodilla: latestAnthroConsulta?.diametro_rodilla,
  });
  const wurchResidualKg = getWurchResidualMass({ peso: dietWeight, sexo: dietSex });
  const derivedMuscleMass = getDerivedMuscleMass({
    peso: dietWeight,
    fatKg: selectedFatForAdvanced?.grasaKg,
    boneKg: vonDobelnBoneKg,
    residualKg: wurchResidualKg,
  });
  const muscleFormulaOptions = [
    { id: "matiegka", label: "Matiegka", data: latestMatiegka, note: "Antropométrica clásica con perímetros y pliegues." },
    { id: "lee_anthro", label: "Lee antropométrica", data: leeAnthroData, note: "Basada en circunferencias corregidas y edad." },
    { id: "lee_weight", label: "Lee peso-talla", data: leeWeightHeightData, note: "Alternativa simple con peso, talla, edad y sexo." },
    { id: "derivada", label: "Residual derivada", data: derivedMuscleMass, note: "Peso menos grasa, ósea y residual." },
  ];
  const selectedMuscleFormula = muscleFormulaOptions.find(item => item.id === muscleFormula && item.data) || muscleFormulaOptions.find(item => item.data) || null;
  const idealWeight = getIdealWeight({ sexo: dietSex, talla: dietHeight });
  const adjustedWeight = getAdjustedWeight({ pesoActual: dietWeight, pesoIdeal: idealWeight });
  const currentImc = dietWeight && dietHeight ? round1(dietWeight / Math.pow(dietHeight / 100, 2)) : null;
  const targetImc = idealWeight && dietHeight ? round1(idealWeight / Math.pow(dietHeight / 100, 2)) : null;
  const dietFormulas = [
    { id: "harris", title: "Harris-Benedict revisada", geb: harrisBenedict, note: "Revisión de Roza y Shizgal con peso, talla, edad y sexo." },
    { id: "mifflin", title: "Mifflin-St Jeor", geb: mifflinStJeor, note: "Suele ser mas precisa en obesidad." },
    { id: "katch", title: "Katch-McArdle", geb: katchMcArdle?.geb || null, note: `Usa masa libre de grasa estimada${selectedFatForAdvanced?.grasaPct != null ? ` (${selectedFatForAdvanced.grasaPct}% grasa)` : ""}.` },
    { id: "schofield", title: "Schofield", geb: schofield, note: "Basada en peso, edad y sexo." },
    { id: "oms", title: "OMS / FAO / UNU", geb: omsFaoUnu, note: "Implementada con los coeficientes adultos usados en Schofield." },
  ];
  const dailyEnergyFormulas = [
    { id: "factorial", title: "Factorial (TMB x AF)", kcal: null, note: "Multiplica la TMB seleccionada por el nivel de actividad." },
    { id: "iom_eer", title: "EER, IOM 2005", kcal: iomEer, note: "Ecuación del Institute of Medicine con PA por nivel de actividad." },
  ];
  const selectedDietFormulaData = dietFormulas.find(item => item.id === dietFormula) || dietFormulas[1];
  const factorialEnergy = selectedDietFormulaData?.geb ? round1(selectedDietFormulaData.geb * activity) : null;
  const bodyCompositionReferenceRows = [
    {
      id: "activity_level",
      label: "Nivel de actividad física",
      formula: "PAL / IOM",
      actual: (ACTIVITY_LEVEL_OPTIONS.find(item => item.id === activityLevelKey)?.label || "No definido"),
      objective: `PAL ${activity}`,
      reference: ACTIVITY_LEVEL_OPTIONS.find(item => item.id === activityLevelKey)?.palRange || "Sin referencia",
      note: "Puedes cambiar el nivel para ajustar tanto el cálculo factorial como el EER del IOM.",
      formulaOptions: ACTIVITY_LEVEL_OPTIONS.map(item => ({ value: item.id, label: `${item.label} · ${item.palRange}` })),
      formulaSelection: activityLevelKey,
      formulaControl: "activity",
    },
    {
      id: "basal_metabolism",
      label: "Metabolismo basal",
      formula: selectedDietFormulaData?.title || "Sin cálculo",
      actual: selectedDietFormulaData?.geb ? `${selectedDietFormulaData.geb} kcal/día` : "Sin dato",
      objective: "—",
      reference: mifflinStJeor ? `${mifflinStJeor} kcal/día` : "Sin referencia",
      note: selectedDietFormulaData?.note || "",
      formulaOptions: dietFormulas.map(item => ({ value: item.id, label: item.title })),
      formulaSelection: dietFormula,
      formulaControl: "basal",
    },
    {
      id: "daily_energy",
      label: "Necesidades energéticas diarias",
      formula: dailyEnergyFormulas.find(item => item.id === dailyEnergyFormula)?.title || "Sin cálculo",
      actual: (dailyEnergyFormula === "iom_eer" ? iomEer : factorialEnergy) ? `${dailyEnergyFormula === "iom_eer" ? iomEer : factorialEnergy} kcal/día` : "Sin dato",
      objective: (dailyEnergyFormula === "iom_eer" ? iomEer : factorialEnergy) ? `${dailyEnergyFormula === "iom_eer" ? iomEer : factorialEnergy} kcal/día` : "No definido",
      reference: iomEer ? `${iomEer} kcal/día` : "Sin referencia",
      note: dailyEnergyFormulas.find(item => item.id === dailyEnergyFormula)?.note || "",
      formulaOptions: dailyEnergyFormulas.map(item => ({ value: item.id, label: item.title })),
      formulaSelection: dailyEnergyFormula,
      formulaControl: "energy",
    },
    {
      id: "weight",
      label: "Peso",
      formula: "—",
      actual: dietWeight ? `${dietWeight} kg` : "Sin dato",
      objective: idealWeight ? `${idealWeight} kg` : "Sin dato",
      reference: idealWeight ? `${idealWeight} kg` : "Sin dato",
      note: dietWeight && idealWeight ? `${dietWeight > idealWeight ? "Reducción" : "Diferencia"} de ${Math.abs(round1(dietWeight - idealWeight))} kg` : "",
    },
    {
      id: "body_fat_pct",
      label: "Porcentaje de masa grasa",
      formula: selectedBodyFatFormula?.label || "Sin cálculo",
      actual: selectedBodyFatFormula?.data?.grasaPct != null ? `${selectedBodyFatFormula.data.grasaPct} %` : "Sin dato",
      objective: "No definido",
      reference: getBodyFatInterpretation(dietSex, selectedBodyFatFormula?.data?.grasaPct)?.label || "Sin referencia",
      note: `${selectedBodyFatFormula?.note || ""}${selectedBodyFatFormula?.data?.grasaKg != null ? ` · ${selectedBodyFatFormula.data.grasaKg} kg de grasa estimada.` : ""}`,
      formulaOptions: bodyFatFormulaOptions.filter(item => item.data).map(item => ({ value: item.id, label: item.label })),
      formulaSelection: selectedBodyFatFormula?.id || bodyFatFormula,
      formulaControl: "fat",
    },
    {
      id: "imc",
      label: "Índice de masa corporal",
      formula: "—",
      actual: currentImc ? `${currentImc} kg/m2` : "Sin dato",
      objective: targetImc ? `${targetImc} kg/m2` : "Sin dato",
      reference: currentImc ? getImcCategory(currentImc) : "Sin referencia",
      note: currentImc ? getImcCategory(currentImc) : "",
    },
    {
      id: "bone_mass",
      label: "Masa ósea",
      formula: "Von Döbeln",
      actual: vonDobelnBoneKg != null ? `${vonDobelnBoneKg} kg` : "Sin dato",
      objective: "No definido",
      reference: "Estimación antropométrica",
      note: "Basada en talla, diámetro biestiloideo y diámetro de rodilla.",
    },
    {
      id: "residual_mass",
      label: "Masa residual",
      formula: "Würch",
      actual: wurchResidualKg != null ? `${wurchResidualKg} kg` : "Sin dato",
      objective: "No definido",
      reference: String(dietSex || "").toLowerCase().includes("masc") ? "24.1% del peso" : "20.9% del peso",
      note: "Estimación clásica del componente residual.",
    },
    {
      id: "muscle_mass",
      label: "Masa muscular",
      formula: selectedMuscleFormula?.label || "Sin cálculo",
      actual: selectedMuscleFormula?.data?.muscularKg != null ? `${selectedMuscleFormula.data.muscularKg} kg` : "Sin dato",
      objective: "No definido",
      reference: selectedMuscleFormula?.data?.muscularPct != null ? `${selectedMuscleFormula.data.muscularPct}%` : "Sin referencia",
      note: `${selectedMuscleFormula?.note || ""}${selectedLeeRace?.label ? ` · Raza Lee: ${selectedLeeRace.label}.` : ""}`,
      formulaOptions: muscleFormulaOptions.filter(item => item.data).map(item => ({ value: item.id, label: item.label })),
      formulaSelection: selectedMuscleFormula?.id || muscleFormula,
      formulaControl: "muscle",
    },
  ];
  const selectedDietGet = dailyEnergyFormula === "iom_eer" ? iomEer : factorialEnergy;
  const macroPlan = getMacroDistribution({ kcalTarget: selectedDietGet, pesoActual: dietWeight, pesoIdeal: idealWeight, pesoAjustado: adjustedWeight, objetivo: selectedPatient?.objetivo, condition: inferredCondition });
  const activeMacroPlan = getEditedMacroPlan({ mode: macroEditMode, kcalTarget: selectedDietGet, weightBase: macroPlan?.weightBase, targets: macroEditMode === "gkg" ? macroTargets.gkg : macroTargets.percentage, fallbackPlan: macroPlan });
  const globalMealTarget = {
    kcal: Number(activeMacroPlan?.kcalTarget || 0),
    fat: Number(activeMacroPlan?.fatG || 0),
    carbs: Number(activeMacroPlan?.carbsG || 0),
    protein: Number(activeMacroPlan?.proteinG || 0),
    fiber: Math.max(25, Math.round((Number(activeMacroPlan?.kcalTarget || 0) / 1000) * 14)),
  };
  useEffect(() => {
    if (!macroPlan || !macroPlan.weightBase) return;
    setMacroTargets({
      percentage: {
        protein: String(macroPlan.proteinPct ?? ""),
        carbs: String(macroPlan.carbsPct ?? ""),
        fat: String(macroPlan.fatPct ?? ""),
      },
      gkg: {
        protein: String(macroPlan.proteinGkg ?? ""),
        carbs: String(macroPlan.carbsGkg ?? ""),
        fat: String(macroPlan.fatGkg ?? ""),
      },
    });
  }, [macroPlan?.kcalTarget, macroPlan?.weightBase]);

  const weeklyRecipes = buildWeeklyRecipes(weeklyPlan, recipeCatalog, weeklyRecipeRefs);
  const recipeSearchQuery = recipeSearch.trim().toLowerCase();
  const filteredRecipeLibrary = recipeCatalog.filter(recipe => {
    if (!recipeMatchesEdamamFilters(recipe, { mealType: recipeMealTypeFilter, dishType: recipeDishTypeFilter, cuisineType: recipeCuisineTypeFilter, clinicalLabel: recipeClinicalFilter })) return false;
    if (recipeDifficultyFilter !== "todos" && recipe.difficulty !== recipeDifficultyFilter) return false;
    if (recipeGoalFilter !== "todos" && !normalizeLabelList(recipe.objetivo).includes(recipeGoalFilter) && !normalizeLabelList(recipe.condicionesCompatibles).includes(recipeGoalFilter)) return false;
    if (showFavoriteRecipesOnly && !favoriteRecipeSet.has(String(recipe.id))) return false;
    if (!recipeSearchQuery) return true;
    const haystack = [
      recipe.nombre,
      recipe.descripcion,
      ...normalizeLabelList(recipe.tags),
      ...normalizeLabelList(recipe.objetivo),
      ...normalizeLabelList(recipe.condicionesCompatibles),
      ...recipe.ingredientes.map(item => item.item),
    ].join(" ").toLowerCase();
    return haystack.includes(recipeSearchQuery);
  });
  const filteredWeeklyRecipes = filteredRecipeLibrary.filter(recipe => weeklyRecipes.some(activeRecipe => String(activeRecipe.id) === String(recipe.id)));
  const groceryList = buildGroceryList(weeklyRecipes);
  const suggestedClinicalTemplate = getClinicalTemplateByCondition(inferredCondition, clinicalTemplateCatalog);
  const latestCheckin = patientCheckins[0] || null;
  const latestJournalEntry = journalEntries[0] || null;
  const latestAdimeConsulta = [...patientConsultas].reverse().find(item => item.adime_valoracion || item.adime_diagnostico || item.adime_intervencion || item.adime_monitoreo || item.diagnostico_nutricional) || null;
  const adherenceAlerts = [
    latestCheckin && Number(latestCheckin.adherencia) <= 2 ? {
      level: "Alta",
      title: "Adherencia baja en check-in",
      note: `El último check-in (${latestCheckin.fecha}) reporta adherencia ${latestCheckin.adherencia}/5.`,
      tone: "#f87171",
    } : null,
    latestJournalEntry && Number(latestJournalEntry.adherencia) <= 2 ? {
      level: "Media",
      title: "Adherencia baja en journaling",
      note: `El journal más reciente (${latestJournalEntry.fecha}) reporta adherencia ${latestJournalEntry.adherencia}/5.`,
      tone: "#fb7185",
    } : null,
    latestJournalEntry && Number(latestJournalEntry.hambre) >= 4 && Number(latestJournalEntry.saciedad) <= 2 ? {
      level: "Media",
      title: "Hambre elevada con baja saciedad",
      note: "Puede sugerir distribución insuficiente, baja densidad de proteína/fibra o pobre apego al plan.",
      tone: "#f59e0b",
    } : null,
    latestJournalEntry && latestJournalEntry.sueno_horas != null && Number(latestJournalEntry.sueno_horas) < 6 ? {
      level: "Media",
      title: "Sueño insuficiente",
      note: `El paciente reportó ${latestJournalEntry.sueno_horas} h de sueño, lo que puede afectar hambre, adherencia y recuperación.`,
      tone: "#60a5fa",
    } : null,
  ].filter(Boolean);
  const adaptedSportModule = useMemo(() => {
    const sportPatient = selectedAdaptedSportPatient;
    const objective = String(sportPatient?.objetivo || "").toLowerCase();
    const energy = Number(latestCheckin?.energia || 3);
    const sleep = Number(latestCheckin?.sueno || 3);
    const adherence = Number(latestCheckin?.adherencia || latestJournalEntry?.adherencia || 3);
    const hydration = Number(latestAnthroConsulta?.hidratacion || 0);
    const bodyFat = Number(latestYuhasz?.grasaPct || 0);
    let profile = "Actividad fisica general";
    let trainingFocus = "Progresion funcional y adherencia";
    let intensity = "Moderada";
    let weeklyGoal = "3 sesiones principales + 2 sesiones ligeras de movilidad o caminata";
    let prePost = "Pre: carbohidrato facil + hidratacion. Post: proteina + carbohidrato simple/moderado.";
    let precautions = "Supervisar tolerancia, tecnica y recuperacion.";
    if (inferredCondition === "diabetes") {
      profile = "Control glucemico con ejercicio adaptado";
      trainingFocus = "Fuerza total + caminata postprandial + resistencia moderada";
      intensity = "Moderada sostenida";
      weeklyGoal = "3 sesiones de fuerza + 4-5 caminatas de 10-20 min después de comer";
      prePost = "Pre: revisar tolerancia y evitar largos ayunos; Post: proteina magra + carbohidrato distribuido.";
      precautions = "Monitorear sintomas de hipoglucemia, horarios y respuesta individual.";
    } else if (objective.includes("hipertrofia") || objective.includes("musculo")) {
      profile = "Hipertrofia adaptada";
      trainingFocus = "Fuerza estructurada con volumen progresivo";
      intensity = "Moderada a alta";
      weeklyGoal = "4 sesiones de fuerza + 1-2 de movilidad o cardio suave";
      prePost = "Pre: carbohidrato + algo de proteina; Post: 25-40 g de proteina + carbohidrato.";
      precautions = "Cuidar tecnica, sueño y distribución de proteína diaria.";
    } else if (objective.includes("resistencia")) {
      profile = "Resistencia adaptada";
      trainingFocus = "Base aerobica + fuerza de soporte";
      intensity = "Moderada con picos controlados";
      weeklyGoal = "3 sesiones aeróbicas + 2 de fuerza + 1 de movilidad";
      prePost = "Pre: carbohidrato utilizable e hidratacion; Post: reposicion de líquidos, sodio y proteína.";
      precautions = "Vigilar fatiga acumulada y recuperación.";
    } else if (objective.includes("sprint") || objective.includes("potencia")) {
      profile = "Potencia y velocidad adaptadas";
      trainingFocus = "Fuerza neural + técnica + sprint breve";
      intensity = "Alta pero dosificada";
      weeklyGoal = "2 sesiones de potencia + 2 de fuerza + recuperación activa";
      prePost = "Pre: combustible ligero, buena hidratación; Post: proteína y recuperación neuromuscular.";
      precautions = "Evitar acumular fatiga con mal sueño o baja adherencia.";
    } else if (objective.includes("grasa") || objective.includes("peso") || inferredCondition === "obesidad") {
      profile = "Pérdida de grasa con movimiento adaptado";
      trainingFocus = "Fuerza básica + gasto diario + caminata";
      intensity = "Baja a moderada progresiva";
      weeklyGoal = "3 sesiones de fuerza + caminatas diarias + movilidad";
      prePost = "Pre: comida ligera tolerable; Post: proteína y buena saciedad.";
      precautions = "Priorizar adherencia, molestias articulares y progresión gradual.";
    }
    const readinessScore = Math.max(1, Math.min(5, Math.round((energy + sleep + adherence) / 3)));
    const readinessLabel = readinessScore >= 4 ? "Listo para progresar" : readinessScore >= 3 ? "Carga estable" : "Reducir carga y priorizar recuperación";
    const adaptationNotes = [
      adherence <= 2 ? "Reducir complejidad del plan de entrenamiento y mantener sesiones cortas, claras y repetibles." : "Se puede sostener una estructura semanal más completa.",
      sleep <= 2 ? "Bajar volumen/intensidad temporalmente y reforzar recuperación." : "El sueño actual permite una carga más estable.",
      energy <= 2 ? "Priorizar técnica, movilidad y trabajo submáximo hasta recuperar energía." : "La energía reportada permite trabajo funcional o deportivo progresivo.",
      bodyFat && bodyFat >= 30 ? "Combinar fuerza y actividad aeróbica de bajo impacto para mejorar tolerancia y composición corporal." : "La composición actual permite progresar según objetivo y tolerancia.",
    ];
    const suitableSports = inferredCondition === "diabetes"
      ? ["Caminata postprandial", "Bicicleta fija", "Fuerza total", "Circuitos moderados"]
      : objective.includes("hipertrofia") || objective.includes("musculo")
        ? ["Fuerza en sala", "Máquinas guiadas", "Trabajo accesorio", "Movilidad"]
        : objective.includes("resistencia")
          ? ["Caminata rápida", "Trote suave", "Bicicleta", "Remo o elíptica"]
          : objective.includes("sprint") || objective.includes("potencia")
            ? ["Sprints cortos", "Lanzamientos", "Saltos dosificados", "Fuerza neural"]
          : ["Caminata", "Circuitos funcionales", "Bandas de resistencia", "Movilidad"];
    const adaptedProfiles = [
      {
        title: "Silla de ruedas",
        focus: "Fuerza de tren superior, estabilidad central, prevención de sobreuso y gasto energético adaptado.",
        examples: "Bandas, poleas, empujes, remo, ergómetro de brazos.",
        caution: "Vigilar hombros, postura, puntos de apoyo e hidratación.",
      },
      {
        title: "Amputación",
        focus: "Progresión de fuerza, equilibrio, coordinación y adaptación según uso de prótesis o apoyo.",
        examples: "Fuerza unilateral, trabajo de core, marcha, bici o remo según tolerancia.",
        caution: "Revisar fatiga del segmento residual, ajuste protésico y asimetrías.",
      },
      {
        title: "Baja visión",
        focus: "Rutinas seguras, repetibles y bien guiadas con referencias auditivas o táctiles.",
        examples: "Caminadora guiada, bicicleta fija, circuitos simples, fuerza con máquina.",
        caution: "Reducir obstáculos, reforzar instrucciones y control del entorno.",
      },
      {
        title: "Neurológico",
        focus: "Movilidad, equilibrio, coordinación y fuerza funcional en bloques cortos.",
        examples: "Marcha asistida, levantarse-sentarse, bandas, trabajo postural.",
        caution: "Adaptar velocidad, fatiga y estímulos según control motor.",
      },
      {
        title: "Adulto mayor",
        focus: "Fuerza funcional, equilibrio, marcha, prevención de caídas y masa muscular.",
        examples: "Sit to stand, caminata, escalón bajo, bandas y mancuernas ligeras.",
        caution: "Monitorear recuperación, estabilidad y síntomas cardiovasculares.",
      },
      {
        title: "Talla pequeña",
        focus: "Ajuste de implementos, rangos de movimiento, ergonomía y dosificación proporcional.",
        examples: "Máquinas ajustables, trabajo con bandas, fuerza técnica, movilidad y equilibrio.",
        caution: "Adaptar palancas, alturas, agarres y volumen para evitar sobrecarga mecánica.",
      },
      {
        title: "Síndrome de Down",
        focus: "Rutinas estructuradas, fuerza básica, coordinación, equilibrio y adherencia con consignas simples.",
        examples: "Circuitos guiados, caminata, bicicleta fija, ejercicios con peso corporal y bandas.",
        caution: "Individualizar progresión, supervisar técnica y considerar tono, laxitud y tolerancia.",
      },
    ];
    return { profile, trainingFocus, intensity, weeklyGoal, prePost, precautions, readinessScore, readinessLabel, adaptationNotes, suitableSports, hydration, adaptedProfiles };
  }, [selectedAdaptedSportPatient, inferredCondition, latestCheckin, latestJournalEntry, latestAnthroConsulta, latestYuhasz]);
  const upcomingAgenda = agendaItems.filter(item => !item.completado).slice(0, 5);
  const totalAssignedMeals = countAssignedMeals(weeklyPlan);
  const totalGroceryItems = groceryList.reduce((acc, group) => acc + group.items.length, 0);
  const mealAssignmentSummary = MEAL_SLOTS.map(slot => ({
    ...slot,
    count: mealAssignments[slot.id]?.length || 0,
    items: mealAssignments[slot.id] || [],
  }));
  const weightChartData = patientConsultas.filter(c => c.peso).map(c => ({ mes: new Date(c.fecha).toLocaleDateString("es-MX", { month: "short", day: "numeric" }), peso: Number(c.peso) }));

  async function deleteSelectedPatient() {
    if (!selectedPatient) return;
    if (!window.confirm(`¿Seguro que quieres borrar a ${selectedPatient.nombre} ${selectedPatient.apellidos || ""}?`)) return;
    const { error } = await supabase.from("pacientes").delete().eq("id", selectedPatient.id);
    if (error) return showToast(`Error al borrar paciente: ${error.message}`);
    showToast("✓ Paciente borrado");
    fetchPatients();
    fetchConsultas();
  }
  async function deactivateSelectedPatient() {
    if (!selectedPatient) return;
    if (!window.confirm(`¿Seguro que quieres desactivar a ${selectedPatient.nombre} ${selectedPatient.apellidos || ""}?`)) return;
    const { error } = await supabase.from("pacientes").update({ activo: false }).eq("id", selectedPatient.id);
    if (error) return showToast(`Error al desactivar paciente: ${error.message}`);
    showToast("✓ Paciente desactivado");
    fetchPatients();
  }
  async function reactivatePatient(patient) {
    const { error } = await supabase.from("pacientes").update({ activo: true }).eq("id", patient.id);
    if (error) return showToast(`Error al reactivar paciente: ${error.message}`);
    showToast("✓ Paciente reactivado");
    fetchPatients();
  }

  function toggleFoodSelection(name) {
    setSelectedFoods(prev => prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]);
  }
  function assignFoodToMeal(name, slotId) {
    setMealAssignments(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        next[key] = next[key].filter(item => item !== name);
      });
      next[slotId] = [...next[slotId], name];
      return next;
    });
  }
  function removeFoodFromMeal(name, slotId) {
    setMealAssignments(prev => ({ ...prev, [slotId]: prev[slotId].filter(item => item !== name) }));
  }
  function moveFoodWithinMeal(slotId, index, direction) {
    setMealAssignments(prev => {
      const items = [...(prev[slotId] || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return prev;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      return { ...prev, [slotId]: items };
    });
  }
  function addFoodToMealFromQuickSelect(slotId) {
    const name = mealQuickAdd[slotId];
    if (!name) return;
    setSelectedFoods(prev => prev.includes(name) ? prev : [...prev, name]);
    assignFoodToMeal(name, slotId);
    setMealQuickAdd(prev => ({ ...prev, [slotId]: "" }));
  }
  async function savePatientFoodPlan() {
    if (!selectedPatient) return showToast("Selecciona un paciente");
    const { data: latestConsulta } = await supabase.from("consultas").select("id").eq("paciente_id", selectedPatient.id).order("fecha", { ascending: false }).limit(1).maybeSingle();
    const latestConsultaId = latestConsulta?.id || null;
    const rows = selectedFoods.map((name, index) => {
      const food = allFoods.find(item => item.name === name);
      const slot = MEAL_SLOTS.find(entry => mealAssignments[entry.id].includes(name))?.id || "sin_asignar";
      return {
        paciente_id: selectedPatient.id,
        consulta_id: latestConsultaId,
        alimento_nombre: name,
        grupo: food?.grupo || null,
        porcion: food?.porcion || null,
        intercambio: food?.intercambio || null,
        tiempo_comida: slot,
        receta: getFoodRecipe(food || { name }),
        sustituciones: food ? getFoodSubstitutions(food, allFoods) : [],
        orden: index + 1,
      };
    });
    const { error: deleteError } = await supabase.from("paciente_plan_alimentos").delete().eq("paciente_id", selectedPatient.id);
    if (deleteError) return showToast(`Error al limpiar plan: ${deleteError.message}`);
    if (rows.length) {
      const { error: insertError } = await supabase.from("paciente_plan_alimentos").insert(rows);
      if (insertError) return showToast(`Error al guardar plan: ${insertError.message}`);
    }
    showToast("✓ Plan de alimentos guardado");
    fetchPatientFoodPlan(selectedPatient.id);
  }
  async function saveCustomFood() {
    if (!customFoodForm.name.trim()) return showToast("Escribe un nombre para el alimento");
    const payload = {
      name: customFoodForm.name,
      grupo: customFoodForm.grupo,
      porcion: customFoodForm.porcion,
      intercambio: customFoodForm.intercambio,
      kcal: Number(customFoodForm.kcal || 0),
      prot: Number(customFoodForm.prot || 0),
      carbs: Number(customFoodForm.carbs || 0),
      fat: Number(customFoodForm.fat || 0),
      tags: customFoodForm.tags.split(",").map(item => item.trim()).filter(Boolean),
      tiempos: customFoodForm.tiempos,
    };
    const { error } = await supabase.from("alimentos_personalizados").insert([payload]);
    if (error) return showToast(`Error al guardar alimento: ${error.message}`);
    setCustomFoodForm({ name: "", grupo: "proteinas", porcion: "", intercambio: "", kcal: "", prot: "", carbs: "", fat: "", tags: "", tiempos: ["comida"] });
    showToast("✓ Alimento personalizado guardado");
    fetchCustomFoods();
  }
  async function importFoodsFromCsv() {
    const lines = csvText.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return showToast("Pega un CSV valido");
    const headers = lines[0].split(",").map(item => item.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(",").map(item => item.trim());
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
      return {
        name: row.name,
        grupo: row.grupo || "otros",
        porcion: row.porcion || "",
        intercambio: row.intercambio || "",
        kcal: Number(row.kcal || 0),
        prot: Number(row.prot || 0),
        carbs: Number(row.carbs || 0),
        fat: Number(row.fat || 0),
        tags: String(row.tags || "").split("|").map(item => item.trim()).filter(Boolean),
        tiempos: String(row.tiempos || "comida").split("|").map(item => item.trim()).filter(Boolean),
      };
    }).filter(row => row.name);
    const { error } = await supabase.from("alimentos_personalizados").insert(rows);
    if (error) return showToast(`Error al importar CSV: ${error.message}`);
    setCsvText("");
    showToast("✓ Alimentos importados");
    fetchCustomFoods();
  }
  function applyPreparationTemplate(template) {
    template.alimentos.forEach(name => {
      setSelectedFoods(prev => prev.includes(name) ? prev : [...prev, name]);
      assignFoodToMeal(name, template.tiempo);
    });
  }
  async function toggleFavoriteRecipe(recipe) {
    if (!selectedPatient) return showToast("Selecciona un paciente");
    const recipeUid = String(recipe.id);
    const isFavorite = favoriteRecipeSet.has(recipeUid);
    if (isFavorite) {
      const { error } = await supabase.from("paciente_recetas_favoritas").delete().eq("paciente_id", selectedPatient.id).eq("recipe_uid", recipeUid);
      if (error) return showToast(`Error al quitar favorito: ${error.message}`);
      setFavoriteRecipeIds(prev => prev.filter(item => String(item) !== recipeUid));
      showToast("✓ Favorito eliminado");
      return;
    }
    const { error } = await supabase.from("paciente_recetas_favoritas").upsert([{
      paciente_id: selectedPatient.id,
      recipe_uid: recipeUid,
      recipe_name: recipe.nombre,
    }], { onConflict: "paciente_id,recipe_uid" });
    if (error) return showToast(`Error al guardar favorito: ${error.message}`);
    setFavoriteRecipeIds(prev => [...new Set([...prev, recipeUid])]);
    showToast("✓ Receta guardada en favoritos");
  }
  function applyRecipeToWeek(recipe, preferredSlot = null) {
    const compatibleSlots = getRecipeCompatibleSlots(recipe);
    const slotId = preferredSlot || compatibleSlots[0];
    setWeeklyPlan(prev => {
      const next = structuredClone(prev);
      WEEK_DAYS.forEach(day => {
        next[day][slotId] = recipe.nombre;
      });
      return next;
    });
    setWeeklyRecipeRefs(prev => {
      const next = structuredClone(prev);
      WEEK_DAYS.forEach(day => {
        next[day][slotId] = String(recipe.id);
      });
      return next;
    });
    showToast(`✓ ${recipe.nombre} aplicado a ${slotId} toda la semana`);
  }
  function applyRecipeToCurrentDay(recipe, day = todayWeekDay, preferredSlot = null) {
    const slotId = preferredSlot || getRecipeCompatibleSlots(recipe)[0];
    updateWeeklyPlanCell(day, slotId, recipe.nombre, recipe.id);
    showToast(`✓ ${recipe.nombre} asignado a ${day}`);
  }
  function applyTemplateToWeek(template) {
    const slotId = normalizeTemplateSlot(template.tiempo);
    setWeeklyPlan(prev => {
      const next = structuredClone(prev);
      WEEK_DAYS.forEach(day => {
        next[day][slotId] = template.nombre;
      });
      return next;
    });
    const matchedRecipe = getStructuredRecipeByName(template.nombre, recipeCatalog);
    setWeeklyRecipeRefs(prev => {
      const next = structuredClone(prev);
      WEEK_DAYS.forEach(day => {
        next[day][slotId] = matchedRecipe ? String(matchedRecipe.id) : "";
      });
      return next;
    });
    showToast(`✓ ${template.nombre} aplicado a toda la semana`);
  }
  function applyClinicalTemplate(template) {
    setWeeklyPlan(prev => {
      const next = structuredClone(prev);
      WEEK_DAYS.forEach(day => {
        Object.entries(template.weekAssignments).forEach(([slot, value]) => {
          next[day][slot] = value;
        });
      });
      return next;
    });
    setWeeklyRecipeRefs(prev => {
      const next = structuredClone(prev);
      WEEK_DAYS.forEach(day => {
        Object.entries(template.weekAssignments).forEach(([slot, value]) => {
          const recipe = getStructuredRecipeByName(value, recipeCatalog);
          next[day][slot] = recipe ? String(recipe.id) : "";
        });
      });
      return next;
    });
    showToast(`✓ ${template.nombre} aplicado`);
  }
  function duplicateDayToWeek(sourceDay) {
    setWeeklyPlan(prev => {
      const next = structuredClone(prev);
      WEEK_DAYS.forEach(day => {
        if (day !== sourceDay) next[day] = { ...prev[sourceDay] };
      });
      return next;
    });
    showToast(`✓ ${sourceDay} duplicado al resto de la semana`);
  }
  function clearWeeklyPlan() {
    setWeeklyPlan(createEmptyWeeklyPlan());
    setWeeklyRecipeRefs(createEmptyWeeklyRecipeRefs());
    showToast("✓ Semana reiniciada");
  }
  function assignPreparationToCell(day, slotId, templateName) {
    const template = ALL_PREPARATION_TEMPLATES.find(item => item.nombre === templateName);
    if (!template) return;
    if (normalizeTemplateSlot(template.tiempo) !== slotId) {
      showToast("Ese tiempo de comida no coincide con la preparación");
      return;
    }
    const matchedRecipe = getStructuredRecipeByName(templateName, recipeCatalog);
    updateWeeklyPlanCell(day, slotId, templateName, matchedRecipe?.id || "");
    showToast(`✓ ${templateName} asignado a ${day}`);
  }
  function autoGenerateWeeklyPlan() {
    applyClinicalTemplate(suggestedClinicalTemplate);
  }
  function updateWeeklyPlanCell(day, slotId, value, recipeUid = null) {
    const resolvedRecipe = recipeUid ? getStructuredRecipeByUid(recipeUid, recipeCatalog) : getStructuredRecipeByName(value, recipeCatalog);
    setWeeklyPlan(prev => ({ ...prev, [day]: { ...prev[day], [slotId]: value } }));
    setWeeklyRecipeRefs(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotId]: resolvedRecipe ? String(resolvedRecipe.id) : "",
      },
    }));
  }
  async function saveWeeklyPlan() {
    if (!selectedPatient) return showToast("Selecciona un paciente");
    setLoadingWeeklyPlan(true);
    const rows = WEEK_DAYS.flatMap(day => WEEKLY_MEAL_SLOTS.map(slot => ({
      paciente_id: selectedPatient.id,
      dia_semana: day,
      tiempo_comida: slot.id,
      preparacion: weeklyPlan[day][slot.id] || null,
      recipe_uid: weeklyRecipeRefs[day][slot.id] || null,
    })));
    const { error } = await supabase.from("paciente_plan_semanal").upsert(rows, { onConflict: "paciente_id,dia_semana,tiempo_comida" });
    setLoadingWeeklyPlan(false);
    if (error) return showToast(`Error al guardar semana: ${error.message}`);
    showToast("✓ Plan semanal guardado");
    fetchWeeklyPlan(selectedPatient.id);
  }
  function exportWeeklyPlanPdf() {
    if (!selectedPatient) return showToast("Selecciona un paciente");
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return showToast("Activa ventanas emergentes para exportar");
    const rowsHtml = WEEK_DAYS.map(day => `
      <tr>
        <td>${day}</td>
        ${WEEKLY_MEAL_SLOTS.map(slot => `<td>${weeklyPlan[day][slot.id] || "Sin asignar"}</td>`).join("")}
      </tr>
    `).join("");
    const groceryHtml = groceryList.length ? `
      <div class="section">
        <h2>Lista de compras</h2>
        <div class="grid two">
          ${groceryList.map(group => `<div class="card"><strong>${group.grupo}</strong><ul>${group.items.map(item => `<li>${item}</li>`).join("")}</ul></div>`).join("")}
        </div>
      </div>` : "";
    const recipesHtml = weeklyRecipes.length ? `
      <div class="section">
        <h2>Recetario de la semana</h2>
        ${weeklyRecipes.map(recipe => `
          <div class="card" style="margin-bottom:16px">
            <h3>${recipe.nombre}</h3>
            <p>${recipe.tiempoPrep} min · ${recipe.yield || recipe.porciones} porcion(es)</p>
            <p>${recipe.mealType} · ${recipe.dishType} · ${recipe.cuisineType}</p>
            <p><strong>Health:</strong> ${(recipe.healthLabels || []).join(" · ") || "Sin especificar"}</p>
            <p><strong>Diet:</strong> ${(recipe.dietLabels || []).join(" · ") || "Sin especificar"}</p>
            <p><strong>Alergenos:</strong> ${(recipe.allergenLabels || []).join(" · ") || "Sin especificar"}</p>
            <p><strong>Ingredientes:</strong> ${recipe.ingredientes.map(item => `${item.item} (${item.cantidad})`).join(" · ")}</p>
            <p><strong>Pasos:</strong> ${recipe.pasos.join(" ")}</p>
          </div>`).join("")}
      </div>` : "";
    const dietHtml = latestDietCalculation ? `
      <div class="section">
        <h2>Calculo dietetico</h2>
        <div class="grid two">
          <div class="card"><strong>Formula</strong><p>${latestDietCalculation.formula_referencia}</p></div>
          <div class="card"><strong>Factor actividad</strong><p>${latestDietCalculation.factor_actividad}</p></div>
          <div class="card"><strong>Peso ideal</strong><p>${latestDietCalculation.peso_ideal || "-"}</p></div>
          <div class="card"><strong>Peso ajustado</strong><p>${latestDietCalculation.peso_ajustado || "-"}</p></div>
          <div class="card"><strong>GET</strong><p>${latestDietCalculation.kcal_objetivo || "-"}</p></div>
          <div class="card"><strong>Macros</strong><p>P ${latestDietCalculation.proteina_g || "-"}g · C ${latestDietCalculation.carbohidratos_g || "-"}g · G ${latestDietCalculation.grasa_g || "-"}g</p></div>
        </div>
      </div>` : "";
    const progressHtml = latestCheckin ? `
      <div class="section">
        <h2>Seguimiento reciente</h2>
        <div class="grid two">
          <div class="card"><strong>Fecha</strong><p>${latestCheckin.fecha}</p></div>
          <div class="card"><strong>Escalas</strong><p>Energia ${latestCheckin.energia} · Sueño ${latestCheckin.sueno} · Digestion ${latestCheckin.digestion} · Adherencia ${latestCheckin.adherencia} · Entrenamiento ${latestCheckin.entrenamiento}</p></div>
        </div>
        ${latestCheckin.notas ? `<div class="card" style="margin-top:12px"><strong>Notas</strong><p>${latestCheckin.notas}</p></div>` : ""}
      </div>` : "";
    const journalHtml = latestJournalEntry ? `
      <div class="section">
        <h2>Journaling diario reciente</h2>
        <div class="grid two">
          <div class="card"><strong>Fecha</strong><p>${latestJournalEntry.fecha}</p></div>
          <div class="card"><strong>Lectura del día</strong><p>Hambre ${latestJournalEntry.hambre}/5 · Saciedad ${latestJournalEntry.saciedad}/5 · Sueño ${latestJournalEntry.sueno_horas || "-"} h · Adherencia ${latestJournalEntry.adherencia}/5</p></div>
        </div>
        <div class="grid two" style="margin-top:12px">
          <div class="card"><strong>Entrenamiento</strong><p>${latestJournalEntry.entrenamiento || "Sin registro"}</p></div>
          <div class="card"><strong>Síntomas</strong><p>${latestJournalEntry.sintomas || "Sin registro"}</p></div>
        </div>
        ${latestJournalEntry.notas ? `<div class="card" style="margin-top:12px"><strong>Notas</strong><p>${latestJournalEntry.notas}</p></div>` : ""}
      </div>` : "";
    const adimeHtml = latestAdimeConsulta ? `
      <div class="section">
        <h2>Nota ADIME</h2>
        <div class="grid two">
          <div class="card"><strong>A · Valoración</strong><p>${latestAdimeConsulta.adime_valoracion || "Sin registro"}</p></div>
          <div class="card"><strong>D · Diagnóstico</strong><p>${latestAdimeConsulta.adime_diagnostico || latestAdimeConsulta.diagnostico_nutricional || "Sin registro"}</p></div>
          <div class="card"><strong>I · Intervención</strong><p>${latestAdimeConsulta.adime_intervencion || latestAdimeConsulta.indicaciones || "Sin registro"}</p></div>
          <div class="card"><strong>M/E · Monitoreo</strong><p>${latestAdimeConsulta.adime_monitoreo || latestAdimeConsulta.objetivos || "Sin registro"}</p></div>
        </div>
      </div>` : "";
    const remindersHtml = upcomingAgenda.length ? `
      <div class="section">
        <h2>Recordatorios proximos</h2>
        <div class="grid two">
          ${upcomingAgenda.map(item => `<div class="card"><strong>${item.titulo}</strong><p>${item.fecha}${item.hora ? ` · ${item.hora}` : ""}</p><p>${item.tipo} · ${item.canal}</p>${item.nota ? `<p>${item.nota}</p>` : ""}</div>`).join("")}
        </div>
      </div>` : "";
    const skinfoldInterpretationHtml = latestSkinfoldRows.length ? `
      <div class="section">
        <h2>Interpretacion antropometrica</h2>
        <div class="grid two">
          <div class="card">
            <strong>Pliegues actuales</strong>
            <table style="margin-top:10px">
              <thead><tr><th>Pliegue</th><th>mm</th><th>Lectura</th></tr></thead>
              <tbody>
                ${latestSkinfoldRows.map(row => `<tr><td>${row.label}</td><td>${row.value}</td><td>${row.band}</td></tr>`).join("")}
              </tbody>
            </table>
          </div>
          <div class="card">
            <strong>Patron y alerta central</strong>
            <p>${skinfoldDistribution ? `${skinfoldDistribution.label} · Relacion ${skinfoldDistribution.ratio}` : "Sin lectura de distribución"}</p>
            <p>${skinfoldDistribution?.note || ""}</p>
            <p><strong>Adiposidad central:</strong> ${centralAdiposityAlert.level}</p>
            <p>${centralAdiposityAlert.note}</p>
          </div>
        </div>
        <div class="grid three" style="margin-top:12px">
          ${anthropometrySemaphores.map(item => `<div class="card"><strong>${item.label}</strong><p>${item.status}</p><p>${item.note}</p></div>`).join("")}
        </div>
      </div>` : "";
    const bodyCompositionHistoryHtml = bodyCompositionEvolutionData.length ? `
      <div class="section">
        <h2>Resumen numerico de composicion corporal</h2>
        <table>
          <thead><tr><th>Fecha</th><th>Yuhasz %</th><th>Yuhasz kg</th><th>Faulkner %</th><th>Faulkner kg</th><th>Matiegka %</th><th>Matiegka kg</th></tr></thead>
          <tbody>
            ${bodyCompositionEvolutionData.map(row => `
              <tr>
                <td>${row.fechaRaw || row.fecha}</td>
                <td>${row.yuhasz != null ? `${row.yuhasz}%` : "—"}</td>
                <td>${row.yuhaszKg != null ? `${row.yuhaszKg} kg` : "—"}</td>
                <td>${row.faulkner != null ? `${row.faulkner}%` : "—"}</td>
                <td>${row.faulknerKg != null ? `${row.faulknerKg} kg` : "—"}</td>
                <td>${row.matiegka != null ? `${row.matiegka}%` : "—"}</td>
                <td>${row.muscularKg != null ? `${row.muscularKg} kg` : "—"}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : "";
    const skinfoldHistoryHtml = skinfoldHistoryRows.length ? `
      <div class="section">
        <h2>Comparativo historico de pliegues</h2>
        <table>
          <thead><tr><th>Fecha</th><th>Triceps</th><th>Biceps</th><th>Subescapular</th><th>Cresta iliaca</th><th>Supraespinal</th><th>Abdominal</th><th>Muslo</th><th>Pantorrilla</th><th>Patron</th></tr></thead>
          <tbody>
            ${skinfoldHistoryRows.map(row => `
              <tr>
                <td>${row.fecha}</td>
                <td>${row.triceps ?? "—"}</td>
                <td>${row.biceps ?? "—"}</td>
                <td>${row.subescapular ?? "—"}</td>
                <td>${row.crestaIliaca ?? "—"}</td>
                <td>${row.supraespinal ?? "—"}</td>
                <td>${row.abdominal ?? "—"}</td>
                <td>${row.muslo ?? "—"}</td>
                <td>${row.pantorrilla ?? "—"}</td>
                <td>${row.distribution?.label || "—"}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : "";
    const anthropometryHtml = latestAnthroConsulta ? `
      <div class="section">
        <h2>Resumen antropometrico</h2>
        <div class="grid two">
          <div class="card"><strong>Peso / IMC</strong><p>${latestAnthroConsulta.peso || "-"} kg · IMC ${latestAnthroConsulta.imc || "-"}</p></div>
          <div class="card"><strong>Cintura / Cadera</strong><p>${latestAnthroConsulta.cintura || "-"} cm · ${latestAnthroConsulta.cadera || "-"} cm</p></div>
          <div class="card"><strong>Yuhasz</strong><p>${latestYuhasz ? `${latestYuhasz.grasaPct}% grasa · ${latestYuhasz.grasaKg} kg` : "Sin dato"}</p></div>
          <div class="card"><strong>Faulkner / Matiegka</strong><p>${latestFaulkner ? `${latestFaulkner.grasaPct}% grasa · ${latestFaulkner.grasaKg} kg` : "Sin dato"}<br />${latestMatiegka ? `${latestMatiegka.muscularKg} kg · ${latestMatiegka.muscularPct}% muscular` : "Sin dato"}</p></div>
        </div>
      </div>` : "";
    printWindow.document.write(`
      <html>
        <head>
          <title>Plan semanal ${selectedPatient.nombre}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #0f172a; background: #f8fafc; }
            h1,h2,h3 { margin: 0 0 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; background: #ffffff; }
            th,td { border: 1px solid #dbe7f1; padding: 10px; text-align: left; vertical-align: top; }
            .section { margin-top: 28px; }
            .grid { display: grid; gap: 12px; }
            .two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .card { border: 1px solid #dbe7f1; border-radius: 12px; padding: 14px; background: #ffffff; }
            .hero { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; background:#ffffff; border:1px solid #dbe7f1; border-radius:18px; padding:20px; }
            .hero small { color:#64748b; display:block; margin-top:4px; }
            .stamp { text-align:right; }
            .summary { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-top:18px; }
            .summary .card strong { display:block; font-size:12px; color:#334155; margin-bottom:6px; }
          </style>
        </head>
        <body>
          <div class="hero">
            <div>
              <h1>Plan alimenticio semanal</h1>
              <p>${selectedPatient.nombre} ${selectedPatient.apellidos || ""}</p>
              <p>Objetivo: ${selectedPatient.objetivo || "Sin objetivo"}</p>
              <small>Generado desde Nutri Panel clinico-deportivo</small>
            </div>
            <div class="stamp">
              <strong>L.N. Jesus</strong>
              <p>Nutriologo</p>
            </div>
          </div>
          <div class="summary">
            <div class="card"><strong>Comidas asignadas</strong><div>${totalAssignedMeals} / ${WEEK_DAYS.length * WEEKLY_MEAL_SLOTS.length}</div></div>
            <div class="card"><strong>Recetas de la semana</strong><div>${weeklyRecipes.length}</div></div>
            <div class="card"><strong>Items de compra</strong><div>${totalGroceryItems}</div></div>
            <div class="card"><strong>Ultimo seguimiento</strong><div>${latestCheckin ? latestCheckin.fecha : "Sin dato"}</div></div>
          </div>
          <table>
            <thead><tr><th>Dia</th>${WEEKLY_MEAL_SLOTS.map(slot => `<th>${slot.label}</th>`).join("")}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          ${dietHtml}
          ${anthropometryHtml}
          ${skinfoldInterpretationHtml}
          ${bodyCompositionHistoryHtml}
          ${skinfoldHistoryHtml}
          ${adimeHtml}
          ${progressHtml}
          ${journalHtml}
          ${remindersHtml}
          ${groceryHtml}
          ${recipesHtml}
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
  async function saveDietCalculation(customConfig = {}) {
    if (!selectedPatient || !selectedDietGet || !activeMacroPlan) return showToast("Selecciona un paciente y revisa el calculo");
    setSavingDietCalc(true);
    const latestConsultaId = patientConsultas.at(-1)?.id || null;
    const payload = {
      paciente_id: selectedPatient.id,
      consulta_id: latestConsultaId,
      formula_referencia: dietFormula,
      factor_actividad: Number(activityFactor),
      perfil_clinico: inferredCondition,
      objetivo: selectedPatient.objetivo || null,
      peso_actual: dietWeight || null,
      talla: dietHeight || null,
      edad: dietAge || null,
      sexo: dietSex || null,
      peso_ideal: idealWeight || null,
      peso_ajustado: adjustedWeight || null,
      geb_harris_benedict: harrisBenedict || null,
      get_harris_benedict: harrisBenedict ? round1(harrisBenedict * activity) : null,
      geb_mifflin_st_jeor: mifflinStJeor || null,
      get_mifflin_st_jeor: mifflinStJeor ? round1(mifflinStJeor * activity) : null,
      geb_katch_mcardle: katchMcArdle?.geb || null,
      get_katch_mcardle: katchMcArdle?.geb ? round1(katchMcArdle.geb * activity) : null,
      geb_schofield: schofield || null,
      get_schofield: schofield ? round1(schofield * activity) : null,
      geb_oms_fao_unu: omsFaoUnu || null,
      get_oms_fao_unu: omsFaoUnu ? round1(omsFaoUnu * activity) : null,
      kcal_objetivo: activeMacroPlan.kcalTarget || null,
      proteina_g: activeMacroPlan.proteinG || null,
      carbohidratos_g: activeMacroPlan.carbsG || null,
      grasa_g: activeMacroPlan.fatG || null,
      proteina_pct: activeMacroPlan.proteinPct || null,
      carbohidratos_pct: activeMacroPlan.carbsPct || null,
      grasa_pct: activeMacroPlan.fatPct || null,
      peso_base_macros: activeMacroPlan.weightBase || null,
      nota_macros: activeMacroPlan.strategy || null,
      custom_body_rows: customConfig.bodyRows || null,
      custom_nutrient_rows: customConfig.nutrientRows || null,
      custom_duration_rows: customConfig.durationRows || null,
      plan_scope: customConfig.planScope || planScope,
    };
    const { error } = await supabase.from("paciente_calculo_dietetico").insert([payload]);
    setSavingDietCalc(false);
    if (error) return showToast(`Error al guardar calculo: ${error.message}`);
    showToast("✓ Calculo dietetico guardado");
    fetchDietCalculation(selectedPatient.id);
  }
  function setMacroField(mode, field, value) {
    setMacroTargets(prev => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
  }
  function normalizeMacroPercentages() {
    const protein = Number(macroTargets.percentage.protein || 0);
    const carbs = Number(macroTargets.percentage.carbs || 0);
    const fat = Number(macroTargets.percentage.fat || 0);
    const total = protein + carbs + fat;
    if (!total) return;
    setMacroTargets(prev => ({
      ...prev,
      percentage: {
        protein: String(round1((protein / total) * 100)),
        carbs: String(round1((carbs / total) * 100)),
        fat: String(round1((fat / total) * 100)),
      },
    }));
  }
  function convertPercentToGkg() {
    if (!selectedDietGet || !macroPlan?.weightBase) return;
    const converted = getEditedMacroPlan({ mode: "percentage", kcalTarget: selectedDietGet, weightBase: macroPlan.weightBase, targets: macroTargets.percentage, fallbackPlan: macroPlan });
    if (!converted) return;
    setMacroTargets(prev => ({
      ...prev,
      gkg: {
        protein: String(converted.proteinGkg),
        carbs: String(converted.carbsGkg),
        fat: String(converted.fatGkg),
      },
    }));
    setMacroEditMode("gkg");
  }
  function convertGkgToPercent() {
    if (!selectedDietGet || !macroPlan?.weightBase) return;
    const converted = getEditedMacroPlan({ mode: "gkg", kcalTarget: selectedDietGet, weightBase: macroPlan.weightBase, targets: macroTargets.gkg, fallbackPlan: macroPlan });
    if (!converted) return;
    setMacroTargets(prev => ({
      ...prev,
      percentage: {
        protein: String(converted.proteinPct),
        carbs: String(converted.carbsPct),
        fat: String(converted.fatPct),
      },
    }));
    setMacroEditMode("percentage");
  }
  async function saveCheckin() {
    if (!selectedPatient) return showToast("Selecciona un paciente");
    setSavingCheckin(true);
    const payload = {
      paciente_id: selectedPatient.id,
      fecha: checkinForm.fecha,
      energia: Number(checkinForm.energia),
      sueno: Number(checkinForm.sueno),
      digestion: Number(checkinForm.digestion),
      adherencia: Number(checkinForm.adherencia),
      entrenamiento: Number(checkinForm.entrenamiento),
      notas: checkinForm.notas || null,
    };
    const query = editingCheckinId ? supabase.from("paciente_checkins").update(payload).eq("id", editingCheckinId) : supabase.from("paciente_checkins").insert([payload]);
    const { error } = await query;
    setSavingCheckin(false);
    if (error) return showToast(`Error en check-in: ${error.message}`);
    setCheckinForm({ fecha: new Date().toISOString().split("T")[0], energia: "3", sueno: "3", digestion: "3", adherencia: "3", entrenamiento: "3", notas: "" });
    setEditingCheckinId(null);
    showToast(editingCheckinId ? "✓ Check-in actualizado" : "✓ Check-in guardado");
    fetchPatientCheckins(selectedPatient.id);
  }
  function editCheckin(item) {
    setEditingCheckinId(item.id);
    setCheckinForm({
      fecha: item.fecha,
      energia: String(item.energia),
      sueno: String(item.sueno),
      digestion: String(item.digestion),
      adherencia: String(item.adherencia),
      entrenamiento: String(item.entrenamiento),
      notas: item.notas || "",
    });
  }
  async function deleteCheckin(id) {
    const { error } = await supabase.from("paciente_checkins").delete().eq("id", id);
    if (error) return showToast(`Error al borrar check-in: ${error.message}`);
    showToast("✓ Check-in borrado");
    fetchPatientCheckins(selectedPatient.id);
  }
  async function saveJournalEntry() {
    if (!selectedPatient) return showToast("Selecciona un paciente");
    setSavingJournal(true);
    const payload = {
      paciente_id: selectedPatient.id,
      fecha: journalForm.fecha,
      hambre: Number(journalForm.hambre),
      saciedad: Number(journalForm.saciedad),
      sintomas: journalForm.sintomas || null,
      sueno_horas: Number(journalForm.sueno_horas || 0) || null,
      entrenamiento: journalForm.entrenamiento || null,
      adherencia: Number(journalForm.adherencia),
      agua_litros: Number(journalForm.agua_litros || 0) || null,
      notas: journalForm.notas || null,
    };
    const query = editingJournalId ? supabase.from("paciente_journal_entries").update(payload).eq("id", editingJournalId) : supabase.from("paciente_journal_entries").insert([payload]);
    const { error } = await query;
    setSavingJournal(false);
    if (error) return showToast(`Error en journaling: ${error.message}`);
    setJournalForm({ fecha: new Date().toISOString().split("T")[0], hambre: "3", saciedad: "3", sintomas: "", sueno_horas: "7.0", entrenamiento: "", adherencia: "3", agua_litros: "2.0", notas: "" });
    setEditingJournalId(null);
    showToast(editingJournalId ? "✓ Journal actualizado" : "✓ Journal guardado");
    fetchJournalEntries(selectedPatient.id);
  }
  function editJournalEntry(item) {
    setEditingJournalId(item.id);
    setJournalForm({
      fecha: item.fecha,
      hambre: String(item.hambre),
      saciedad: String(item.saciedad),
      sintomas: item.sintomas || "",
      sueno_horas: item.sueno_horas != null ? String(item.sueno_horas) : "",
      entrenamiento: item.entrenamiento || "",
      adherencia: String(item.adherencia),
      agua_litros: item.agua_litros != null ? String(item.agua_litros) : "",
      notas: item.notas || "",
    });
  }
  async function deleteJournalEntry(id) {
    const { error } = await supabase.from("paciente_journal_entries").delete().eq("id", id);
    if (error) return showToast(`Error al borrar journal: ${error.message}`);
    showToast("✓ Journal borrado");
    fetchJournalEntries(selectedPatient.id);
  }
  async function saveAgenda() {
    if (!selectedPatient) return showToast("Selecciona un paciente");
    setSavingAgenda(true);
    const payload = {
      paciente_id: selectedPatient.id,
      titulo: agendaForm.titulo,
      fecha: agendaForm.fecha,
      hora: agendaForm.hora || null,
      tipo: agendaForm.tipo,
      canal: agendaForm.canal,
      estado_envio: agendaForm.canal === "interno" ? "no_aplica" : "pendiente",
      nota: agendaForm.nota || null,
    };
    const query = editingAgendaId ? supabase.from("agenda_recordatorios").update(payload).eq("id", editingAgendaId) : supabase.from("agenda_recordatorios").insert([payload]);
    const { error } = await query;
    setSavingAgenda(false);
    if (error) return showToast(`Error en agenda: ${error.message}`);
    setAgendaForm({ titulo: "", fecha: new Date().toISOString().split("T")[0], hora: "09:00", tipo: "consulta", canal: "interno", nota: "" });
    setEditingAgendaId(null);
    showToast(editingAgendaId ? "✓ Recordatorio actualizado" : "✓ Recordatorio guardado");
    fetchAgendaItems(selectedPatient.id);
  }
  function editAgendaItem(item) {
    setEditingAgendaId(item.id);
    setAgendaForm({
      titulo: item.titulo || "",
      fecha: item.fecha,
      hora: item.hora || "09:00",
      tipo: item.tipo || "consulta",
      canal: item.canal || "interno",
      nota: item.nota || "",
    });
  }
  async function deleteAgendaItem(id) {
    const { error } = await supabase.from("agenda_recordatorios").delete().eq("id", id);
    if (error) return showToast(`Error al borrar recordatorio: ${error.message}`);
    showToast("✓ Recordatorio borrado");
    fetchAgendaItems(selectedPatient.id);
  }
  async function toggleAgendaCompleted(item) {
    const { error } = await supabase.from("agenda_recordatorios").update({ completado: !item.completado }).eq("id", item.id);
    if (error) return showToast(`Error al actualizar recordatorio: ${error.message}`);
    fetchAgendaItems(selectedPatient.id);
  }

  const totalKcal = Math.round(activeMacroPlan?.kcalTarget || 0);
  const planScopeDays = planScope === "mensual" ? 28 : planScope === "quincenal" ? 14 : 7;
  const planScopeLabel = planScope === "mensual" ? "Mensual" : planScope === "quincenal" ? "Quincenal" : "Semanal";
  const macroDistributionData = [
    { name: "Proteína", value: Math.round(activeMacroPlan?.proteinPct || 0), color: "#22c55e" },
    { name: "Carbohidratos", value: Math.round(activeMacroPlan?.carbsPct || 0), color: "#fb7185" },
    { name: "Grasas", value: Math.round(activeMacroPlan?.fatPct || 0), color: "#f59e0b" },
  ].filter(item => item.value > 0);
  const macroBreakdownRows = [
    {
      key: "fat",
      label: "Lípidos",
      pct: round1(activeMacroPlan?.fatPct || 0),
      grams: round1(activeMacroPlan?.fatG || 0),
      gkg: round1(activeMacroPlan?.fatGkg || 0),
      reference: "20 - 35 %",
      color: "#fbbf24",
      donut: [
        { name: "Lípidos", value: Math.max(Number(activeMacroPlan?.fatPct || 0), 0.1), color: "#fbbf24" },
        { name: "Restante", value: Math.max(100 - Number(activeMacroPlan?.fatPct || 0), 0.1), color: "#f8e7b0" },
      ],
    },
    {
      key: "carbs",
      label: "Hidratos de carbono",
      pct: round1(activeMacroPlan?.carbsPct || 0),
      grams: round1(activeMacroPlan?.carbsG || 0),
      gkg: round1(activeMacroPlan?.carbsGkg || 0),
      reference: "45 - 65 %",
      color: "#fb923c",
      donut: [
        { name: "Hidratos", value: Math.max(Number(activeMacroPlan?.carbsPct || 0), 0.1), color: "#fb923c" },
        { name: "Restante", value: Math.max(100 - Number(activeMacroPlan?.carbsPct || 0), 0.1), color: "#fde4d3" },
      ],
    },
    {
      key: "protein",
      label: "Proteínas",
      pct: round1(activeMacroPlan?.proteinPct || 0),
      grams: round1(activeMacroPlan?.proteinG || 0),
      gkg: round1(activeMacroPlan?.proteinGkg || 0),
      reference: "10 - 35 %",
      color: "#60a5fa",
      donut: [
        { name: "Proteínas", value: Math.max(Number(activeMacroPlan?.proteinPct || 0), 0.1), color: "#60a5fa" },
        { name: "Restante", value: Math.max(100 - Number(activeMacroPlan?.proteinPct || 0), 0.1), color: "#dbeafe" },
      ],
    },
  ];
  const nutrientQuantificationRows = [
    { label: "Fibra alimentaria", source: "Food and Nutrition Board / IOM", value: globalMealSummary.fiber ? round1(globalMealSummary.fiber) : Math.round((totalKcal / 1000) * 14), reference: Math.max(25, Math.round((totalKcal / 1000) * 14)), unit: "g", color: "#6ee7b7" },
    { label: "Calcio", source: "Food and Nutrition Board / IOM", value: round1(globalMealSummary.calcium || 0), reference: 1000, unit: "mg", color: "#2563eb" },
    { label: "Zinc", source: "Food and Nutrition Board / IOM", value: round1(globalMealSummary.zinc || 0), reference: 8, unit: "mg", color: "#f9a8d4" },
    { label: "Cobre", source: "Food and Nutrition Board / IOM", value: round1(globalMealSummary.copper || 0), reference: 0.9, unit: "mg", color: "#fdba74" },
    { label: "Colina", source: "Food and Nutrition Board / IOM", value: round1(globalMealSummary.choline || 0), reference: 425, unit: "mg", color: "#c4b5fd" },
    { label: "Ácido pantoténico", source: "Food and Nutrition Board / IOM", value: round1(globalMealSummary.pantothenic || 0), reference: 5, unit: "mg", color: "#86efac" },
  ];
  const planStartDate = latestDietCalculation?.created_at ? new Date(latestDietCalculation.created_at) : (selectedPatient?.created_at ? new Date(selectedPatient.created_at) : null);
  const lastPlanChangeDate = latestDietCalculation?.created_at ? new Date(latestDietCalculation.created_at) : null;
  const projectedEndDate = planStartDate ? new Date(planStartDate.getTime() + (planScopeDays * 24 * 60 * 60 * 1000)) : null;
  const planDurationRows = [
    { label: "Periodo", value: planScopeLabel },
    { label: "Inicio", value: planStartDate ? planStartDate.toLocaleDateString("es-MX") : "Sin dato" },
    { label: "Último cambio", value: lastPlanChangeDate ? lastPlanChangeDate.toLocaleDateString("es-MX") : "Sin dato" },
    { label: "Previsión del fin", value: projectedEndDate ? projectedEndDate.toLocaleDateString("es-MX") : "Sin dato" },
  ];
  const jsWeekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const todayWeekDay = WEEK_DAYS.includes(jsWeekDays[new Date().getDay()]) ? jsWeekDays[new Date().getDay()] : WEEK_DAYS[0];
  const portalTodayMeals = WEEKLY_MEAL_SLOTS.map(slot => ({
    ...slot,
    value: weeklyPlan[todayWeekDay]?.[slot.id] || "",
    recipe: getStructuredRecipeByUid(weeklyRecipeRefs?.[todayWeekDay]?.[slot.id], recipeCatalog) || getStructuredRecipeByName(weeklyPlan[todayWeekDay]?.[slot.id] || "", recipeCatalog),
    key: `${todayWeekDay}-${slot.id}`,
  }));
  const portalCompletedMeals = portalTodayMeals.filter(meal => meal.value && ["hecho", "sustitui"].includes(portalMealStatuses[meal.key])).length;
  const portalAssignedMeals = portalTodayMeals.filter(meal => meal.value).length;
  const portalCompletionPct = portalAssignedMeals ? Math.round((portalCompletedMeals / portalAssignedMeals) * 100) : 0;
  const portalUpcomingReminders = upcomingAgenda.slice(0, 3);
  async function setPortalMealStatus(day, slotId, status) {
    if (!selectedPatient) return;
    const key = `${day}-${slotId}`;
    const nextStatus = portalMealStatuses[key] === status ? "" : status;
    setPortalMealStatuses(prev => ({ ...prev, [key]: nextStatus }));
    const recipe = getStructuredRecipeByUid(weeklyRecipeRefs?.[day]?.[slotId], recipeCatalog) || getStructuredRecipeByName(weeklyPlan?.[day]?.[slotId] || "", recipeCatalog);
    const payload = {
      paciente_id: selectedPatient.id,
      fecha: new Date().toISOString().slice(0, 10),
      dia_semana: day,
      tiempo_comida: slotId,
      estado: nextStatus || "pendiente",
      recipe_uid: recipe ? String(recipe.id) : null,
      recipe_name: recipe?.nombre || weeklyPlan?.[day]?.[slotId] || null,
    };
    const { error } = await supabase.from("paciente_plan_adherencia").upsert([payload], { onConflict: "paciente_id,fecha,tiempo_comida" });
    if (error) {
      setPortalMealStatuses(prev => ({ ...prev, [key]: portalMealStatuses[key] || "" }));
      showToast(`Error al guardar adherencia: ${error.message}`);
    }
  }
  const bodyCompositionSplitData = latestYuhasz ? [
    { name: "Grasa", value: Math.round(latestYuhasz.grasaPct || 0), color: "#fb7185" },
    { name: "Libre de grasa", value: Math.round(latestYuhasz.libreGrasaPct || 0), color: "#22c55e" },
  ] : [];
  const dailyAnalysisData = [
    { name: "Energía", value: Number(latestCheckin?.energia || 0), fill: "#22c55e" },
    { name: "Sueño", value: Number(latestCheckin?.sueno || 0), fill: "#3b82f6" },
    { name: "Digestión", value: Number(latestCheckin?.digestion || 0), fill: "#f59e0b" },
    { name: "Adherencia", value: Number(latestCheckin?.adherencia || latestJournalEntry?.adherencia || 0), fill: "#fb7185" },
    { name: "Entreno", value: Number(latestCheckin?.entrenamiento || 0), fill: "#14b8a6" },
  ];
  const nutriniumQuickTabs = [
    { label: "Resumen", target: "dashboard" },
    { label: "Análisis", target: "analisis" },
    { label: "Plan alimenticio", target: "plan" },
    { label: "Deporte adaptado", target: "deporte" },
    { label: "Seguimiento", target: "seguimiento" },
    { label: "Portal paciente", target: "portal" },
  ];
  const mealCoverageData = WEEKLY_MEAL_SLOTS.map(slot => ({
    name: slot.label,
    value: WEEK_DAYS.filter(day => weeklyPlan?.[day]?.[slot.id]).length,
    fill: ["#22c55e", "#14b8a6", "#f59e0b", "#fb7185", "#3b82f6"][WEEKLY_MEAL_SLOTS.findIndex(item => item.id === slot.id)] || "#64748b",
  }));
  const latestBioConsulta = [...patientConsultas].reverse().find(c => c.glucosa || c.hba1c || c.colesterol_total || c.trigliceridos || c.hdl || c.ldl) || null;
  const biomarkerSummaryData = latestBioConsulta ? [
    { name: "Glucosa", value: Number(latestBioConsulta.glucosa || 0), ref: "70-100", ok: Number(latestBioConsulta.glucosa || 0) <= 100, fill: Number(latestBioConsulta.glucosa || 0) <= 100 ? "#22c55e" : "#f59e0b" },
    { name: "HbA1c", value: Number(latestBioConsulta.hba1c || 0), ref: "<5.7", ok: Number(latestBioConsulta.hba1c || 0) <= 5.7, fill: Number(latestBioConsulta.hba1c || 0) <= 5.7 ? "#22c55e" : "#f59e0b" },
    { name: "TG", value: Number(latestBioConsulta.trigliceridos || 0), ref: "<150", ok: Number(latestBioConsulta.trigliceridos || 0) <= 150, fill: Number(latestBioConsulta.trigliceridos || 0) <= 150 ? "#22c55e" : "#f59e0b" },
    { name: "LDL", value: Number(latestBioConsulta.ldl || 0), ref: "<130", ok: Number(latestBioConsulta.ldl || 0) <= 130, fill: Number(latestBioConsulta.ldl || 0) <= 130 ? "#22c55e" : "#f59e0b" },
  ].filter(item => item.value > 0) : [];
  const weeklyDayCoverageData = WEEK_DAYS.map(day => ({
    name: day.slice(0, 3),
    value: WEEKLY_MEAL_SLOTS.filter(slot => weeklyPlan?.[day]?.[slot.id]).length,
  }));
  const readinessScore = round1((((Number(latestCheckin?.energia || 0) + Number(latestCheckin?.sueno || 0) + Number(latestCheckin?.entrenamiento || 0)) / 15) * 100) || 0);
  const adherenceScore = round1((((Number(latestCheckin?.adherencia || latestJournalEntry?.adherencia || 0)) / 5) * 100) || 0);
  const clinicalRiskScore = round1(Math.max(
    biomarkerSummaryData.some(item => !item.ok) ? 65 : 20,
    latestYuhasz?.grasaPct > 30 ? 70 : 20,
    latestAnthroConsulta?.cintura > 94 ? 60 : 20
  ));
  const dashboardSpotlightCards = [
    {
      title: "Readiness deportiva",
      value: `${readinessScore}%`,
      note: latestCheckin ? "Basado en energía, sueño y entrenamiento" : "Sin check-in reciente",
      tone: "#22c55e",
    },
    {
      title: "Adherencia semanal",
      value: `${adherenceScore}%`,
      note: latestCheckin || latestJournalEntry ? "Seguimiento clínico reciente" : "Aún sin seguimiento",
      tone: "#3b82f6",
    },
    {
      title: "Riesgo clínico",
      value: `${clinicalRiskScore}%`,
      note: biomarkerSummaryData.length ? "Calculado con marcadores y adiposidad" : "Se ajusta al registrar labs",
      tone: clinicalRiskScore >= 60 ? "#f59e0b" : "#14b8a6",
    },
  ];
  const analysisComparisonData = [
    { name: "Proteína", actual: Math.round(activeMacroPlan?.proteinPct || 0), target: inferredCondition === "hipertrofia" ? 30 : 25 },
    { name: "Carbohidratos", actual: Math.round(activeMacroPlan?.carbsPct || 0), target: inferredCondition === "diabetes" ? 35 : 45 },
    { name: "Grasas", actual: Math.round(activeMacroPlan?.fatPct || 0), target: inferredCondition === "obesidad" ? 30 : 30 },
  ];
  const coverageCompletionPct = round1(((totalAssignedMeals / (WEEK_DAYS.length * WEEKLY_MEAL_SLOTS.length)) * 100) || 0);
  const todayIso = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const monthlyNewPatients = patients.filter(patient => String(patient.created_at || "").slice(0, 7) === todayIso.slice(0, 7)).length;
  const monthlyCompletedConsultas = consultas.filter(consulta => String(consulta.fecha || "").slice(0, 7) === todayIso.slice(0, 7)).length;
  const patientsWithMoreThanOneConsulta = round1((patients.length ? (patients.filter(patient => consultas.filter(consulta => consulta.paciente_id === patient.id).length > 1).length / patients.length) * 100 : 0));
  const sentMessagesCount = agendaItems.filter(item => ["email", "whatsapp"].includes(item.canal || "")).length;
  const dashboardMonthlyStats = [
    { label: "Nuevos clientes", value: monthlyNewPatients, tone: "#8b5cf6", bg: "#f3e8ff", icon: "◉" },
    { label: "Citas completadas", value: monthlyCompletedConsultas, tone: "#2563eb", bg: "#dbeafe", icon: "◌" },
    { label: "Clientes con > 1 cita", value: `${patientsWithMoreThanOneConsulta}%`, tone: "#14b8a6", bg: "#ccfbf1", icon: "◎" },
    { label: "Mensajes enviados", value: sentMessagesCount, tone: "#d97706", bg: "#fef3c7", icon: "✉" },
  ];
  const nextConsultaCard = upcomingAgenda[0] || null;
  const dashboardUpcomingConsultas = upcomingAgenda.slice(0, 4);
  const dashboardCancelledItems = agendaItems.filter(item => !item.completado && String(item.fecha || "") < todayIso).slice(0, 4);
  const dashboardMessageItems = agendaItems.filter(item => ["email", "whatsapp"].includes(item.canal || "")).slice(0, 4);
  const currentGreeting = now.getHours() < 12 ? "Buenos días" : now.getHours() < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#ffffff", color: "#334155", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {toast && (
        <div style={{ position: "fixed", right: 24, top: 24, zIndex: 5000, background: "#ecfdf5", color: "#86efac", border: "1px solid #22c55e55", borderRadius: 12, padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>
          {toast}
        </div>
      )}
      <aside style={{ width: 280, background: "linear-gradient(180deg,#e8f8fb,#f7fbff)", borderRight: "1px solid #dbe7f1", padding: 24, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#84b7f6,#b8d9ff)", color: "#1e293b", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>LJ</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>L.N. Jesus</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Nutriologo</div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {SECTION_ITEMS.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "12px 14px", borderRadius: 12, border: `1px solid ${section === item.id ? "#b8d9ff" : "#dbe7f1"}`, background: section === item.id ? "#ffffff" : "rgba(255,255,255,0.65)", color: section === item.id ? "#2563eb" : "#475569", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", boxShadow: section === item.id ? "0 10px 24px rgba(148,163,184,0.10)" : "none" }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 24, background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16, boxShadow: "0 12px 30px rgba(148,163,184,0.10)" }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#64748b" }}>Paciente actual</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{selectedPatient ? `${selectedPatient.nombre} ${selectedPatient.apellidos || ""}` : "Sin paciente"}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{selectedPatient?.objetivo || "Selecciona un paciente"}</div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        {showPacienteModal && <NuevoPacienteModal onClose={() => setShowPacienteModal(false)} onSaved={onPacienteSaved} />}
        {showEditPacienteModal && selectedPatient && <NuevoPacienteModal initialData={selectedPatient} onClose={() => setShowEditPacienteModal(false)} onSaved={onPacienteSaved} />}
        {showConsultaModal && <ConsultaModal patients={patients} defaultPatientId={selectedPatient?.id} onClose={() => setShowConsultaModal(false)} onSaved={onConsultaSaved} />}

        {section === "dashboard" && (
          <div style={{ padding: 0, background: "#f6fafc", minHeight: "100vh", color: "#334155" }}>
            <div style={{ background: "linear-gradient(180deg,#e8f8fb 0%, #f6fafc 100%)", borderBottom: "1px solid #dbe7f1", padding: "28px 32px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 17, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>{currentGreeting}, {selectedPatient?.nombre || "Jesús"}</div>
                  <h1 style={{ fontSize: 36, margin: 0, fontWeight: 900, color: "#1e293b" }}>Panel principal</h1>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  {nutriniumQuickTabs.map(tab => (
                    <button key={tab.target} onClick={() => setSection(tab.target)} style={{ background: "#fff", color: "#475569", border: "1px solid #dbe7f1", borderRadius: 999, padding: "9px 14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(148,163,184,0.08)" }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 24, alignItems: "start" }}>
                <div style={{ display: "grid", gap: 22 }}>
                  <div style={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 22, padding: 24, boxShadow: "0 16px 40px rgba(148,163,184,0.12)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#1e293b" }}>Próxima consulta</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ background: "#fef3c7", color: "#a16207", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800 }}>1°</span>
                        <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800 }}>
                          {nextConsultaCard ? `${nextConsultaCard.fecha}${nextConsultaCard.hora ? ` · ${nextConsultaCard.hora}` : ""}` : "Sin cita programada"}
                        </span>
                      </div>
                    </div>
                    <div style={{ background: "#edf5ff", border: "1px solid #d7e8ff", borderRadius: 18, padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#60a5fa,#c4b5fd)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900 }}>
                          {selectedPatient ? getAvatar(selectedPatient.nombre, selectedPatient.apellidos) : "LJ"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: "#1e293b" }}>{selectedPatient ? `${selectedPatient.nombre} ${selectedPatient.apellidos || ""}` : "Selecciona un paciente"}</div>
                          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
                            {nextConsultaCard ? `${nextConsultaCard.fecha}${nextConsultaCard.hora ? ` | ${nextConsultaCard.hora}` : ""}` : selectedPatient?.objetivo || "Sin consulta programada"}
                          </div>
                        </div>
                        <button style={{ background: "transparent", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>⋮</button>
                      </div>
                      <button onClick={() => nextConsultaCard ? setShowConsultaModal(true) : setSection("agenda")} style={{ width: "100%", background: "#84b7f6", color: "#fff", border: "none", borderRadius: 12, padding: "14px 18px", fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
                        {nextConsultaCard ? "Iniciar consulta" : "Programar consulta"}
                      </button>
                    </div>
                  </div>

                  <div style={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 22, padding: 24, boxShadow: "0 16px 40px rgba(148,163,184,0.12)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#1e293b" }}>Próximas consultas</div>
                      <button onClick={() => setSection("agenda")} style={{ background: "transparent", border: "none", color: "#475569", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Abrir calendario →</button>
                    </div>
                    <div style={{ display: "grid", gap: 12 }}>
                      {dashboardUpcomingConsultas.length ? dashboardUpcomingConsultas.map((item, index) => (
                        <div key={item.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: ["#67e8f9", "#fca5a5", "#86efac", "#c4b5fd"][index % 4] }} />
                          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                            {selectedPatient ? getAvatar(selectedPatient.nombre, selectedPatient.apellidos) : "P"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>{item.titulo || "Consulta programada"}</div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>{item.fecha}{item.hora ? ` · ${item.hora}` : ""}</div>
                          </div>
                          <div style={{ color: "#64748b", fontSize: 18 }}>⋮</div>
                        </div>
                      )) : (
                        <div style={{ background: "#f8fafc", border: "1px dashed #dbe7f1", borderRadius: 18, padding: 28, textAlign: "center" }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>🗓</div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: "#475569", marginBottom: 6 }}>Esta lista está vacía</div>
                          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>No tienes más ninguna consulta programada.</div>
                          <button onClick={() => setSection("agenda")} style={{ background: "#84b7f6", color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>Programar consulta</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 22 }}>
                  <div style={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 22, padding: 24, boxShadow: "0 16px 40px rgba(148,163,184,0.12)" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#1e293b", marginBottom: 18 }}>Mis estadísticas mensuales</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
                      {dashboardMonthlyStats.map(item => (
                        <div key={item.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: 18 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: item.bg, color: item.tone, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{item.icon}</div>
                            <div style={{ fontSize: 34, fontWeight: 900, color: "#1e293b", lineHeight: 1 }}>{item.value}</div>
                          </div>
                          <div style={{ fontSize: 14, color: "#64748b", fontWeight: 700 }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 22, overflow: "hidden", boxShadow: "0 16px 40px rgba(148,163,184,0.12)" }}>
                    <div style={{ display: "flex", gap: 20, padding: "18px 20px 0", borderBottom: "1px solid #e2e8f0" }}>
                      {[
                        { id: "canceladas", label: "Citas canceladas" },
                        { id: "mensajes", label: "Últimos mensajes" },
                      ].map(tab => (
                        <button key={tab.id} onClick={() => setDashboardActivityTab(tab.id)} style={{ background: "transparent", border: "none", borderBottom: dashboardActivityTab === tab.id ? "3px solid #64748b" : "3px solid transparent", color: dashboardActivityTab === tab.id ? "#334155" : "#64748b", padding: "0 0 14px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ padding: 20 }}>
                      {(dashboardActivityTab === "canceladas" ? dashboardCancelledItems : dashboardMessageItems).length ? (
                        <div style={{ display: "grid", gap: 12 }}>
                          {(dashboardActivityTab === "canceladas" ? dashboardCancelledItems : dashboardMessageItems).map(item => (
                            <div key={item.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 14 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>{item.titulo}</div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>{item.fecha}{item.hora ? ` · ${item.hora}` : ""} · {item.canal || item.tipo}</div>
                              {item.nota ? <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>{item.nota}</div> : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 18, padding: 42, textAlign: "center" }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>🗂</div>
                          <div style={{ fontSize: 16, color: "#64748b", fontWeight: 800 }}>Esta lista está vacía</div>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 20, borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
                      <button onClick={() => setSection(dashboardActivityTab === "canceladas" ? "agenda" : "seguimiento")} style={{ background: "transparent", border: "none", color: "#475569", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                        Ver todas las actividades →
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 22, padding: 20, boxShadow: "0 16px 40px rgba(148,163,184,0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div style={{ fontWeight: 900, color: "#1e293b" }}>Panorama clínico</div>
                        <button onClick={() => setSection("analisis")} style={{ background: "transparent", border: "none", color: "#64748b", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Ver análisis</button>
                      </div>
                      <div style={{ display: "grid", gap: 10 }}>
                        {dashboardSpotlightCards.map(card => (
                          <div key={card.title} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{card.title}</div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: card.tone }}>{card.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 22, padding: 20, boxShadow: "0 16px 40px rgba(148,163,184,0.12)" }}>
                      <div style={{ fontWeight: 900, color: "#1e293b", marginBottom: 14 }}>Cobertura del plan</div>
                      <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer>
                          <BarChart data={weeklyDayCoverageData}>
                            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #dbe7f1", borderRadius: 12, color: "#334155" }} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#84b7f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {section === "pacientes" && (
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Pacientes</h1>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowPacienteModal(true)} style={{ background: "#ffffff", border: "1px solid #dbe7f1", color: "#334155", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Nuevo paciente</button>
                <button onClick={() => setShowConsultaModal(true)} disabled={!selectedPatient} style={{ background: "#22c55e", border: "none", color: "#000", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", opacity: selectedPatient ? 1 : 0.6 }}>Nueva consulta</button>
              </div>
            </div>
            {loadingPats ? <Spinner /> : (
              <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 18 }}>
                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <input value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Buscar por nombre u objetivo..." style={{ ...inputBase, flex: 1 }} />
                      <select value={patientStatusFilter} onChange={e => setPatientStatusFilter(e.target.value)} style={{ ...inputBase, width: 130 }}>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Inactivos</option>
                        <option value="todos">Todos</option>
                      </select>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {(patientStatusFilter === "inactivos" ? [] : filteredActivePatients).map(patient => (
                        <button key={patient.id} onClick={() => setSelectedPatient(patient)} style={{ textAlign: "left", background: selectedPatient?.id === patient.id ? "#ecfdf5" : "#f8fbfe", color: "#334155", border: `1px solid ${selectedPatient?.id === patient.id ? "#22c55e55" : "#dbe7f1"}`, borderRadius: 12, padding: 14, cursor: "pointer", fontFamily: "inherit" }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{patient.nombre} {patient.apellidos}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{patient.objetivo || "Sin objetivo"}</div>
                        </button>
                      ))}
                      {patientStatusFilter === "inactivos" && <div style={{ fontSize: 12, color: "#6b7280" }}>Usa el bloque inferior para reactivar pacientes.</div>}
                    </div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>Pacientes desactivados ({inactivePatients.length})</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Conservan historial</div>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {(patientStatusFilter === "activos" ? filteredInactivePatients.slice(0, 6) : filteredInactivePatients).map(patient => (
                        <div key={patient.id} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{patient.nombre} {patient.apellidos}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{patient.objetivo || "Sin objetivo"}</div>
                          </div>
                          <button onClick={() => reactivatePatient(patient)} style={{ ...buttonSuccessSoft, padding: "7px 12px", fontWeight: 700 }}>Reactivar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  {!selectedPatient ? <EmptyState icon="◎" title="Sin paciente seleccionado" sub="Elige un paciente para ver su expediente." /> : (
                    <div style={{ display: "grid", gap: 16 }}>
                      <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 16, padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#000", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{getAvatar(selectedPatient.nombre, selectedPatient.apellidos)}</div>
                            <div>
                              <div style={{ fontSize: 20, fontWeight: 900 }}>{selectedPatient.nombre} {selectedPatient.apellidos}</div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>{selectedPatient.edad ? `${selectedPatient.edad} años · ` : ""}{selectedPatient.objetivo || "Sin objetivo"}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowEditPacienteModal(true)} style={{ ...buttonNeutral, padding: "8px 12px" }}>Editar paciente</button>
                            <button onClick={deactivateSelectedPatient} style={{ ...buttonWarningSoft, padding: "8px 12px" }}>Desactivar paciente</button>
                            <button onClick={deleteSelectedPatient} style={{ ...buttonDangerSoft, padding: "8px 12px", fontWeight: 700 }}>Borrar paciente</button>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
                          <Chip label="Telefono" value={selectedPatient.telefono || "Sin dato"} />
                          <Chip label="Email" value={selectedPatient.email || "Sin dato"} />
                          <Chip label="Consultas" value={String(patientConsultas.length)} />
                          <Chip label="Ultima cita" value={patientConsultas.at(-1)?.fecha || "Sin dato"} />
                        </div>
                      </div>
                      <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 16, padding: 20 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Historial de consultas ({patientConsultas.length})</div>
                        <div style={{ display: "grid", gap: 10, maxHeight: 420, overflowY: "auto" }}>
                          {[...patientConsultas].reverse().map((consulta, index) => (
                            <div key={consulta.id} style={{ background: "#f8fbfe", border: `1px solid ${index === 0 ? "#22c55e55" : "#dbe7f1"}`, borderRadius: 12, padding: 14 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 13 }}>{consulta.fecha} {index === 0 && <span style={{ marginLeft: 8, background: "#22c55e", color: "#000", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>Ultima</span>}</div>
                                  <div style={{ fontSize: 11, color: "#6b7280" }}>{consulta.tipo_cita}</div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                  {consulta.peso && <Chip label="Peso" value={`${consulta.peso}kg`} />}
                                  {consulta.imc && <Chip label="IMC" value={consulta.imc} />}
                                  {consulta.glucosa && <Chip label="Glucosa" value={consulta.glucosa} />}
                                </div>
                              </div>
                              {consulta.diagnostico_nutricional && <div style={{ marginTop: 8, fontSize: 12, color: "#475569" }}>{consulta.diagnostico_nutricional}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {section === "analisis" && (
          <Suspense fallback={<div style={{ padding: 32 }}><Spinner /></div>}>
            <AnalisisSection
              selectedPatient={selectedPatient}
              patients={patients}
              onSelectPatient={value => {
                const patient = patients.find(item => String(item.id) === value);
                if (patient) setSelectedPatient(patient);
              }}
              onGoPlan={() => setSection("plan")}
              inputBase={inputBase}
              EmptyState={EmptyState}
              totalKcal={totalKcal}
              activeMacroPlan={activeMacroPlan}
              totalAssignedMeals={totalAssignedMeals}
              macroDistributionData={macroDistributionData}
              bodyCompositionSplitData={bodyCompositionSplitData}
              mealCoverageData={mealCoverageData}
              dailyAnalysisData={dailyAnalysisData}
              analysisComparisonData={analysisComparisonData}
              coverageCompletionPct={coverageCompletionPct}
              readinessScore={readinessScore}
              adherenceScore={adherenceScore}
              clinicalRiskScore={clinicalRiskScore}
              suggestedClinicalTemplate={suggestedClinicalTemplate}
              biomarkerSummaryData={biomarkerSummaryData}
              inferredCondition={inferredCondition}
              latestYuhasz={latestYuhasz}
              latestMatiegka={latestMatiegka}
              weeklyRecipes={weeklyRecipes}
              totalGroceryItems={totalGroceryItems}
              latestCheckin={latestCheckin}
            />
          </Suspense>
        )}

        {section === "calculo" && (
          <Suspense fallback={<div style={{ padding: 32 }}><Spinner /></div>}>
            <CalculoSection
              selectedPatient={selectedPatient}
              patients={patients}
              onSelectPatient={value => {
                const patient = patients.find(item => String(item.id) === value);
                if (patient) setSelectedPatient(patient);
              }}
              inputBase={inputBase}
              lbl={lbl}
              activityFactor={activityFactor}
              setActivityFactor={setActivityFactor}
              activityLevelKey={activityLevelKey}
              setActivityLevelKey={setActivityLevelKey}
              saveDietCalculation={saveDietCalculation}
              latestDietCalculation={latestDietCalculation}
              planScope={planScope}
              setPlanScope={setPlanScope}
              selectedDietGet={selectedDietGet}
              savingDietCalc={savingDietCalc}
              harrisBenedict={harrisBenedict}
              mifflinStJeor={mifflinStJeor}
              katchMcArdle={katchMcArdle}
              schofield={schofield}
              omsFaoUnu={omsFaoUnu}
              dietSex={dietSex}
              dietAge={dietAge}
              dietWeight={dietWeight}
              dietHeight={dietHeight}
              bodyCompositionReferenceRows={bodyCompositionReferenceRows}
              idealWeight={idealWeight}
              adjustedWeight={adjustedWeight}
              Chip={Chip}
              dietFormula={dietFormula}
              setDietFormula={setDietFormula}
              dailyEnergyFormula={dailyEnergyFormula}
              setDailyEnergyFormula={setDailyEnergyFormula}
              dietFormulas={dietFormulas}
              selectedDietFormulaData={selectedDietFormulaData}
              selectedLeeRace={selectedLeeRace}
              leeRaceKey={leeRaceKey}
              setLeeRaceKey={setLeeRaceKey}
              activity={activity}
              inferredCondition={inferredCondition}
              bodyFatFormula={bodyFatFormula}
              setBodyFatFormula={setBodyFatFormula}
              muscleFormula={muscleFormula}
              setMuscleFormula={setMuscleFormula}
              activeMacroPlan={activeMacroPlan}
              macroEditMode={macroEditMode}
              setMacroEditMode={setMacroEditMode}
              normalizeMacroPercentages={normalizeMacroPercentages}
              convertPercentToGkg={convertPercentToGkg}
              convertGkgToPercent={convertGkgToPercent}
              macroTargets={macroTargets}
              setMacroField={setMacroField}
              totalKcal={totalKcal}
              macroBreakdownRows={macroBreakdownRows}
              nutrientQuantificationRows={nutrientQuantificationRows}
              planDurationRows={planDurationRows}
              EmptyState={EmptyState}
              round1={round1}
            />
          </Suspense>
        )}

        {section === "plan" && (
          <Suspense fallback={<div style={{ padding: 32 }}><Spinner /></div>}>
            <PlanSection
              selectedPatient={selectedPatient}
              patients={patients}
              setSelectedPatient={setSelectedPatient}
              inputBase={inputBase}
              autoGenerateWeeklyPlan={autoGenerateWeeklyPlan}
              exportWeeklyPlanPdf={exportWeeklyPlanPdf}
              saveWeeklyPlan={saveWeeklyPlan}
              loadingWeeklyPlan={loadingWeeklyPlan}
              totalKcal={totalKcal}
              activeMacroPlan={activeMacroPlan}
              macroDistributionData={macroDistributionData}
              dailyAnalysisData={dailyAnalysisData}
              totalAssignedMeals={totalAssignedMeals}
              weeklyRecipes={weeklyRecipes}
              totalGroceryItems={totalGroceryItems}
              upcomingAgenda={upcomingAgenda}
              inferredCondition={inferredCondition}
              suggestedClinicalTemplate={suggestedClinicalTemplate}
              preparationCategory={preparationCategory}
              setPreparationCategory={setPreparationCategory}
              recipeSearch={recipeSearch}
              setRecipeSearch={setRecipeSearch}
              recipeMealTypeFilter={recipeMealTypeFilter}
              setRecipeMealTypeFilter={setRecipeMealTypeFilter}
              recipeDishTypeFilter={recipeDishTypeFilter}
              setRecipeDishTypeFilter={setRecipeDishTypeFilter}
              recipeCuisineTypeFilter={recipeCuisineTypeFilter}
              setRecipeCuisineTypeFilter={setRecipeCuisineTypeFilter}
              recipeClinicalFilter={recipeClinicalFilter}
              setRecipeClinicalFilter={setRecipeClinicalFilter}
              recipeDifficultyFilter={recipeDifficultyFilter}
              setRecipeDifficultyFilter={setRecipeDifficultyFilter}
              recipeGoalFilter={recipeGoalFilter}
              setRecipeGoalFilter={setRecipeGoalFilter}
              recipeViewMode={recipeViewMode}
              setRecipeViewMode={setRecipeViewMode}
              showFavoriteRecipesOnly={showFavoriteRecipesOnly}
              setShowFavoriteRecipesOnly={setShowFavoriteRecipesOnly}
              recommendedDishes={recommendedDishes}
              clinicalTemplates={clinicalTemplateCatalog}
              applyClinicalTemplate={applyClinicalTemplate}
              preparationTemplates={ALL_PREPARATION_TEMPLATES}
              draggedPreparation={draggedPreparation}
              setDraggedPreparation={setDraggedPreparation}
              applyTemplateToWeek={applyTemplateToWeek}
              recipeCatalog={recipeCatalog}
              filteredWeeklyRecipes={filteredWeeklyRecipes}
              filteredRecipeLibrary={filteredRecipeLibrary}
              favoriteRecipeIds={favoriteRecipeIds}
              toggleFavoriteRecipe={toggleFavoriteRecipe}
              applyRecipeToWeek={applyRecipeToWeek}
              applyRecipeToCurrentDay={applyRecipeToCurrentDay}
              groceryList={groceryList}
              mealPlannerData={mealPlannerData}
              allFoods={allFoods}
              mealQuickAdd={mealQuickAdd}
              setMealQuickAdd={setMealQuickAdd}
              addFoodToMealFromQuickSelect={addFoodToMealFromQuickSelect}
              moveFoodWithinMeal={moveFoodWithinMeal}
              removeFoodFromMeal={removeFoodFromMeal}
              setSection={setSection}
              mealNotes={mealNotes}
              setMealNotes={setMealNotes}
              round1={round1}
              globalMealSummary={globalMealSummary}
              globalMealTarget={globalMealTarget}
              mealDonutData={mealDonutData}
              nutrientReferenceRows={nutrientReferenceRows}
              duplicateDayToWeek={duplicateDayToWeek}
              clearWeeklyPlan={clearWeeklyPlan}
              weekDays={WEEK_DAYS}
              weeklyMealSlots={WEEKLY_MEAL_SLOTS}
              weeklyPlan={weeklyPlan}
              getRecipeCompatibleSlots={getRecipeCompatibleSlots}
              normalizeTemplateSlot={normalizeTemplateSlot}
              assignPreparationToCell={assignPreparationToCell}
              updateWeeklyPlanCell={updateWeeklyPlanCell}
              recipeMealTypeOptions={RECIPE_MEAL_TYPE_OPTIONS}
              recipeDishTypeOptions={RECIPE_DISH_TYPE_OPTIONS}
              recipeCuisineOptions={RECIPE_CUISINE_OPTIONS}
              clinicalLabelOptions={CLINICAL_LABEL_OPTIONS}
              recipeDifficultyOptions={RECIPE_DIFFICULTY_OPTIONS}
              recipeGoalOptions={RECIPE_GOAL_OPTIONS}
            />
          </Suspense>
        )}

        {section === "clinicos" && (
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Datos Clinicos</h1>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={selectedPatient?.id || ""} onChange={e => { const patient = patients.find(item => String(item.id) === e.target.value); if (patient) setSelectedPatient(patient); }} style={{ ...inputBase, width: 220 }}>
                  {patients.map(patient => <option key={patient.id} value={patient.id}>{patient.nombre} {patient.apellidos}</option>)}
                </select>
                {["antropometria", "bioquimicos"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? "#22c55e" : "#ffffff", color: activeTab === tab ? "#000" : "#64748b", border: `1px solid ${activeTab === tab ? "#22c55e" : "#dbe7f1"}`, borderRadius: 8, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{tab === "antropometria" ? "Antropometria" : "Bioquimicos"}</button>
                ))}
              </div>
            </div>
            {loadingCons ? <Spinner /> : patientConsultas.length === 0 ? <EmptyState icon="◐" title="Sin datos clinicos" sub="Registra una consulta con datos antropometricos o bioquimicos." /> : activeTab === "antropometria" ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #dbe7f1", fontWeight: 800, fontSize: 14 }}>Historial antropometrico</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ ...tableBase, minWidth: 1100 }}>
                      <thead>
                        <tr style={tableHeadRow}>
                          {["Fecha", "Peso", "IMC", "Cintura", "Cadera", "Yuhasz % grasa", "Yuhasz kg", "Matiegka kg", "Matiegka %"].map(header => <th key={header} style={tableHeadCell}>{header}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {patientConsultas.filter(item => item.peso || item.imc).map((consulta, index, array) => {
                          const y = resolveFatMassResult({
                            peso: consulta.peso,
                            storedPct: consulta.yuhasz_grasa_pct,
                            storedKg: consulta.yuhasz_grasa_kg,
                            storedLeanPct: consulta.yuhasz_libre_grasa_pct,
                            storedLeanKg: consulta.yuhasz_libre_grasa_kg,
                            fallback: getYuhaszData({ sexo: selectedPatient?.sexo, peso: consulta.peso, pliegue_triceps: consulta.pliegue_triceps, pliegue_subescapular: consulta.pliegue_subescapular, pliegue_cresta_iliaca: consulta.pliegue_cresta_iliaca, pliegue_abdominal: consulta.pliegue_abdominal, pliegue_muslo: consulta.pliegue_muslo, pliegue_pantorrilla: consulta.pliegue_pantorrilla }),
                          });
                          const m = resolveMuscleMassResult({
                            peso: consulta.peso,
                            storedPct: consulta.matiegka_muscular_pct,
                            storedKg: consulta.matiegka_muscular_kg,
                            fallback: getMatiegkaData({ peso: consulta.peso, talla: consulta.talla, brazo: consulta.brazo, perimetro_torax: consulta.perimetro_torax, perimetro_muslo: consulta.perimetro_muslo, perimetro_pantorrilla: consulta.perimetro_pantorrilla, pliegue_triceps: consulta.pliegue_triceps, pliegue_subescapular: consulta.pliegue_subescapular, pliegue_muslo: consulta.pliegue_muslo, pliegue_pantorrilla: consulta.pliegue_pantorrilla }),
                          });
                          const isLatest = index === array.length - 1;
                          return (
                            <tr key={consulta.id} style={{ ...tableBodyRow, background: isLatest ? "#ecfdf5" : "transparent" }}>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>{consulta.fecha}</td>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>{consulta.peso || "—"}</td>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>{consulta.imc || "—"}</td>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>{consulta.cintura || "—"}</td>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>{consulta.cadera || "—"}</td>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>{y?.grasaPct || "—"}</td>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>{y?.grasaKg || "—"}</td>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>{m?.muscularKg || "—"}</td>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>{m?.muscularPct || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Pliegues y circunferencias</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                      {latestAnthroConsulta && [
                        ["Triceps", latestAnthroConsulta.pliegue_triceps],
                        ["Biceps", latestAnthroConsulta.pliegue_biceps],
                        ["Subescapular", latestAnthroConsulta.pliegue_subescapular],
                        ["Cresta iliaca", latestAnthroConsulta.pliegue_cresta_iliaca],
                        ["Supraespinal", latestAnthroConsulta.pliegue_supraespinal],
                        ["Abdominal", latestAnthroConsulta.pliegue_abdominal],
                        ["Muslo", latestAnthroConsulta.pliegue_muslo],
                        ["Pantorrilla", latestAnthroConsulta.pliegue_pantorrilla],
                        ["Cintura", latestAnthroConsulta.cintura],
                        ["Cadera", latestAnthroConsulta.cadera],
                        ["Brazo relajado", latestAnthroConsulta.circunferencia_brazo_relajado],
                        ["Brazo flexionado", latestAnthroConsulta.circunferencia_brazo_flexionado],
                        ["Muslo circ.", latestAnthroConsulta.circunferencia_muslo],
                        ["Pantorrilla circ.", latestAnthroConsulta.circunferencia_pantorrilla],
                        ["Humero", latestAnthroConsulta.diametro_humero],
                        ["Biestiloideo", latestAnthroConsulta.diametro_biestiloideo],
                        ["Rodilla", latestAnthroConsulta.diametro_rodilla],
                      ].filter(([, value]) => value != null).map(([label, value]) => <Chip key={label} label={label} value={String(value)} />)}
                    </div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Composicion corporal y calculo dietetico</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {latestYuhasz && <>
                        <Chip label="Yuhasz % grasa" value={`${latestYuhasz.grasaPct}%`} />
                        <Chip label="Yuhasz grasa kg" value={`${latestYuhasz.grasaKg} kg`} />
                      </>}
                      {latestFaulkner && <>
                        <Chip label="Faulkner % grasa" value={`${latestFaulkner.grasaPct}%`} />
                        <Chip label="Faulkner grasa kg" value={`${latestFaulkner.grasaKg} kg`} />
                      </>}
                      {latestMatiegka && <>
                        <Chip label="Matiegka muscular kg" value={`${latestMatiegka.muscularKg} kg`} />
                        <Chip label="Matiegka muscular %" value={`${latestMatiegka.muscularPct}%`} />
                      </>}
                      {petersonData && <>
                        <Chip label="Peterson % grasa" value={`${petersonData.grasaPct}%`} />
                        <Chip label="Peterson grasa kg" value={`${petersonData.grasaKg} kg`} />
                      </>}
                      {evansData && <>
                        <Chip label="Evans % grasa" value={`${evansData.grasaPct}%`} />
                        <Chip label="Evans grasa kg" value={`${evansData.grasaKg} kg`} />
                      </>}
                      {vonDobelnBoneKg != null && <Chip label="Von Döbeln ósea" value={`${vonDobelnBoneKg} kg`} />}
                      {wurchResidualKg != null && <Chip label="Würch residual" value={`${wurchResidualKg} kg`} />}
                      {derivedMuscleMass && <>
                        <Chip label="Muscular derivada kg" value={`${derivedMuscleMass.muscularKg} kg`} />
                        <Chip label="Muscular derivada %" value={`${derivedMuscleMass.muscularPct}%`} />
                      </>}
                      {latestDietCalculation && <>
                        <Chip label="Formula" value={latestDietCalculation.formula_referencia} />
                        <Chip label="GET" value={`${latestDietCalculation.kcal_objetivo || "-"} kcal`} />
                        <Chip label="Macros" value={`P ${latestDietCalculation.proteina_g || "-"} · C ${latestDietCalculation.carbohidratos_g || "-"} · G ${latestDietCalculation.grasa_g || "-"}`} />
                      </>}
                    </div>
                  </div>
                </div>
                {latestAdimeConsulta && (
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Nota ADIME más reciente</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>A · Valoración</div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{latestAdimeConsulta.adime_valoracion || latestAdimeConsulta.diagnostico_nutricional || "Sin registro"}</div>
                      </div>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>D · Diagnóstico</div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{latestAdimeConsulta.adime_diagnostico || latestAdimeConsulta.diagnostico_nutricional || "Sin registro"}</div>
                      </div>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>I · Intervención</div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{latestAdimeConsulta.adime_intervencion || latestAdimeConsulta.indicaciones || "Sin registro"}</div>
                      </div>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>M/E · Monitoreo</div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{latestAdimeConsulta.adime_monitoreo || latestAdimeConsulta.objetivos || "Sin registro"}</div>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Interpretación de pliegues</div>
                    {latestSkinfoldRows.length ? (
                      <div style={{ display: "grid", gap: 12 }}>
                        <div style={{ overflowX: "auto" }}>
                          <table style={tableBase}>
                            <thead>
                              <tr style={tableHeadRow}>
                                {["Pliegue", "Valor (mm)", "Lectura"].map(header => (
                                  <th key={header} style={{ ...tableHeadCell, padding: "10px 12px" }}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {latestSkinfoldRows.map(row => {
                                const tone = getSkinfoldBandTone(row.band);
                                return (
                                  <tr key={row.label} style={tableBodyRow}>
                                    <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700 }}>{row.label}</td>
                                    <td style={{ padding: "10px 12px", fontSize: 12 }}>{row.value}</td>
                                    <td style={{ padding: "10px 12px", fontSize: 12 }}>
                                      <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 999, color: tone.text, background: tone.bg, border: `1px solid ${tone.border}`, fontWeight: 700 }}>
                                        {row.band}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {skinfoldDistribution && (
                          <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: skinfoldDistribution.tone, marginBottom: 6 }}>{skinfoldDistribution.label}</div>
                            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
                              Relación tronco/extremidades: {skinfoldDistribution.ratio}
                              <br />
                              Promedio central: {skinfoldDistribution.centralAvg} mm · Promedio periférico: {skinfoldDistribution.peripheralAvg} mm
                              <br />
                              {skinfoldDistribution.note}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : <div style={{ fontSize: 12, color: "#6b7280" }}>No hay suficientes pliegues registrados para interpretar.</div>}
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 10 }}>
                      Lectura orientativa por bandas de milímetros para facilitar revisión rápida en consulta.
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 16 }}>
                    <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Interpretación Yuhasz / Faulkner</div>
                      <div style={{ display: "grid", gap: 10 }}>
                        {latestYuhasz && (
                          <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>Yuhasz</div>
                            <div style={{ fontSize: 12, color: "#15803d", marginBottom: 6 }}>{yuhaszInterpretation?.label || "Sin interpretación"}</div>
                            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
                              {latestYuhasz.grasaPct}% grasa · {latestYuhasz.grasaKg} kg
                              <br />
                              {yuhaszInterpretation?.note}
                            </div>
                          </div>
                        )}
                        {latestFaulkner && (
                          <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>Faulkner</div>
                            <div style={{ fontSize: 12, color: "#15803d", marginBottom: 6 }}>{faulknerInterpretation?.label || "Sin interpretación"}</div>
                            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
                              {latestFaulkner.grasaPct}% grasa · {latestFaulkner.grasaKg} kg
                              <br />
                              {faulknerInterpretation?.note}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Interpretación de masa muscular</div>
                      {latestMatiegka ? (
                        <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                          <div style={{ fontSize: 12, color: "#15803d", fontWeight: 800, marginBottom: 6 }}>{muscleInterpretation?.label || "Sin interpretación"}</div>
                          <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
                            {latestMatiegka.muscularKg} kg · {latestMatiegka.muscularPct}% muscular
                            <br />
                            {muscleInterpretation?.note}
                          </div>
                        </div>
                      ) : <div style={{ fontSize: 12, color: "#6b7280" }}>No hay suficientes datos para interpretar masa muscular.</div>}
                    </div>
                  </div>
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #dbe7f1", fontWeight: 800, fontSize: 14 }}>Modelos avanzados de composición corporal</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ ...tableBase, minWidth: 920 }}>
                      <thead>
                        <tr style={tableHeadRow}>
                          {["Indicador", "Fórmula", "Actual", "Objetivo", "Referencia / lectura"].map(header => (
                            <th key={header} style={tableHeadCell}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bodyCompositionReferenceRows.map(row => (
                          <tr key={row.label} style={tableBodyRow}>
                            <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800 }}>{row.label}</td>
                            <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.formula || "—"}</td>
                            <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.actual || "—"}</td>
                            <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.goal || "—"}</td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                              <div>{row.reference || "—"}</div>
                              {row.note ? <div style={{ fontSize: 11, marginTop: 4 }}>{row.note}</div> : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Alerta por adiposidad central</div>
                    <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: centralAdiposityAlert.tone, marginBottom: 6 }}>{centralAdiposityAlert.level}</div>
                      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
                        Cintura actual: {latestAnthroConsulta?.cintura ?? "—"} cm
                        <br />
                        Yuhasz: {latestYuhasz?.grasaPct != null ? `${latestYuhasz.grasaPct}%` : "—"} · Patrón: {skinfoldDistribution?.label || "Sin lectura"}
                        <br />
                        {centralAdiposityAlert.note}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Semáforo según objetivo</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {anthropometrySemaphores.map(item => (
                        <div key={item.label} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                            <div style={{ fontSize: 12, fontWeight: 800 }}>{item.label}</div>
                            <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 999, color: item.tone, background: "#f8fafc", border: "1px solid #dbe7f1", fontWeight: 700, fontSize: 11 }}>
                              {item.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{item.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Evolución de pliegues</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Series principales para seguimiento de consulta</div>
                  </div>
                  {skinfoldEvolutionData.length > 1 ? (
                    <div style={{ width: "100%", height: 280 }}>
                      <ResponsiveContainer>
                        <LineChart data={skinfoldEvolutionData}>
                          <CartesianGrid stroke="#dbe7f1" strokeDasharray="3 3" />
                          <XAxis dataKey="fecha" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, color: "#334155" }} />
                          <Line type="monotone" dataKey="triceps" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} name="Triceps" />
                          <Line type="monotone" dataKey="subescapular" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Subescapular" />
                          <Line type="monotone" dataKey="abdominal" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} name="Abdominal" />
                          <Line type="monotone" dataKey="muslo" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Muslo" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Necesitas al menos dos consultas con pliegues para ver la evolución gráfica.</div>
                  )}
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Evolución de composición corporal</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Yuhasz, Faulkner y porcentaje muscular</div>
                  </div>
                  {bodyCompositionEvolutionData.length > 1 ? (
                    <div style={{ width: "100%", height: 280 }}>
                      <ResponsiveContainer>
                        <LineChart data={bodyCompositionEvolutionData}>
                          <CartesianGrid stroke="#dbe7f1" strokeDasharray="3 3" />
                          <XAxis dataKey="fecha" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, color: "#334155" }} />
                          <Line type="monotone" dataKey="yuhasz" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} name="Yuhasz % grasa" />
                          <Line type="monotone" dataKey="faulkner" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Faulkner % grasa" />
                          <Line type="monotone" dataKey="matiegka" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Matiegka % muscular" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Necesitas al menos dos consultas con composición corporal para ver la evolución gráfica.</div>
                  )}
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #dbe7f1", fontWeight: 800, fontSize: 14 }}>Resumen numérico de composición corporal</div>
                  {bodyCompositionEvolutionData.length ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ ...tableBase, minWidth: 980 }}>
                        <thead>
                          <tr style={tableHeadRow}>
                            {["Fecha", "Yuhasz %", "Yuhasz kg", "Faulkner %", "Faulkner kg", "Matiegka % muscular", "Matiegka kg muscular"].map(header => (
                              <th key={header} style={tableHeadCell}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {bodyCompositionEvolutionData.map((row, index) => {
                            const isLatest = index === bodyCompositionEvolutionData.length - 1;
                            return (
                              <tr key={row.id || `${row.fechaRaw}-${index}`} style={{ ...tableBodyRow, background: isLatest ? "#ecfdf5" : "transparent" }}>
                                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700 }}>{row.fechaRaw || row.fecha}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.yuhasz != null ? `${row.yuhasz}%` : "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.yuhaszKg != null ? `${row.yuhaszKg} kg` : "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.faulkner != null ? `${row.faulkner}%` : "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.faulknerKg != null ? `${row.faulknerKg} kg` : "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.matiegka != null ? `${row.matiegka}%` : "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.muscularKg != null ? `${row.muscularKg} kg` : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: 18, fontSize: 12, color: "#6b7280" }}>Aún no hay suficientes datos de composición corporal para construir el resumen numérico.</div>
                  )}
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #dbe7f1", fontWeight: 800, fontSize: 14 }}>Comparativo historico de pliegues</div>
                  {skinfoldHistoryRows.length ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ ...tableBase, minWidth: 1280 }}>
                        <thead>
                          <tr style={tableHeadRow}>
                            {["Fecha", "Triceps", "Biceps", "Subescapular", "Cresta iliaca", "Supraespinal", "Abdominal", "Muslo", "Pantorrilla", "Yuhasz %", "Patron"].map(header => (
                              <th key={header} style={tableHeadCell}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {skinfoldHistoryRows.map((row, index) => {
                            const isLatest = index === skinfoldHistoryRows.length - 1;
                            return (
                              <tr key={row.id} style={{ ...tableBodyRow, background: isLatest ? "#ecfdf5" : "transparent" }}>
                                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700 }}>{row.fecha}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.triceps ?? "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.biceps ?? "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.subescapular ?? "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.crestaIliaca ?? "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.supraespinal ?? "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.abdominal ?? "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.muslo ?? "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.pantorrilla ?? "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>{row.yuhasz != null ? `${row.yuhasz}%` : "—"}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12 }}>
                                  {row.distribution ? (
                                    <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 999, color: row.distribution.tone, background: "#f8fafc", border: "1px solid #dbe7f1", fontWeight: 700 }}>
                                      {row.distribution.label}
                                    </span>
                                  ) : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: 18, fontSize: 12, color: "#6b7280" }}>Aun no hay suficientes consultas con pliegues para comparar la evolucion por fecha.</div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {patientConsultas.filter(c => c.glucosa || c.colesterol_total || c.hba1c).slice(-1).map(consulta => {
                  const markers = [
                    { label: "Glucosa en ayuno", value: consulta.glucosa, unit: "mg/dL", ref: "70-100", low: 70, high: 100 },
                    { label: "HbA1c", value: consulta.hba1c, unit: "%", ref: "<5.7", low: 0, high: 5.7 },
                    { label: "Colesterol total", value: consulta.colesterol_total, unit: "mg/dL", ref: "<200", low: 0, high: 200 },
                    { label: "Trigliceridos", value: consulta.trigliceridos, unit: "mg/dL", ref: "<150", low: 0, high: 150 },
                    { label: "HDL", value: consulta.hdl, unit: "mg/dL", ref: ">40", low: 40, high: 999 },
                    { label: "LDL", value: consulta.ldl, unit: "mg/dL", ref: "<130", low: 0, high: 130 },
                    { label: "Vitamina D", value: consulta.vit_d, unit: "ng/mL", ref: "30-100", low: 30, high: 100 },
                    { label: "Ferritina", value: consulta.ferritina, unit: "ng/mL", ref: "12-150", low: 12, high: 150 },
                  ].filter(marker => marker.value != null);
                  return markers.map(marker => {
                    const ok = marker.value >= marker.low && marker.value <= marker.high;
                    return (
                      <div key={marker.label} style={{ background: "#ffffff", border: `1px solid ${ok ? "#dbe7f1" : "#f59e0b55"}`, borderRadius: 12, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{marker.label}</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>Ref: {marker.ref} · Fecha: {consulta.fecha}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: ok ? "#22c55e" : "#f59e0b" }}>{marker.value} <span style={{ fontSize: 11 }}>{marker.unit}</span></div>
                          <div style={{ fontSize: 10, color: ok ? "#22c55e" : "#f59e0b" }}>{ok ? "Normal" : "Revisar"}</div>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </div>
        )}

        {section === "deporte" && (
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Deporte Adaptado</h1>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Registro independiente para pacientes de deporte adaptado y orientación clínica-deportiva específica.</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <select value={selectedAdaptedSportPatient?.id || ""} onChange={e => { const patient = adaptedSportPatients.find(item => String(item.id) === e.target.value); if (patient) setSelectedAdaptedSportPatient(patient); }} style={{ ...inputBase, width: 260 }}>
                  {adaptedSportPatients.length ? adaptedSportPatients.map(patient => <option key={patient.id} value={patient.id}>{patient.nombre} {patient.apellidos}</option>) : <option value="">Sin registros</option>}
                </select>
                <button onClick={() => setShowAdaptedSportModal(true)} style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Nuevo registro</button>
                <button onClick={() => setShowEditAdaptedSportModal(true)} disabled={!selectedAdaptedSportPatient} style={{ ...buttonNeutral, padding: "10px 14px", fontWeight: 800, opacity: selectedAdaptedSportPatient ? 1 : 0.6 }}>Editar</button>
                <button onClick={deleteAdaptedSportPatient} disabled={!selectedAdaptedSportPatient} style={{ ...buttonDangerSoft, padding: "10px 14px", opacity: selectedAdaptedSportPatient ? 1 : 0.6 }}>Borrar</button>
              </div>
            </div>
            {showAdaptedSportModal && (
              <NuevoPacienteModal
                onClose={() => setShowAdaptedSportModal(false)}
                onSaved={onAdaptedSportPatientSaved}
                tableName="deporte_adaptado_pacientes"
                modalTitle="Nuevo Registro de Deporte Adaptado"
                successCreateLabel="✓ Registro de deporte adaptado guardado"
                successEditLabel="✓ Registro de deporte adaptado actualizado"
              />
            )}
            {showEditAdaptedSportModal && selectedAdaptedSportPatient && (
              <NuevoPacienteModal
                initialData={selectedAdaptedSportPatient}
                onClose={() => setShowEditAdaptedSportModal(false)}
                onSaved={onAdaptedSportPatientSaved}
                tableName="deporte_adaptado_pacientes"
                modalTitle="Editar Registro de Deporte Adaptado"
                successCreateLabel="✓ Registro de deporte adaptado guardado"
                successEditLabel="✓ Registro de deporte adaptado actualizado"
              />
            )}
            {!selectedAdaptedSportPatient ? <EmptyState icon="◉" title="Sin registro" sub="Crea o selecciona un registro dentro de Deporte Adaptado." /> : (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
                    <Chip label="Nombre" value={`${selectedAdaptedSportPatient.nombre} ${selectedAdaptedSportPatient.apellidos || ""}`} />
                    <Chip label="Edad / sexo" value={`${selectedAdaptedSportPatient.edad || "-"} años · ${selectedAdaptedSportPatient.sexo || "-"}`} />
                    <Chip label="Objetivo" value={selectedAdaptedSportPatient.objetivo || "General"} />
                    <Chip label="Actividad base" value={selectedAdaptedSportPatient.actividad_fisica_base || "Sin registro"} />
                  </div>
                  {selectedAdaptedSportPatient.discapacidad ? (
                    <div style={{ marginTop: 12 }}>
                      <Chip label="Discapacidad / condición" value={selectedAdaptedSportPatient.discapacidad} />
                    </div>
                  ) : null}
                  {(selectedAdaptedSportPatient.motivo_consulta || selectedAdaptedSportPatient.antecedentes_personales || selectedAdaptedSportPatient.antecedentes_familiares || selectedAdaptedSportPatient.medicamentos || selectedAdaptedSportPatient.alergias || selectedAdaptedSportPatient.suplementacion) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12, fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                        {selectedAdaptedSportPatient.motivo_consulta ? <div><strong style={{ color: "#334155" }}>Motivo:</strong> {selectedAdaptedSportPatient.motivo_consulta}</div> : null}
                        {selectedAdaptedSportPatient.antecedentes_personales ? <div><strong style={{ color: "#334155" }}>Antecedentes personales:</strong> {selectedAdaptedSportPatient.antecedentes_personales}</div> : null}
                        {selectedAdaptedSportPatient.antecedentes_familiares ? <div><strong style={{ color: "#334155" }}>Antecedentes familiares:</strong> {selectedAdaptedSportPatient.antecedentes_familiares}</div> : null}
                      </div>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12, fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                        {selectedAdaptedSportPatient.medicamentos ? <div><strong style={{ color: "#334155" }}>Medicamentos:</strong> {selectedAdaptedSportPatient.medicamentos}</div> : null}
                        {selectedAdaptedSportPatient.alergias ? <div><strong style={{ color: "#334155" }}>Alergias:</strong> {selectedAdaptedSportPatient.alergias}</div> : null}
                        {selectedAdaptedSportPatient.suplementacion ? <div><strong style={{ color: "#334155" }}>Suplementación:</strong> {selectedAdaptedSportPatient.suplementacion}</div> : null}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Perfil</div>
                    <div style={{ fontSize: 17, fontWeight: 900 }}>{adaptedSportModule.profile}</div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Readiness</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{adaptedSportModule.readinessScore}/5</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{adaptedSportModule.readinessLabel}</div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Intensidad sugerida</div>
                    <div style={{ fontSize: 17, fontWeight: 900 }}>{adaptedSportModule.intensity}</div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Objetivo actual</div>
                    <div style={{ fontSize: 17, fontWeight: 900 }}>{selectedAdaptedSportPatient.objetivo || "General"}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Plan base adaptado</div>
                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Foco de entrenamiento</div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{adaptedSportModule.trainingFocus}</div>
                      </div>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Meta semanal</div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{adaptedSportModule.weeklyGoal}</div>
                      </div>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Nutrición peri-entreno</div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{adaptedSportModule.prePost}</div>
                      </div>
                      <div style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Precauciones</div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{adaptedSportModule.precautions}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 16 }}>
                    <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Deportes o formatos sugeridos</div>
                      <div style={{ display: "grid", gap: 8 }}>
                        {adaptedSportModule.suitableSports.map(item => (
                          <div key={item} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#475569" }}>{item}</div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Contexto reciente</div>
                      <div style={{ display: "grid", gap: 8 }}>
                        <Chip label="Energía" value={`${latestCheckin?.energia || "-"} / 5`} />
                        <Chip label="Sueño" value={`${latestCheckin?.sueno || "-"} / 5`} />
                        <Chip label="Adherencia" value={`${latestCheckin?.adherencia || latestJournalEntry?.adherencia || "-"} / 5`} />
                        <Chip label="Yuhasz" value={latestYuhasz?.grasaPct != null ? `${latestYuhasz.grasaPct}%` : "Sin dato"} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Adaptaciones automáticas</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                    {adaptedSportModule.adaptationNotes.map((item, index) => (
                      <div key={`${item}-${index}`} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{item}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Mini semana sugerida</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {[
                        "Lunes · sesión principal",
                        "Martes · movilidad o caminata",
                        "Miércoles · sesión principal",
                        "Jueves · recuperación activa",
                        "Viernes · sesión principal",
                        "Sábado · opcional técnica / cardio suave",
                        "Domingo · descanso o paseo ligero",
                      ].map(item => (
                        <div key={item} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#475569" }}>{item}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Cuándo bajar la carga</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {[
                        "Sueño menor a 6 horas o mala calidad por varios días.",
                        "Adherencia baja y fatiga alta en seguimiento.",
                        "Molestia articular, mareo o mala tolerancia al esfuerzo.",
                        "Síntomas digestivos o baja ingesta alrededor del entrenamiento.",
                      ].map(item => (
                        <div key={item} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#475569" }}>{item}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Perfiles de adaptación deportiva</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Guías rápidas para ajustar ejercicio según contexto funcional</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                    {adaptedSportModule.adaptedProfiles.map(profile => (
                      <div key={profile.title} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 8 }}>{profile.title}</div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                          <strong style={{ color: "#334155" }}>Foco:</strong> {profile.focus}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7, marginTop: 8 }}>
                          <strong style={{ color: "#334155" }}>Ejemplos:</strong> {profile.examples}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7, marginTop: 8 }}>
                          <strong style={{ color: "#334155" }}>Precaución:</strong> {profile.caution}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {section === "alimentos" && (
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>Base de Datos de Alimentos</h1>
                <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 760 }}>Catalogo base + alimentos personalizados + catalogo SMAE cargado desde Supabase.</div>
                <div style={{ fontSize: 12, color: "#2563eb", marginTop: 8 }}>Paciente activo: {selectedPatient ? `${selectedPatient.nombre} ${selectedPatient.apellidos || ""}` : "Selecciona un paciente"}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(90px, 1fr))", gap: 10, minWidth: 420 }}>
                <Chip label="Alimentos" value={String(filteredFoods.length)} />
                <Chip label="Elegidos" value={String(selectedFoods.length)} />
                <Chip label="Kcal" value={String(Math.round(selectedFoodsSummary.kcal || 0))} />
                <Chip label="Proteina" value={`${Math.round(selectedFoodsSummary.prot || 0)}g`} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
              {mealAssignmentSummary.map(slot => (
                <div key={slot.id} style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{slot.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{slot.count}</div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{slot.items.slice(0, 2).join(" · ") || "Sin asignar"}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Guarda alimentos, tiempos de comida, receta y sustituciones para el paciente seleccionado.</div>
              <button onClick={savePatientFoodPlan} disabled={!selectedPatient || loadingFoodPlan} style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", opacity: !selectedPatient ? 0.6 : 1 }}>{loadingFoodPlan ? "Cargando..." : "Guardar plan en Supabase"}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Alimento personalizado</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FInput label="Nombre" value={customFoodForm.name} onChange={e => setCustomFoodForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Tostada horneada" />
                  <FSelect label="Grupo" value={customFoodForm.grupo} onChange={e => setCustomFoodForm(prev => ({ ...prev, grupo: e.target.value }))} options={FOOD_GROUPS.filter(group => group.id !== "todos").map(group => ({ value: group.id, label: group.label }))} />
                  <FInput label="Porcion" value={customFoodForm.porcion} onChange={e => setCustomFoodForm(prev => ({ ...prev, porcion: e.target.value }))} />
                  <FInput label="Equivalente" value={customFoodForm.intercambio} onChange={e => setCustomFoodForm(prev => ({ ...prev, intercambio: e.target.value }))} />
                  <FInput label="Kcal" type="number" value={customFoodForm.kcal} onChange={e => setCustomFoodForm(prev => ({ ...prev, kcal: e.target.value }))} />
                  <FInput label="Proteina" type="number" value={customFoodForm.prot} onChange={e => setCustomFoodForm(prev => ({ ...prev, prot: e.target.value }))} />
                  <FInput label="Carbohidratos" type="number" value={customFoodForm.carbs} onChange={e => setCustomFoodForm(prev => ({ ...prev, carbs: e.target.value }))} />
                  <FInput label="Grasas" type="number" value={customFoodForm.fat} onChange={e => setCustomFoodForm(prev => ({ ...prev, fat: e.target.value }))} />
                </div>
                <FInput label="Tags (separados por coma)" value={customFoodForm.tags} onChange={e => setCustomFoodForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="mexicano, practica, colacion" />
                <div style={{ marginBottom: 16 }}>
                  <label style={lbl}>Tiempos sugeridos</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {MEAL_SLOTS.map(slot => (
                      <button key={slot.id} onClick={() => setCustomFoodForm(prev => ({ ...prev, tiempos: prev.tiempos.includes(slot.id) ? prev.tiempos.filter(item => item !== slot.id) : [...prev.tiempos, slot.id] }))} style={{ background: customFoodForm.tiempos.includes(slot.id) ? "#22c55e" : "transparent", color: customFoodForm.tiempos.includes(slot.id) ? "#000" : "#64748b", border: "1px solid #dbe7f1", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{slot.label}</button>
                    ))}
                  </div>
                </div>
                <button onClick={saveCustomFood} style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Guardar alimento personalizado</button>
              </div>
              <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Importar CSV</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>Encabezados sugeridos: `name,grupo,porcion,intercambio,kcal,prot,carbs,fat,tags,tiempos`</div>
                <textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={10} style={{ ...inputBase, resize: "vertical", lineHeight: 1.6, marginBottom: 12 }} />
                <button onClick={importFoodsFromCsv} style={{ background: "#eefbf3", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 10, padding: "9px 16px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Importar alimentos desde CSV</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  <input value={foodSearch} onChange={e => setFoodSearch(e.target.value)} placeholder="Buscar por alimento o tag..." style={{ ...inputBase, flex: 1, minWidth: 220 }} />
                  <select value={foodGroup} onChange={e => setFoodGroup(e.target.value)} style={{ ...inputBase, minWidth: 190 }}>
                    {FOOD_GROUPS.map(group => <option key={group.id} value={group.id}>{group.label}</option>)}
                  </select>
                  <select value={foodMealFilter} onChange={e => setFoodMealFilter(e.target.value)} style={{ ...inputBase, minWidth: 190 }}>
                    <option value="todos">Todos los tiempos</option>
                    {MEAL_SLOTS.map(slot => <option key={slot.id} value={slot.id}>{slot.label}</option>)}
                  </select>
                  <select value={foodClinicalFilter} onChange={e => setFoodClinicalFilter(e.target.value)} style={{ ...inputBase, minWidth: 190 }}>
                    {CLINICAL_LABEL_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Mostrando {visibleFoods.length} de {filteredFoods.length} alimentos filtrados.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setFoodVisibleCount(count => Math.min(count + 80, filteredFoods.length))} disabled={visibleFoods.length >= filteredFoods.length} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 8, padding: "7px 12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", opacity: visibleFoods.length >= filteredFoods.length ? 0.5 : 1 }}>Cargar mas</button>
                    <button onClick={() => setFoodVisibleCount(filteredFoods.length || 80)} style={{ background: "#eefbf3", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Ver todos</button>
                  </div>
                </div>
                {smaeCatalog.length === 0 && <div style={{ background: "#ffffff", border: "1px solid #f59e0b55", color: "#fbbf24", borderRadius: 10, padding: "10px 12px", fontSize: 12, marginBottom: 12 }}>El catalogo SMAE aun no esta cargado desde Supabase. Corre el esquema y luego el seed `seed-smae-alimentos.sql`.</div>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
                  {suggestedFoods.map(food => {
                    const selected = selectedFoods.includes(food.name);
                    return (
                      <div key={food.name} style={{ background: selected ? "#ecfdf5" : "#f8fbfe", border: `1px solid ${selected ? "#22c55e55" : "#dbe7f1"}`, borderRadius: 14, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{food.name}</div>
                            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "capitalize" }}>{food.grupo} · {food.porcion}</div>
                            <div style={{ fontSize: 10, color: "#15803d", marginTop: 4 }}>Meal slots: {food.tiempos.join(", ")}</div>
                          </div>
                          <button onClick={() => toggleFoodSelection(food.name)} style={{ background: selected ? "#22c55e" : "#eefbf3", color: selected ? "#000" : "#15803d", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{selected ? "Agregado" : "+ Elegir"}</button>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>{food.intercambio}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>{normalizeLabelList(food.tags).map(tag => <span key={tag} style={tagInfo}>{tag}</span>)}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                          <Chip label="Kcal" value={String(food.kcal)} />
                          <Chip label="Prot" value={`${food.prot}g`} />
                          <Chip label="CHO" value={`${food.carbs}g`} />
                          <Chip label="Grasa" value={`${food.fat}g`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Seleccion para consulta</div>
                  {selectedFoodItems.length ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      {selectedFoodItems.map(food => (
                        <div key={food.name} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{food.name}</div>
                            <button onClick={() => toggleFoodSelection(food.name)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontWeight: 800, fontFamily: "inherit" }}>Quitar</button>
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>{food.intercambio}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Ideal para: {food.tiempos.join(", ")}</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                            {MEAL_SLOTS.map(slot => (
                              <button key={slot.id} onClick={() => assignFoodToMeal(food.name, slot.id)} style={{ background: mealAssignments[slot.id].includes(food.name) ? "#22c55e" : "transparent", color: mealAssignments[slot.id].includes(food.name) ? "#000" : "#64748b", border: "1px solid #dbe7f1", borderRadius: 999, padding: "5px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{slot.label}</button>
                            ))}
                          </div>
                          <div style={{ fontSize: 11, color: "#2563eb", marginTop: 10 }}>Receta: {getFoodRecipe(food)}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Sustituciones: {getFoodSubstitutions(food, allFoods).join(", ") || "Sin sustituciones sugeridas"}</div>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState icon="◆" title="Sin alimentos elegidos" sub="Selecciona alimentos para armar una referencia rapida en consulta." />}
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Atajos de equivalentes</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                      "Proteinas: prioriza alimentos con porcion clara y bajo aporte de grasa.",
                      "Cereales: usa intercambios rapidos para deportistas o control glucemico.",
                      "Frutas y verduras: facilita colaciones y saciedad visual.",
                      "Grasas: util para ajustar energia sin subir demasiado el volumen.",
                      "Usa los filtros clinicos para acercarte a diabetes, control de peso o rendimiento.",
                    ].map(item => <div key={item} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 14, fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{item}</div>)}
                </div>
              </div>
            </div>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Preparaciones listas</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Plantillas para cargar rapidamente combinaciones utiles de consulta.</div>
                </div>
                <select value={preparationCategory} onChange={e => setPreparationCategory(e.target.value)} style={{ ...inputBase, width: 220 }}>
                  <option value="desayunos_mexicanos">Desayunos mexicanos</option>
                  <option value="comidas_mexicanas">Comidas mexicanas</option>
                  <option value="colaciones">Colaciones</option>
                  <option value="cenas_ligeras">Cenas ligeras</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
                {ALL_PREPARATION_TEMPLATES.filter(item => item.categoria === preparationCategory).map(template => (
                  <div key={template.id} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{template.nombre}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>Se asigna a: {MEAL_SLOTS.find(slot => slot.id === template.tiempo)?.label}</div>
                      </div>
                      <button onClick={() => applyPreparationTemplate(template)} style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: 8, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Usar</button>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10, lineHeight: 1.6 }}>{template.nota}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{template.alimentos.map(item => <span key={item} style={tagInfo}>{item}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Tiempos de comida</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 }}>
                {MEAL_SLOTS.map(slot => (
                  <div key={slot.id} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 14, minHeight: 180 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 10 }}>{slot.label}</div>
                    {mealAssignments[slot.id]?.length ? (
                      <div style={{ display: "grid", gap: 8 }}>
                        {mealAssignments[slot.id].map(name => {
                          const food = allFoods.find(item => item.name === name);
                          return (
                            <div key={name} style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 10, padding: 10 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 800 }}>{name}</div>
                                <button onClick={() => removeFoodFromMeal(name, slot.id)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontWeight: 800, fontFamily: "inherit" }}>Quitar</button>
                              </div>
                              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>{food?.porcion}</div>
                              <div style={{ fontSize: 10, color: "#2563eb", marginTop: 6 }}>{getFoodRecipe(food || { name })}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <div style={{ fontSize: 11, color: "#6b7280" }}>Sin alimentos asignados.</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #dbe7f1", fontWeight: 800, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Catalogo completo</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>Renderizando {visibleFoods.length} filas</span>
              </div>
              <div style={{ maxHeight: 560, overflow: "auto" }}>
                <table style={tableBase}>
                  <thead>
                    <tr style={{ ...tableHeadRow, position: "sticky", top: 0 }}>
                      {["Alimento", "Grupo", "Porcion", "Equivalente", "Kcal", "Prot", "CHO", "Grasa", "Tiempo"].map(header => (
                        <th key={header} style={{ ...tableHeadCell, padding: "13px 18px" }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleFoods.map((food, index) => (
                      <tr key={`${food.name}-${index}`} style={{ ...tableBodyRow, background: selectedFoods.includes(food.name) ? "#ecfdf5" : tableBodyRow.background }}>
                        <td style={{ padding: "13px 18px", fontSize: 13, fontWeight: 700 }}>{food.name}</td>
                        <td style={{ padding: "13px 18px", fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{food.grupo}</td>
                        <td style={{ padding: "13px 18px", fontSize: 13, color: "#64748b" }}>{food.porcion}</td>
                        <td style={{ padding: "13px 18px", fontSize: 12, color: "#6b7280" }}>{food.intercambio}</td>
                        <td style={{ padding: "13px 18px", color: "#15803d" }}>{food.kcal}</td>
                        <td style={{ padding: "13px 18px", color: "#22c55e" }}>{food.prot}g</td>
                        <td style={{ padding: "13px 18px", color: "#3b82f6" }}>{food.carbs}g</td>
                        <td style={{ padding: "13px 18px", color: "#f59e0b" }}>{food.fat}g</td>
                        <td style={{ padding: "13px 18px", fontSize: 11, color: "#64748b" }}>{food.tiempos.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {section === "seguimiento" && (
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Seguimiento</h1>
              <select value={selectedPatient?.id || ""} onChange={e => { const patient = patients.find(item => String(item.id) === e.target.value); if (patient) setSelectedPatient(patient); }} style={{ ...inputBase, width: 220 }}>
                {patients.map(patient => <option key={patient.id} value={patient.id}>{patient.nombre} {patient.apellidos}</option>)}
              </select>
            </div>
            {!selectedPatient ? <EmptyState icon="◔" title="Sin paciente" sub="Selecciona un paciente para registrar seguimiento." /> : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
                  {latestCheckin ? [
                    { label: "Energia", value: latestCheckin.energia },
                    { label: "Sueño", value: latestCheckin.sueno },
                    { label: "Digestion", value: latestCheckin.digestion },
                    { label: "Adherencia", value: latestCheckin.adherencia },
                    { label: "Entrenamiento", value: latestCheckin.entrenamiento },
                  ].map(card => (
                    <div key={card.label} style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{card.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 900 }}>{card.value}/5</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Ultimo check-in {latestCheckin.fecha}</div>
                    </div>
                  )) : (
                    <div style={{ gridColumn: "1 / -1", background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, padding: 16, fontSize: 12, color: "#6b7280" }}>
                      Aun no hay check-ins guardados para generar resumen rapido.
                    </div>
                  )}
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 18, marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Alertas automáticas de adherencia</div>
                  {adherenceAlerts.length ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      {adherenceAlerts.map((alert, index) => (
                        <div key={`${alert.title}-${index}`} style={{ background: "#f8fbfe", border: "1px solid #dbe7f1", borderRadius: 12, padding: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: alert.tone, marginBottom: 6 }}>{alert.level} · {alert.title}</div>
                          <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>{alert.note}</div>
                        </div>
                      ))}
                    </div>
                  ) : <div style={{ fontSize: 12, color: "#6b7280" }}>Sin alertas relevantes con el último check-in y el último journaling.</div>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>{editingCheckinId ? "Editar check-in" : "Nuevo check-in"}</div>
                  <FInput label="Fecha" type="date" value={checkinForm.fecha} onChange={e => setCheckinForm(prev => ({ ...prev, fecha: e.target.value }))} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <FInput label="Energia (1-5)" type="number" value={checkinForm.energia} onChange={e => setCheckinForm(prev => ({ ...prev, energia: e.target.value }))} />
                    <FInput label="Sueño (1-5)" type="number" value={checkinForm.sueno} onChange={e => setCheckinForm(prev => ({ ...prev, sueno: e.target.value }))} />
                    <FInput label="Digestion (1-5)" type="number" value={checkinForm.digestion} onChange={e => setCheckinForm(prev => ({ ...prev, digestion: e.target.value }))} />
                    <FInput label="Adherencia (1-5)" type="number" value={checkinForm.adherencia} onChange={e => setCheckinForm(prev => ({ ...prev, adherencia: e.target.value }))} />
                    <FInput label="Entrenamiento (1-5)" type="number" value={checkinForm.entrenamiento} onChange={e => setCheckinForm(prev => ({ ...prev, entrenamiento: e.target.value }))} />
                  </div>
                  <FTextarea label="Notas" value={checkinForm.notas} onChange={e => setCheckinForm(prev => ({ ...prev, notas: e.target.value }))} rows={3} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveCheckin} style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{savingCheckin ? "Guardando..." : editingCheckinId ? "Actualizar" : "Guardar check-in"}</button>
                    {editingCheckinId && <button onClick={() => { setEditingCheckinId(null); setCheckinForm({ fecha: new Date().toISOString().split("T")[0], energia: "3", sueno: "3", digestion: "3", adherencia: "3", entrenamiento: "3", notas: "" }); }} style={{ ...buttonNeutral, padding: "10px 14px", fontWeight: 800 }}>Cancelar</button>}
                  </div>
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Historial de check-ins</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {patientCheckins.length ? patientCheckins.map(item => (
                      <div key={item.id} style={{ ...panelSoft, padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>{item.fecha}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Energia {item.energia} · Sueño {item.sueno} · Digestion {item.digestion} · Adherencia {item.adherencia} · Entrenamiento {item.entrenamiento}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => editCheckin(item)} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                            <button onClick={() => deleteCheckin(item.id)} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Borrar</button>
                          </div>
                        </div>
                        {item.notas && <div style={{ fontSize: 12, color: "#475569" }}>{item.notas}</div>}
                      </div>
                    )) : <EmptyState icon="◔" title="Sin check-ins" sub="Guarda el primer seguimiento semanal." />}
                  </div>
                </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16, marginTop: 16 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>{editingJournalId ? "Editar journaling diario" : "Nuevo journaling diario"}</div>
                    <FInput label="Fecha" type="date" value={journalForm.fecha} onChange={e => setJournalForm(prev => ({ ...prev, fecha: e.target.value }))} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <FInput label="Hambre (1-5)" type="number" value={journalForm.hambre} onChange={e => setJournalForm(prev => ({ ...prev, hambre: e.target.value }))} />
                      <FInput label="Saciedad (1-5)" type="number" value={journalForm.saciedad} onChange={e => setJournalForm(prev => ({ ...prev, saciedad: e.target.value }))} />
                      <FInput label="Sueño (horas)" type="number" value={journalForm.sueno_horas} onChange={e => setJournalForm(prev => ({ ...prev, sueno_horas: e.target.value }))} />
                      <FInput label="Adherencia (1-5)" type="number" value={journalForm.adherencia} onChange={e => setJournalForm(prev => ({ ...prev, adherencia: e.target.value }))} />
                      <FInput label="Agua (L)" type="number" value={journalForm.agua_litros} onChange={e => setJournalForm(prev => ({ ...prev, agua_litros: e.target.value }))} />
                      <FInput label="Entrenamiento" value={journalForm.entrenamiento} onChange={e => setJournalForm(prev => ({ ...prev, entrenamiento: e.target.value }))} placeholder="Fuerza, descanso, carrera..." />
                    </div>
                    <FTextarea label="Síntomas" value={journalForm.sintomas} onChange={e => setJournalForm(prev => ({ ...prev, sintomas: e.target.value }))} rows={2} placeholder="Digestión, apetito, antojos, inflamación, malestar..." />
                    <FTextarea label="Notas" value={journalForm.notas} onChange={e => setJournalForm(prev => ({ ...prev, notas: e.target.value }))} rows={3} placeholder="Observaciones del día y adherencia real." />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveJournalEntry} style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{savingJournal ? "Guardando..." : editingJournalId ? "Actualizar journal" : "Guardar journal"}</button>
                    {editingJournalId && <button onClick={() => { setEditingJournalId(null); setJournalForm({ fecha: new Date().toISOString().split("T")[0], hambre: "3", saciedad: "3", sintomas: "", sueno_horas: "7.0", entrenamiento: "", adherencia: "3", agua_litros: "2.0", notas: "" }); }} style={{ ...buttonNeutral, padding: "10px 14px", fontWeight: 800 }}>Cancelar</button>}
                    </div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Historial de journaling</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {journalEntries.length ? journalEntries.map(item => (
                        <div key={item.id} style={{ ...panelSoft, padding: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 13 }}>{item.fecha}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>Hambre {item.hambre}/5 · Saciedad {item.saciedad}/5 · Sueño {item.sueno_horas || "-"} h · Adherencia {item.adherencia}/5</div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => editJournalEntry(item)} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                              <button onClick={() => deleteJournalEntry(item.id)} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Borrar</button>
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
                            {item.entrenamiento ? <div><strong>Entrenamiento:</strong> {item.entrenamiento}</div> : null}
                            {item.sintomas ? <div><strong>Síntomas:</strong> {item.sintomas}</div> : null}
                            {item.agua_litros != null ? <div><strong>Agua:</strong> {item.agua_litros} L</div> : null}
                            {item.notas ? <div><strong>Notas:</strong> {item.notas}</div> : null}
                          </div>
                        </div>
                      )) : <EmptyState icon="◔" title="Sin journaling" sub="Guarda el primer registro diario del paciente." />}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {section === "portal" && (
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Portal Paciente</h1>
              <select value={selectedPatient?.id || ""} onChange={e => { const patient = patients.find(item => String(item.id) === e.target.value); if (patient) setSelectedPatient(patient); }} style={{ ...inputBase, width: 220 }}>
                {patients.map(patient => <option key={patient.id} value={patient.id}>{patient.nombre} {patient.apellidos}</option>)}
              </select>
            </div>
	            {!selectedPatient ? <EmptyState icon="▣" title="Sin paciente" sub="Selecciona un paciente para ver su portal." /> : (
	              <div style={{ background: "#f8fafc", color: "#0f172a", borderRadius: 18, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>Hola, {selectedPatient.nombre}</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Objetivo: {selectedPatient.objetivo || "Sin objetivo"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800 }}>L.N. Jesus</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Portal paciente</div>
                  </div>
                </div>
	                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
	                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
	                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Semana actual</div>
	                    <div style={{ display: "grid", gap: 10 }}>
                      {WEEK_DAYS.map(day => (
                        <div key={day} style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>{day}</div>
                          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>{WEEKLY_MEAL_SLOTS.map(slot => `${slot.label}: ${weeklyPlan[day][slot.id] || "Sin asignar"}`).join(" · ")}</div>
                        </div>
	                      ))}
	                    </div>
	                  </div>
	                  <div style={{ display: "grid", gap: 16 }}>
	                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
	                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
	                        <div>
	                          <div style={{ fontWeight: 800, fontSize: 14 }}>Cumplimiento de hoy</div>
	                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{todayWeekDay} · Plan {planScopeLabel.toLowerCase()}</div>
	                        </div>
	                        <div style={{ fontSize: 22, fontWeight: 900, color: "#0f766e" }}>{portalCompletionPct}%</div>
	                      </div>
	                      <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden", marginBottom: 14 }}>
	                        <div style={{ width: `${portalCompletionPct}%`, height: "100%", background: "linear-gradient(90deg,#38bdf8,#22c55e)" }} />
	                      </div>
	                      <div style={{ display: "grid", gap: 10 }}>
	                        {portalTodayMeals.map(meal => {
	                          const currentStatus = portalMealStatuses[meal.key] || "";
	                          const statusMeta = PORTAL_MEAL_STATUS_OPTIONS.find(item => item.value === currentStatus);
	                          return (
	                          <div key={meal.key} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: statusMeta?.bg || "#f8fafc" }}>
	                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
	                              <div>
	                                <div style={{ fontWeight: 800, fontSize: 13 }}>{meal.label}</div>
	                                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{meal.value || "Sin asignar por ahora"}</div>
                                  {meal.recipe ? (
                                    <div style={{ marginTop: 8, fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
                                      <div><strong>Ingredientes:</strong> {meal.recipe.ingredientes.map(item => `${item.item} (${item.cantidad})`).join(" · ")}</div>
                                      <div style={{ marginTop: 6 }}><strong>Pasos:</strong> {meal.recipe.pasos.join(" ")}</div>
                                      <div style={{ marginTop: 6 }}><strong>Sustituciones:</strong> {meal.recipe.sustituciones?.length ? meal.recipe.sustituciones.map(item => `${item.original || "Alternativa"}: ${(item.opciones || []).join(", ")}`).join(" · ") : "Sin sustituciones cargadas"}</div>
                                    </div>
                                  ) : null}
	                              </div>
                                <div style={{ display: "grid", gap: 6 }}>
                                  {PORTAL_MEAL_STATUS_OPTIONS.map(status => (
                                    <button
                                      key={status.value}
                                      onClick={() => meal.value && setPortalMealStatus(todayWeekDay, meal.id, status.value)}
                                      disabled={!meal.value}
                                      style={{
                                        background: currentStatus === status.value ? status.bg : "#fff",
                                        color: currentStatus === status.value ? status.color : "#475569",
                                        border: `1px solid ${currentStatus === status.value ? status.color : "#dbe7f1"}`,
                                        borderRadius: 999,
                                        padding: "8px 12px",
                                        fontSize: 11,
                                        fontWeight: 800,
                                        cursor: meal.value ? "pointer" : "not-allowed",
                                        opacity: meal.value ? 1 : 0.55,
                                        fontFamily: "inherit",
                                      }}
                                    >
                                      {status.label}
                                    </button>
                                  ))}
                                </div>
	                            </div>
                              {currentStatus ? <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: statusMeta?.color || "#475569" }}>Estado: {statusMeta?.label || currentStatus}</div> : null}
	                          </div>
	                        )})}
	                      </div>
	                    </div>
	                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
	                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Resumen rapido</div>
	                      <div style={{ display: "grid", gap: 8, fontSize: 12, color: "#475569" }}>
	                        <div>Comidas asignadas: {totalAssignedMeals}</div>
	                        <div>Recetas activas: {weeklyRecipes.length}</div>
	                        <div>Items de compra: {totalGroceryItems}</div>
	                        <div>Ultimo seguimiento: {latestCheckin?.fecha || "Sin dato"}</div>
	                        <div>Alertas activas: {adherenceAlerts.length}</div>
	                        <div>Periodo del plan: {planScopeLabel}</div>
	                      </div>
	                    </div>
	                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
	                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Próximos recordatorios</div>
	                      {portalUpcomingReminders.length ? (
	                        <div style={{ display: "grid", gap: 10 }}>
	                          {portalUpcomingReminders.map(item => (
	                            <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
	                              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
	                                <div style={{ fontWeight: 800, fontSize: 12 }}>{item.titulo}</div>
	                                <div style={{ fontSize: 11, color: "#64748b" }}>{item.canal}</div>
	                              </div>
	                              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{item.fecha} {item.hora ? `· ${item.hora}` : ""}</div>
	                              {item.nota ? <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{item.nota}</div> : null}
	                            </div>
	                          ))}
	                        </div>
	                      ) : <div style={{ fontSize: 12, color: "#64748b" }}>No hay recordatorios pendientes.</div>}
	                    </div>
	                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
	                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Lista de compras</div>
                      <div style={{ display: "grid", gap: 10 }}>
                        {groceryList.length ? groceryList.map(group => (
                          <div key={group.grupo}>
                            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "capitalize", marginBottom: 4 }}>{group.grupo}</div>
                            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{group.items.join(" · ")}</div>
                          </div>
                        )) : <div style={{ fontSize: 12, color: "#64748b" }}>Aun no hay compras generadas.</div>}
                      </div>
                    </div>
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Indicaciones rapidas</div>
                      <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8 }}>{latestDietCalculation?.nota_macros || "Mantener horarios consistentes, hidratacion y seguimiento semanal."}</div>
                    </div>
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Seguimiento</div>
                      {latestCheckin ? (
                        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8 }}>
                          {latestCheckin.fecha} · Energia {latestCheckin.energia}/5 · Sueño {latestCheckin.sueno}/5 · Digestion {latestCheckin.digestion}/5 · Adherencia {latestCheckin.adherencia}/5
                          {latestCheckin.notas ? <div style={{ marginTop: 8 }}>{latestCheckin.notas}</div> : null}
                        </div>
                      ) : <div style={{ fontSize: 12, color: "#64748b" }}>Aun no hay seguimiento registrado.</div>}
                    </div>
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Journaling diario</div>
                      {latestJournalEntry ? (
                        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8 }}>
                          {latestJournalEntry.fecha} · Hambre {latestJournalEntry.hambre}/5 · Saciedad {latestJournalEntry.saciedad}/5 · Sueño {latestJournalEntry.sueno_horas || "-"} h · Adherencia {latestJournalEntry.adherencia}/5
                          {latestJournalEntry.entrenamiento ? <div style={{ marginTop: 8 }}>Entrenamiento: {latestJournalEntry.entrenamiento}</div> : null}
                          {latestJournalEntry.sintomas ? <div style={{ marginTop: 8 }}>Síntomas: {latestJournalEntry.sintomas}</div> : null}
                        </div>
                      ) : <div style={{ fontSize: 12, color: "#64748b" }}>Aun no hay journaling diario registrado.</div>}
                    </div>
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Resumen ADIME</div>
                      {latestAdimeConsulta ? (
                        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8 }}>
                          <div><strong>Valoración:</strong> {latestAdimeConsulta.adime_valoracion || "Sin registro"}</div>
                          <div style={{ marginTop: 8 }}><strong>Diagnóstico:</strong> {latestAdimeConsulta.adime_diagnostico || latestAdimeConsulta.diagnostico_nutricional || "Sin registro"}</div>
                          <div style={{ marginTop: 8 }}><strong>Intervención:</strong> {latestAdimeConsulta.adime_intervencion || latestAdimeConsulta.indicaciones || "Sin registro"}</div>
                        </div>
                      ) : <div style={{ fontSize: 12, color: "#64748b" }}>Aun no hay nota ADIME registrada.</div>}
                    </div>
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Alertas de adherencia</div>
                      {adherenceAlerts.length ? (
                        <div style={{ display: "grid", gap: 8 }}>
                          {adherenceAlerts.map((alert, index) => (
                            <div key={`${alert.title}-${index}`} style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
                              <strong style={{ color: alert.tone }}>{alert.level}</strong> · {alert.title}
                              <div>{alert.note}</div>
                            </div>
                          ))}
                        </div>
                      ) : <div style={{ fontSize: 12, color: "#64748b" }}>Sin alertas relevantes por ahora.</div>}
                    </div>
                  </div>
                </div>
                {weeklyRecipes.length > 0 && (
                  <div style={{ marginTop: 16, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Recetas de la semana</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                      {weeklyRecipes.map(recipe => (
                        <div key={recipe.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>{recipe.nombre}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>{recipe.mealType} · {recipe.dishType}</div>
                          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>{recipe.ingredientes.map(item => `${item.item} (${item.cantidad})`).join(" · ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {section === "agenda" && (
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Agenda y Recordatorios</h1>
              <select value={selectedPatient?.id || ""} onChange={e => { const patient = patients.find(item => String(item.id) === e.target.value); if (patient) setSelectedPatient(patient); }} style={{ ...inputBase, width: 220 }}>
                {patients.map(patient => <option key={patient.id} value={patient.id}>{patient.nombre} {patient.apellidos}</option>)}
              </select>
            </div>
            {!selectedPatient ? <EmptyState icon="◷" title="Sin paciente" sub="Selecciona un paciente para gestionar su agenda." /> : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Pendientes</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{agendaItems.filter(item => !item.completado).length}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>recordatorios activos</div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Completados</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{agendaItems.filter(item => item.completado).length}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>eventos cerrados</div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Proximo</div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>{upcomingAgenda[0]?.fecha || "Sin fecha"}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{upcomingAgenda[0]?.titulo || "Sin recordatorios"}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>{editingAgendaId ? "Editar recordatorio" : "Nuevo recordatorio"}</div>
                  <FInput label="Titulo" value={agendaForm.titulo} onChange={e => setAgendaForm(prev => ({ ...prev, titulo: e.target.value }))} placeholder="Seguimiento de adherencia" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <FInput label="Fecha" type="date" value={agendaForm.fecha} onChange={e => setAgendaForm(prev => ({ ...prev, fecha: e.target.value }))} />
                    <FInput label="Hora" type="time" value={agendaForm.hora} onChange={e => setAgendaForm(prev => ({ ...prev, hora: e.target.value }))} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <FSelect label="Tipo" value={agendaForm.tipo} onChange={e => setAgendaForm(prev => ({ ...prev, tipo: e.target.value }))} options={[{ value: "consulta", label: "Consulta" }, { value: "seguimiento", label: "Seguimiento" }, { value: "laboratorio", label: "Laboratorio" }, { value: "plan", label: "Plan alimenticio" }]} />
                    <FSelect label="Canal" value={agendaForm.canal} onChange={e => setAgendaForm(prev => ({ ...prev, canal: e.target.value }))} options={[{ value: "interno", label: "Interno" }, { value: "email", label: "Email" }, { value: "whatsapp", label: "WhatsApp" }]} />
                  </div>
                  <FTextarea label="Nota" value={agendaForm.nota} onChange={e => setAgendaForm(prev => ({ ...prev, nota: e.target.value }))} rows={3} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveAgenda} style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{savingAgenda ? "Guardando..." : editingAgendaId ? "Actualizar" : "Guardar recordatorio"}</button>
                    {editingAgendaId && <button onClick={() => { setEditingAgendaId(null); setAgendaForm({ titulo: "", fecha: new Date().toISOString().split("T")[0], hora: "09:00", tipo: "consulta", canal: "interno", nota: "" }); }} style={{ ...buttonNeutral, padding: "10px 14px", fontWeight: 800 }}>Cancelar</button>}
                  </div>
                </div>
                <div style={{ background: "#ffffff", border: "1px solid #dbe7f1", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Agenda del paciente</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {agendaItems.length ? agendaItems.map(item => (
                      <div key={item.id} style={{ ...panelSoft, padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>{item.titulo}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{item.fecha} {item.hora ? `· ${item.hora}` : ""} · {item.tipo} · {item.canal}</div>
                            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>Estado de envio: {item.estado_envio || "no_aplica"}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button onClick={() => toggleAgendaCompleted(item)} style={{ background: item.completado ? "#22c55e" : "#eefbf3", color: item.completado ? "#000" : "#15803d", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{item.completado ? "Completado" : "Marcar"}</button>
                            <button onClick={() => editAgendaItem(item)} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                            <button onClick={() => deleteAgendaItem(item.id)} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Borrar</button>
                          </div>
                        </div>
                        {item.nota && <div style={{ fontSize: 12, color: "#475569" }}>{item.nota}</div>}
                      </div>
                    )) : <EmptyState icon="◷" title="Sin recordatorios" sub="Guarda el primer recordatorio del paciente." />}
                  </div>
                </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
