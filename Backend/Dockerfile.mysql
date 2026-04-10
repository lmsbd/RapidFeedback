# Use MySQL 8.0 official image
FROM mysql:8.0

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=123456
ENV MYSQL_DATABASE=rfo_db
ENV MYSQL_USER=rfo_user
ENV MYSQL_PASSWORD=rfo_password

# Set timezone to Melbourne
ENV TZ=Australia/Melbourne
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy custom startup script
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

# Expose MySQL port (container listens on 3306)
EXPOSE 3306

# Use custom startup script
CMD ["/startup.sh"]
