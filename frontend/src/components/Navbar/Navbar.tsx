import { Button } from "../Button";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationPath: { name: string; path: string }[] = [
  {
    name: "PROCESSES",
    path: "/processes",
  },
  {
    name: "INSTANCES",
    path: "/instances",
  },
  {
    name: "INCIDENTS",
    path: "/incidents",
  },
  {
    name: "JOBS",
    path: "/jobs",
  },
  {
    name: "MESSAGES",
    path: "/messages",
  },
  {
    name: "ERRORS",
    path: "/errors",
  },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="fixed z-50 flex w-full items-center gap-7 border-b border-black/20 bg-background px-5">
      <div>
        <div>NAVBAR</div>
      </div>
      <div className="h-10 w-0 border-l border-black/30" />
      <div className="flex gap-3">
        {NavigationPath.map((nav) => (
          <Button
            active={location.pathname.includes(nav.path)}
            size="large"
            onClick={() => navigate(nav.path)}
            key={nav.path}
          >
            {nav.name}
          </Button>
        ))}
      </div>
    </header>
  );
}
