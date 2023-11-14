import { useState } from "react";
import { AlertOctagon, Database, Map, Shield } from "react-feather";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { Colors, getColor } from "../../../../constants/colors";
import { ReduxState } from "../../../store";
import { UserType } from "../../../store/actions/user";
import PageBan from "./Ban";
import PageLogs from "./Logs";
import PageMapOperations from "./MapOperations";
import NoPixelZone from "./NoPixelZone";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  gap: 1rem;
`;
const TabList = styled.div<{ darkMode: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 0.4rem;
    border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
    cursor: pointer;
  }
`;
const Component = styled.div`
  width: calc(100% - 32px);
`;

const modPages = [
  {
    icon: <Database/>,
    component: <PageLogs/>
  },
  {
    icon: <Shield/>,
    component: <PageBan/>
  },
  {
    icon: <Map/>,
    component: <PageMapOperations/>
  }
];
const adminPages = [
  {
    icon: <AlertOctagon/>,
    component: <NoPixelZone/>
  }
]

export default function ModalModeration() {
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const isAdmin = useSelector((state: ReduxState) => state.user?.type === UserType.ADMIN);
  const [selected, setSelected] = useState(0);

  const pages = [
    ...modPages,
    ...(isAdmin ? adminPages : []),
  ];

  return (
    <Container>
      <TabList darkMode={darkMode}>
        {pages.map((mp, i) => (
          <div key={i} onClick={() => setSelected(i)}>
            {mp.icon}
          </div>
        ))}
      </TabList>
      <Component>
        {pages[selected].component}
      </Component>
    </Container>
  )
}