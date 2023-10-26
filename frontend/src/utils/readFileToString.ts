export const readFileToString = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      if (e.target && e.target.result) {
        resolve(e.target.result as string);
      } else {
        reject("Error while reading file");
      }
    };
    reader.readAsText(file);
  });
