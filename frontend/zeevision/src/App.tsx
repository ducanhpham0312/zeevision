import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import CounterTest from './components/CounterTest';
import Navbar from './components/navbar/Navbar';

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
        path: "counter",
        element: <CounterTest />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router}/>
}

export default App
