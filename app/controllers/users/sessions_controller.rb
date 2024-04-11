class Users::SessionsController < Devise::SessionsController
  # before_action :configure_sign_in_params, only: [:create]
  require 'open3'

  def after_sign_in_path_for(resource)
    # Llama a la función para crear/verificar la sesión screen para el usuario
    create_remote_user(resource)
    super
    # Redirige al usuario a su dashboard correspondiente
    if resource.admin?
      admin_dashboard_path
    else
      student_dashboard_path
  
    end
  end
  require 'net/ssh'

  def create_remote_user(resource)
    remote_user_name = "#{resource.user_name[0].downcase}#{resource.user_last_name.downcase}"
    user_home_dir = "/home/#{remote_user_name}"
    generic_password = "allinf"
    
    hostname = 'ec2-54-94-57-100.sa-east-1.compute.amazonaws.com'
    username = 'shellbox'
    ssh_password = 'qwerty'
  
    Net::SSH.start(hostname, username, password: ssh_password) do |ssh|
      commands = [
        "echo '#{ssh_password}' | sudo -S groupadd webappusers || true",
        "echo '#{ssh_password}' | sudo -S useradd -m -d #{user_home_dir} -s /bin/rbash -g webappusers #{remote_user_name} || true",
        "echo '#{ssh_password}' | sudo -S sh -c \"echo '#{remote_user_name}:#{generic_password}' | chpasswd\""
      ]
  
      commands.each do |command|
        stdout_data = ""
        stderr_data = ""
        exit_code = nil
        ssh.open_channel do |channel|
          channel.exec(command) do |ch, success|
            unless success
              abort "FAILED: couldn't execute command (ssh.channel.exec)"
            end
            channel.on_data do |ch, data|
              stdout_data += data
            end
  
            channel.on_extended_data do |ch, type, data|
              stderr_data += data
            end
  
            channel.on_request("exit-status") do |ch, data|
              exit_code = data.read_long
            end
          end
        end
        ssh.loop
        
        puts "stdout: #{stdout_data}"
        puts "stderr: #{stderr_data}" unless stderr_data.empty?
        puts "exit code: #{exit_code}"
      end
    end
  rescue Net::SSH::AuthenticationFailed => e
    puts "Authentication failed for user #{username} on #{hostname}"
  end
  

end

