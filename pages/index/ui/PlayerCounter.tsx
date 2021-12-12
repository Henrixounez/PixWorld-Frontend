import styled from 'styled-components';
import { useSelector } from "react-redux"
import { Edit3, Users } from 'react-feather';
import { ReduxState } from "../store"
import { Colors, getColor } from '../../constants/colors';

const Counter = styled.div<{darkMode: boolean}>`
  position: fixed;
  bottom: 55px;
  left: 10px;
  font-size: 1rem;
  height: 35px;
  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
  color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  padding: 0 10px;
  gap: 5px;
  display: flex;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
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