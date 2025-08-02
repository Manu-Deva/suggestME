FROM node:18

# Set working directory
WORKDIR /app

# Copy backend directory
COPY backend/ ./backend/

# Change to backend directory
WORKDIR /app/backend

# Install dependencies
RUN npm install

# Default command (can be overridden)
CMD ["node", "scripts/batch-1-hiphop.js"]