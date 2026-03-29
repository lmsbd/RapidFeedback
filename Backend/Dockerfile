FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=123456
ENV MYSQL_DATABASE=rfo_db
ENV MYSQL_USER=rfo_user
ENV MYSQL_PASSWORD=rfo_password

ENV TZ=Australia/Melbourne
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

# 把初始化 SQL 拷进去
COPY src/main/resources/sql/init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 3306

CMD ["/startup.sh"]