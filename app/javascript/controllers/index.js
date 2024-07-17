// Importar los controladores
import { Application } from "@hotwired/stimulus";
import FlashController from "./flash_controller";

// Iniciar la aplicación Stimulus
const application = Application.start();
application.register("flash", FlashController);
