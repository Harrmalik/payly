FROM 172.30.160.12:5043/phpimage_dscommon

# Set Working Directory
WORKDIR /var/www/kissklock

# Install Requirements
COPY package*.json ./

# Copy Source Code
copy . .

# Expose Port
EXPOSE 80
