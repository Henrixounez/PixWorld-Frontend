import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { Send } from "react-feather";
import { useSelector } from "react-redux";
import { API_URL } from "../../../../constants/api";
import { onCoordinatesPaste } from "../../../../pagesComponents";
import { ReduxState } from "../../../store";
import { dateEnToFr, dateFrToEn } from "../../HistoryMode";
import {
  CustomModalSelect,
  ModalBoxContainer,
  ModalBoxTitle,
  ModalCoordRow,
  ModalErrorBox,
  ModalQueryForm,
  ModalSelect,
  ModalTextfield,
} from "./components";

export function ColorInputSelect({
  color,
  setColor,
  canvas,
}: {
  color: string;
  setColor(c: string): void;
  canvas: string;
}) {
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const canvases = useSelector((state: ReduxState) => state.canvases);

  return (
    <CustomModalSelect
      darkMode={darkMode}
      value={
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: color,
            }}
          />
          <p style={{ margin: 0 }}>{color}</p>
        </div>
      }
    >
      {canvases
        .find((c) => c.id === canvas)
        ?.palette.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => setColor(c)}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: c,
              }}
            />
            <p style={{ margin: 0 }}>{c}</p>
          </div>
        ))}
    </CustomModalSelect>
  );
}

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
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/import`,
        { input: url, canvas, x, y },
        { headers: { Authorization: token } }
      );
      setStatus("success");
    } catch (err: any) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  };

  return (
    <ModalBoxContainer darkMode={darkMode} status={status}>
      <ModalBoxTitle darkMode={darkMode}>Import Image</ModalBoxTitle>
      <ModalQueryForm darkMode={darkMode} onSubmit={importImage}>
        <ModalCoordRow darkMode={darkMode}>
          <ModalTextfield
            darkMode={darkMode}
            placeholder="URL"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <ModalTextfield
            darkMode={darkMode}
            onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)}
            placeholder="Canvas"
            type="text"
            value={canvas}
            onChange={(e) => setCanvas(e.target.value)}
          />
        </ModalCoordRow>
        <ModalCoordRow
          darkMode={darkMode}
          onPaste={(e) => onCoordinatesPaste(e, setX, setY, setCanvas)}
        >
          <ModalTextfield
            darkMode={darkMode}
            placeholder="X"
            type="number"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
          />
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Y"
            type="number"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
          />
        </ModalCoordRow>
        <ModalCoordRow darkMode={darkMode}>
          <div style={{ flex: 1 }} />
          <button>
            <Send />
          </button>
        </ModalCoordRow>
      </ModalQueryForm>
      {error ? (
        <ModalErrorBox darkMode={darkMode}>{error}</ModalErrorBox>
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
  const canvases = useSelector((state: ReduxState) => state.canvases);

  const importImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setStatus("");
      setError("");
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/fill`,
        { x: startX, y: startY, endX, endY, canvas, color: color },
        { headers: { Authorization: token } }
      );
      setStatus("success");
    } catch (err: any) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  };

  return (
    <ModalBoxContainer darkMode={darkMode} status={status}>
      <ModalBoxTitle darkMode={darkMode}>Erase</ModalBoxTitle>
      <ModalQueryForm darkMode={darkMode} onSubmit={importImage}>
        <ModalCoordRow
          darkMode={darkMode}
          onPaste={(e) => {
            onCoordinatesPaste(e, setStartX, setStartY, setCanvas);
          }}
        >
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Start X"
            type="number"
            value={startX}
            onChange={(e) => setStartX(Number(e.target.value))}
          />
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Start Y"
            type="number"
            value={startY}
            onChange={(e) => setStartY(Number(e.target.value))}
          />
        </ModalCoordRow>
        <ModalCoordRow
          darkMode={darkMode}
          onPaste={(e) => {
            onCoordinatesPaste(e, setEndX, setEndY, setCanvas);
          }}
        >
          <ModalTextfield
            darkMode={darkMode}
            placeholder="End X"
            type="number"
            value={endX}
            onChange={(e) => setEndX(Number(e.target.value))}
          />
          <ModalTextfield
            darkMode={darkMode}
            placeholder="End Y"
            type="number"
            value={endY}
            onChange={(e) => setEndY(Number(e.target.value))}
          />
        </ModalCoordRow>
        <ModalCoordRow darkMode={darkMode}>
          <ModalSelect
            darkMode={darkMode}
            value={canvas}
            onChange={(e) => {
              setCanvas(e.target.value);
              setColor("");
            }}
          >
            <option value="" disabled>
              Canvas
            </option>
            {canvases.map((c, i) => (
              <option key={i} value={c.id}>
                {c.name}
              </option>
            ))}
          </ModalSelect>
          <ColorInputSelect color={color} setColor={setColor} canvas={canvas} />

          <button>
            <Send />
          </button>
        </ModalCoordRow>
      </ModalQueryForm>
      {error ? (
        <ModalErrorBox darkMode={darkMode}>{error}</ModalErrorBox>
      ) : null}
    </ModalBoxContainer>
  );
}

function Rollback() {
  const [canvas, setCanvas] = useState("");
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");

  const [minDate, setMinDate] = useState(new Date().toLocaleDateString('fr-FR').replace(/\//g, '-'));
  const [availableHours, setAvailableHours] = useState<string[]>([]);

  const [loadedDateOnCanvas, setLoadedDateOnCanvas] = useState("");

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const canvases = useSelector((state: ReduxState) => state.canvases);

  const importImage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setStatus("");
      setError("");
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/rollback`,
        { x: startX, y: startY, endX, endY, canvas, date, hour },
        { headers: { Authorization: token } }
      );
      setStatus("success");
    } catch (err: any) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  };

  async function getFirstDate() {
    try {
      const datesUrl = `${API_URL}/history/dates/${canvas}`;
      const res = await axios(datesUrl);

      if (res.data.length) {
        setMinDate(res.data[0]);
      }
      setLoadedDateOnCanvas(canvas);
    } catch (err) {
      console.error(err);
    }
  }
  async function setHoursFromDate(date: string) {
    if (!date || date === '')
      return;
    try {
      const hoursUrl = `${API_URL}/history/hours/${date}/${canvas}`
      const res = await axios(hoursUrl);
      setAvailableHours(res.data || []);
      setHour(res.data[0] || '');
    } catch (err) {
      console.error(err);
    }
  }

  function getCurrentDate() {
    if (date !== '') {
      const newDate = new Date(dateFrToEn(date));
      newDate.setMinutes(newDate.getMinutes() -  newDate.getTimezoneOffset());
      return newDate.toISOString().slice(0, 10);
    } else {
      return minDate;
    }
  }
  function changeDate(value: string) {
    setDate(dateEnToFr(value));
  }


  useEffect(() => {
    if (canvas) {
      if (loadedDateOnCanvas !== canvas)
        getFirstDate();
      if (!availableHours.length)
        setHoursFromDate(date);
    }
  }, [canvas]);

  useEffect(() => {
    if (canvas && date !== '')
      setHoursFromDate(date);
  }, [date, canvas]);

  return (
    <ModalBoxContainer darkMode={darkMode} status={status}>
      <ModalBoxTitle darkMode={darkMode}>Rollback</ModalBoxTitle>
      <ModalQueryForm darkMode={darkMode} onSubmit={importImage}>
        <ModalCoordRow
          darkMode={darkMode}
          onPaste={(e) => {
            onCoordinatesPaste(e, setStartX, setStartY, setCanvas);
          }}
        >
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Start X"
            type="number"
            value={startX}
            onChange={(e) => setStartX(Number(e.target.value))}
          />
          <ModalTextfield
            darkMode={darkMode}
            placeholder="Start Y"
            type="number"
            value={startY}
            onChange={(e) => setStartY(Number(e.target.value))}
          />
        </ModalCoordRow>
        <ModalCoordRow
          darkMode={darkMode}
          onPaste={(e) => {
            onCoordinatesPaste(e, setEndX, setEndY, setCanvas);
          }}
        >
          <ModalTextfield
            darkMode={darkMode}
            placeholder="End X"
            type="number"
            value={endX}
            onChange={(e) => setEndX(Number(e.target.value))}
          />
          <ModalTextfield
            darkMode={darkMode}
            placeholder="End Y"
            type="number"
            value={endY}
            onChange={(e) => setEndY(Number(e.target.value))}
          />
        </ModalCoordRow>
        <ModalCoordRow darkMode={darkMode}>
          <ModalSelect
            darkMode={darkMode}
            value={canvas}
            onChange={(e) => {
              setCanvas(e.target.value);
            }}
          >
            <option value="" disabled>
              Canvas
            </option>
            {canvases.map((c, i) => (
              <option key={i} value={c.id}>
                {c.name}
              </option>
            ))}
          </ModalSelect>

          <ModalTextfield
            darkMode={darkMode}
            placeholder="Date"
            type="date"
            min={new Date(dateFrToEn(minDate)).toISOString().slice(0, 10)}
            max={new Date().toISOString().slice(0, 10)}
            defaultValue={getCurrentDate()}
            onChange={(e) => changeDate(e.target.value)}
            disabled={!canvas}
          />

          <ModalSelect
            darkMode={darkMode}
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            disabled={!canvas || !availableHours.length}
          >
            <option value="" disabled>
              Hour
            </option>
            {availableHours.map((h, i) => (
              <option key={i} value={h}>
                {h}
              </option>
            ))}
          </ModalSelect>

          <button>
            <Send />
          </button>
        </ModalCoordRow>
      </ModalQueryForm>
      {error ? (
        <ModalErrorBox darkMode={darkMode}>{error}</ModalErrorBox>
      ) : null}
    </ModalBoxContainer>
  );
}

export default function PageMapOperations() {
  return (
    <>
      <Import />
      <Erase />
      <Rollback />
    </>
  );
}
