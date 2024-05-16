// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import { Application } from "@hotwired/stimulus"


import Rails from "@rails/ujs";
Rails.start();

require("@rails/activestorage").start();

