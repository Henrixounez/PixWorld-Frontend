import { Dispatch, SetStateAction } from 'react';
import styled, { css } from 'styled-components'
import { pages, PageTypes } from './index.page';

const SideBarContainer = styled.div`
  padding: .5rem;
  background-color: rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  height: 100vh;
  box-sizing: border-box;
`;
const SideBarButton = styled.div<{active: boolean}>`
  background-color: hsla(0,0%,100%,0.04);
  width: 55px;
  height: 55px;
  max-width: 55px;
  max-height: 55px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: .2s;
  svg {
    color: #ffffffa0;
    transition: .2s;
  }
  &:hover {
    border-radius: 1rem;
    svg {
      color: #ffffff;
    }
  }
  ${({ active }) => active && css`
    border-radius: 1rem;
    background-color: #3070a5;
  `}
`;


interface SideBarProps {
  currentPage: PageTypes,
  setCurrentPage: Dispatch<SetStateAction<PageTypes>>,
}

export default function SideBar({ currentPage, setCurrentPage}: SideBarProps) {
  return (
    <SideBarContainer>
      { pages.map((p, i) => (
        <SideBarButton
          key={i}
          title={p.name}
          active={currentPage === p.type}
          onClick={() => setCurrentPage(p.type)}
        >
          {p.icon}
        </SideBarButton>
      ))}
    </SideBarContainer>
  )
}