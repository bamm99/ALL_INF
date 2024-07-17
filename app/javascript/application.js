import "@hotwired/turbo-rails";
import "./controllers";
import "bulma/css/bulma.css";
import "../assets/stylesheets/application.css";
import { Application } from "@hotwired/stimulus";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

import Rails from "@rails/ujs";
Rails.start();
require("@rails/activestorage").start();

document.addEventListener("DOMContentLoaded", () => {
  const flashMessagesElement = document.getElementById("flash-messages");
  if (flashMessagesElement) {
    const flashData = JSON.parse(flashMessagesElement.dataset.flash);
    console.log("Flash data:", flashData);
    if (flashData.notice) {
      toastr.success(flashData.notice);
    }
    if (flashData.alert) {
      toastr.warning(flashData.alert);
    }
    if (flashData.error) {
      toastr.error(flashData.error);
    }
  } else {
    console.log("No flash messages element found");
  }
});
