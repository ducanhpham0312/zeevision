import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import ProcessesPage from './pages/ProcessesPage';
import InstancesPage from './pages/InstancesPage';
import IncidentsPage from './pages/IncidentsPage';
import JobsPage from './pages/jobsPage';
import MessagesPage from './pages/messagesPage';
import ErrorsPage from './pages/ErrorsPage';

const Layout = () => (
  <>
    <Navbar/>
    <Outlet/>
  </>
)

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
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
  return <RouterProvider router={router}/>
}

export default App
