import { styled } from "@mui/system";
import { StyledButton } from "../styled-component/StyledButton";
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

function Navbar() {
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
          <StyledButton
            active={location.pathname.includes(nav.path)}
            variant="text"
            size="large"
            onClick={() => navigate(nav.path)}
            key={nav.path}
          >
            {nav.name}
          </StyledButton>
        ))}
      </div>
    </NavbarComponent>
  );
}

const NavbarComponent = styled("header")(
  () => `
  display: flex;
  position: fixed;
  width: 100%;
  padding: 0px 20px;
  box-sizing: border-box;
  align-items: center;
  gap: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`
);

const Divider = styled("div")(
  () => `
  height: 40px;
  width: 0;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
`
);

export default Navbar;
