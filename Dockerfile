# Use a Node.js base image
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Copy pnpm-lock.yaml and package.json to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install pnpm and then install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application using SWC
RUN pnpm run build

# Expose the port your NestJS app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start:prod"]

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy pnpm-lock.yaml and package.json from the development stage (or install if not multi-stage)
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

# Copy only the built application from the development stage
COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/prisma ./prisma
COPY --from=development /app/.env.production ./.env

EXPOSE 3000

CMD ["node", "dist/main"]