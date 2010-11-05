require 'rubygems'
require 'sinatra'
require 'json'
require 'erb'
require 'models/sticky'

require "sinatra/reloader" if development?

class App < Sinatra::Base
  configure do
    set :public, File.dirname(__FILE__) + '/public'
    set :views, File.dirname(__FILE__) + '/views'
  end

  configure :development do
    register Sinatra::Reloader
    also_reload "models/*.rb"
  end

  helpers do
    include Rack::Utils
    alias_method :h, :escape_html
  
    def sbr(str)
     h(str).gsub(/\r\n|\r|\n/, '<br/>') 
    end
  end
  
  get '/' do
    erb :index
  end
  
  get '/init' do
    content_type :json
    sticky = Stickies.filter('delete_flg is null').order(:updated_at, :id).map{|e|e.values}
    sticky.each{|s| s[:message] = sbr(s[:message])}
    JSON.unparse(sticky)
  end
  
  post '/create' do
    params[:left] = 0
    params[:top] = 62
  
    sticky = Stickies.create(params)
    JSON.generate("id" => sticky.id, "message" => sbr(sticky.message), "left" => sticky.left, "top" => sticky.top)
  end
  
  post '/update' do
    params[:left] = params[:left].to_f if params.has_key? :left
    params[:top] = params[:top].to_f  if params.has_key? :top
  
    id = params[:id].gsub(/id_/, '')
    params.delete('id')
    sticky = Stickies.find(:id => id).update(params)
    message = sticky.nil? ? params[:message] : sticky.message
  
    JSON.generate("id" => id, "message" => sbr(message))
  end
  
  post '/delete' do
    id = params[:id].gsub(/id_/, '')
    params.delete('id')
    params[:delete_flg] = '1'
    Stickies.filter('id = ?', id).update(params)
  end
end