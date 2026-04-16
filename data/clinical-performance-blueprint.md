# Base Clinica + Performance

Este archivo resume la propuesta compartida por el usuario para una base profesional hibrida:

- Motor clinico: diabetes, obesidad, TCA, sindrome metabolico.
- Motor deportivo: hipertrofia, definicion, resistencia, sprint/potencia.
- Motor adaptativo: ajuste de macros, sustituciones y adherencia.

## Tablas sugeridas

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  weight numeric,
  height numeric,
  age int,
  goal text,
  condition text
);

create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  weight numeric,
  date date
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  calories numeric,
  protein numeric,
  carbs numeric,
  fat numeric
);
```

## CSV base incluido

El archivo `clinical-performance-dishes.csv` contiene una primera base importable con platillos:

- Clinicos
- Deportivos
- Mixtos

Columnas:

- `name`
- `category`
- `protein`
- `carbs`
- `fat`
- `kcal`
- `tags`

## Uso sugerido

1. Importar el CSV a una tabla nueva como `platillos_inteligentes`.
2. Relacionar `goal` y `condition` del paciente con `tags`.
3. Generar planes semanales filtrando por objetivo clinico y deportivo.
