import "@hotwired/turbo-rails";
import "./controllers";
import "bulma/css/bulma.css";
import "../assets/stylesheets/application.css";
import "../assets/stylesheets/dataTables_custom.css";

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

import "chartkick/chart.js";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function calculatePageLength() {
  const windowHeight = $(window).height();
  const baseLength = 8;
  let pageLength;

  if (windowHeight < 600) {
    pageLength = Math.max(3, baseLength - 4);
  } else if (windowHeight < 800) {
    pageLength = Math.max(5, baseLength - 2);
  } else {
    pageLength = baseLength;
  }

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
  document.querySelectorAll('.table-datatables').forEach(table => {
    if (!$.fn.DataTable.isDataTable(table)) {
      var tableInstance = $(table).DataTable({
        dom: 'Bfrtip',
        buttons: [
          {
            extend: 'csv',
            exportOptions: {
              columns: ':not(:last-child)'
            }
          },
          {
            extend: 'print',
            exportOptions: {
              columns: ':not(:last-child)'
            }
          }
        ],
        paging: true,
        searching: true,
        info: true,
        ordering: true,
        pageLength: calculatePageLength(),
      });

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

  const chartContainer = document.getElementById('chart-container');
  if (chartContainer) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const chartData = JSON.parse(chartContainer.dataset.chartData);
    const chartType = chartContainer.dataset.chartType;
    
    let config;

    if (chartType === 'courses_completed_per_month' || chartType === 'course_completions_by_month') {
      config = {
        type: 'bar',
        data: {
          labels: Object.keys(chartData),
          datasets: [{
            label: 'Cantidad',
            data: Object.values(chartData),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Gráfico de Barras'
            }
          }
        }
      };
    } else if (chartType === 'user_distribution_by_university' || chartType === 'study_materials_distribution_by_category' || chartType === 'user_distribution_by_degree_and_university') {
      config = {
        type: 'pie',
        data: {
          labels: Object.keys(chartData),
          datasets: [{
            label: 'Cantidad',
            data: Object.values(chartData),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Gráfico de Torta'
            }
          }
        }
      };
    }

    new Chart(ctx, config);
  }
});
