class RemoveUserPasswordFromUsers < ActiveRecord::Migration[7.0]
  def change
    remove_column :users, :user_password, :string
  end
end
