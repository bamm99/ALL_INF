// Entry point for the build script in your package.json
import "@hotwired/turbo-rails";
import "./controllers";
import "bulma/css/bulma.css";
import "../assets/stylesheets/application.css";
import { Application } from "@hotwired/stimulus";

import Rails from "@rails/ujs";
Rails.start();

require("@rails/activestorage").start();