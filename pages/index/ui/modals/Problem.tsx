import { useTranslation } from "next-i18next";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "../../store";

export default function ModalProblem() {
  const disconnectReason = useSelector((state: ReduxState) => state.disconnectReason);
  const { t } = useTranslation('problem');

  return (
    <>
      <h3>
        {disconnectReason ? (
          disconnectReason.split('\n').map((m, i) => (
            <Fragment key={i}>
              {m}<br/>
            </Fragment>
          ))
        ) : (
          t('connectionLost')
        )}
      </h3>
      <hr/>
      {t('refresh')}
      <br/>
      <br/>
      <button onClick={() => location.reload()}>
        {t('refreshBtn')}
      </button>
    </>
  );
}