import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import consumer from "./channels/consumer";

document.addEventListener('DOMContentLoaded', () => {
    const terminalContainer = document.getElementById('terminal-container');
    const terminal = new Terminal({
        cursorBlink: true,
        theme: {
            foreground: '#FFFFFF',
            background: '#2C001E',
            cursor: '#E95420',
            selection: 'rgba(233, 84, 32, 0.3)'
        }
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalContainer);
    fitAddon.fit();

    window.addEventListener('resize', () => fitAddon.fit()); // Ajusta el tamaño al cambiar el tamaño de la ventana

    const promptString = '/all_inf@usuario/~ ';
    terminal.writeln('Bienvenido a tu entorno de pruebas Linux.');
    terminal.write(promptString);

    const userId = document.body.getAttribute('data-user-id');
    const terminalChannel = consumer.subscriptions.create({ channel: "TerminalChannel", user_id: userId }, {
        received(data) {
            // Procesa y muestra la salida del comando
            const processedOutput = data.message.split('\n').join('\r\n');
            terminal.write('\r\n' + processedOutput);
            
            // Muestra el nuevo prompt después de la salida del comando
            terminal.write('\r\n' + promptString);
        }
    });

    let commandBuffer = '';
    terminal.onData(data => {
        if (data === '\r') { // Si el usuario presiona Enter
            terminalChannel.send({ command: commandBuffer.trim() }); // Envía el comando acumulado, usando trim() para eliminar espacios en blanco iniciales y finales
            commandBuffer = ''; // Limpia el buffer para el próximo comando
        } else if (data.charCodeAt(0) === 127) { // Si el usuario presiona la tecla de borrar (Backspace)
            if (commandBuffer.length > 0) {
                commandBuffer = commandBuffer.slice(0, -1); // Elimina el último carácter del buffer de comandos
                terminal.write('\b \b'); // Elimina el último carácter en la terminal
            }
        } else {
            commandBuffer += data; // Agrega el carácter ingresado al buffer de comandos
            terminal.write(data); // Muestra el carácter ingresado en la terminal
        }
    });
});