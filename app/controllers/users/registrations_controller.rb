class Users::RegistrationsController < Devise::RegistrationsController
  require 'net/ssh'

  prepend_before_action :authenticate_scope!, only: [:edit, :destroy]

  private

  def sign_up_params
    params.require(:user).permit(:user_name, :user_last_name, :email, :password, :password_confirmation, :user_student, :user_university_id, :user_degree_id)
  end

  def account_update_params
    params.require(:user).permit(:user_name, :user_last_name, :email, :password, :current_password, :password_confirmation, :user_student, :user_university_id, :user_degree_id)
  end

  protected

  def after_sign_up_path_for(resource)
    sign_out(resource)
    root_path
  end

  def update_resource(resource, params)
    if resource.update_with_password(params)
      update_terminal_password(resource, params[:password]) if params[:password].present?
      true
    else
      false
    end
  end

  def update_terminal_password(user, new_password)
    username = generate_wetty_username(user)
    hostname = '146.83.194.188'
    port = 22
    ssh_username = 'dev'
    ssh_password = 'dolcegusto'

    add_host_key_to_known_hosts(hostname)

    begin
      Net::SSH.start(hostname, ssh_username, password: ssh_password, port: port) do |ssh|
        command = "cd ~/tesis && echo '#{ssh_password}' | sudo -S ./update_password.sh '#{username}' '#{new_password}'"
        execute_ssh_command(ssh, command)
      end
    rescue Net::SSH::AuthenticationFailed, Net::SSH::ConnectionTimeout
      puts "SSH connection error with #{hostname}"
    end
  end

  def generate_wetty_username(resource)
    username = "#{resource.user_name[0].downcase}#{resource.user_last_name.downcase}#{resource.id}"
    ActiveSupport::Inflector.transliterate(username).gsub(/[^a-zA-Z0-9]/, "")
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

  def add_host_key_to_known_hosts(hostname)
    known_hosts_file = File.expand_path('~/.ssh/known_hosts')
    host_key = `ssh-keyscan -t ed25519 #{hostname} 2>/dev/null`

    File.open(known_hosts_file, 'a+') do |file|
      existing_hosts = file.readlines
      unless existing_hosts.any? { |line| line.include?(hostname) }
        file.puts host_key
      end
    end
  end

  def after_update_path_for(resource)
    sign_out(resource)
    new_session_path(resource_name)
  end
end
