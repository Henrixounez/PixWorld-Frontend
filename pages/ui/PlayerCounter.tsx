import styled from 'styled-components';
import { useSelector } from "react-redux"
import { Users } from 'react-feather';
import { ReduxState } from "../../store"

const Counter = styled.div`
  position: fixed;
  bottom: 55px;
  left: 10px;
  font-size: 1rem;
  height: 35px;
  background-color: #FFFD;
  border: 1px solid #000;
  padding: 0 10px;
  gap: 10px;
  display: flex;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
`;

export default function PlayerCounter() {
  const playerNb = useSelector((state: ReduxState) => state.playersNb);

  return (
    <Counter>
      <Users height="20px" />
      {playerNb}
    </Counter>
  );
}