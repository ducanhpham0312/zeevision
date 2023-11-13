import { styled } from "@mui/system";
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
    <NavbarComponent>
      <div>
        <div>NAVBAR</div>
      </div>
      <Divider />
      <div style={{ display: "flex", gap: "10px" }}>
        {NavigationPath.map((nav) => (
          <Button
            active={location.pathname.includes(nav.path)}
            variant="text"
            size="large"
            onClick={() => navigate(nav.path)}
            key={nav.path}
          >
            {nav.name}
          </Button>
        ))}
      </div>
    </NavbarComponent>
  );
}

const NavbarComponent = styled("header")(
  () => `
  display: flex;
  position: fixed;
  z-index: 1000;
  background-color: white;
  width: 100%;
  padding: 0px 20px;
  box-sizing: border-box;
  align-items: center;
  gap: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`,
);

const Divider = styled("div")(
  () => `
  height: 40px;
  width: 0;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
`,
);
