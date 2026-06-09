# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY shell/package*.json ./
RUN npm ci

COPY shell/ .
RUN npm run build

# Stage 2: Runner stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install Python 3 and compilation libraries (required for lxml / dateutil)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    build-base \
    python3-dev \
    libxml2-dev \
    libxslt-dev

# Install python dependencies
COPY JOB-AGENT/requirements.txt /JOB-AGENT/requirements.txt
RUN pip install --no-cache-dir --break-system-packages -r /JOB-AGENT/requirements.txt

# Copy necessary runtime directories and outputs from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/proxy.js ./src/proxy.js

# Copy JOB-AGENT directory
COPY JOB-AGENT /JOB-AGENT

EXPOSE 3000

CMD ["npm", "run", "start"]
