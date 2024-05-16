class Users::SessionsController < Devise::SessionsController
  require 'net/ssh'

  def after_sign_in_path_for(resource)
    setup_user_environment(resource)
    resource.admin? ? admin_dashboard_path : student_dashboard_path
  end

  private

  def setup_user_environment(resource)
    username = format_username(resource)
    generic_password = "allinf"
    hostname = '146.83.194.188'
    port = 22
    ssh_username = 'dev'
    ssh_password = 'dolcegusto'

    begin
      Net::SSH.start(hostname, ssh_username, password: ssh_password, port: port) do |ssh|
        execute_user_setup_script(ssh, username, generic_password, ssh_password)
      end
    rescue Net::SSH::AuthenticationFailed, Net::SSH::ConnectionTimeout
      puts "SSH connection error with #{hostname}"
    end
  end

  def format_username(resource)
    "#{resource.user_name[0].downcase}#{resource.user_last_name.downcase}"
  end

  def execute_user_setup_script(ssh, username, password, ssh_password)
    commands = [
      "cd ~/tesis && echo '#{ssh_password}' | sudo -S ./script.sh '#{username}' '#{password}'"
    ]
    commands.each do |command|
      stdout_data, stderr_data, exit_code = execute_ssh_command(ssh, command)
      log_command_results(stdout_data, stderr_data, exit_code)
    end
  end

  def execute_ssh_command(ssh, command)
    stdout_data, stderr_data, exit_code = "", "", nil
    ssh.open_channel do |channel|
      channel.exec(command) do |ch, success|
        raise "Command execution failed" unless success
        channel.on_data { |ch, data| stdout_data += data }
        channel.on_extended_data { |ch, type, data| stderr_data += data }
        channel.on_request("exit-status") { |ch, data| exit_code = data.read_long }
      end
    end
    ssh.loop
    [stdout_data, stderr_data, exit_code]
  end

  def log_command_results(stdout, stderr, exit_code)
    puts "Command STDOUT: #{stdout}", "Command STDERR: #{stderr}", "Exit Code: #{exit_code}"
  end
end
