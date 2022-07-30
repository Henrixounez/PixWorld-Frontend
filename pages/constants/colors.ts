export enum Colors {
  UI_BACKGROUND,
  UI_BACKDROP,
  UI_BORDER,
  TEXT,
  LIGHT_TEXT,
  UNREAD,
  LINK,
  HOVERED_LINK,
  ALERT,
}

const colors = {
  [Colors.UI_BACKGROUND]: "#FFFD",
  [Colors.UI_BACKDROP]: "#FFFA",
  [Colors.UI_BORDER]: "#000",
  [Colors.TEXT]: "#000",
  [Colors.LIGHT_TEXT]: '#444',
  [Colors.UNREAD]: "#FF0000",
  [Colors.LINK]: "#428BCA",
  [Colors.HOVERED_LINK]: "#226BAA",
  [Colors.ALERT]: "#FFA9A9cc",
};

const darkThemeColors = {
  [Colors.UI_BACKGROUND]: "#000D",
  [Colors.UI_BACKDROP]: "#000A",
  [Colors.UI_BORDER]: "#FFF",
  [Colors.TEXT]: "#FFF",
  [Colors.LIGHT_TEXT]: '#AAA',
  [Colors.UNREAD]: "#FF0000",
  [Colors.LINK]: "#428BCA",
  [Colors.HOVERED_LINK]: "#226BAA",
  [Colors.ALERT]: "#FFA9A9cc",
};

// Christmas Colors
// const colors = {
//   [Colors.UI_BACKGROUND]: "#ff4949",
//   [Colors.UI_BACKDROP]: "#FFFA",
//   [Colors.UI_BORDER]: "#FFF",
//   [Colors.TEXT]: "#FFF",
//   [Colors.LIGHT_TEXT]: '#444',
//   [Colors.UNREAD]: "#FF0000",
//   [Colors.LINK]: "#428BCA",
//   [Colors.HOVERED_LINK]: "#226BAA",
//   [Colors.ALERT]: "#FFA9A9cc",
// };

// const darkThemeColors = {
//   [Colors.UI_BACKGROUND]: "#000D",
//   [Colors.UI_BACKDROP]: "#000A",
//   [Colors.UI_BORDER]: "#ff8181",
//   [Colors.TEXT]: "#ff8181",
//   [Colors.LIGHT_TEXT]: '#AAA',
//   [Colors.UNREAD]: "#FF0000",
//   [Colors.LINK]: "#428BCA",
//   [Colors.HOVERED_LINK]: "#226BAA",
//   [Colors.ALERT]: "#FFA9A9cc",
// };

export function getColor(colorName: Colors, darkMode: boolean) {
  return darkMode ? darkThemeColors[colorName] : colors[colorName];
}