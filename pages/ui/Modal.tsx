import styled from 'styled-components'
import { useRef } from 'react';
import { XCircle } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'next-i18next';

import { ReduxState } from '../../store';
import { SET_MODAL } from '../../store/actions/infos';
import ModalTypes from '../constants/modalTypes';
import ModalInfos from './modals/Infos';
import ModalProblem from './modals/Problem';
import ModalConverter from './modals/Converter';
import ModalParameters from './modals/Parameters';
import Captcha from './modals/Captcha';
import ModalStats from './modals/Stats';
import ModalLogin from './modals/Login';
import ModalRegister from './modals/Register';
import ModalOverlay from './modals/Overlay';

const ModalBackdrop = styled.div<{darkMode: boolean}>`
  position: absolute;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background-color: #FFFA;
  filter: ${({ darkMode }) => darkMode ? 'invert(1)' : 'invert(0)'};
`;
const ModalContent = styled.div`
  position: relative;
  margin: 10vh auto;
  z-index: 1000;
  width: 80vw;
  height: 80vh;
  max-width: 800px;
  background-color: white;
  box-sizing: border-box;
  padding: 2.5rem 0;
  padding-bottom: 0;
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  line-height: 1.5rem;
  display: flex;
  flex-direction: column;
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

  @media(max-width: 500px) {
    margin: 0;
    width: 100vw;
    height: 100vh;
  }
`;
const ContentContainer = styled.div`
  max-height: calc(80vh - 2.5rem);
  overflow: auto;
  padding-bottom: 2.5rem;
`;
const ModalTitle = styled.div`
  margin: 0;
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
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
  [ModalTypes.NONE]: { title: '', component: null },
  [ModalTypes.INFOS]: { title: 'infos:title', component: <ModalInfos/> },
  [ModalTypes.PROBLEM]: { title: 'problem:title', component: <ModalProblem/> },
  [ModalTypes.CONVERTER]: { title: 'converter:title', component: <ModalConverter/> },
  [ModalTypes.PARAMETERS]: { title: 'parameters:title', component: <ModalParameters/> },
  [ModalTypes.CAPTCHA]: { title: '', component: <Captcha/> },
  [ModalTypes.STATS]: { title: 'stats:title', component: <ModalStats/> },
  [ModalTypes.LOGIN]: { title: 'auth:login:title', component: <ModalLogin/> },
  [ModalTypes.REGISTER]: { title: 'auth:register:title', component: <ModalRegister/> },
  [ModalTypes.OVERLAY]: { title: 'overlay:options', component: <ModalOverlay/> },
}

export default function Modal() {
  const { t } = useTranslation();
  const currentModal = useSelector((state: ReduxState) => state.currentModal);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef(0);

  if (currentModal === ModalTypes.NONE)
    return null;

  return (
    <ModalBackdrop darkMode={darkMode} onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.NONE })}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <div style={{ height: "2.5rem" }}>
          <ModalTitle>
            {t(modalComponents[currentModal].title)}
          </ModalTitle>
          <CloseButton onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.NONE })}>
            <XCircle color="#000" />
          </CloseButton>
        </div>
        <ContentContainer
          ref={containerRef}
          onTouchStart={(e) => touchStart.current = e.changedTouches[0].clientY }
          onTouchMove={(e) => {
            if (containerRef.current) {
              const delta = touchStart.current - e.changedTouches[0].clientY;
              containerRef.current.scrollBy(0, delta)
              touchStart.current = e.changedTouches[0].clientY;
            }
          }}  
        >
          {modalComponents[currentModal].component}
        </ContentContainer>
      </ModalContent>
    </ModalBackdrop>
  );
}