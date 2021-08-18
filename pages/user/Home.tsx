import { useTranslation } from "next-i18next";
import React from "react";
import { useSelector } from "react-redux"

import { BoxContainer, BoxRow, BoxTitle } from "../pagesComponents"
import { UserReduxState } from "./store"

function Stats() {
  const { t } = useTranslation('stats');
  const user = useSelector((state: UserReduxState) => state.user);

  return (
    <BoxContainer>
      <BoxTitle>
        {user?.username} - {t('title')}
      </BoxTitle>
      <BoxRow>
        <b>{t('profile.pixelsToday')}:</b> {user?.dailyPixels}<br/>
      </BoxRow>
      <BoxRow>
        <b>{t('profile.pixelsTotal')}:</b> {user?.totalPixels}<br/>
      </BoxRow>
    </BoxContainer>
  )
}

export default function PageHome() {
  return (
    <>
      <Stats/>
    </>
  )
}