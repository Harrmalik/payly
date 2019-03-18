# Use base Php image that includes the resources directory.
FROM 172.30.160.12:5043/phpimage:latest
# Set Timezone to Eastern time
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
