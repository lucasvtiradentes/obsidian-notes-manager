import { Notice } from "obsidian";

export function addRibbonToObsidian() {
  // This creates an icon in the left ribbon.
  const ribbonIconEl = this.addRibbonIcon(
    "dice",
    "Sample Plugin",
    (evt: MouseEvent) => {
      new Notice("This is a notice!");
      console.log(evt);
    },
  );
  // Perform additional things with the ribbon
  ribbonIconEl.addClass("my-plugin-ribbon-class");
}
