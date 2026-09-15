import { LABEL_FONT, type NativeId } from "./model";

export type LabelWidths = Record<NativeId, number>;

export function measureLabelWidths(appName: string): LabelWidths {
  const context = document.createElement("canvas").getContext("2d")!;
  context.font = LABEL_FONT;
  return {
    app: context.measureText(appName).width,
    applications: context.measureText("Applications").width,
  };
}
