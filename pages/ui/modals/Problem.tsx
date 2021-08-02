import { useTranslation } from "next-i18next";

export default function ModalProblem() {
  const { t } = useTranslation('problem');

  return (
    <>
      <h3>
        {t('connectionLost')}
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