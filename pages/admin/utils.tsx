import styled, { css } from "styled-components"

export const BoxContainer = styled.div<{ status?: string }>`
  border-radius: .5rem;
  margin: 1rem auto;
  background-color: rgba(0,0,0,0.2);
  max-width: 1500px;
  width: 100%;
  box-sizing: border-box;
  ${({ status }) => status === "success" && css`
    border: 2px solid #3070a5;
  `}
  ${({ status }) => status === "error" && css`
    border: 2px solid #a53030;
  `}
`;
export const ErrorBox = styled.div`
  padding: 1rem;
  color: #a53030;
`;

export const BoxTitle = styled.h1`
  font-size: 1rem;
  padding: 1rem;
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
    &:hover {
      background-color: rgba(0,0,0,0.3);
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
  &:hover {
    outline-offset: 0px;
    outline: -webkit-focus-ring-color auto 1px;
  }
`;
export const Checkbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 1rem;
  background-color: rgba(0,0,0,0.2);
`;

export const CoordRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.5rem;
`;