import { styled } from "@mui/system";

export const PopupContent = styled("div")`
  margin-top: 10px;
  flex-grow: 1;
  padding-left: 20px;
  overflow-y: scroll;
  max-height: 500px;
  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-right: 20px;
  }
`;

export const PopupAction = styled("div")`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 10px;
`;
