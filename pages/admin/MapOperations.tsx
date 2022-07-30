import axios from "axios";
import { FormEvent, useState } from "react";
import { Send } from "react-feather";
import { API_URL } from "../constants/api";
import { BoxContainer, BoxTitle, CoordRow, ErrorBox, onCoordinatesPaste, QueryForm, Textfield } from "../pagesComponents"

function Import() {
  const [url, setUrl] = useState("");
  const [canvas, setCanvas] = useState("");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
    <BoxContainer status={status}>
      <BoxTitle>
        Import Image
      </BoxTitle>
      <QueryForm onSubmit={importImage}>
        <CoordRow>
          <Textfield placeholder="URL" type="text" value={url} onChange={(e) => setUrl(e.target.value) }/>
          <Textfield onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)} placeholder="Canvas" type="text" value={canvas} onChange={(e) => setCanvas(e.target.value) }/>
        </CoordRow>
        <CoordRow onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)}>
          <Textfield placeholder="X" type="number" value={x} onChange={(e) => setX(Number(e.target.value)) }/>
          <Textfield placeholder="Y" type="number" value={y} onChange={(e) => setY(Number(e.target.value)) }/>
        </CoordRow>
        <CoordRow>
          <div style={{ flex: 1 }}/>
          <button>
            <Send/>
          </button>
        </CoordRow>
      </QueryForm>
      { error ? (
        <ErrorBox>
          {error}
        </ErrorBox>
      ) : null}
    </BoxContainer>
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
    <BoxContainer status={status}>
      <BoxTitle>
        Erase
      </BoxTitle>
      <QueryForm onSubmit={importImage}>
        <CoordRow onPaste={(e) => onCoordinatesPaste(e, setStartX, setStartY, setCanvas)}>
          <Textfield placeholder="Start X" type="number" value={startX} onChange={(e) => setStartX(Number(e.target.value)) }/>
          <Textfield placeholder="Start Y" type="number" value={startY} onChange={(e) => setStartY(Number(e.target.value)) }/>
        </CoordRow>
        <CoordRow onPaste={(e) => onCoordinatesPaste(e, setEndX, setEndY, setCanvas)}>
          <Textfield placeholder="End X" type="number" value={endX} onChange={(e) => setEndX(Number(e.target.value)) }/>
          <Textfield placeholder="End Y" type="number" value={endY} onChange={(e) => setEndY(Number(e.target.value)) }/>
        </CoordRow>
        <CoordRow>
          <Textfield placeholder="Canvas" type="text" value={canvas} onChange={(e) => setCanvas(e.target.value) }/>
          <Textfield placeholder="Color" type="text" value={color} onChange={(e) => setColor(e.target.value)} />
          <button>
            <Send/>
          </button>
        </CoordRow>
      </QueryForm>
      { error ? (
        <ErrorBox>
          {error}
        </ErrorBox>
      ) : null}
    </BoxContainer>
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