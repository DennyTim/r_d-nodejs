const commands = [];

export const addCommand = (name, handler) => {
  commands.push({ name, handler });
};

export const handleCommand = (command, args) => {
  const entry = commands.find(c => c.name === command);

  if (entry) {
    entry.handler(args);
  } else {
    console.log("Unknown command. Use one of: " + commands.map(c => c.name).join(", "));
  }
};
