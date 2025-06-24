export const retrieveArgs = (str) => {
  const regex = /[^\s"]+|"([^"]*)"/g;
  const argList = [];
  let match;

  while ((match = regex.exec(str)) !== null) {
    argList.push(match[1] !== undefined ? match[1] : match[0]);
  }

  return argList;
};
