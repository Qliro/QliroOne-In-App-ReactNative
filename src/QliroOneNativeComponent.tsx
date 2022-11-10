import { requireNativeComponent } from "react-native";
import { NativeCheckout } from "./QliroOneTypes";

export const QlirOneNativeCheckout: typeof NativeCheckout =
  requireNativeComponent("QliroOneCheckout");
