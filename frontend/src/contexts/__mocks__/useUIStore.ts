export const useUIStore = () => {
  return {
    snackMessage: {
      title: "This is a test",
      message: "Everything was sent to the desired address.",
      type: "success",
      open: true,
    },
    closeSnackbar: () => {}
  };
};
