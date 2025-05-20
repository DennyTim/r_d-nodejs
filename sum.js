const [, , param] = process.argv;

const sumList = (list) => list.reduce((acc, curr) => Array.isArray(curr) ? acc + sumList(curr) : acc + curr, 0)

(function(list) {
  if (typeof list === "string") {
    list = JSON.parse(list);
  }

  if (!Array.isArray(list)) {
    throw new Error('Param isn\'t a list')
  }

  const result = sumList(list);
  console.log('Sum operation result: ', result)
})(param);
