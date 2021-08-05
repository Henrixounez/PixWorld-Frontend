import axios from "axios";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from 'styled-components';
import { ReduxState } from "../../../store";
import { SET_MODAL } from "../../../store/actions/infos";
import { SET_USER } from "../../../store/actions/user";
import { API_URL } from "../../constants/api";
import ModalTypes from "../../constants/modalTypes";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;
const LogoutButton = styled.div`
  cursor: pointer;
  border: 1px solid #777;
  border-radius: 2px;
  width: min-content;
  padding: 5px 10px;
`;
const MenuSelection = styled.div`
  display: flex;
  flex-direction: row;
  align-self: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  border-bottom: 1px solid #DDD;
`;
const MenuBtn = styled.div<{active: boolean}>`
  position: relative;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  top: 1px;
  ${({ active }) => active ? `
    border: 1px solid #CCC;
    border-bottom: 0;
    background-color: #FFF;
  ` : `
    border: 1px solid transparent;
    border-bottom: 0;
  `}
`;
const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;
const RankingTable = styled.table`
  gap: 0;
  row-gap: 0;
  column-gap: 0;
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
  max-width: 500px;
  td {
    padding: 0.5rem 1rem;
    margin: 0;
    border: 1px solid #CCC;
  }

  tr:nth-child(even) {
    background-color: #DDD;
  }
`;
const RankingBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  div {
    width: calc(50% - 2rem);
    cursor: pointer;
    font-size: .9rem;
    &:hover {
      font-weight: bold;
    }
  }
`;

function UserInfos() {
  const { t } = useTranslation('stats');
  const dispatch = useDispatch();
  const user = useSelector((state: ReduxState) => state.user);

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: SET_USER, payload: null });
    dispatch({ type: SET_MODAL, payload: ModalTypes.LOGIN });
  }

  return (
    <MenuContainer>
      {t('profile.pixelsToday')}: {user?.dailyPixels}<br/>
      {t('profile.pixelsTotal')}: {user?.totalPixels}<br/>
      {t('profile.loggedAs')}: {user?.username}
      <LogoutButton onClick={logout}>
        {t('profile.logout')}
      </LogoutButton>
    </MenuContainer>
  );
}

enum RankingType {
  TOTAL = 'totalRanking',
  DAILY = 'dailyRanking',
}
interface Rankings {
  totalRanking: Array<{ username: string, dailyPixels: number, totalPixels: number }>
  dailyRanking: Array<{ username: string, dailyPixels: number, totalPixels: number }>
}
function PixelRankings() {
  const { t } = useTranslation('stats');
  const [currentRanking, setCurrentRanking] = useState(RankingType.TOTAL);
  const [rankings, setRankings] = useState<Rankings>({ totalRanking: [], dailyRanking: [] });

  const getRankings = async () => {
    try {
      const res = await axios.get(`${API_URL}/ranking`);
      setRankings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getRankings();
  }, []);

  return (
    <MenuContainer>
      <RankingBar>
        <div onClick={() => setCurrentRanking(RankingType.TOTAL)} style={{ textAlign: 'right', fontWeight: currentRanking === RankingType.TOTAL ? 'bold' : undefined }}>
          {t(`ranking.totalRanking`)}
        </div>
        <span style={{width: '4rem'}}>
          &nbsp;|&nbsp;
        </span>
        <div onClick={() => setCurrentRanking(RankingType.DAILY)} style={{ textAlign: 'left', fontWeight: currentRanking === RankingType.DAILY ? 'bold' : undefined }}>
          {t(`ranking.dailyRanking`)}
        </div>
      </RankingBar>
      <RankingTable>
        <thead>
          <td>#</td>
          <td>{t('ranking.username')}</td>
          <td>{t('ranking.pixels')}</td>
        </thead>
        {rankings[currentRanking].map((r, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{r.username}</td>
            <td>{currentRanking === RankingType.TOTAL ? r.totalPixels : r.dailyPixels}</td>
          </tr>
        ))}
      </RankingTable>
      <span style={{ fontWeight: "lighter", fontSize: "0.8rem", color: "#777" }}>
        {t('ranking.reset')}
      </span>
    </MenuContainer>
  )
}

enum MenusTypes {
  UserInfos = 'UserInfos',
  PixelRankings = 'PixelRankings'
}
const menus = {
  [MenusTypes.UserInfos]: {
    name: 'profile.title',
    component: <UserInfos/>
  },
  [MenusTypes.PixelRankings]: {
    name: 'ranking.title',
    component: <PixelRankings/>,
  }
};


export default function ModalStats() {
  const { t } = useTranslation('stats');
  const dispatch = useDispatch();
  const user = useSelector((state: ReduxState) => state.user);
  const [currentMenu, setCurrentMenu] = useState(MenusTypes.UserInfos);

  useEffect(() => {
    if (!user)
      dispatch({ type: SET_MODAL, payload: ModalTypes.LOGIN });
  }, []);

  return (
    <Container>
      <MenuSelection>
        {Object.keys(menus).map((m, i) => (
          <MenuBtn key={i} active={currentMenu === m} onClick={() => setCurrentMenu(m as MenusTypes)}>
            {t(menus[m as MenusTypes].name)}
          </MenuBtn>
        ))}
      </MenuSelection>
      {menus[currentMenu].component}
    </Container>
  );
}