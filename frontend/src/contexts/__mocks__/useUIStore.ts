export const useUIStore = () => {
  return {
    snackbarContent: {
      title: "This is a test",
      message: "Everything was sent to the desired address.",
      type: "success",
      open: true,
    },
    closeSnackBar: () => {},
  };
};
