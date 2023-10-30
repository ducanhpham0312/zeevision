import {
  ApolloClient,
  InMemoryCache,
  //ApolloProvider,
  gql,
} from "@apollo/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import ProcessesPage from "./pages/ProcessesPage";
import InstancesPage from "./pages/InstancesPage";
import IncidentsPage from "./pages/IncidentsPage";
import ErrorsPage from "./pages/ErrorsPage";
import MessagesPage from "./pages/MessagesPage";
import JobsPage from "./pages/JobsPage";
import { Snackbar } from "./components/Snackbar";
import { useEffect } from "react";

const Layout = () => (
  <>
    <Navbar />
    <Snackbar />
    <div style={{ marginTop: "70px" }}>
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
        path: "instances",
        element: <InstancesPage />,
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
  useEffect(() => {
    client
      .query({
        query: gql`
          query Test {
            processes {
              processId
              processKey
            }
          }
        `,
      })
      .then((result) => console.log(result));
  });

  return <RouterProvider router={router} />;
}

export default App;
