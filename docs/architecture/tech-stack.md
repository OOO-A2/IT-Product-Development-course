---
layout: default
nav_order: 1
parent: "Architecture"
title: "Tech Stack"
---

# Tech Stack

## Frontend

- React - modern UI Library, huge ecosystem and community support, stable and known as easy to build web apps;
- Vite build tool - modern and lightweight, proides fast dev server with hot module replacement, easy customization;
- Typescript - superset of JavaScript, provides type safety for better IDE interaction and less error prone;
- Possible extensions:
    - Redux - modern state management used with react;
    - Router - most popular React routing solution;
    - Tailwind CSS - rapid and consistend design.

## Backend

- Python 3.11+ – mature, familiar language with rich ecosystem, great support for FastAPI, async I/O, testing, and deployment in self-hosted environments;
- FastAPI – modern, high-performance async web framework with type hints and automatic OpenAPI docs, ideal for a clean REST API for auth, teams, pairings, grading, and reviews;
- Pydantic – robust data validation and serialization layer for request/response models, ensuring consistent schemas for grades, teams, and assignments;
- Uvicorn – lightweight ASGI server well-suited for FastAPI, simple to run in Docker and sufficient for expected traffic;
- SQLAlchemy – ORM and query toolkit on top of PostgreSQL, keeps domain logic explicit and maintainable without scattering raw SQL;
- Alembic – schema migration tool integrated with SQLAlchemy, used to evolve DB schema safely as requirements change;


## Database

- PostgreSQL – reliable relational database for users, teams, assignments, pairings, grades, and file metadata, easy to host on-prem and widely supported;

## Testing
We use pytest as our primary testing framework. It was chosen because:

- It has a clean, minimal syntax and is easy to scale.
- It supports fixtures, parametrization, and plugins out of the box.
- It integrates seamlessly with pytest-cov for coverage measurement.
- It is the most widely adopted testing tool in modern Python backend development.

## Unit tests

### Location and naming conventions:
- All backend unit tests are located in:  
  `backend/peer-pilot/tests/`
- Test files must be named:  
  `test_*.py`
- Test functions must start with:  
  `test_`
- API-level tests are grouped under:  
  `backend/peer-pilot/tests/api/`
- Shared fixtures are placed in:  
  `tests/conftest.py`

---

### How to run unit tests
- From the backend root:
`pytest`
- Run a specific test file:
`pytest tests/test_example.py`
- Run a single test:
`pytest tests/test_example.py::test_specific_case`

---

### How to generate a coverage report
Generate terminal + XML coverage output:
`pytest --cov=app --cov-report=xml --cov-report=term`


This produces:
`coverage.xml`

The XML file is used by CI to evaluate coverage levels.

---

### How to adjust minimum coverage thresholds
The minimum threshold is defined in `pytest.ini`:
--cov-fail-under=30
To increase or decrease it, simply update the value:


CI also reads the same number from the generated XML report for validation.

---

### Why this coverage report format?
- **XML** is compatible with modern CI systems, such as GitHub Actions, Codecov, and SonarQube.
- It is the **standard output format** for pytest-cov, requiring no extra tooling.
- It allows CI to **parse precise numeric coverage values**.
- Developers still get immediate feedback through **terminal reports**.

This format strikes a balance between human readability and automation compatibility.

---

### Why these minimum coverage thresholds?
Current threshold: **30%**.

Chosen because:
- The project is still in early development.
- Some modules (schemas, ORM models) have inherently low ROI for testing.
- It prevents completely untested code while allowing rapid iteration.
- It offers a **baseline quality floor** without slowing the team.

---

### Coverage thresholds planned for MVP
Expected overall target: **60–70%**

Module-specific targets:

| Module Area               | Target |
|---------------------------|--------|
| Business logic/services   | 80–90% |
| Scoring/aggregation       | 70–80% |
| API endpoints             | 50–60% |
| Database models/ORM       | 10–20% |

These levels reflect:
- Core logic → must be highly reliable  
- API → moderate safety requirement  
- Models → stable, low failure risk  

---

### Modules selected for unit tests and why
The following modules were prioritized:

- **Grade aggregation logic**
  - High complexity  
  - Direct impact on user grades  
- **Dashboard composition**
  - Integrates multiple datasets  
  - Changes often  
- **Peer review scoring**
  - Core business logic  
  - Direct customer impact  
- **Team/student relational logic**
  - Sensitive to regression  
- **Endpoint contract tests**
  - `/dashboard`, `/grades`  
  - Provide user-facing functionality  
  - Must stay stable

Modules were selected based on:
- Complexity  
- Change frequency  
- Customer importance  
- Risk of regression  

---


