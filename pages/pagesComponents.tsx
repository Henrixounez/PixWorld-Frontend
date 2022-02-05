import { ClipboardEvent, Dispatch, SetStateAction } from "react";
import styled, { css } from "styled-components"

export const BoxContainer = styled.div<{ status?: string }>`
  border-radius: .5rem;
  margin: 1rem auto;
  background-color: rgba(0,0,0,0.2);
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
export const ErrorBox = styled.div`
  padding: 1rem;
  color: #a53030;
  @media(max-width: 500px) {
    padding: 0.5rem;
  }
`;

export const BoxTitle = styled.h1`
  font-size: 1.5rem;
  padding: 1rem;
  margin: 0;
  @media(max-width: 500px) {
    font-size: 0.7rem;
    padding: 0.5rem 1rem;
  }
`;

export const QueryForm = styled.form`
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
    color: #ffffffa0;
    background-color: rgba(0,0,0,0.2);
    border: none;
    border-radius: 0;
    font-size: 1rem;
    cursor: pointer;
    transition: .1s;
    svg {
      transition: .2s;
    }
    &:hover {
      background-color: rgba(0,0,0,0.3);
      svg {
        color: #4bc0c0;
      }
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
export const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 1rem;
  color: #ffffffa0;
  background-color: rgba(0,0,0,0.2);
  border: none;
  border-radius: 0;
  font-size: 1rem;
  cursor: pointer;
  transition: .1s;
  svg {
    transition: .2s;
  }
  &:hover {
    background-color: rgba(0,0,0,0.3);
    svg {
      color: #4bc0c0;
    }
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

export const Textfield = styled.input`
  flex: 1;
  padding: 1rem;
  color: #ffffffa0;
  background-color: rgba(0,0,0,0.2);
  border: none;
  border-radius: 0;
  min-width: 5rem;
  &:hover {
    outline-offset: 0px;
    outline: -webkit-focus-ring-color auto 1px;
  }
  color-scheme: dark;
  @media(max-width: 500px) {
    font-size: 0.7rem;
    padding: 0.5rem;
  }
`;
export const Textarea = styled.textarea`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  flex: 1;
  padding: 1rem;
  color: #ffffffa0;
  background-color: rgba(0,0,0,0.2);
  border: none;
  border-radius: 0;
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
export const Checkbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 1rem;
  background-color: rgba(0,0,0,0.2);
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
export const CoordRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.5rem;
`;
export const BoxRow = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

const canvases = {
  "w": "world",
  "a": "art",
}

export function onCoordinatesPaste(e: ClipboardEvent<HTMLInputElement | HTMLDivElement>, setX: Dispatch<SetStateAction<number>>, setY: Dispatch<SetStateAction<number>>, setCanvas: Dispatch<SetStateAction<string>>) {
  const text = e.clipboardData.getData('Text');
  const regex = /#(.)\((-?\d*),\s*(-?\d*),\s*(-?\d*)\)/;
  const res = text.match(regex);
  if (res && res.length === 5) {
    const canvasLetter = res[1];
    const x = Number(res[2]);
    const y = Number(res[3]);
    // const zoom = Number(res[4]);

    if (!Object.keys(canvases).includes(canvasLetter))
      return false;
    // @ts-ignore
    const canvas = canvases[canvasLetter];

    e.preventDefault();
    setX(x);
    setY(y);
    setCanvas(canvas);
    return true;
  }
  return false;
}