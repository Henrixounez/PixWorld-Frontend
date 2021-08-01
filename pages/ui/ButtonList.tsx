import styled from 'styled-components'
import { HelpCircle, Upload, Sliders } from 'react-feather';
import { useDispatch } from 'react-redux';
import { SET_MODAL } from '../../store/actions/infos';
import ModalTypes from '../constants/modalTypes';

const ButtonListContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;

  div {
    background-color: #FFFD;
    border: 1px solid #000;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
      background-color: #FFFA;
    }
  }
`;

export default function ButtonList() {
  const dispatch = useDispatch();

  return (
    <ButtonListContainer>
      <div onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.INFOS })}>
        <HelpCircle color="#000" />
      </div>
      <div onClick = {() => dispatch({ type: SET_MODAL, payload: ModalTypes.CONVERTER })}>
        <Upload color = "#000" />
      </div>
      <div onClick = {() => dispatch({ type: SET_MODAL, payload: ModalTypes.PARAMETERS })}>
        <Sliders color = "#000" />
      </div>
    </ButtonListContainer>
  );
}