import "@hotwired/turbo-rails";
import "bulma/css/bulma.css";
import "../assets/stylesheets/application.css";
import "../assets/stylesheets/dataTables_custom.css";
import "../assets/stylesheets/print.css"; // Importa el CSS de impresión

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

import Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import Accessibility from 'highcharts/modules/accessibility';

Exporting(Highcharts);
ExportData(Highcharts);
Accessibility(Highcharts);

window.Highcharts = Highcharts;
window.toastr = toastr; // Asegúrate de que toastr esté disponible globalmente

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

function destroyDataTables() {
  console.log("Destroying existing DataTables...");
  document.querySelectorAll('.table-datatables').forEach(table => {
    if ($.fn.DataTable.isDataTable(table)) {
      console.log("Destroying DataTable on table:", table);
      $(table).DataTable().clear().destroy(); // Asegúrate de que la tabla esté completamente destruida
    }
  });
}

function initializeDataTables() {
  console.log("Initializing DataTables...");
  const tables = document.querySelectorAll('.table-datatables');
  if (tables.length === 0) {
    console.log("No tables found with the class 'table-datatables'.");
    return;
  }

  tables.forEach(table => {
    if (!$.fn.DataTable.isDataTable(table)) {
      console.log("Initializing DataTable on table:", table);
      var tableInstance = $(table).DataTable({
        dom: 'Bfrtip',
        buttons: [
          {
            extend: 'csv',
            exportOptions: {
              columns: ':not(:last-child)'
            },
            customize: function (csv) {
              return "\uFEFF" + csv; // Añade BOM para que se muestren caracteres especiales
            }
          },
          {
            extend: 'print',
            exportOptions: {
              columns: ':not(:last-child)'
            },
            customize: function (win) {
              $(win.document.body).find('table').addClass('table').css('color', 'black');
              $(win.document.body).css('background-color', 'white');
              $(win.document.body).css('color', 'black');
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
    } else {
      console.log("Table already initialized:", table);
    }
  });
}

document.addEventListener("turbo:before-cache", () => {
  destroyDataTables();
});

document.addEventListener("turbo:load", () => {
  const flashMessagesElement = document.getElementById("flash-messages");
  if (flashMessagesElement) {
    const flashData = JSON.parse(flashMessagesElement.dataset.flash);
    if (flashData.notice) {
      toastr.success(flashData.notice);
    }
    if (flashData.alert) {
      toastr.warning(flashData.alert);
    }
    if (flashData.error) {
      toastr.error(flashData.error);
    }
    // Limpia los mensajes flash después de mostrarlos
    flashMessagesElement.dataset.flash = JSON.stringify({});
  }

  initializeDataTables();

  function initializeHighchartsBar(containerId, chartData, titleText) {
    if (document.getElementById(containerId)) {
      Highcharts.chart(containerId, {
        chart: {
          type: 'column',
          backgroundColor: 'white'
        },
        title: {
          text: titleText,
          style: {
            color: 'black'
          }
        },
        xAxis: {
          categories: Object.keys(chartData),
          labels: {
            style: {
              color: 'black'
            }
          }
        },
        yAxis: {
          title: {
            text: 'Cantidad',
            style: {
              color: 'black'
            }
          },
          labels: {
            style: {
              color: 'black'
            }
          },
          allowDecimals: false
        },
        series: [{
          name: 'Cantidad',
          data: Object.values(chartData),
          color: '#7cb5ec'
        }],
        legend: {
          itemStyle: {
            color: 'black'
          }
        },
        exporting: {
          enabled: true
        }
      });
    }
  }

  function initializeHighchartsPie(containerId, chartData, titleText) {
    if (document.getElementById(containerId)) {
      Highcharts.chart(containerId, {
        chart: {
          type: 'pie',
          backgroundColor: 'white'
        },
        title: {
          text: titleText,
          style: {
            color: 'black'
          }
        },
        series: [{
          name: 'Cantidad',
          data: Object.entries(chartData).map(([key, value]) => ({ name: key, y: value })),
          colors: Highcharts.getOptions().colors
        }],
        legend: {
          itemStyle: {
            color: 'black'
          }
        },
        exporting: {
          enabled: true
        }
      });
    }
  }

  function initializeUserDistributionByDegreeAndUniversityChart(containerId, chartData, titleText) {
    if (document.getElementById(containerId)) {
      const colors = Highcharts.getOptions().colors;
      const browserData = [];
      const versionsData = [];
      const colorMap = new Map();

      chartData.browserData.forEach((university, i) => {
        const color = colors[i % colors.length];
        colorMap.set(university.name, color);
        browserData.push({
          ...university,
          color
        });
      });

      chartData.versionsData.forEach((degree) => {
        const universityColor = colorMap.get(degree.university);
        versionsData.push({
          ...degree,
          color: universityColor
        });
      });

      Highcharts.chart(containerId, {
        chart: {
          type: 'pie',
          backgroundColor: 'white'
        },
        title: {
          text: titleText,
          style: {
            color: 'black'
          }
        },
        series: [{
          name: 'Universidades',
          data: browserData,
          size: '60%',
          dataLabels: {
            color: '#000000',
            distance: -30
          }
        }, {
          name: 'Carreras',
          data: versionsData,
          size: '80%',
          innerSize: '60%',
          dataLabels: {
            format: '<b>{point.name}:</b> <span style="opacity: 0.5">{y}</span>',
            style: {
              fontWeight: 'normal',
              color: '#000000'
            }
          },
          id: 'versions'
        }],
        legend: {
          itemStyle: {
            color: 'black'
          }
        },
        exporting: {
          enabled: true
        }
      });
    }
  }

  const coursesCompletedPerMonthContainer = document.getElementById('courses-completed-per-month-container');
  if (coursesCompletedPerMonthContainer) {
    const coursesCompletedPerMonthData = JSON.parse(coursesCompletedPerMonthContainer.dataset.chartData);
    initializeHighchartsBar('courses-completed-per-month-container', coursesCompletedPerMonthData, 'Cantidad de veces que se terminaron cursos en cada mes del último año');
  }

  const courseCompletionsByMonthContainer = document.getElementById('course-completions-by-month-container');
  if (courseCompletionsByMonthContainer) {
    const courseCompletionsByMonthData = JSON.parse(courseCompletionsByMonthContainer.dataset.chartData);
    initializeHighchartsBar('course-completions-by-month-container', courseCompletionsByMonthData, 'Cursos completados por mes');
  }

  const userDistributionByUniversityContainer = document.getElementById('user-distribution-by-university-container');
  if (userDistributionByUniversityContainer) {
    const userDistributionByUniversityData = JSON.parse(userDistributionByUniversityContainer.dataset.chartData);
    initializeHighchartsPie('user-distribution-by-university-container', userDistributionByUniversityData, 'Distribución de usuarios por universidad');
  }

  const studyMaterialsDistributionByCategoryContainer = document.getElementById('study-materials-distribution-by-category-container');
  if (studyMaterialsDistributionByCategoryContainer) {
    const studyMaterialsDistributionByCategoryData = JSON.parse(studyMaterialsDistributionByCategoryContainer.dataset.chartData);
    initializeHighchartsPie('study-materials-distribution-by-category-container', studyMaterialsDistributionByCategoryData, 'Distribución de materiales de estudio por categoría');
  }

  const userDistributionByDegreeAndUniversityContainer = document.getElementById('user-distribution-by-degree-and-university-container');
  if (userDistributionByDegreeAndUniversityContainer) {
    const userDistributionByDegreeAndUniversityData = JSON.parse(userDistributionByDegreeAndUniversityContainer.dataset.chartData);
    initializeUserDistributionByDegreeAndUniversityChart('user-distribution-by-degree-and-university-container', userDistributionByDegreeAndUniversityData, 'Distribución de Usuarios por Carrera y Universidad');
  }
});
