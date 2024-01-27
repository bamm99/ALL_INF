class CreateDegrees < ActiveRecord::Migration[7.1]
  def change
    create_table :degrees do |t|
      t.string :name
      t.references :university, null: false, foreign_key: true

      t.timestamps
    end
  end
end
