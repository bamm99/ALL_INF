import { Controller } from "@hotwired/stimulus";
import toastr from "toastr";

export default class extends Controller {
  connect() {
    const flashMessagesElement = document.getElementById("flash-messages");
    if (flashMessagesElement) {
      const flashData = JSON.parse(flashMessagesElement.dataset.flash);
      console.log("Flash data:", flashData); // <-- Agregar esta línea para verificar los datos flash
      if (flashData.notice) {
        toastr.success(flashData.notice);
      }
      if (flashData.alert) {
        toastr.warning(flashData.alert);
      }
      if (flashData.error) {
        toastr.error(flashData.error);
      }
    }
  }
}
