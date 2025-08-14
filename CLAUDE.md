# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library that parses and executes "Niwango" (ニワン語) - a specialized scripting language used in video comments. The library is built as a UMD module and distributed as @xpadev-net/niwango-core.

## Development Commands

### Building
- `npm run build` - Complete build (removes dist/, builds TS and DTS files)
- `npm run build:ts` - Build TypeScript using Rollup
- `npm run build:dts` - Build type definitions and resolve path aliases
- `npm run watch` - Development build with file watching

### Code Quality
- `npm run lint` - Run ESLint and TypeScript type checking
- `npm run lint:fix` - Auto-fix formatting, ESLint issues, and run type check
- `npm run check-types` - TypeScript type checking only
- `npm run eslint` - ESLint only
- `npm run eslint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run Jest tests (uses jsdom environment)

### Parser Generation
- `npm run pegjs` - Generate parser.js from niwango.pegjs grammar using Peggy

### Documentation
- `npm run typedoc` - Generate TypeDoc documentation

## Architecture

### Core Components

1. **Parser Layer** (`src/parser/`, `src/grammar/`)
   - `niwango.pegjs` - PEG.js grammar file defining Niwango syntax (based on JavaScript grammar)
   - `parser.js` - Generated parser from grammar
   - `parse.ts` - Parser wrapper and entry point

2. **Execution Engine** (`src/executor.ts`, `src/context.ts`)
   - AST-based interpreter that processes parsed code
   - Context management for scopes and execution state
   - Recursion limit protection and error handling

3. **AST Processors** (`src/processors/`)
   - Individual processors for each AST node type (CallExpression, BinaryExpression, etc.)
   - Handles language constructs like variables, functions, expressions
   - Plugin-based architecture with processor registry

4. **Type System & Prototypes** (`src/prototype/`)
   - Built-in types: Array, Bool, Number, Object, String, Value
   - Each type has methods defined in separate files (e.g., `Array/join.ts`, `String/slice.ts`)
   - Prototype resolution and method dispatch system

5. **Built-in Functions** (`src/functions/`)
   - Language built-ins like `if`, `while_kari`, `dump`, `timethis`
   - Screen and timing related functions for video context

6. **Error System** (`src/errors/`)
   - Custom error types: `InvalidTypeError`, `NotImplementedError`, `TooMuchRecursionError`

### Key Patterns

- **Path Aliases**: Uses `@/*` for `src/*` - configured in tsconfig.json and Jest
- **Type Definitions**: Comprehensive TypeScript types in `src/@types/`
- **Processor Pattern**: Each AST node type has dedicated processor function
- **Prototype System**: Object-oriented method dispatch similar to JavaScript prototypes
- **Hook System**: Result hooks and function registration for extensibility

### Testing Strategy

- Tests in `src/__tests__/` covering language features
- Test utilities in `testUtils.ts` with `run()` helper for executing Niwango code
- Tests verify language samples from the original Niwango wiki specification

### Build System

- **Rollup** for bundling with UMD output format
- **TypeScript compilation** with declaration file generation
- **Path alias resolution** custom utility for proper d.ts file paths
- **Babel** for additional JS transforms
- **Peggy** for parser generation from grammar

The codebase implements a complete interpreter for the Niwango language with proper AST processing, type system, and extensible architecture for adding new language features.