class TerminalChannel < ApplicationCable::Channel
  def subscribed
    stream_from "terminal_#{params[:user_id]}"
  end

  def receive(data)
    user_session_name = "session_#{params[:user_id]}"
    temp_output_file = "/tmp/output_#{user_session_name}"

    Net::SSH.start(ENV['SSH_HOST'], ENV['SSH_USER'], password: ENV['SSH_PASSWORD'], port: ENV['SSH_PORT'].to_i) do |ssh|
      # Prepara el comando asegurándose de que se ejecute en el contexto del shell correcto.
      # La redirección del comando se realiza directamente a través de la sesión de screen.
      command = "#{data['command']} > #{temp_output_file} 2>&1"
      
      # Usa printf para enviar el comando a la sesión de screen. Esto ayuda a manejar correctamente los saltos de línea y otros caracteres especiales.
      stuff_command = "screen -S #{user_session_name} -p 0 -X stuff \"$(printf '#{command}\r')\""

      # Ejecuta el comando de preparación. No olvides verificar la correcta formación de este comando.
      ssh.exec!(stuff_command)
      sleep 2 # Da tiempo para que el comando se ejecute y se genere el archivo de salida.

      # Verifica si el archivo temporal existe y, de ser así, recupera su contenido.
      output_exists = ssh.exec!("if [ -f #{temp_output_file} ]; then echo 'exists'; fi").strip
      output = if output_exists == "exists"
                 ssh.exec!("cat #{temp_output_file}").strip
               else
                 "Error: No se encontró la salida del comando."
               end

      # Elimina el archivo temporal después de leer su contenido.
      ssh.exec!("rm -f #{temp_output_file}")

      # Envía la salida recuperada al cliente.
      ActionCable.server.broadcast("terminal_#{params[:user_id]}", { message: output })
    rescue => e
      # Manejo de errores durante el proceso de ejecución del comando.
      ActionCable.server.broadcast("terminal_#{params[:user_id]}", { message: "Error: #{e.message}" })
    end
  end
end