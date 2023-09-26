import { styled } from "@mui/system";
import { StyledButton } from "../styled-component/StyledButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useUIStore } from "../../contexts/useUIStore";
import Sidebar from "./Sidebar";

function Navbar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <NavbarComponent>
      <FloatContainer expand={isSidebarOpen}>
        <div
          style={{
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <StyledButton
            active={isSidebarOpen}
            variant="text"
            size="standard"
            onClick={toggleSidebar}
          >
            <MenuIcon />
          </StyledButton>
          <div style={{ paddingRight: "20px" }}>ZEEVISION</div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            maxHeight: isSidebarOpen ? "1000px" : "0",
            transition: "max-height 300ms ease",
            overflow: "hidden",
          }}
        >
          <Sidebar />
        </div>
      </FloatContainer>
    </NavbarComponent>
  );
}

const NavbarComponent = styled("header")(
  ({}) => `
  display: fixed;
  position: absolute;
  padding: 15px 20px;
  align-items: center;
  gap: 30px;
  z-index: 10;
`
);

const FloatContainer = styled("div", {
  shouldForwardProp: (props) => props !== "expand",
})(
  ({ expand }: { expand: boolean }) => `
  display: flex;
  flex-direction: column;
  width: ${expand ? "230px" : "180px"};
  justify-content: space-between;
  // background-color: grey;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: width 300ms ease;
`
);

export default Navbar;
