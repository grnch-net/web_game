function wait(time = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1000);
  });
}

export {
  wait
};