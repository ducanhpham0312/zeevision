describe("Navbar Tests", () => {
  const pages = [
    "/", // Home page
    "/processes", // Process Page
    "/instances", // Instances Page
    "/incidents", // Incidents Page
    "/jobs", // Jobs Page
    "/messages", // Messages Page
    "/errors", // Errors Page
  ];

  beforeEach(() => {
    cy.visit("/"); // Start at the home page for each test
  });

  pages.forEach((page) => {
    it(`should have a navbar on the ${page} page`, () => {
      cy.visit(page); // Navigate to the page
      cy.contains("ZEEVISION").should("exist");
      cy.screenshot(`Navbar${page}`); // Screenshot for each page
    });
  });
});
