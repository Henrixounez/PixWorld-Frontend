import axios from "axios";
import { FormEvent, useState } from "react";
import { Search } from "react-feather";
import styled from "styled-components";
import { API_URL } from "../constants/api";
import { BoxContainer, BoxTitle, CoordRow, onCoordinatesPaste, QueryForm, Textfield } from "../pagesComponents"

const ContainerLogsResult = styled.div`
  height: 500px;
  overflow: auto;
  position: relative;
`;
const LogsResults = styled.table`
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
    <BoxContainer>
      <BoxTitle>
        Coordinate Pixel Logs
      </BoxTitle>
      <QueryForm onSubmit={searchPixelLogs}>
        <CoordRow onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)}>
          <Textfield placeholder="Coord X" type="number" value={x} onChange={(e) => setX(Number(e.target.value)) }/>
          <Textfield placeholder="Coord Y" type="number" value={y} onChange={(e) => setY(Number(e.target.value)) }/>
        </CoordRow>
        <CoordRow onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)}>
          <Textfield placeholder="Canvas" type="text" value={canvas} onChange={(e) => setCanvas(e.target.value) }/>
          <button>
            <Search/>
          </button>
        </CoordRow>
      </QueryForm>
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
    </BoxContainer>
  );
}

function UserPixelLogs() {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<PixelLogResult[]>([]);

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
    <BoxContainer>
      <BoxTitle>
        User Pixel Logs
      </BoxTitle>
      <QueryForm onSubmit={searchPixelLogs}>
        <CoordRow>
          <Textfield placeholder="Username" type="text" onChange={(e) => setUsername(e.target.value) }/>
          <button>
            <Search/>
          </button>
        </CoordRow>
      </QueryForm>
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
    </BoxContainer>
  );
}

export default function PageLogs() {
  return (
    <>
      <PixelLogs/>
      <UserPixelLogs/>
    </>
  )
}