import styled from 'styled-components'
import { XCircle } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'next-i18next';

import { ReduxState } from '../store';
import { SET_MODAL } from '../store/actions/infos';
import ModalTypes from '../../constants/modalTypes';
import ModalInfos from './modals/Infos';
import ModalProblem from './modals/Problem';
import ModalConverter from './modals/Converter';
import ModalParameters from './modals/Parameters';
import Captcha from './modals/Captcha';
import ModalOverlay from './modals/Overlay';
import ModalBookmarks from './modals/Bookmarks';
import ModalCanvases from './modals/Canvases';
import { Colors, getColor } from '../../constants/colors';
import ModalModeration from './modals/Moderation';

const ModalBackdrop = styled.div<{darkMode: boolean}>`
  position: absolute;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKDROP, darkMode)};
`;
const ModalContent = styled.div<{ darkMode: boolean }>`
  position: relative;
  margin: 10vh auto;
  z-index: 1000;
  width: 80vw;
  height: 80vh;
  max-width: 800px;
  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
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
    color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
    background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
    border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
    border-radius: 2px;
    padding: 5px 10px;
    cursor: pointer;
    box-shadow: 1px 1px 2px ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
    transition: .5s;
    &:hover {
      box-shadow: 2px 2px 3px ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
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
  [ModalTypes.NONE]: { title: '', component: null, maxWidth: null },
  [ModalTypes.INFOS]: { title: 'infos:title', component: <ModalInfos/>, maxWidth: null },
  [ModalTypes.PROBLEM]: { title: 'problem:title', component: <ModalProblem/>, maxWidth: null },
  [ModalTypes.CONVERTER]: { title: 'converter:title', component: <ModalConverter/>, maxWidth: null },
  [ModalTypes.PARAMETERS]: { title: 'parameters:title', component: <ModalParameters/>, maxWidth: null },
  [ModalTypes.CAPTCHA]: { title: '', component: <Captcha/>, maxWidth: null },
  [ModalTypes.OVERLAY]: { title: 'overlay:options', component: <ModalOverlay/>, maxWidth: null },
  [ModalTypes.BOOKMARKS]: { title: 'bookmark:title', component: <ModalBookmarks/>, maxWidth: null },
  [ModalTypes.CANVASES]: { title: 'canvas:title', component: <ModalCanvases/>, maxWidth: null },
  [ModalTypes.MODERATION]: { title: 'Moderation', component: <ModalModeration/>, maxWidth: "80vw" },
}

export default function Modal() {
  const { t } = useTranslation();
  const currentModal = useSelector((state: ReduxState) => state.currentModal);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const dispatch = useDispatch();

  if (currentModal === ModalTypes.NONE)
    return null;

  return (
    <ModalBackdrop darkMode={darkMode} onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.NONE })}>
      <ModalContent darkMode={darkMode} onClick={(e) => e.stopPropagation()} style={{ maxWidth: modalComponents[currentModal].maxWidth ?? undefined }}>
        <div style={{ height: "2.5rem" }}>
          <ModalTitle>
            {t(modalComponents[currentModal].title)}
          </ModalTitle>
          <CloseButton onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.NONE })}>
            <XCircle color={getColor(Colors.UI_BORDER, darkMode)} />
          </CloseButton>
        </div>
        <ContentContainer>
          {modalComponents[currentModal].component}
        </ContentContainer>
      </ModalContent>
    </ModalBackdrop>
  );
}