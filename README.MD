# Pano API TS

A TypeScript API project built with [Fastify](https://www.fastify.io/) for high-performance server-side applications.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Additional Information](#additional-information)

## Prerequisites

- **Node.js** (v14 or higher is recommended)  
  [Download Node.js](https://nodejs.org/en/download/)
- **npm** (comes with Node.js)

## Installation

If you are starting from scratch, you can initialize the project and install the necessary dependencies with the following commands:

```bash
npm init -y
npm install fastify
npm install -D typescript @types/node
npx tsc --init
```

If you have already cloned the repository (which includes the provided `package.json`), simply install the dependencies:

```bash
npm install
```

## Running the Project

For development, run the project using the following command:

```bash
npm run dev
```

> **Note:** This command starts the server in development mode using `nodemon` and `ts-node`. It watches for any changes in your `.ts` files (typically located in the `src/` directory) and restarts the server automatically.

## Available Scripts

- **Development:**  
  Starts the server with hot-reloading using `nodemon` and `ts-node`.
  ```bash
  npm run dev
  ```

- **Build:**  
  Compiles the TypeScript code into JavaScript.
  ```bash
  npm run build
  ```
  Uses the `tsconfig.json` configuration file for compiling your project.

- **Start:**  
  Runs the compiled JavaScript code.
  ```bash
  npm start
  ```

- **Test:**  
  Currently a placeholder for future test scripts.
  ```bash
  npm run test
  ```

## Project Structure

```
pano-api-ts/
├── src/
│   └── ...        # Your TypeScript source files
├── index.ts       # Entry point of the application
├── package.json
├── tsconfig.json  # Generated with `npx tsc --init`
└── README.md
```

*Note:* Adjust the structure as needed. The provided `package.json` points to `index.ts` as the main file.

## Configuration

- **TypeScript:**  
  The `tsconfig.json` file is used to configure the TypeScript compiler. Modify it to suit your project's needs.

- **Environment Variables:**  
  If you need to manage environment-specific variables (e.g., API keys, Firebase configuration), consider creating a `.env` file and using [dotenv](https://www.npmjs.com/package/dotenv) to load these variables.  
  **Note:** The `.env` file is stored in 1Password.

- **Fastify & Plugins:**  
  The project uses Fastify as its web framework along with the following packages:
    - `@fastify/cors` for handling CORS.
    - `firebase-admin` for interacting with Firebase services.

```
