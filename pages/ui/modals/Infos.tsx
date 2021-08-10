import { useTranslation } from 'next-i18next';
import React from 'react';
import styled from "styled-components";

const Text = styled.div`
  text-align: left;
  margin: auto;
  width: fit-content;
`;
const Key = styled.span`
  border: 1px solid #333;
  padding: 0.3rem 0.4rem;
  border-radius: 0.4rem;
  color: #333;
  font-weight: bold;
  font-size: 0.8rem;
  line-height: 2rem;
`;

export enum FormatType {
  TEXT = 'TEXT',
  BREAK = 'BREAK',
  KEY = 'KEY',
  TAB = 'TAB',
}

const formattingTypes = [
  {
    type: FormatType.BREAK,
    regex: /\n/gm,
  },
  {
    type: FormatType.KEY,
    regex: /Key([^\s]*)/gm,
  },
  {
    type: FormatType.TAB,
    regex: /\s\s/gm,
  }
];

function formatControls(text: string) {
  let formattings: { type: FormatType, text: string, index: number }[] = []

  formattingTypes.forEach(({ type, regex }) => {
    const found = [...text.matchAll(regex)];
    formattings.push(...found.map((e) => ({ type, text: e[0], index: e.index! })));
  });
  formattings = formattings.sort((a, b) => a.index - b.index);

  let index = 0;
  formattings.push(...formattings.map((f) => {
    const start = f.index;
    const length = f.text.length;

    const txt = {
      type: FormatType.TEXT,
      text: text.substr(index, start - index),
      index,
    };
    index = start + length;
    return txt;
  })
    .concat([ { type: FormatType.TEXT, text: text.substr(index), index }])
  );

  formattings = formattings.sort((a, b) => a.index - b.index);

  return (
    <>
      {formattings.map(({ type, text }, i) => {
        switch (type) {
          case FormatType.TEXT:
            return <React.Fragment key={i}>{text}</React.Fragment>;
          case FormatType.BREAK:
            return <br key={i}/>;  
          case FormatType.KEY:
            return <Key key={i}>{text.substr(3)}</Key>;
          case FormatType.TAB:
            return <React.Fragment key={i}>&nbsp;&nbsp;</React.Fragment>
        }
      })}
    </>
  )
}

export default function ModalInfos() {
  const { t } = useTranslation('infos');

  return (
    <>
      {t('text')}<br/>
      <hr/>
      {t('madeBy')}<br/>
      {t('os')} <a href="https://github.com/Henrixounez/PixWorld-Frontend">Frontend</a> & <a href="https://github.com/Henrixounez/PixWorld-Backend">Backend</a><br/>
      {t('discord')} <a href="https://discord.gg/kQPsRxNuDr">Discord</a>
      <hr/>
      <Text>
        {formatControls(t('controls'))}
      </Text>
    </>
  );
}