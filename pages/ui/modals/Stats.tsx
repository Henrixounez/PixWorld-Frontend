import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from 'styled-components';
import { ReduxState } from "../../../store";
import { SET_MODAL } from "../../../store/actions/infos";
import { SET_USER } from "../../../store/actions/user";
import ModalTypes from "../../constants/modalTypes";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;
const LogoutButton = styled.div`
  cursor: pointer;
  border: 1px solid #777;
  border-radius: 2px;
  width: min-content;
  padding: 5px 10px;
`;

export default function ModalStats() {
  const dispatch = useDispatch();
  const user = useSelector((state: ReduxState) => state.user);

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: SET_USER, payload: null });
    dispatch({ type: SET_MODAL, payload: ModalTypes.LOGIN });
  }

  useEffect(() => {
    if (!user)
      dispatch({ type: SET_MODAL, payload: ModalTypes.LOGIN });
  }, []);

  return (
    <Container>
      <h1>Stats</h1>
      Logged as: {user?.username}
      <LogoutButton onClick={logout}>
        Logout
      </LogoutButton>
    </Container>
  );
}