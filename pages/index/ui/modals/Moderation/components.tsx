import styled, { css } from "styled-components";
import { Colors, getColor } from "../../../../constants/colors";

export const ModalBoxContainer = styled.div<{ status?: string, darkMode: boolean }>`
  border-radius: .5rem;
  margin: 1rem auto;
  max-width: 1500px;
  width: 100%;
  box-sizing: border-box;
  ${({ status }) => status === "success" && css`
    border: 2px solid #3aa1a1;
  `}
  ${({ status }) => status === "error" && css`
    border: 2px solid #a53030;
  `}
  @media(max-width: 500px) {
    margin: 0.5rem auto;
  }
`;
export const ModalErrorBox = styled.div<{ darkMode: boolean }>`
  padding: 1rem;
  color: #a53030;
  @media(max-width: 500px) {
    padding: 0.5rem;
  }
`;

export const ModalBoxTitle = styled.h1<{ darkMode: boolean }>`
  font-size: 1.5rem;
  padding: 1rem;
  margin: 0;
  @media(max-width: 500px) {
    font-size: 0.7rem;
    padding: 0.5rem 1rem;
  }
`;

export const ModalQueryForm = styled.form<{ darkMode: boolean }>`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  gap: 0.5rem;
  label {
    padding: 1rem;
  }
  button {
    display: flex;
    align-items: center;
    padding: 1rem;
    color: ${({darkMode}) => getColor(Colors.TEXT, darkMode)};
    border: 1px solid ${({darkMode}) => getColor(Colors.UI_BORDER, darkMode)};
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: .1s;
    svg {
      transition: .2s;
    }
    box-shadow: none;
    &:hover {
      box-shadow: none;
    }
  }
  @media(max-width: 500px) {
    label {
      padding: 0.5rem;
    }
    button {
      padding: 0.5rem;
      font-size: 0.7rem;
      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
`;
export const ModalButton = styled.button<{ darkMode: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  color: ${({darkMode}) => getColor(Colors.TEXT, darkMode)};
  background-color: ${({darkMode}) => getColor(Colors.UI_BACKGROUND, darkMode)};
  border: 1px solid ${({darkMode}) => getColor(Colors.UI_BORDER, darkMode)};
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: .1s;
  svg {
    transition: .2s;
  }
  @media(max-width: 500px) {
    button {
      padding: 0.5rem;
      font-size: 0.7rem;
      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
`;

export const ModalTextfield = styled.input<{ darkMode: boolean }>`
  flex: 1;
  padding: 1rem;
  color: ${({darkMode}) => getColor(Colors.TEXT, darkMode)};
  border: none;
  border-radius: 0;
  min-width: 5rem;
  border-radius: 4px;
  border: 1px solid ${({darkMode}) => getColor(Colors.UI_BORDER, darkMode)};
  &:hover {
    outline-offset: 0px;
    outline: -webkit-focus-ring-color auto 1px;
  }
  @media(max-width: 500px) {
    font-size: 0.7rem;
    padding: 0.5rem;
  }
`;
export const ModalTextarea = styled.textarea<{ darkMode: boolean }>`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  flex: 1;
  padding: 1rem;
  color: ${({darkMode}) => getColor(Colors.TEXT, darkMode)};
  border: 1px solid ${({darkMode}) => getColor(Colors.UI_BORDER, darkMode)};
  border: none;
  border-radius: 4px;
  min-width: 5rem;
  &:hover {
    outline-offset: 0px;
    outline: -webkit-focus-ring-color auto 1px;
  }
  @media(max-width: 500px) {
    font-size: 0.7rem;
    padding: 0.5rem;
  }
`;
export const ModalCheckbox = styled.div<{ darkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 1rem;
  svg {
    transition: .2s;
  }
  &:hover {
    svg {
      color: #4bc0c0;
    }
  }
  @media(max-width: 500px) {
    padding: 0.5rem;
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;
export const ModalCoordRow = styled.div<{ darkMode: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.5rem;


`;
export const ModalBoxRow = styled.div<{ darkMode: boolean }>`
  padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;
