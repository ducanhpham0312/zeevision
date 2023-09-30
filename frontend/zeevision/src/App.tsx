import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import ProcessesPage from "./pages/ProcessesPage";
import InstancesPage from "./pages/InstancesPage";
import IncidentsPage from "./pages/IncidentsPage";
import ErrorsPage from "./pages/ErrorsPage";
import MessagesPage from "./pages/MessagesPage";
import JobsPage from "./pages/JobsPage";

const Layout = () => (
  <>
    <Navbar />
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

function App() {
  return <RouterProvider router={router} />;
}

export default App;
