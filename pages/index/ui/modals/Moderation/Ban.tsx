import axios from "axios";
import { format } from "date-fns";
import { FormEvent, useState } from "react";
import { CheckSquare, Send, Square } from "react-feather";
import { useSelector } from "react-redux";
import { API_URL } from "../../../../constants/api";
import { ReduxState } from "../../../store";
import { ModalBoxContainer, ModalBoxTitle, ModalCheckbox, ModalCoordRow, ModalErrorBox, ModalQueryForm, ModalTextfield } from "./components"

function BanIp() {
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [ban, setBan] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const banIp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/ban`, { ip, ban, reason, date }, { headers: { 'Authorization': token } });
      setIp("")
      setReason("");
      setDate("");
      setStatus("success");
    } catch (err: any) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  }

  return (
    <ModalBoxContainer darkMode={darkMode} status={status}>
      <ModalBoxTitle darkMode={darkMode}>
        Ban IP
      </ModalBoxTitle>
      <ModalQueryForm onSubmit={banIp} darkMode={darkMode}>
        <ModalCoordRow darkMode={darkMode}>
          <ModalTextfield placeholder="IP" type="text" value={ip} required onChange={(e) => setIp(e.target.value) } darkMode={darkMode}/>
          <ModalTextfield placeholder="Reason" type="text" value={reason} required={ban} onChange={(e) => setReason(e.target.value)} darkMode={darkMode} />
          <ModalTextfield type="datetime-local" value={date} min={format(new Date(), "yyyy-MM-dd'T'hh:mm")} step={60} onChange={(e) => setDate(e.target.value)} darkMode={darkMode} />
          <ModalCheckbox onClick={() => setBan(!ban) } darkMode={darkMode}>
            {ban ? <CheckSquare/> : <Square/> }
          </ModalCheckbox>
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

function BanUser() {
  const [username, setUsername] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [ban, setBan] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const banUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/banUser`, { username, ban, reason, date }, { headers: { 'Authorization': token } });
      setUsername("")
      setReason("");
      setDate("");
      setStatus("success");
    } catch (err: any) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  }

  return (
    <ModalBoxContainer status={status} darkMode={darkMode}>
      <ModalBoxTitle darkMode={darkMode}>
        Ban User
      </ModalBoxTitle>
      <ModalQueryForm onSubmit={banUser} darkMode={darkMode}>
        <ModalCoordRow darkMode={darkMode}>
          <ModalTextfield placeholder="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value) } darkMode={darkMode}/>
          <ModalTextfield placeholder="Reason" type="text" value={reason} required={ban} onChange={(e) => setReason(e.target.value)}  darkMode={darkMode}/>
          <ModalTextfield type="datetime-local" value={date} min={format(new Date(), "yyyy-MM-dd'T'hh:mm")} step={60} onChange={(e) => setDate(e.target.value)}  darkMode={darkMode}/>
          <ModalCheckbox onClick={() => setBan(!ban) } darkMode={darkMode}>
            {ban ? <CheckSquare/> : <Square/> }
          </ModalCheckbox>
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


export default function PageBan() {
  return (
    <>
      <BanIp/>
      <BanUser/>
    </>
  )
}