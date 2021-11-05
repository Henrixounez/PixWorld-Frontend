import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/dist/client/router";
import { useTranslation } from "react-i18next";

import { List } from ".";
import { API_URL } from "../../constants/api";
import { BoxContainer, BoxRow, BoxTitle } from "../../pagesComponents";
import { Faction } from "../store/actions/faction";

export function FactionList() {
  const { t } = useTranslation('faction');
  const router = useRouter();
  const [factions, setFactions] = useState<Faction[]>([]);

  const getFactions = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token)
        return router.replace(router.basePath);

      const res = await axios.get(`${API_URL}/factions`, { headers: { 'Authorization': token }});
      setFactions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getFactions();
  }, []);

  return (
    <BoxContainer>
      <BoxTitle>
        {t('list.title')}
      </BoxTitle>
      <BoxRow>
        <List>
          {factions.map((f, i) => (
            <div key={i} style={{ gap: "2rem" }}>
              <b style={{ flex: 'none' }}>[{f.tag}] {f.name}</b>
              <span>
                {f.description}
              </span>
            </div>
          ))}
        </List>
      </BoxRow>
    </BoxContainer>
  )
}