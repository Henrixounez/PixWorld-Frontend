import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { Globe, LogOut } from 'react-feather';
import styled, { css } from 'styled-components'

const SideBarContainer = styled.div`
  padding: .5rem;
  background-color: rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  height: 100vh;
  box-sizing: border-box;
  position: relative;
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
    background-color: #3eb1b1;
  `}

  @media(max-width: 500px) {
    width: 22.5px;
    height: 22.5px;
    svg {
      width: 12px;
      height: 12px;
    }
    border-radius: 15px;
    ${({ active }) => active && css`
      border-radius: 0.5rem;
    `}
  }
`;


interface SideBarProps {
  currentPage: string,
  pages: {
    type: string;
    icon: JSX.Element;
    name: string;
    component: JSX.Element;
  }[],
  routePrefix: string
}

export default function SideBar({ currentPage, pages, routePrefix }: SideBarProps) {
  const router = useRouter();

  return (
    <SideBarContainer>
      { pages.map((p, i) => (
        <Link key={i} href={`/${routePrefix}/${p.type}`}>
          <SideBarButton title={p.name} active={currentPage === p.type}>
            {p.icon}
          </SideBarButton>
        </Link>
      ))}
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", bottom: ".5rem", gap: ".5rem" }}>
        <SideBarButton
          title="Go to map"
          active={false}
          onClick={() => {
            router.push('/');
          }}
        >
          <Globe/>
        </SideBarButton>
        <SideBarButton
          title="Disconnect"
          active={false}
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/');
          }}
        >
          <LogOut/>
        </SideBarButton>
      </div>
    </SideBarContainer>
  )
}