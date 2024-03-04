require 'redcarpet'
require 'rouge'
require 'rouge/plugins/redcarpet'

module MarkdownHelper
  def self.markdown_to_html(text)
    renderer = HTMLWithRouge.new(escape_html: true, hard_wrap: true)
    markdown = Redcarpet::Markdown.new(renderer, extensions = {
      fenced_code_blocks: true,
      no_intra_emphasis: true,
      autolink: true,
      tables: true,
      underline: true,
      highlight: true
    })
    markdown.render(text).html_safe
  end

  class HTMLWithRouge < Redcarpet::Render::HTML
    include Rouge::Plugins::Redcarpet
  end
end
