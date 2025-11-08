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
