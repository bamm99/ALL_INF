// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import { Application } from "@hotwired/stimulus"
import { Terminal } from 'xterm';


import Rails from "@rails/ujs";
Rails.start();

require("@rails/activestorage").start();

document.addEventListener('DOMContentLoaded', () => {
    const terminal = new Terminal();
    terminal.open(document.getElementById('terminal-container'));
    terminal.write('Bienvenido a tu Terminal\n');
  });