// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import { Application } from "@hotwired/stimulus"

require("@rails/activestorage").start();