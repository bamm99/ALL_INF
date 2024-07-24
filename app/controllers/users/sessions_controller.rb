class Users::SessionsController < Devise::SessionsController
  require 'net/ssh'

  def create
    self.resource = warden.authenticate!(auth_options)
    set_flash_message!(:notice, :signed_in)
    sign_in(resource_name, resource)
    store_password_in_session
    setup_user_environment(resource)
    generate_wetty_url(resource)
    yield resource if block_given?
    respond_with resource, location: after_sign_in_path_for(resource)
  end

  def after_sign_in_path_for(resource)
    resource.admin? ? admin_dashboard_path : student_dashboard_path
  end

  private

  def store_password_in_session
    session[:user_password] = params[:user][:password]
  end

  def setup_user_environment(resource)
    username = generate_wetty_username(resource)
    password = session[:user_password]
    generic_password = "allinf"
    hostname = '146.83.194.188'
    port = 22
    ssh_username = 'dev'
    ssh_password = 'dolcegusto'

    add_host_key_to_known_hosts(hostname)

    begin
      Net::SSH.start(hostname, ssh_username, password: ssh_password, port: port) do |ssh|
        execute_user_setup_script(ssh, username, password, ssh_password)
      end
    rescue Net::SSH::AuthenticationFailed, Net::SSH::ConnectionTimeout
      puts "SSH connection error with #{hostname}"
    end
  end

  def generate_wetty_username(resource)
    "#{resource.user_name[0].downcase}#{resource.user_last_name.downcase}#{resource.id}"
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

  def generate_wetty_url(resource)
    username = generate_wetty_username(resource)
    password = session[:user_password]
    wetty_url = "http://146.83.194.188:3000/wetty/ssh/#{username}?pass=#{password}"
    session[:wetty_url] = wetty_url
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
end
