import axios from "axios";
import { format } from "date-fns";
import { FormEvent, useState } from "react";
import { CheckSquare, Send, Square } from "react-feather";
import { API_URL } from "../constants/api";
import { BoxContainer, BoxTitle, Checkbox, CoordRow, ErrorBox, QueryForm, Textfield } from "../pagesComponents"

function BanIp() {
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [ban, setBan] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
    <BoxContainer status={status}>
      <BoxTitle>
        Ban IP
      </BoxTitle>
      <QueryForm onSubmit={banIp}>
        <CoordRow>
          <Textfield placeholder="IP" type="text" value={ip} required onChange={(e) => setIp(e.target.value) }/>
          <Textfield placeholder="Reason" type="text" value={reason} required={ban} onChange={(e) => setReason(e.target.value)} />
          <Textfield type="datetime-local" value={date} min={format(new Date(), "yyyy-MM-dd'T'hh:mm")} step={60} onChange={(e) => setDate(e.target.value)} />
          <Checkbox onClick={() => setBan(!ban) }>
            {ban ? <CheckSquare/> : <Square/> }
          </Checkbox>
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

function BanUser() {
  const [username, setUsername] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [ban, setBan] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
    <BoxContainer status={status}>
      <BoxTitle>
        Ban User
      </BoxTitle>
      <QueryForm onSubmit={banUser}>
        <CoordRow>
          <Textfield placeholder="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value) }/>
          <Textfield placeholder="Reason" type="text" value={reason} required={ban} onChange={(e) => setReason(e.target.value)} />
          <Textfield type="datetime-local" value={date} min={format(new Date(), "yyyy-MM-dd'T'hh:mm")} step={60} onChange={(e) => setDate(e.target.value)} />
          <Checkbox onClick={() => setBan(!ban) }>
            {ban ? <CheckSquare/> : <Square/> }
          </Checkbox>
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


export default function PageBan() {
  return (
    <>
      <BanIp/>
      <BanUser/>
    </>
  )
}