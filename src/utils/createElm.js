const createElm = (html) => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.removeChild(temp.firstElementChild);
};

export default createElm;