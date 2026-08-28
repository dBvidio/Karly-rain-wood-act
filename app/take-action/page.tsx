import { redirect } from "next/navigation";

// Shareable, memorable link: KarlyRainWoodAct.com/take-action
// Sends visitors straight to the homepage's action flow anchor.
export default function TakeAction() {
  redirect("/#action");
}
