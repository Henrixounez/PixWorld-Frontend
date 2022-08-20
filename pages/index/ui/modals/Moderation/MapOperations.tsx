import axios from "axios";
import { FormEvent, useState } from "react";
import { Send } from "react-feather";
import { useSelector } from "react-redux";
import { API_URL } from "../../../../constants/api";
import { onCoordinatesPaste } from "../../../../pagesComponents";
import { ReduxState } from "../../../store";
import { ModalBoxContainer, ModalBoxTitle, ModalCoordRow, ModalErrorBox, ModalQueryForm, ModalTextfield } from "./components"

function Import() {
  const [url, setUrl] = useState("");
  const [canvas, setCanvas] = useState("");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const importImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setStatus("");
      setError("");
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/import`, { input: url, canvas, x, y }, { headers: { 'Authorization': token } });
      setStatus("success");
    } catch (err: any) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  }

  return (
    <ModalBoxContainer darkMode={darkMode} status={status}>
      <ModalBoxTitle darkMode={darkMode}>
        Import Image
      </ModalBoxTitle>
      <ModalQueryForm darkMode={darkMode} onSubmit={importImage}>
        <ModalCoordRow darkMode={darkMode}>
          <ModalTextfield darkMode={darkMode} placeholder="URL" type="text" value={url} onChange={(e) => setUrl(e.target.value) }/>
          <ModalTextfield darkMode={darkMode} onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)} placeholder="Canvas" type="text" value={canvas} onChange={(e) => setCanvas(e.target.value) }/>
        </ModalCoordRow>
        <ModalCoordRow darkMode={darkMode} onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)}>
          <ModalTextfield darkMode={darkMode} placeholder="X" type="number" value={x} onChange={(e) => setX(Number(e.target.value)) }/>
          <ModalTextfield darkMode={darkMode} placeholder="Y" type="number" value={y} onChange={(e) => setY(Number(e.target.value)) }/>
        </ModalCoordRow>
        <ModalCoordRow darkMode={darkMode}>
          <div style={{ flex: 1 }}/>
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

function Erase() {
  const [canvas, setCanvas] = useState("");
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [color, setColor] = useState("#0000");
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const importImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setStatus("");
      setError("");
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/fill`, { x: startX, y: startY, endX, endY, canvas, color: color }, { headers: { 'Authorization': token } });
      setStatus("success");
    } catch (err: any) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  }

  return (
    <ModalBoxContainer darkMode={darkMode} status={status}>
      <ModalBoxTitle darkMode={darkMode}>
        Erase
      </ModalBoxTitle>
      <ModalQueryForm darkMode={darkMode} onSubmit={importImage}>
        <ModalCoordRow darkMode={darkMode} onPaste={(e) => onCoordinatesPaste(e, setStartX, setStartY, setCanvas)}>
          <ModalTextfield darkMode={darkMode} placeholder="Start X" type="number" value={startX} onChange={(e) => setStartX(Number(e.target.value)) }/>
          <ModalTextfield darkMode={darkMode} placeholder="Start Y" type="number" value={startY} onChange={(e) => setStartY(Number(e.target.value)) }/>
        </ModalCoordRow>
        <ModalCoordRow darkMode={darkMode} onPaste={(e) => onCoordinatesPaste(e, setEndX, setEndY, setCanvas)}>
          <ModalTextfield darkMode={darkMode} placeholder="End X" type="number" value={endX} onChange={(e) => setEndX(Number(e.target.value)) }/>
          <ModalTextfield darkMode={darkMode} placeholder="End Y" type="number" value={endY} onChange={(e) => setEndY(Number(e.target.value)) }/>
        </ModalCoordRow>
        <ModalCoordRow darkMode={darkMode}>
          <ModalTextfield darkMode={darkMode} placeholder="Canvas" type="text" value={canvas} onChange={(e) => setCanvas(e.target.value) }/>
          <ModalTextfield darkMode={darkMode} placeholder="Color" type="text" value={color} onChange={(e) => setColor(e.target.value)} />
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

export default function PageMapOperations() {
  return (
    <>
      <Import/>
      <Erase/>
    </>
  )
}