const [, , param] = process.argv;

const sumList = (list) => {
  if (Array.isArray(list) && !list.some(item => Array.isArray(item))) {
    return list.reduce((acc, curr) => acc + curr, 0);
  } else {
    return sumList(list.flat());
  }
}

(function(list) {
  if (typeof list === "string") {
    list = JSON.parse(list);
  }

  const result = sumList(list);
  console.log('Sum operation result: ', result)
})(param);
