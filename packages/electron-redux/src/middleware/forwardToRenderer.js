import { webContents } from "electron";
import validateAction from "../helpers/validateAction";

const forwardToRenderer = () => (next) => (action) => {
  if (!validateAction(action)) return next(action);
  if (action.meta && action.meta.scope === "local") return next(action);

  // change scope to avoid endless-loop
  const rendererAction = {
    ...action,
    meta: {
      ...action.meta,
      scope: "local",
    },
  };
  if (!webContents) {
    return next(action);
  }
  const allWebContents = webContents.getAllWebContents();

  allWebContents.forEach((contents) => {
    contents.send("redux-action", rendererAction);
  });

  return next(action);
};

export default forwardToRenderer;
