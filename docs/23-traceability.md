# 23 · Matriz de trazabilidad

> Cadena **objetivo → requisito → regla → pantalla → flujo → criterio de aceptación → prueba**. Permite comprobar que todo objetivo está cubierto por requisitos, que toda regla se implementa en algún requisito y que todo requisito tiene prueba. Si un documento cambia, esta matriz se actualiza en el mismo cambio.
>
> Fuentes: objetivos `01-PRD.md §4` · requisitos y criterios `08` · reglas `09` · pantallas `06` · flujos `07` · pruebas `20`.

## 1. Objetivos

| ID | Objetivo | Requisitos | Flujos | Pruebas clave |
|---|---|---|---|---|
| O-01 | Comunicar identidad y propuesta | FR-001 – FR-015 | UF-01 | T-001 – T-011 |
| O-02 | Explorar menú y platillos | FR-007, FR-016 – FR-024, FR-072 | UF-02, UF-03 | T-007, T-012 – T-019, T-070 |
| O-03 | Reservar de forma guiada con mesa y disponibilidad dinámica | FR-003, FR-025 – FR-039, FR-045 | UF-04 – UF-06 | T-020 – T-039 |
| O-04 | Autogestionar la reserva | FR-040 – FR-044 | UF-07 – UF-09 | T-040 – T-045 |
| O-05 | Operar el restaurante desde el panel | FR-045, FR-049 – FR-065 | UF-10 – UF-13 | T-050 – T-063 |
| O-06 | Calidad de producto demostrable | FR-005, FR-024, FR-046 – FR-048, FR-066 – FR-072 | UF-14 | T-046 – T-049, T-064 – T-070 |

## 2. Matriz por requisito

“CA de FR-xxx” = criterio de aceptación definido en el requisito correspondiente de `08-functional-requirements.md`.

| FR | Objetivo | Reglas (BR) | Pantallas | Flujos | Criterio de aceptación | Pruebas |
|---|---|---|---|---|---|---|
| FR-001 | O-01 | — | G-01 | UF-01 | CA de FR-001 | T-001 |
| FR-002 | O-01 | — | G-01 | UF-01 | CA de FR-002 | T-002 |
| FR-003 | O-03 | — | G-01, S-01.6, S-03 | UF-04 | CA de FR-003 | T-003 |
| FR-004 | O-01 | — | S-01.1 | UF-01 | CA de FR-004 | T-004 |
| FR-005 | O-01, O-06 | — | S-01.1 | UF-01 | CA de FR-005 | T-005 |
| FR-006 | O-01 | — | S-01.2 | UF-01 | CA de FR-006 | T-006 |
| FR-007 | O-01, O-02 | BR-047 | S-01.3 | UF-01, UF-03 | CA de FR-007 | T-007 |
| FR-008 | O-01 | BR-052 | S-01.4 | UF-01 | CA de FR-008 | T-008 |
| FR-009 | O-01 | BR-052 | S-01.4 | UF-01 | CA de FR-009 | T-008 |
| FR-010 | O-01 | BR-052 | S-01.4 | UF-01 | CA de FR-010 | T-008 |
| FR-011 | O-01 | BR-052 | S-01.4 | UF-01 | CA de FR-011 | T-008 |
| FR-012 | O-01 | BR-001, BR-002 | S-01.5 | UF-01 | CA de FR-012 | T-009 |
| FR-013 | O-01 | BR-057 | S-01.5 | UF-01 | CA de FR-013 | T-010 |
| FR-014 | O-01 | BR-057 | S-01.5 | UF-01 | CA de FR-014 | T-010 |
| FR-015 | O-01 | BR-057 | G-02 | UF-01 | CA de FR-015 | T-011 |
| FR-016 | O-02 | BR-040, BR-041, BR-045 | S-02 | UF-02 | CA de FR-016 | T-012 |
| FR-017 | O-02 | BR-040 | S-02 | UF-02 | CA de FR-017 | T-013 |
| FR-018 | O-02 | BR-043, BR-049 | S-02 | UF-02 | CA de FR-018 | T-014 |
| FR-019 | O-02 | BR-044 | S-02, S-03 | UF-02 | CA de FR-019 | T-019 |
| FR-020 | O-02 | BR-045 | S-01.3, S-02, S-03 | UF-02, UF-03 | CA de FR-020 | T-015 |
| FR-021 | O-02 | BR-045, BR-046 | S-02, S-10 | UF-02, UF-03 | CA de FR-021 | T-016 |
| FR-022 | O-02 | BR-048, BR-050 | S-03 | UF-03 | CA de FR-022 | T-017 |
| FR-023 | O-02 | BR-041 | S-03 | UF-03 | CA de FR-023 | T-017 |
| FR-024 | O-02, O-06 | — | S-03 | UF-03 | CA de FR-024 | T-018 |
| FR-025 | O-03 | — | S-04 | UF-04 | CA de FR-025 | T-020 |
| FR-026 | O-03 | BR-008, BR-009 | S-04.1 | UF-04 | CA de FR-026 | T-021 |
| FR-027 | O-03 | BR-003, BR-004 | S-04.2 | UF-04 | CA de FR-027 | T-022 |
| FR-028 | O-03 | BR-001, BR-006, BR-007, BR-020 | S-04.3 | UF-04 | CA de FR-028 | T-023 |
| FR-029 | O-03 | BR-011, BR-013, BR-014 | S-04.4 | UF-05 | CA de FR-029 | T-024 |
| FR-030 | O-03 | BR-012 | S-04.4 | UF-05 | CA de FR-030 | T-024 |
| FR-031 | O-03 | BR-010, BR-016 | S-04.4 | UF-05 | CA de FR-031 | T-025, T-026 |
| FR-032 | O-03 | BR-017, BR-018, BR-026 | S-04.5 | UF-04 | CA de FR-032 | T-027 |
| FR-033 | O-03 | BR-025 | S-04.6 | UF-04 | CA de FR-033 | T-028 |
| FR-034 | O-03 | BR-022 | S-04.7 | UF-04 | CA de FR-034 | T-029 |
| FR-035 | O-03 | BR-027, BR-028, BR-030 | S-04.7, S-05 | UF-06 | CA de FR-035 | T-030, T-037, T-039 |
| FR-036 | O-03 | BR-022, BR-023 | S-04.4, S-04.7 | UF-06 | CA de FR-036 | T-031, T-032 |
| FR-037 | O-03 | BR-020, BR-024 | S-04.3 | UF-04 | CA de FR-037 | T-033 |
| FR-038 | O-03 | BR-001, BR-006, BR-007 | S-04.3 | UF-04 | CA de FR-038 | T-034, T-035 |
| FR-039 | O-03 | BR-010 | S-04 | UF-04 | CA de FR-039 | T-038 |
| FR-040 | O-04 | BR-031 | S-06 | UF-07 | CA de FR-040 | T-040 |
| FR-041 | O-04 | BR-029, BR-032 | S-07 | UF-07 | CA de FR-041 | T-041 |
| FR-042 | O-04 | BR-032, BR-033, BR-034, BR-035 | S-08 | UF-08 | CA de FR-042 | T-042, T-043 |
| FR-043 | O-04 | BR-032, BR-036 | S-09 | UF-09 | CA de FR-043 | T-044 |
| FR-044 | O-04 | BR-036 | S-09 | UF-09 | CA de FR-044 | T-045 |
| FR-045 | O-03, O-05 | BR-005, BR-019, BR-020, BR-021 | S-04.3, S-04.4, A-02, A-05 | UF-04, UF-05, UF-11 | CA de FR-045 | T-036 |
| FR-046 | O-06 | BR-054, BR-055 | Global (G-05) | UF-14 | CA de FR-046 | T-046, T-049 |
| FR-047 | O-06 | BR-021 | Global | UF-11 | CA de FR-047 | T-047 |
| FR-048 | O-06 | BR-055, BR-056 | G-03, A-02 | UF-14 | CA de FR-048 | T-048 |
| FR-049 | O-05 | BR-053 | A-01 | UF-10 | CA de FR-049 | T-050 |
| FR-050 | O-05 | BR-053 | A-01 | UF-10 | CA de FR-050 | T-051 |
| FR-051 | O-05 | BR-019 | A-02 | UF-11 | CA de FR-051 | T-052 |
| FR-052 | O-05 | BR-013 | A-02 | UF-11, UF-13 | CA de FR-052 | T-053 |
| FR-053 | O-05 | BR-038, BR-039 | A-03 | UF-11 | CA de FR-053 | T-054 |
| FR-054 | O-05 | BR-029 | A-04 | UF-11 | CA de FR-054 | T-055 |
| FR-055 | O-05 | BR-029, BR-037 | A-04 | UF-11 | CA de FR-055 | T-056 |
| FR-056 | O-05 | BR-033, BR-034, BR-035, BR-037 | A-05 | UF-11 | CA de FR-056 | T-057 |
| FR-057 | O-05 | BR-036, BR-037 | A-04 | UF-11 | CA de FR-057 | T-058 |
| FR-058 | O-05 | BR-040, BR-041 | A-06 | UF-12 | CA de FR-058 | T-059 |
| FR-059 | O-05 | BR-041, BR-042 | A-07 | UF-12 | CA de FR-059 | T-059 |
| FR-060 | O-05 | BR-042, BR-048 | A-07 | UF-12 | CA de FR-060 | T-059 |
| FR-061 | O-05 | BR-045 | A-06 | UF-12 | CA de FR-061 | T-060 |
| FR-062 | O-05 | BR-045 | A-06 | UF-12 | CA de FR-062 | T-060 |
| FR-063 | O-05 | BR-046, BR-047 | A-06, A-08 | UF-12 | CA de FR-063 | T-061 |
| FR-064 | O-05 | BR-050, BR-051 | A-07 | UF-12 | CA de FR-064 | T-062 |
| FR-065 | O-05 | BR-012, BR-015, BR-038 | A-02, A-09, A-10 | UF-13 | CA de FR-065 | T-063 |
| FR-066 | O-06 | — | Todas | Todos | CA de FR-066 | T-064 |
| FR-067 | O-06 | — | Todas (G-04) | Todos | CA de FR-067 | T-065 |
| FR-068 | O-06 | BR-057 | G-03 | UF-14 | CA de FR-068 | T-066 |
| FR-069 | O-06 | — | G-02, S-01.1, S-03 | Todos | CA de FR-069 | T-005, T-067 |
| FR-070 | O-06 | — | Todas | Todos | CA de FR-070 | T-068 |
| FR-071 | O-06 | — | Todas | Todos | CA de FR-071 | T-069 |
| FR-072 | O-02, O-06 | — | S-10 | UF-03 | CA de FR-072 | T-070 |

## 3. Casos límite → pruebas

| Casos límite (`12`) | Pruebas |
|---|---|
| EC-01, EC-02 | T-033 |
| EC-03 | T-034 |
| EC-04, EC-05, EC-07 | T-035 |
| EC-06, EC-08 | T-023 |
| EC-10 – EC-12 | T-024, T-025 |
| EC-13 | T-021 |
| EC-14, EC-15 | T-029, T-038 |
| EC-16, EC-17 | T-063 |
| EC-18, EC-20, EC-21, EC-26 | T-031, T-032 |
| EC-22 – EC-24 | T-039 |
| EC-25, EC-49 | T-037 |
| EC-30 – EC-38 | T-027, T-028 |
| EC-40 – EC-43 | T-040 |
| EC-44, EC-45 | T-041 |
| EC-46 – EC-48, EC-50, EC-51 | T-042 – T-044, T-047 |
| EC-60 – EC-66 | T-046, T-048, T-049, T-062 |
| EC-70 – EC-83 | T-050 – T-063 |
| EC-90 – EC-96 | T-005, T-010, T-065, T-070 |

## 4. Comprobaciones de cobertura

| Comprobación | Resultado |
|---|---|
| Todo objetivo tiene al menos un requisito y una prueba | ✔ O-01 – O-06 |
| Toda regla BR-001 – BR-057 aparece en al menos un requisito | ✔ 57/57 |
| Todo requisito FR-001 – FR-072 tiene criterio de aceptación y al menos una prueba | ✔ 72/72 |
| Toda prueba T-001 – T-070 se origina en al menos un requisito | ✔ 70/70 |
| Todo flujo UF-01 – UF-14 está asociado a requisitos | ✔ 14/14 |
| Toda pantalla del mapa del sitio (`05 §1`) tiene al menos un requisito | ✔ (G-04 vía FR-067; G-05 vía FR-046) |
