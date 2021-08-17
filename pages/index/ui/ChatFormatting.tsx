import React from 'react';
import styled from 'styled-components';
import md5 from 'md5';
import { store } from '../store';

function createColor(text: string) {
  return '#' + md5(text).substr(0, 6);
}

const Position = styled.span`
  color: #428BCA;
  padding: 0 2px;
  cursor: pointer;
  &:hover {
    color: #226BAA;
  }
`;
const Mention = styled.span<{color: string, isMe: boolean}>`
  ${( { isMe, color }) => `${isMe ? 'background-color' : 'color'}: ${color}`};
  ${( { isMe }) => `${isMe ? 'color' : 'background-color'}: ${isMe ? '#FFF' : 'transparent'}`};
  padding: 0 2px;
`;
const Greentext = styled.span`
  color: green;
`;

export enum FormatType {
  TEXT = 'TEXT',
  BREAK = 'BREAK',
  POSITION = 'POSITION',
  MENTION = 'MENTION',
  GREENTEXT = 'GREENTEXT',
  BOLD = 'BOLD',
  ITALICS = 'ITALICS',
  UNDERLINE = 'UNDERLINE',
  CODE = 'CODE',
}

const formattingTypes = [
  {
    type: FormatType.BREAK,
    regex: /\n/gm,
  },
  {
    type: FormatType.POSITION,
    regex: /#.\(-?\d*,\s*-?\d*,\s*-?\d*\)/gm,
  },
  {
    type: FormatType.MENTION,
    regex: /@[^\s]*/gm,
  },
  {
    type: FormatType.GREENTEXT,
    regex: /^>.*$/gm,
  },
  {
    type: FormatType.BOLD,
    regex: /\*{2}(.*?(?:(?=\*{2}\w)|(?=\*{2}$)))\*{2}/gm
  },
  {
    type: FormatType.ITALICS,
    regex: /(?:[^\*]|^)\*([^*]+)\*(?:[^\*]|$)/gm,
  },
  {
    type: FormatType.UNDERLINE,
    regex: /_{2}([^_]+)_{2}/gm
  },
  {
    type: FormatType.CODE,
    regex: /`.*`/gm
  }
]

export default function formatChatText(text: string, onClick: (type: FormatType, text: string) => void) {
  let formattings: { type: FormatType, text: string, index: number }[] = []

  formattingTypes.forEach(({ type, regex }) => {
    const found = [...text.matchAll(regex)];
    const newFormattings = found.map((e) => ({ type, text: e[0], index: e.index! }))
    formattings.push(...newFormattings.filter((f) => formattings.findIndex((f2) => f.index >= f2.index && f.index <= f2.index + f2.text.length) === -1));
  });
  formattings = formattings.sort((a, b) => a.index - b.index);
  formattings = formattings.filter((f, i) => formattings.findIndex((f2, i2) => i > i2 && f.index >= f2.index && f.index <= f2.index + f2.text.length ) === -1);

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
          case FormatType.POSITION:
            return <Position onClick={() => onClick(FormatType.POSITION, text)} key={i}>{text}</Position>;
          case FormatType.MENTION:
            const name = text.replace('@', '');
            return <Mention isMe={name === store?.getState().user?.username} color={createColor(name)} key={i}>{text}</Mention>;
          case FormatType.BOLD:
            return <b key={i}>{formatChatText(text.replace(/\*{2}/gm, ''), onClick)}</b>
          case FormatType.ITALICS:
            return <i key={i}>{formatChatText(text.replace(/\*/gm, ''), onClick)}</i>
          case FormatType.UNDERLINE:
            return <u key={i}>{formatChatText(text.replace(/_{2}/gm, ''), onClick)}</u>
          case FormatType.CODE:
            return <code key={i}>{text.replace(/`/gm, '')}</code>
          case FormatType.GREENTEXT:
            return <Greentext key={i}>&gt;{formatChatText(text.replace('>', ''), onClick)}</Greentext>
        }
      })}
    </>
  )
}