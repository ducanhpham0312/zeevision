# Frontend README

- [Frontend README](#frontend-readme)
  - [Introduction](#introduction)
  - [Getting started](#getting-started)
  - [Tests](#tests)
    - [Unit Testing](#unit-testing)
    - [Integration Testing](#integration-testing)
  - [Storybook](#storybook)
  - [Eslint](#eslint)
  - [Prettier](#prettier)
  - [Tech Stack](#tech-stack)

## Introduction

This document provides an overview of the frontend part of our application. It outlines how to get started, guides on tests and the technologies used.

## Getting started

Before you begin, ensure you have the following installed:

- Node.js (version 18 or later)
- npm (for managing packages)
- Start the customized `zeebe-test-bench` and build the application as instructed in the main README.

**Clone the repository and navigate to the frontend folder in project directory:**

```bash
git clone https://github.com/ducanhpham0312/zeevision.git
cd zeevision/frontend
```

**Install dependencies:**

```bash
npm install
```

**Start the development server::**

```bash
npm run dev
```

You should see something like the following after running `npm run dev`

```bash
> zeevision@0.0.0 dev
> vite


  VITE v4.5.0  ready in 411 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

You're ready to develop !

## Tests

### Unit Testing

For ensuring individual components function as expected, we use [Jest](https://jestjs.io/).

- Run the tests:
  ```bash
  npm run test
  ```
- Run the tests with snapshot update:
  ```bash
  npm run test:update
  ```
- Run the tests with coverage:
  ```bash
  npm run test:coverage
  ```

### Integration Testing

For basic application flow testing in the frontend (currently without any backend data), we use [Cypress](https://www.cypress.io/).

- To run the tests from the command line:
  ```bash
  npm run cypress:run
  ```
- To run the tests with Cypress LaunchPad (all interactions will be shown in an UI):
  ```bash
  npm run cypress:open
  ```

## Storybook

For visualizing and testing UI components in isolation, we use [Storybook](https://storybook.js.org/).

- Start the storybook:
  ```bash
  npm run storybook
  ```

## Eslint

For ensuring code quality and adhering to coding standards, we use [ESLint](https://eslint.org/).

- To check the code for any linting issues:
  ```bash
  npm run eslint
  ```
- To automatically fix many of the linting issues:
  ```bash
  npm run eslint:fix
  ```

## Prettier

For automatically formatting our code to maintain a consistent style, we use [Prettier](https://prettier.io/).

- To check code formatting:

  ```bash
  npm run prettier
  ```

- To automatically fix formatting issues:
  ```bash
  npm run prettier:fix
  ```

## Tech Stack

- [React](https://react.dev/) - A JavaScript library for building user interfaces, known for its efficiency and flexibility. React's reusable components streamline UI development, while its rich ecosystem and strong industry adoption provide robust solutions and community support, crucial for scalable and manageable applications.
- [Vite](https://vitejs.dev/) - An ultra-fast frontend build tool, leveraging native ES modules for lightning-fast server start and hot module replacement (HMR). Vite is chosen for its speed in builds and reloads, out-of-the-box features like TypeScript support, and simple yet optimized production build process, enhancing modern web development efficiency.
- [TypeScript](https://www.typescriptlang.org/) - An open-source language which builds on JavaScript by adding static type definitions, aiming to make the development process smoother and more robust. TypeScript's type safety reduces errors, especially in large-scale applications, while its developer-friendly features aid in maintenance and team collaboration.
- [Zustand](https://github.com/pmndrs/zustand) - A small, fast, and scalable state-management solution using simplified flux principles. It's easy to integrate with React. Zustand offers an uncomplicated and flexible approach to state management, ideal for projects needing a lightweight and unopinionated solution.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework packed with classes that can be composed to build design. Tailwind CSS is chosen for its ability to facilitate quick design iterations and responsive designs through its utility-based approach, streamlining front-end development.
- [bpmn-js](https://bpmn.io/toolkit/bpmn-js/): A powerful JavaScript library that allows to embed BPMN 2.0 diagrams into web applications. Bpmn-js is chosen by its compliance with BPMN 2.0 standards, and its interactive features and customization capabilities, which are integral to our application's workflow management.
