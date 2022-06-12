import axios from "axios";
import { useTranslation } from "next-i18next";
import { FormEvent, useEffect, useState } from "react"
import { ChevronsDown, ChevronsUp, Send, Trash2, UserX, X } from "react-feather";

import { API_URL } from "../../constants/api";
import { BoxContainer, BoxTitle, BoxRow, QueryForm, Textfield, CoordRow, ErrorBox, Button } from "../../pagesComponents"
import { List } from ".";
import { DEL_FACTION, FactionInvite, FactionMember, FactionRole, SET_FACTION } from "../store/actions/faction";
import { useDispatch, useSelector } from "react-redux";
import { UserReduxState } from "../store";

function Infos() {
  const { t } = useTranslation('faction');
  const faction = useSelector((state: UserReduxState) => state.faction)!;

  return (
    <BoxContainer>
      <BoxTitle>
        [{faction?.tag}] {faction?.name}
      </BoxTitle>
      <BoxRow>
        {faction.description || <i>{t('infos.noDescription')}</i>}
        <div style={{ flex: 1 }}/>
      </BoxRow>
    </BoxContainer>
  )
}

function Members({ role }: { role: FactionRole }) {
  const { t } = useTranslation('faction');
  const faction = useSelector((state: UserReduxState) => state.faction)!;
  const member = useSelector((state: UserReduxState) => state.user?.factionMember);
  const [members, setMembers] = useState<FactionMember[]>([]);

  const rolePriority = [FactionRole.ADMIN, FactionRole.MOD, FactionRole.PLAYER, FactionRole.NEW];

  const getMembers = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;
      const res = await axios.get(`${API_URL}/faction/${faction.id}/members`, { headers: { 'Authorization': token }});

      setMembers((res.data as FactionMember[]).sort((a, b) => rolePriority.findIndex((e) => e === a.role) - rolePriority.findIndex((e) => e === b.role)));
    } catch (e) {
      console.error(e);
    }
  }
  const updateMember = async (memberId: number, role: FactionRole) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;
      await axios.put(`${API_URL}/faction/${faction.id}/member/${memberId}`, { role }, { headers: { 'Authorization': token }});
      getMembers();
    } catch (e) {
      console.error(e);
    }
  }

  const kickMember = async (memberId: number) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;
      await axios.delete(`${API_URL}/faction/${faction.id}/member/${memberId}`, { headers: { 'Authorization': token }});
      getMembers();
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    getMembers();
  }, []);

  const userRoleIndex = rolePriority.findIndex((e) => e === role);

  return (
    <BoxContainer>
      <BoxTitle>
        {t('members.title')}
      </BoxTitle>
      <BoxRow>
        <List>
          {members.map((f, i) => {
            const roleIndex = rolePriority.findIndex((e) => e === f.role);

            return (
              <div key={i}>
                {f.role} | {f.username}
                { userRoleIndex <= 1 && userRoleIndex <= roleIndex && (
                  <>
                    <div style={{flex: 1}}/>
                    { f.id !== member?.id && f.role !== FactionRole.ADMIN ? (
                      <Button onClick={() => updateMember(f.id, rolePriority[roleIndex - 1])} style={{ padding: "0.5rem" }}>
                        <ChevronsUp/>
                      </Button>
                    ) : (
                      <div style={{ width: "40px" }}/>
                    )}
                    { f.id !== member?.id && f.role !== FactionRole.NEW ? (
                      <Button onClick={() => updateMember(f.id, rolePriority[roleIndex + 1])} style={{ padding: "0.5rem" }}>
                        <ChevronsDown/>
                      </Button>
                    ) : (
                      <div style={{ width: "40px" }}/>
                    )}
                    { member?.role === FactionRole.ADMIN && f.id !== member?.id && f.role !== FactionRole.ADMIN ? (
                      <Button onClick={() => kickMember(f.id) } style={{ padding: "0.5rem" }}>
                        <UserX/>
                      </Button>
                    ) : null }
                  </>
                )}
              </div>
            )
          })}
        </List>
      </BoxRow>
    </BoxContainer>
  );
}

function Invites() {
  const { t } = useTranslation('faction');
  const faction = useSelector((state: UserReduxState) => state.faction)!;
  const [invites, setInvites] = useState<FactionInvite[]>([]);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const getInvites = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;
      const res = await axios.get(`${API_URL}/faction/${faction.id}/invites`, { headers: { 'Authorization': token }});
      setInvites(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  const inviteUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setError("");

    try {
      const token = localStorage.getItem('token');

      if (!token)
        return;
  
      await axios.post(`${API_URL}/faction/${faction.id}/invite`, { username }, { headers: { 'Authorization': token }});

      getInvites();
      setUsername("");
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setError(err.response?.data);
    }
  };
  const cancelInvite = async (inviteId: number) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;
      await axios.delete(`${API_URL}/faction/${faction.id}/invite/${inviteId}`, { headers: { 'Authorization': token }});
      setInvites(invites.filter((e) => e.id !== inviteId));
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(() => {
    getInvites();
  }, []);

  return (
    <BoxContainer status={status}>
      <BoxTitle>
        {t('invites.title')}
      </BoxTitle>
      <QueryForm onSubmit={inviteUser}>
        <CoordRow>
          <Textfield
            placeholder={t('invites.username')}
            type='username'
            name='username'
            autoComplete='username'
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
      <BoxRow>
        <List>
          {invites.map((f, i) => (
            <div key={i}>
              {f.username} - {new Date(f.createdAt).toLocaleDateString('fr-FR') + ' ' + new Date(f.createdAt).toLocaleTimeString('fr-FR')}
              <div style={{flex: 1}} />
              <Button onClick={() => cancelInvite(f.id)} title="Cancel invite" style={{ padding: "0.5rem" }}>
                <X/>
              </Button>
            </div>
          ))}
        </List>
      </BoxRow>
    </BoxContainer>
  );
}

function ManageFaction({ role }: { role: FactionRole }) {
  const { t } = useTranslation('faction');
  const dispatch = useDispatch();
  const faction = useSelector((state: UserReduxState) => state.faction)!;
  const [description, setDescription] = useState(faction.description);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const updateFaction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      const token = localStorage.getItem('token');

      if (!token) return;
      const res = await axios.put(`${API_URL}/faction/${faction.id}`, { description }, { headers: { 'Authorization': token }});
      setStatus("success");
      dispatch({
        type: SET_FACTION,
        payload: res.data,
      });
    } catch (err: any) {
      setStatus("error");
      setError(err.response?.data);
    }
  };
  const deleteFaction = async () => {
    setStatus("");
    setError("");
    try {
      const token = localStorage.getItem('token');

      if (!token) return;
      await axios.delete(`${API_URL}/faction/${faction.id}`, { headers: { 'Authorization': token }});
      setStatus("success");
      dispatch({ type: DEL_FACTION });
    } catch (err: any) {
      setStatus("error");
      setError(err.response?.data);
    }
  };
  const leaveFaction = async () => {
    setStatus("");
    setError("");
    try {
      const token = localStorage.getItem('token');

      if (!token) return;
      await axios.delete(`${API_URL}/faction/${faction.id}/leave`, { headers: { 'Authorization': token }});
      setStatus("success");
      dispatch({ type: DEL_FACTION });
    } catch (err: any) {
      setStatus("error");
      setError(err.response?.data);
    }
  };

  return (
    <BoxContainer status={status}>
      <BoxTitle>
        {t('settings.title')}
      </BoxTitle>
      { role === FactionRole.ADMIN && (
        <>
          <QueryForm onSubmit={updateFaction}>
            <CoordRow>
              <Textfield
                placeholder={t('settings.description')}
                type='description'
                name='description'
                autoComplete='description'
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button>
                <Send/>
              </button>
            </CoordRow>
          </QueryForm>
          <div style={{ border: "1px solid #ffffffc0", marginTop: "1rem" }}/>
        </>
      )}
      <BoxRow style={{ justifyContent: "space-evenly" }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
          {t('settings.quit')}
          <Button onClick={leaveFaction}>
            <UserX/>
          </Button>
        </div>
        { role === FactionRole.ADMIN && (
          <>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
              {t('settings.delete')}
              <Button onClick={deleteFaction}>
                <Trash2/>
              </Button>
            </div>
          </>
        )}
      </BoxRow>
      { error ? (
        <ErrorBox>
          {t(error)}
        </ErrorBox>
      ) : null}
    </BoxContainer>
  )
}

export function MyFaction({ factionId, role }: { factionId: number, role: FactionRole }) {
  const dispatch = useDispatch();
  const faction = useSelector((state: UserReduxState) => state.faction);

  const getMyFaction = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;
      const res = await axios.get(`${API_URL}/faction/${factionId}`, { headers: { 'Authorization': token }});
      dispatch({
        type: SET_FACTION,
        payload: res.data,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getMyFaction();
  }, []);

  if (!faction)
    return <></>;

  return (
    <>
      <Infos/>
      <Members role={role}/>
      { (role === FactionRole.ADMIN || role === FactionRole.MOD) && (
        <>
          <Invites/>
        </>
      )}
      <ManageFaction role={role} />
    </>
  );
}