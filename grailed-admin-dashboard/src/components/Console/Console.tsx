// src/components/Console/Console.tsx

import React, { useRef, useEffect } from "react";
import styles from "./Console.module.css";

interface ConsoleProps {
  output: LogMessage[];
}

interface LogMessage {
  level: string;
  message: string;
  timestamp: string;
}

export const Console: React.FC<ConsoleProps> = ({ output }) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const getLogColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return styles.errorLog;
      case "WARNING":
        return styles.warningLog;
      case "INFO":
        return styles.infoLog;
      default:
        return styles.defaultLog;
    }
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output]);

  return (
    <div className={styles.console}>
      <div className={styles.consoleBody}>
        {output.map((log, index) => (
          <div
            key={index}
            className={`${styles.consoleLine} ${getLogColor(log.level)}`}
          >
            <span className={styles.consolePrompt}>$</span> {log.message}
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};
