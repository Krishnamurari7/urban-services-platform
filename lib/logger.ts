export type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
    error?: any;
}

class Logger {
    private log(level: LogLevel, message: string, context?: Record<string, any>, error?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
        };

        if (error) {
            entry.error = error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error;
        }

        // In development, pretty print
        if (process.env.NODE_ENV === "development") {
            const colorMap = {
                info: "\x1b[36m", // Cyan
                warn: "\x1b[33m", // Yellow
                error: "\x1b[31m", // Red
                debug: "\x1b[90m", // Gray
            };
            const reset = "\x1b[0m";

            console.log(
                `${colorMap[level]}[${level.toUpperCase()}]${reset} ${entry.timestamp}: ${message}`
            );
            if (context) console.log("Context:", context);
            if (error) console.error("Error:", error);
        } else {
            // In production, log JSON string for aggregation tools
            console.log(JSON.stringify(entry));
        }
    }

    info(message: string, context?: Record<string, any>) {
        this.log("info", message, context);
    }

    warn(message: string, context?: Record<string, any>) {
        this.log("warn", message, context);
    }

    error(message: string, error?: any, context?: Record<string, any>) {
        this.log("error", message, context, error);
    }

    debug(message: string, context?: Record<string, any>) {
        this.log("debug", message, context);
    }
}

export const logger = new Logger();
