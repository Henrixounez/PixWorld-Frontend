import styled from 'styled-components';
import { useSelector } from "react-redux"
import { Edit3, Users } from 'react-feather';
import { ReduxState } from "../../store"

const Counter = styled.div<{darkMode: boolean}>`
  position: fixed;
  bottom: 55px;
  left: 10px;
  font-size: 1rem;
  height: 35px;
  background-color: #FFFD;
  border: 1px solid #000;
  padding: 0 10px;
  gap: 5px;
  display: flex;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
  filter: ${({ darkMode }) => darkMode ? 'invert(1)' : 'invert(0)'};
`;

function pixelNbRounded(p: number) {
  if (p < 1000) {
    return p;
  } else {
    const thousands = Math.floor(p / 1000);
    const hundred = Math.floor(p % 1000 / 100);
    return `${thousands}.${hundred}k`;
  }
}

export default function PlayerCounter() {
  const playerNb = useSelector((state: ReduxState) => state.playersNb);
  const pixelNb = useSelector((state: ReduxState) => state.user?.totalPixels);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  return (
    <Counter darkMode={darkMode}>
      <Users height="20px" />
      {playerNb}
      { pixelNb ? (
        <>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {pixelNbRounded(pixelNb)}
          <Edit3 height="20px" />
        </>
      ) : null}
    </Counter>
  );
}