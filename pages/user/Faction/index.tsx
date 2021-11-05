import { useSelector } from "react-redux";
import styled from "styled-components";
import { UserReduxState } from "../store";
import { MyFaction } from "./Member";
import { FactionCreate, FactionInvites } from "./NotMember";

export const List = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  & > div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
  }
`;

export default function PageFaction() {
  const user = useSelector((state: UserReduxState) => state.user);

  if (!user?.factionMember) {
    return (
      <>
        <FactionCreate/>
        <FactionInvites/>
        {/* <SearchFaction/> */}
      </>
    );
  } else {
    return (
      <MyFaction factionId={user.factionMember.faction} role={user.factionMember.role} />
    );
  }
}