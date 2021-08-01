import styled from 'styled-components'
import { XCircle } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../store';
import { SET_MODAL } from '../../store/actions/infos';
import ModalTypes from '../constants/modalTypes';
import ModalInfos from './modals/Infos';
import ModalProblem from './modals/Problem';
import ModalConverter from './modals/Converter';
import ModalParameters from './modals/Parameters';
import Captcha from './modals/Captcha';

const ModalBackdrop = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background-color: #FFFA;
`;
const ModalContent = styled.div`
  position: relative;
  margin: 10vh auto;
  width: 80vw;
  height: 80vh;
  max-width: 800px;
  background-color: white;
  box-sizing: border-box;
  padding: 2.5rem;
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  line-height: 1.5rem;
  hr {
    margin: 2rem 0;
  }
  button {
    outline: none;
    background-color: white;
    border: 1px solid #555;
    border-radius: 2px;
    padding: 5px 10px;
    cursor: pointer;
    box-shadow: 1px 1px 2px #000;
    transition: .5s;
    &:hover {
      box-shadow: 2px 2px 3px #000;
    }
  }
`;
const CloseButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  transition: 0.1s;;
  &:hover {
    transform: scale(1.1);
  }
`;

const modalComponents = {
  [ModalTypes.NONE]: null,
  [ModalTypes.INFOS]: <ModalInfos/>,
  [ModalTypes.PROBLEM]: <ModalProblem/>,
  [ModalTypes.CONVERTER]: <ModalConverter/>,
  [ModalTypes.PARAMETERS]: <ModalParameters/>,
  [ModalTypes.CAPTCHA]: <Captcha/>,
}

export default function Modal() {
  const currentModal = useSelector((state: ReduxState) => state.currentModal);
  const dispatch = useDispatch();

  if (currentModal === ModalTypes.NONE)
    return null;

  return (
    <ModalBackdrop onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.NONE })}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.NONE })}>
          <XCircle color="#000" />
        </CloseButton>
        {modalComponents[currentModal]}
      </ModalContent>
    </ModalBackdrop>
  );
}