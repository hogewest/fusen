require 'sequel'

DB = Sequel.connect(ENV['DATABASE_URL'] || 'sqlite://stickies.db')
unless DB.table_exists?(:stickies)
  DB.create_table(:stickies) do
    primary_key :id
    text :message
    Float :left
    Float :top
    String :delete_flg, :null => true
    timestamp :created_at
    timestamp :updated_at
  end
end

class Stickies < Sequel::Model(:stickies)
  plugin :validation_helpers
  plugin :hook_class_methods

  def validate
    validates_presence(:message) && validates_max_length(8000, :message)
  end

  def before_create
    self.created_at = self.updated_at = Time.now
    super
  end

  def before_update
    self.updated_at = Time.now
    super
  end
end
