import { styled } from "@mui/system";

export const PopupContent = styled("div")`
  margin-top: 10px;
  flex-grow: 1;
  padding-left: 20px;
  padding-right: 20px;
  overflow-y: scroll;
  max-height: 500px;
`;

export const PopupAction = styled("div")`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 15px;
  padding-right: 20px;
`;
