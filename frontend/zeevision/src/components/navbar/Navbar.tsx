import { styled } from "@mui/system";

function Navbar() {
  return (
    <NavbarComponent>
      NAVABR
    </NavbarComponent>
  )
}

const NavbarComponent = styled("header")(({}) => `
  display: flex;

`)

export default Navbar;
