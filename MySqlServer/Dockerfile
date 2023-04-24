FROM mysql
EXPOSE 3306

# copy sql script to /docker-entrypoint-initdb.d so that it'll be run automatically
COPY user_password.sql /docker-entrypoint-initdb.d/user_password.sql