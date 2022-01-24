FROM debian:9.5-slim

RUN brew ruby -e 'Homebrew.install_gem! "git_diff"'

ADD review.rb /review.rb
ADD git_diff_extension.rb /git_diff_extension.rb
ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
