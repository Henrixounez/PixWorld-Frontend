import axios from "axios";
import { FormEvent, useState } from "react";
import { Search } from "react-feather";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { API_URL } from "../../../../constants/api";
import { onCoordinatesPaste } from "../../../../pagesComponents"
import { ReduxState } from "../../../store";
import { ModalBoxContainer, ModalBoxTitle, ModalCoordRow, ModalQueryForm, ModalTextfield } from "./components";

export const ContainerLogsResult = styled.div`
  max-height: 500px;
  overflow: auto;
  position: relative;
`;
export const LogsResults = styled.table`
  overflow: auto;
  margin: 1rem;
  width: 100%;
  max-width: 95%;
  row-gap: 1rem;
  column-gap: 1rem;
  border-collapse: collapse;
  td {
    padding: .25rem .5rem;
    text-align: center;
  }
  thead {
    td {
      font-weight: bold;
    }
  }
  tr {
    text-align: center;
  }
`;

interface PixelLogResult {
  ip: string;
  userId?: number;
  username?: string;
  pos: {
    x: number;
    y: number;
  }
  color: string;
  canvas: string;
  createdAt: string;
}

function dateFormat(date: string) {
  const d = new Date(date);

  return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR')}`;
}

function PixelLogs() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [canvas, setCanvas] = useState("");
  const [results, setResults] = useState<PixelLogResult[]>([]);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const searchPixelLogs = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/pixelLogs/${canvas}/${x}/${y}`, { headers: { 'Authorization': token } });
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <ModalBoxContainer darkMode={darkMode}>
      <ModalBoxTitle darkMode={darkMode}>
        Coordinate Pixel Logs
      </ModalBoxTitle>
      <ModalQueryForm darkMode={darkMode} onSubmit={searchPixelLogs}>
        <ModalCoordRow darkMode={darkMode} onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)}>
          <ModalTextfield darkMode={darkMode} placeholder="Coord X" type="number" value={x} onChange={(e) => setX(Number(e.target.value)) }/>
          <ModalTextfield darkMode={darkMode} placeholder="Coord Y" type="number" value={y} onChange={(e) => setY(Number(e.target.value)) }/>
        </ModalCoordRow>
        <ModalCoordRow darkMode={darkMode} onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)}>
          <ModalTextfield darkMode={darkMode} placeholder="Canvas" type="text" value={canvas} onChange={(e) => setCanvas(e.target.value) }/>
          <button>
            <Search/>
          </button>
        </ModalCoordRow>
      </ModalQueryForm>
      { results.length ? (
        <ContainerLogsResult>
          <LogsResults>
            <thead>
              <tr>
                <th>Date</th>
                <th>IP</th>
                <th>User Id</th>
                <th>Username</th>
                <th>Position</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{dateFormat(r.createdAt)}</td>
                  <td>{r.ip}</td>
                  <td>{r.userId}</td>
                  <td>{r.username}</td>
                  <td>{r.pos.x},{r.pos.y}</td>
                  <td>
                    <div style={{ display: "inline-block", height: "10px", width: "10px", backgroundColor: r.color, marginRight: ".5rem" }}/>
                    {r.color}
                  </td>
                </tr>
              ))}
            </tbody>
          </LogsResults>
        </ContainerLogsResult>
      ) : null}
    </ModalBoxContainer>
  );
}

function UserPixelLogs() {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<PixelLogResult[]>([]);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const searchPixelLogs = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/userPixelLogs/${username}`, { headers: { 'Authorization': token } });
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <ModalBoxContainer darkMode={darkMode}>
      <ModalBoxTitle darkMode={darkMode}>
        User Pixel Logs
      </ModalBoxTitle>
      <ModalQueryForm darkMode={darkMode} onSubmit={searchPixelLogs}>
        <ModalCoordRow darkMode={darkMode}>
          <ModalTextfield darkMode={darkMode} placeholder="Username" type="text" onChange={(e) => setUsername(e.target.value) }/>
          <button>
            <Search/>
          </button>
        </ModalCoordRow>
      </ModalQueryForm>
      { results.length ? (
        <ContainerLogsResult>
          <LogsResults>
            <thead>
              <tr>
                <th>Date</th>
                <th>Ip</th>
                <th>User Id</th>
                <th>Username</th>
                <th>Canvas</th>
                <th>Position</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{dateFormat(r.createdAt)}</td>
                  <td>{r.ip}</td>
                  <td>{r.userId}</td>
                  <td>{r.username}</td>
                  <td>{r.canvas}</td>
                  <td>{r.pos.x},{r.pos.y}</td>
                  <td>
                    <div style={{ display: "inline-block", height: "10px", width: "10px", backgroundColor: r.color, marginRight: ".5rem" }}/>
                    {r.color}
                  </td>
                </tr>
              ))}
            </tbody>
          </LogsResults>
        </ContainerLogsResult>
      ) : null}
    </ModalBoxContainer>
  );
}

function IpPixelLogs() {
  const [ip, setIp] = useState("");
  const [results, setResults] = useState<PixelLogResult[]>([]);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const searchPixelLogs = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/ipPixelLogs/${ip}`, { headers: { 'Authorization': token } });
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <ModalBoxContainer darkMode={darkMode}>
      <ModalBoxTitle darkMode={darkMode}>
        IP Pixel Logs
      </ModalBoxTitle>
      <ModalQueryForm darkMode={darkMode} onSubmit={searchPixelLogs}>
        <ModalCoordRow darkMode={darkMode}>
          <ModalTextfield darkMode={darkMode} placeholder="Ip" type="text" onChange={(e) => setIp(e.target.value) }/>
          <button>
            <Search/>
          </button>
        </ModalCoordRow>
      </ModalQueryForm>
      { results.length ? (
        <ContainerLogsResult>
          <LogsResults>
            <thead>
              <tr>
                <th>Date</th>
                <th>Ip</th>
                <th>User Id</th>
                <th>Username</th>
                <th>Canvas</th>
                <th>Position</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{dateFormat(r.createdAt)}</td>
                  <td>{r.ip}</td>
                  <td>{r.userId}</td>
                  <td>{r.username}</td>
                  <td>{r.canvas}</td>
                  <td>{r.pos.x},{r.pos.y}</td>
                  <td>
                    <div style={{ display: "inline-block", height: "10px", width: "10px", backgroundColor: r.color, marginRight: ".5rem" }}/>
                    {r.color}
                  </td>
                </tr>
              ))}
            </tbody>
          </LogsResults>
        </ContainerLogsResult>
      ) : null}
    </ModalBoxContainer>
  );
}

export default function PageLogs() {
  return (
    <>
      <PixelLogs/>
      <UserPixelLogs/>
      <IpPixelLogs/>
    </>
  )
}