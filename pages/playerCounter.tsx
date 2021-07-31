import styled from 'styled-components';
import { useSelector } from "react-redux"
import { ReduxState } from "../store"
import { Users } from 'react-feather';

const Counter = styled.div`
  position: fixed;
  bottom: 10px;
  left: 10px;
  background-color: #FFFD;
  border: 1px solid #000;
  padding: 10px 10px;
  gap: 10px;
  display: flex;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

export default function PlayerCounter() {
  const playerNb = useSelector((state: ReduxState) => state.playersNb);

  return (
    <Counter>
      <Users />
      {playerNb}
    </Counter>
  );
}