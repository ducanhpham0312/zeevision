import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import ProcessesPage from "./pages/ProcessesPage";
import InstancesPage from "./pages/InstancesPage";
import IncidentsPage from "./pages/IncidentsPage";
import ErrorsPage from "./pages/ErrorsPage";
import MessagesPage from "./pages/MessagesPage";
import JobsPage from "./pages/JobsPage";
import { Snackbar } from "./components/Snackbar";
import SingleProcessPage from "./pages/SingleProcessPage";
import SingleInstancePage from "./pages/SingleInstancePage";

const Layout = () => (
  <>
    <Navbar />
    <Snackbar />
    <div className="h-screen w-screen p-4 pr-0 pt-[70px]">
      <Outlet />
    </div>
  </>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "processes",
        element: <ProcessesPage />,
      },
      {
        path: "processes/:id",
        element: <SingleProcessPage />,
      },
      {
        path: "instances",
        element: <InstancesPage />,
      },
      {
        path: "instances/:id",
        element: <SingleInstancePage />,
      },
      {
        path: "incidents",
        element: <IncidentsPage />,
      },
      {
        path: "jobs",
        element: <JobsPage />,
      },
      {
        path: "messages",
        element: <MessagesPage />,
      },
      {
        path: "errors",
        element: <ErrorsPage />,
      },
    ],
  },
]);

const client = new ApolloClient({
  uri: "http://127.0.0.1:8081/graphql",
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  );
}

export default App;
