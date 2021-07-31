import styled from 'styled-components';
import { useSelector } from "react-redux"
import { ReduxState } from "../../store"

const Pos = styled.div`
  position: fixed;
  bottom: 10px;
  left: 10px;
  font-size: 1rem;
  height: 35px;
  background-color: #FFFD;
  border: 1px solid #000;
  padding: 0 10px;
  min-width: 50px;
  text-align: center;
  gap: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

export default function CursorPosition() {
  const cursorPos = useSelector((state: ReduxState) => state.cursorPos);

  return (
    <Pos>
      ({cursorPos.x}, {cursorPos.y})
    </Pos>
  );
}