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

function App() {
  const websocket = new WebSocket("ws://127.0.0.1:8081/ws");

  useEffect(() => {
    websocket.addEventListener("open", () => {
      console.log("websocket: connected");
    });

    websocket.addEventListener("close", () => {
      console.log("websocket: closed");
    });

    websocket.addEventListener("error", (event) => {
      console.error("websocket: error:", event);
    });

    websocket.addEventListener("message", (event) => {
      console.log("websocket message:", event.data);
    });
  });

  return <RouterProvider router={router} />;
}

export default App;
