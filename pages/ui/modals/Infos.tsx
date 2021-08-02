import { useTranslation } from 'next-i18next';

export default function ModalInfos() {
  const { t } = useTranslation('infos');

  return (
    <>
      {t('text')}<br/>
      <hr/>
      {t('madeBy')}<br/>
      {t('os')} <a href="https://github.com/Henrixounez/PixWorld-Frontend">Frontend</a> & <a href="https://github.com/Henrixounez/PixWorld-Backend">Backend</a><br/>
      {t('discord')} <a href="https://discord.gg/kQPsRxNuDr">Discord</a>
    </>
  );
}