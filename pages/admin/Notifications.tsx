import axios from "axios";
import { FormEvent, useState } from "react";
import { Send } from "react-feather";
import { API_URL } from "../constants/api";
import { BoxContainer, BoxTitle, CoordRow, ErrorBox, QueryForm, Textarea, Textfield } from "../pagesComponents"

function CreateNotification() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const banIp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      if (!title || !text) {
        setError("Empty text or title");
        setStatus("error");
        return;
      }
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/notifications/create`, { title, text }, { headers: { 'Authorization': token } });
      setTitle("");
      setText("")
      setStatus("success");
    } catch (err) {
      setError(err.response.data || err.message);
      setStatus("error");
    }
  }

  return (
    <BoxContainer status={status}>
      <BoxTitle>
        Create Notification
      </BoxTitle>
      <QueryForm onSubmit={banIp}>
        <CoordRow>
          <Textfield placeholder="Title" type="text" value={title} onChange={(e) => setTitle(e.target.value) }/>
          <button>
            <Send/>
          </button>
        </CoordRow>
        <CoordRow>
          <Textarea placeholder="Text" rows={10} value={text} onChange={(e) => setText(e.target.value) }/>
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

export default function PageNotifications() {
  return (
    <>
      <CreateNotification/>
    </>
  )
}