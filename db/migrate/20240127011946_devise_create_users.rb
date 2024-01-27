# devise_create_users.rb

class DeviseCreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Custom Fields
      t.string :user_name,           null: false
      t.string :user_last_name,      null: false
      t.integer :user_rol,           null: false, default: 0
      t.integer :user_student,       null: false, default: 0
      t.references :user_university, null: false, foreign_key: { to_table: :universities }
      t.references :user_degree,      null: false, foreign_key: { to_table: :degrees }
      t.string :user_password,       null: false

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Indexes
      t.index :email, unique: true
      t.index :reset_password_token, unique: true

      t.timestamps null: false
    end

    # Uncomment the following line if you want to add a unique index for rut
    # add_index :users, :rut, unique: true

    # Add any other indexes you may need
  end
end