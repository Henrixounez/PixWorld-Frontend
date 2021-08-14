import axios from "axios";
import { FormEvent, useState } from "react";
import { Search } from "react-feather";
import styled from "styled-components";
import { API_URL } from "../constants/api";
import { BoxContainer, BoxTitle, CoordRow, QueryForm, Textfield } from "./utils"

const ContainerLogsResult = styled.div`
  height: 500px;
  overflow: auto;
  position: relative;
`;
const LogsResults = styled.table`
  overflow: auto;
  margin: 1rem;
  width: 100%;
  max-width: 500px;
  row-gap: 1rem;
  column-gap: 1rem;
  border-collapse: collapse;
  td {
    padding: .25rem 0;
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
  ip: string,
  userId: number,
  pos: {
    x: number,
    y: number,
  }
  color: string
}

function PixelLogs() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [results, setResults] = useState<PixelLogResult[]>([]);

  const searchPixelLogs = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/pixelLogs/${x}/${y}`, { headers: { 'Authorization': token } });
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
        <CoordRow>
          <Textfield placeholder="Coord X" type="number" onChange={(e) => setX(Number(e.target.value)) }/>
          <Textfield placeholder="Coord Y" type="number" onChange={(e) => setY(Number(e.target.value)) }/>
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
                <th>ip</th>
                <th>userId</th>
                <th>Position</th>
                <th>Color</th>
              </tr>
            </thead>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.ip}</td>
                <td>{r.userId}</td>
                <td>{r.pos.x},{r.pos.y}</td>
                <td>
                  <div style={{ display: "inline-block", height: "10px", width: "10px", backgroundColor: r.color, marginRight: ".5rem" }}/>
                  {r.color}
                </td>
              </tr>
            ))}
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
                <th>ip</th>
                <th>userId</th>
                <th>Position</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.ip}</td>
                  <td>{r.userId}</td>
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