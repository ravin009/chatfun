const overrideConsole = () => {
  if (!__DEV__) {
      console.log = () => {};
  }
};

export default overrideConsole;
