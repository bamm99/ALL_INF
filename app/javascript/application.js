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

function calculatePageLength() {
  const windowHeight = $(window).height();
  const baseLength = 8; // Número base de filas por página
  let pageLength;

  if (windowHeight < 600) {
    pageLength = Math.max(3, baseLength - 4); // Mínimo 3 filas si la pantalla es muy pequeña
  } else if (windowHeight < 800) {
    pageLength = Math.max(5, baseLength - 2); // Mínimo 5 filas para pantallas medianas
  } else {
    pageLength = baseLength; // Usar el número base para pantallas grandes
  }

  // Ajuste para dejar espacio para los botones
  if (pageLength >= 7) {
    return pageLength - 1;
  } else if (pageLength >= 5) {
    return pageLength - 1;
  } else if (pageLength >= 4) {
    return pageLength - 1;
  } else {
    return pageLength;
  }
}

function initializeDataTables() {
  // Inicializa DataTables en las tablas con la clase .table-datatables
  document.querySelectorAll('.table-datatables').forEach(table => {
    if (!$.fn.DataTable.isDataTable(table)) {
      var tableInstance = $(table).DataTable({
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
        ordering: true,
        pageLength: calculatePageLength(),
      });

      // Recalcular la longitud de página en cambio de tamaño de ventana
      window.addEventListener('resize', function() {
        tableInstance.page.len(calculatePageLength()).draw();
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
