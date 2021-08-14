import axios from "axios";
import { FormEvent, useState } from "react";
import { CheckSquare, Send, Square } from "react-feather";
import { API_URL } from "../constants/api";
import { BoxContainer, BoxTitle, Checkbox, CoordRow, ErrorBox, QueryForm, Textfield } from "./utils"

function BanIp() {
  const [ip, setIp] = useState("");
  const [ban, setBan] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const banIp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/ban`, { ip, ban }, { headers: { 'Authorization': token } });
      setIp("")
      setStatus("success");
    } catch (err) {
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
          <Textfield placeholder="IP" type="text" value={ip} onChange={(e) => setIp(e.target.value) }/>
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
  const [ban, setBan] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const banUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/banUser`, { username, ban }, { headers: { 'Authorization': token } });
      setUsername("")
      setStatus("success");
    } catch (err) {
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