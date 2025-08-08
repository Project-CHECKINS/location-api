class Logger {
  private time() {
    return new Date().toISOString();
  }
  info(message: string, ...params: unknown[]) {
    console.info(`[INFO] ${this.time()} - ${message}`, ...params);
  }

  error(message: string, ...params: unknown[]) {
    console.error(`[ERROR] ${this.time()} - ${message}`, ...params);
  }
}

export const logger = new Logger();
