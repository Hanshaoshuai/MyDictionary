import { clearAll } from "./storage";

export function destroyGlobalSpinner() {
  const splash = document.querySelector("#splash-spinner");
  const spinner = document.querySelector(".spinner");
  if (splash) {
    document.head.removeChild(splash);
  }
  if (spinner && spinner.parentNode) {
    spinner.parentNode.removeChild(spinner);
  }
}

export function redirectToLogin() {
  clearAll();
  const { location } = window;
  location.href = "/login";
}
