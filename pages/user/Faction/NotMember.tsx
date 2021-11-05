import axios from "axios";
import { useRouter } from "next/dist/client/router";
import { FormEvent, useEffect, useState } from "react";
import { Check, Send, X } from "react-feather";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { API_URL } from "../../constants/api";
import { SET_USER } from "../../index/store/actions/user";
import { BoxContainer, BoxRow, BoxTitle, Button, CoordRow, ErrorBox, QueryForm, Textfield } from "../../pagesComponents";
import { UserReduxState } from "../store";
import { FactionInvite } from "../store/actions/faction";
import { List } from '.';

export function FactionCreate() {
  const { t } = useTranslation('faction');
  const user = useSelector((state: UserReduxState) => state.user);
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState("");

  const createFaction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setError("");

    try {
      const token = localStorage.getItem('token');

      if (!token)
        return;
  
      const res = await axios.post(`${API_URL}/faction`, { tag, name }, { headers: { 'Authorization': token }});

      dispatch({
        type: SET_USER,
        payload: {
          ...user,
          factionMember: res.data.member
        }
      });
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setError(err.response?.data);
    }
  };
  
  return (
    <BoxContainer status={status}>
      <BoxTitle>
        {t('create.title')}
      </BoxTitle>
      <BoxRow>
        {t('create.description')}
      </BoxRow>
      <QueryForm onSubmit={createFaction}>
        <CoordRow>
          <Textfield
            placeholder={t('create.name')}
            type='name'
            name='name'
            autoComplete='name'
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </CoordRow>
        <CoordRow>
          <Textfield
            placeholder={t('create.tag')}
            type='tag'
            name='tag'
            autoComplete='tag'
            required
            value={tag}
            maxLength={4}
            onChange={(e) => setTag(e.target.value)}
          />
          <button>
            <Send/>
          </button>
        </CoordRow>
      </QueryForm>
      { error ? (
        <ErrorBox>
          {t(error)}
        </ErrorBox>
      ) : null}
    </BoxContainer>
  )
}

export function FactionInvites() {
  const { t } = useTranslation('faction');
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: UserReduxState) => state.user);
  const [invites, setInvites] = useState<FactionInvite[]>([]);

  const getMyInvites = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token)
        return router.replace(router.basePath);

      const res = await axios.get(`${API_URL}/faction/invites`, { headers: { 'Authorization': token }});
      setInvites(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const acceptInvite = async (inviteId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/faction/accept/${inviteId}`, {}, { headers: { 'Authorization': token }});
      dispatch({
        type: SET_USER,
        payload: {
          ...user,
          factionMember: res.data
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
  const refuseInvite = async (inviteId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/faction/invites/${inviteId}`, { headers: { 'Authorization': token }});
      setInvites(invites.filter((e) => e.id !== inviteId));
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    getMyInvites();
  }, []);

  return (
    <BoxContainer>
      <BoxTitle>
        {t('nonMemberInvites.title')}
      </BoxTitle>
      <BoxRow>
        <List>
          {invites.map((f, i) => (
            <div key={i}>
              <>
                <small>({new Date(f.createdAt).toLocaleDateString('fr-FR') + ' ' + new Date(f.createdAt).toLocaleTimeString('fr-FR')})</small>&nbsp;
                [{f.faction.tag}] {f.faction.name}
              </>
              <div style={{flex: 1}}/>
              <Button onClick={() => acceptInvite(f.id)}>
                <Check/>
              </Button>
              <Button onClick={() => refuseInvite(f.id)}>
                <X/>
              </Button>
            </div>
          ))}
        </List>
      </BoxRow>
    </BoxContainer>
  );
}