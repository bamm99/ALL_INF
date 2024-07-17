import "@hotwired/turbo-rails";
import "./controllers";
import "bulma/css/bulma.css";
import "../assets/stylesheets/application.css";
import "../assets/stylesheets/dataTables_custom.css"; // Asegúrate de que esta línea apunte al archivo CSS correcto

import { Application } from "@hotwired/stimulus";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'datatables.net';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5.js';
import 'datatables.net-buttons/js/buttons.print.js';
import Rails from "@rails/ujs";

import $ from 'jquery';
window.$ = window.jQuery = $;

Rails.start();
require("@rails/activestorage").start();

function initializeDataTables() {
  // Inicializa DataTables en las tablas con la clase .table-datatables
  document.querySelectorAll('.table-datatables').forEach(table => {
    if (!$.fn.DataTable.isDataTable(table)) {
      $(table).DataTable({
        dom: 'Bfrtip',
        buttons: [
          {
            extend: 'csv',
            exportOptions: {
              columns: ':not(:last-child)' // Excluye la última columna
            }
          },
          {
            extend: 'print',
            exportOptions: {
              columns: ':not(:last-child)' // Excluye la última columna
            }
          }
        ],
        paging: true,
        searching: true,
        info: true,
        ordering: true
      });
    }
  });
}

document.addEventListener("turbo:load", () => {
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

  initializeDataTables();
});
