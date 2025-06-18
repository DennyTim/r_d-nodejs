export const parseArgs = (args) => {
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {

      const key = args[i].replace("--", "");

      if (!args[i + 1]?.startsWith("--")) {
        parsed[key] = args[i + 1];
      } else {
        parsed[key] = true;
      }

      i++;
    }
  }
  return parsed;
};
