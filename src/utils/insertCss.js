const insertCss = (css) => {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
  return style;
};

export default insertCss;