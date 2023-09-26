import { StyledButton } from "../styled-component/StyledButton";
import { useNavigate, useLocation } from "react-router-dom";
import { useUIStore } from "../../contexts/useUIStore";

const SidebarElement: { name: string; path: string }[] = [
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

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar } = useUIStore();

  const handleClick = (path: string) => () => {
    navigate(path);
    toggleSidebar();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "end",
        gap: "5px"
      }}
    >
      {SidebarElement.map((el) => (
        <div style={{ display: "flex", justifyContent: "end"}}>
          <StyledButton
            active={location.pathname.includes(el.path)}
            variant="text"
            size="large"
            onClick={handleClick(el.path)}
            key={el.path}
          >
            {el.name}
          </StyledButton>
        </div>
      ))}
    </div>
  );
}

export default Sidebar;
