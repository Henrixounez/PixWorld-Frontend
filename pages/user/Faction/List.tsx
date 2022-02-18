import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/dist/client/router";
import { useTranslation } from "react-i18next";

import { API_URL } from "../../constants/api";
import { BoxContainer, BoxRow, BoxTitle } from "../../pagesComponents";
import { Faction } from "../store/actions/faction";
import styled from "styled-components";

const Table = styled.table`
  gap: 0;
  row-gap: 0;
  column-gap: 0;
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
  td {
    padding: 0.5rem 1rem;
    margin: 0;
  }

  tr:nth-child(even) {
    background-color: rgba(0,0,0,0.3);
  }
`;

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
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Total pixels</th>
            </tr>
          </thead>
          <tbody>
            {factions.map((f, i) => (
              <tr key={i}>
                <td
                  style={{ flex: 'none' }}
                >
                  [{f.tag}] {f.name}
                </td>
                <td>
                  {f.description}
                </td>
                <td
                  style={{ textAlign: "right" }}
                >
                  {f.totalPixelCount} Pixels
                </td>
              </tr>
            ))}

          </tbody>
        </Table>
      </BoxRow>
    </BoxContainer>
  )
}