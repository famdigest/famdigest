# Saas Boilerplate Turborepo starter

This is an official starter Turborepo.


### Apps and Packages

- `dashboard`: a [Remix](https://remix.run/) app
- `@repo/ui`: a shadecn component lib shared by for all applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@repo/supabase`: [Supabase](https://supabase.com) utility
- `@repo/database`: [Drizzle](https://orm.drizzle.team) database client with schemas and introspection


Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```
