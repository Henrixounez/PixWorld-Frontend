import axios from "axios";
import { FormEvent, useState } from "react";
import { Search, Send } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import { API_URL } from "../../../../constants/api";
import { onCoordinatesPaste } from "../../../../pagesComponents";
import { ReduxState } from "../../../store";
import { NoPixelZoneReturn, SET_NPZ_MODE } from "../../../store/actions/painting";
import {
  ModalBoxContainer,
  ModalBoxTitle,
  ModalCoordRow,
  ModalErrorBox,
  ModalQueryForm,
  ModalTextfield,
} from "./components";
import { ContainerLogsResult, LogsResults } from "./Logs";

function CreateNPZ() {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);
  const [canvas, setCanvas] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const npzMode = useSelector((state: ReduxState) => state.npzMode);
  const currentNpzs = useSelector((state: ReduxState) => state.npzList);
  const dispatch = useDispatch();

  const createNpz = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/noPixelZone`, { startX, startY, endX, endY, canvas }, { headers: { 'Authorization': token } });
      const npzRes: NoPixelZoneReturn[] = !npzMode ? (await axios.get(`${API_URL}/noPixelZone`, { headers: { 'Authorization': token } })).data : currentNpzs;
      dispatch({
        type: SET_NPZ_MODE,
        payload: {
          activated: npzMode,
          npzs: npzRes
        }
      });
      setStatus("success");
    } catch (err: any) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  }

  return (
    <ModalBoxContainer darkMode={darkMode} status={status}>
      <ModalBoxTitle darkMode={darkMode}>Create No Pixel Zone</ModalBoxTitle>
      <ModalQueryForm darkMode={darkMode} onSubmit={createNpz}>
        <ModalCoordRow
          darkMode={darkMode}
          onPaste={(e) =>
            onCoordinatesPaste(e, setStartX, setStartY, setCanvas)
          }
        >
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Coord X"
            type="number"
            value={startX}
            onChange={(e) => setStartX(Number(e.target.value))}
          />
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Coord Y"
            type="number"
            value={startY}
            onChange={(e) => setStartY(Number(e.target.value))}
          />
        </ModalCoordRow>
        <ModalCoordRow
          darkMode={darkMode}
          onPaste={(e) => onCoordinatesPaste(e, setEndX, setEndY, setCanvas)}
        >
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Coord X"
            type="number"
            value={endX}
            onChange={(e) => setEndX(Number(e.target.value))}
          />
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Coord Y"
            type="number"
            value={endY}
            onChange={(e) => setEndY(Number(e.target.value))}
          />
        </ModalCoordRow>
        <ModalCoordRow darkMode={darkMode}>
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Canvas"
            type="text"
            value={canvas}
            onChange={(e) => setCanvas(e.target.value)}
          />
          <button>
            <Send />
          </button>
        </ModalCoordRow>
      </ModalQueryForm>
      { error ? (
        <ModalErrorBox darkMode={darkMode}>
          {error}
        </ModalErrorBox>
      ) : null}
    </ModalBoxContainer>
  );
}

function DeleteNPZ() {
  const [npzId, setNpzId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const npzMode = useSelector((state: ReduxState) => state.npzMode);
  const currentNpzs = useSelector((state: ReduxState) => state.npzList);
  const dispatch = useDispatch();

  const banIp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/noPixelZone/${npzId}`, { headers: { 'Authorization': token } });
      setStatus("success");
      const npzRes: NoPixelZoneReturn[] = !npzMode ? (await axios.get(`${API_URL}/noPixelZone`, { headers: { 'Authorization': token } })).data : currentNpzs;
      dispatch({
        type: SET_NPZ_MODE,
        payload: {
          activated: npzMode,
          npzs: npzRes
        }
      });

    } catch (err: any) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  }

  return (
    <ModalBoxContainer darkMode={darkMode} status={status}>
      <ModalBoxTitle darkMode={darkMode}>
        Delete No Pixel Zone
      </ModalBoxTitle>
      <ModalQueryForm onSubmit={banIp} darkMode={darkMode}>
        <ModalCoordRow darkMode={darkMode}>
          <ModalTextfield placeholder="npzId" type="text" value={npzId} required onChange={(e) => setNpzId(e.target.value) } darkMode={darkMode}/>
          <button>
            <Send/>
          </button>
        </ModalCoordRow>
      </ModalQueryForm>
      { error ? (
        <ModalErrorBox darkMode={darkMode}>
          {error}
        </ModalErrorBox>
      ) : null}
    </ModalBoxContainer>
  );
}

function ListNPZ() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [canvas, setCanvas] = useState("");
  const [results, setResults] = useState<NoPixelZoneReturn[]>([]);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const searchPixelLogs = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/noPixelZone/byCoordinates/${canvas}/${x}/${y}`, { headers: { 'Authorization': token } });
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <ModalBoxContainer darkMode={darkMode}>
      <ModalBoxTitle darkMode={darkMode}>
        Search No Pixel Zones
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
                <th>ID</th>
                <th>Canvas</th>
                <th>Start X</th>
                <th>Start Y</th>
                <th>End X</th>
                <th>End Y</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.id}</td>
                  <td>{r.startX}</td>
                  <td>{r.startY}</td>
                  <td>{r.endX}</td>
                  <td>{r.endY}</td>
                </tr>
              ))}
            </tbody>
          </LogsResults>
        </ContainerLogsResult>
      ) : null}
    </ModalBoxContainer>
  );
}

export default function NoPixelZone() {
  return (
    <>
      <CreateNPZ />
      <DeleteNPZ />
      <ListNPZ />
    </>
  );
}
