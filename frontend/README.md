[Introduction](#introduction) • 
[Tech Stack](#tech-stack) • 
[Tech Stack Decisions](#tech-stack-decisions) • 
[Prerequisites](#prerequisites) • 
[Installation](#installation) • 
[Tests](#tests) 


# Frontend README

# Introduction <a name="introduction"/>
This document provides an overview of the frontend part of our application. It outlines the technologies used, how to get started, and guides on tests.

## Tech Stack <a name="tech-stack"/>
- [React](https://react.dev/) - A JavaScript library for building user interfaces, known for its efficiency and flexibility.
- [Vite](https://vitejs.dev/) - An ultra-fast frontend build tool, leveraging native ES modules for lightning-fast server start and hot module replacement (HMR).
- [TypeScript](https://www.typescriptlang.org/) - An open-source language which builds on JavaScript by adding static type definitions, aiming to make the development process smoother and more robust.
- [Zustand](https://github.com/pmndrs/zustand) - A small, fast, and scalable state-management solution using simplified flux principles. It's easy to integrate with React.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework packed with classes that can be composed to build design.
- [bpmn-js](https://bpmn.io/toolkit/bpmn-js/): A powerful JavaScript library that allows to embed BPMN 2.0 diagrams into web applications.
- [Storybook](https://storybook.js.org/) - A tool for developing UI components in isolation for React, which helps in building robust user interfaces without worrying about app specifics.

## Tech Stack Decisions <a name="tech-stack-decisions"/>
- Why React?
  - Component-Based Architecture: React's component-based structure allows for reusable and isolated code, making the UI more manageable and scalable.
   - Rich Ecosystem: React has a vast ecosystem with a multitude of libraries and tools, which provide flexibility and robust solutions for various development needs.
   - Strong Community and Industry Adoption: With strong backing and widespread use in the industry, React offers reliability, continuous improvements, and a wealth of community knowledge.
- Why Vite?
   - Fast Builds: Vite leverages ES modules and doesn't need to bundle the code during development, resulting in significantly faster build and reload times.
   - Out-of-the-Box Features: Vite comes with built-in features like hot module replacement and TypeScript support, streamlining the development process.
   - Simplicity and Optimized Production Builds: Its simple setup and optimized build process make it a great choice for modern web development.
- Why TypeScript?
   - Type Safety: TypeScript introduces static typing, leading to more predictable and less error-prone code, particularly beneficial in large-scale applications.
   - Enhanced Developer Experience: Features like autocompletion, code navigation, and refactoring tools significantly improve the development experience.
   - Ease of Maintenance: The explicit typing system makes the codebase easier to understand and maintain, especially when working in teams.
- Why Zustand?
   - Simplicity and Flexibility: Zustand offers a simple and straightforward way to handle state management, making it easier to understand and use.
   - Unopinionated and Lightweight: It's unopinionated about how you structure your state, and is lightweight, adding minimal overhead to the project.
- Why Tailwind CSS?
   - Rapid Prototyping and Customization: Tailwind CSS's utility-first approach makes it easy to quickly prototype designs and customize them without leaving HTML.
   - Responsive Design: It simplifies the process of creating a responsive design with its built-in utilities.
- Why bpmn-js?
   - BPMN 2.0 Standard Compliance: bpmn-js allows embedding and interacting with BPMN 2.0 diagrams, crucial for our application's workflow functionalities.
   - Interactivity and Customization: It offers interactive features like zooming, editing, and can be customized to fit the specific needs of our application.
- Why Storybook?
   - UI Component Development and Testing: Storybook provides an isolated environment for developing and testing UI components, improving the overall quality and consistency of the UI.
   - Documentation and Collaboration: It acts as a living documentation for components.
     
## Prerequisites <a name="prerequisites"/>
Before you begin, ensure you have the following installed:

- Node.js (version 18 or later) 
- npm (for managing packages)

## Installation <a name="installation"/>
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
You should see the the following after running `npm run dev`
```bash
> zeevision@0.0.0 dev
> vite


  VITE v4.5.0  ready in 411 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```
You're ready to develop !

## Tests <a name="tests"/>
### Unit Testing
For ensuring individual components function as expected, we use [Jest](https://jestjs.io/). To run the tests, use the following command:
```bash
npm run test
```
## Intergration Testing
For comprehensive application flow testing, we use [Cypress](https://www.cypress.io/). To run the tests, use the following command:
```bash
npm run cypress
```
## Storybook
For visualizing and testing UI components in isolation, we use [Storybook](https://storybook.js.org/). To run the tests, use the following command:
```bash
npm run storybook
```


