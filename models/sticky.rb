require 'sequel'

Sequel.connect(ENV['DATABASE_URL'] || 'sqlite://stickies.db')

class Stickies < Sequel::Model
  plugin :schema
  plugin :validation_helpers
  plugin :hook_class_methods

  def validate
    validates_presence(:message) && validates_max_length(8000, :message)
  end

  unless table_exists?
    set_schema do
      primary_key :id
      text :message
      Float :left
      Float :top
      String :delete_flg
      timestamp :created_at
      timestamp :updated_at
    end
    create_table
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
