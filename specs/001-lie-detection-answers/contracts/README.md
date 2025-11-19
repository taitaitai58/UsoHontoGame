# API Contracts: 嘘当て回答機能

**Feature**: Answer submission for lie detection game
**Date**: 2025-01-19

## Overview

This directory contains the API contract definitions for the answer submission feature. All contracts use Next.js Server Actions pattern rather than traditional REST endpoints.

## Server Actions

Next.js Server Actions are server-side functions that can be called directly from Client Components. They are defined in `src/app/actions/` and provide type-safe, server-side data mutations.

### Why Server Actions?

- **Type Safety**: Full TypeScript support, no manual API typing
- **Simplicity**: No need to define REST routes, just async functions
- **Built-in Features**: CSRF protection, automatic serialization
- **Co-location**: Actions can be defined near the components that use them

## Contracts in this Feature

1. [submit-answer.md](./submit-answer.md) - Submit or update participant answer
2. [get-game-for-answers.md](./get-game-for-answers.md) - Fetch game data for answer screen
3. [validate-game-for-answers.md](./validate-game-for-answers.md) - Validate game eligibility for answers

## References

- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Feature Specification: [../spec.md](../spec.md)
- Data Model: [../data-model.md](../data-model.md)
