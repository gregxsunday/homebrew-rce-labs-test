FROM homebrew/ubuntu16.04

RUN brew ruby -e 'Homebrew.install_gem! "git_diff"'

COPY review.rb /review.rb
COPY git_diff_extension.rb /git_diff_extension.rb
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
