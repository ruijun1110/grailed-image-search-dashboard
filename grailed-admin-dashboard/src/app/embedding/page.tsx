"use client";

import React, { useState, useEffect } from "react";
import { Console } from "@/components/Console/Console";
import styles from "./page.module.css";
import { add } from "date-fns";

interface LogMessage {
  level: string;
  message: string;
  timestamp: string;
}

export default function EmbeddingPage() {
  const [isImageEmbeddingActive, setIsImageEmbeddingActive] = useState(false);
  const [isTextEmbeddingActive, setIsTextEmbeddingActive] = useState(false);
  const [imageConsoleOutput, setImageConsoleOutput] = useState<LogMessage[]>(
    []
  );
  const [textConsoleOutput, setTextConsoleOutput] = useState<LogMessage[]>([]);

  const [imageEmbeddingStatus, setImageEmbeddingStatus] = useState({
    image_index_total_record: "-",
    image_last_embed_time: "-",
    image_index_size: "-",
  });

  const [textEmbeddingStatus, setTextEmbeddingStatus] = useState({
    text_index_total_record: "-",
    text_last_embed_time: "-",
    text_index_size: "-",
  });

  const apiBaseUrl = "http://127.0.0.1:8000/api/";

  const handleStopImageEmbedding = async () => {
    try {
      const response = await fetch(apiBaseUrl + "stop_image_embedding", {
        method: "POST",
      });
      const data = await response.json();
      setIsImageEmbeddingActive(false);
      addImageConsoleOutput({
        level: "INFO",
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to stop embedding:", error);
      addImageConsoleOutput({
        level: "ERROR",
        message: "Failed to stop embedding.",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleStopTextEmbedding = async () => {
    try {
      const response = await fetch(apiBaseUrl + "stop_text_embedding", {
        method: "POST",
      });
      const data = await response.json();
      setIsTextEmbeddingActive(false);
      addTextConsoleOutput({
        level: "INFO",
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to stop embedding:", error);
      addTextConsoleOutput({
        level: "ERROR",
        message: "Failed to stop embedding.",
        timestamp: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    fetchImageEmbeddingStatus();
    fetchTextEmbeddingStatus();
    const imageEventSource = new EventSource(
      apiBaseUrl + "image_embedding_logs"
    );
    const textEventSource = new EventSource(apiBaseUrl + "text_embedding_logs");

    const handleImageMessage = (event: MessageEvent) => {
      if (event.data.trim() !== "") {
        try {
          const logData = JSON.parse(event.data);
          addImageConsoleOutput(logData);
          if (logData.level === "ERROR" && isImageEmbeddingActive) {
            handleStopImageEmbedding();
          }

          if (logData.message.includes("image embedding checkpoint updated:")) {
            const checkpointString = logData.message
              .split("image embedding checkpoint updated:")[1]
              .trim();
            const checkpointData = parseCheckpoint(checkpointString);
            updateImageEmbeddingStatus(checkpointData);
          }
        } catch (error) {
          console.error("Failed to parse log message:", error);
          addImageConsoleOutput({
            level: "ERROR",
            message: "Failed to parse log message.",
            timestamp: new Date().toISOString(),
          });

          if (isImageEmbeddingActive) {
            handleStopImageEmbedding();
          }
        }
      }
    };

    const handleTextMessage = (event: MessageEvent) => {
      if (event.data.trim() !== "") {
        try {
          const logData = JSON.parse(event.data);
          addTextConsoleOutput(logData);
          if (logData.level === "ERROR" && isTextEmbeddingActive) {
            handleStopTextEmbedding();
          }

          if (logData.message.includes("text embedding checkpoint updated:")) {
            const checkpointString = logData.message
              .split("text embedding checkpoint updated:")[1]
              .trim();
            const checkpointData = parseCheckpoint(checkpointString);
            updateTextEmbeddingStatus(checkpointData);
          }
        } catch (error) {
          console.error("Failed to parse log message:", error);
          addTextConsoleOutput({
            level: "ERROR",
            message: "Failed to parse log message.",
            timestamp: new Date().toISOString(),
          });

          if (isTextEmbeddingActive) {
            handleStopTextEmbedding();
          }
        }
      }
    };

    imageEventSource.addEventListener("message", handleImageMessage);
    textEventSource.addEventListener("message", handleTextMessage);

    return () => {
      imageEventSource.removeEventListener("message", handleImageMessage);
      textEventSource.removeEventListener("message", handleTextMessage);
      imageEventSource.close();
      textEventSource.close();
    };
  }, []);

  const addTextConsoleOutput = (message: LogMessage) => {
    setTextConsoleOutput((prev) => [...prev, message]);
  };
  const addImageConsoleOutput = (message: LogMessage) => {
    setImageConsoleOutput((prev) => [...prev, message]);
  };

  const handleStartImageEmbedding = async () => {
    try {
      const response = await fetch(apiBaseUrl + "start_image_embedding", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
      }
      const data = await response.json();
      setIsImageEmbeddingActive(true);
      addImageConsoleOutput({
        level: "INFO",
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to start embedding:", error);
      addImageConsoleOutput({
        level: "ERROR",
        message: "Failed to start embedding.",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleStartTextEmbedding = async () => {
    try {
      const response = await fetch(apiBaseUrl + "start_text_embedding", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
      }
      const data = await response.json();
      setIsTextEmbeddingActive(true);
      addTextConsoleOutput({
        level: "INFO",
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to start embedding:", error);
      addTextConsoleOutput({
        level: "ERROR",
        message: "Failed to start embedding.",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const parseCheckpoint = (checkpointString: string) => {
    // Remove the surrounding curly braces
    const cleanedString = checkpointString.slice(1, -1);

    // Split the string into key-value pairs
    const pairs = cleanedString.split(", ").map((pair) => {
      const [key, value] = pair.split(": ");
      // Remove quotes from keys
      return [key.replace(/['"]+/g, ""), value];
    });

    // Convert the pairs into an object
    const checkpointObject = Object.fromEntries(pairs);
    // console.log(parseInt(checkpointObject.total_items_processed));
    return {
      total_items_processed: parseInt(checkpointObject.total_items_processed),
      // Note: timestamp is not present in the given format, so we'll use the current time
      timestamp: checkpointObject.timestamp,
    };
  };

  const fetchImageEmbeddingStatus = async () => {
    try {
      const response = await fetch(apiBaseUrl + "get_image_embedding_status");
      const data = await response.json();
      addImageConsoleOutput({
        level: "INFO",
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to fetch image embedding status:", error);
      addImageConsoleOutput({
        level: "ERROR",
        message: "Failed to fetch image embedding status.",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const fetchTextEmbeddingStatus = async () => {
    try {
      const response = await fetch(apiBaseUrl + "get_text_embedding_status");
      const data = await response.json();
      addTextConsoleOutput({
        level: "INFO",
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to fetch text embedding status:", error);
      addTextConsoleOutput({
        level: "ERROR",
        message: "Failed to fetch text embedding status.",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const updateImageEmbeddingStatus = (checkpointData: any) => {
    setImageEmbeddingStatus((prevStatus) => ({
      ...prevStatus,
      image_index_total_record: checkpointData.total_items_processed,
      image_last_embed_time: checkpointData.timestamp,
    }));
  };

  const updateTextEmbeddingStatus = (checkpointData: any) => {
    setTextEmbeddingStatus((prevStatus) => ({
      ...prevStatus,
      text_index_total_record: checkpointData.total_items_processed,
      text_last_embed_time: checkpointData.timestamp,
    }));
  };

  const clearImageConsoleOutput = () => {
    setImageConsoleOutput([]);
  };

  const clearTextConsoleOutput = () => {
    setTextConsoleOutput([]);
  };

  return (
    <div className={styles.embeddingPage}>
      <h2 className={styles.title}>Last Embedding Status</h2>
      <div className={styles.embeddingGrid}>
        <div className={styles.embeddingPanel}>
          <h3 className={styles.subTitle}>Image Index</h3>
          <div className={styles.statusGrid}>
            <div className={styles.statusCard}>
              <div className={styles.statusKey}>Total records</div>
              <div className={styles.statusValue}>
                {imageEmbeddingStatus.image_index_total_record}
              </div>
            </div>
            <div className={styles.statusCard}>
              <div className={styles.statusKey}>Last Embedding Time</div>
              <div className={styles.statusValue}>
                {imageEmbeddingStatus.image_last_embed_time}
              </div>
            </div>
            <div className={styles.statusCard}>
              <div className={styles.statusKey}>Storage Size</div>
              <div className={styles.statusValue}>360 Mb</div>
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} ${
                isImageEmbeddingActive ? styles.buttonStop : styles.buttonStart
              }`}
              onClick={
                isImageEmbeddingActive
                  ? handleStopImageEmbedding
                  : handleStartImageEmbedding
              }
            >
              {isImageEmbeddingActive
                ? "Stop Image Embedding"
                : "Start Image Embedding"}
            </button>
          </div>
          <div
            style={{
              alignSelf: "center",
              width: "40%",
              position: "fixed",
              bottom: "0",
            }}
          >
            <div className={styles.consoleGroup}>
              <h3 className={styles.title}>CONSOLE</h3>
              <button
                className={`${styles.clearConsoleButton} ${styles.button}`}
                onClick={clearImageConsoleOutput}
              >
                Clear
              </button>
            </div>
            <Console output={imageConsoleOutput} />
          </div>
        </div>
        <div className={styles.embeddingPanel}>
          <h3 className={styles.subTitle}>Text Index</h3>
          <div className={styles.statusGrid}>
            <div className={styles.statusCard}>
              <div className={styles.statusKey}>Total records</div>
              <div className={styles.statusValue}>
                {textEmbeddingStatus.text_index_total_record}
              </div>
            </div>
            <div className={styles.statusCard}>
              <div className={styles.statusKey}>Last Embedding Time</div>
              <div className={styles.statusValue}>
                {textEmbeddingStatus.text_last_embed_time}
              </div>
            </div>
            <div className={styles.statusCard}>
              <div className={styles.statusKey}>Storage Size</div>
              <div className={styles.statusValue}>360 Mb</div>
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} ${
                isTextEmbeddingActive ? styles.buttonStop : styles.buttonStart
              }`}
              onClick={
                isTextEmbeddingActive
                  ? handleStopTextEmbedding
                  : handleStartTextEmbedding
              }
            >
              {isTextEmbeddingActive
                ? "Stop Text Embedding"
                : "Start Text Embedding"}
            </button>
          </div>
          <div
            style={{
              alignSelf: "center",
              width: "40%",
              position: "fixed",
              bottom: "0",
            }}
          >
            <div className={styles.consoleGroup}>
              <h3 className={styles.title}>CONSOLE</h3>
              <button
                className={`${styles.clearConsoleButton} ${styles.button}`}
                onClick={clearTextConsoleOutput}
              >
                Clear
              </button>
            </div>
            <Console output={textConsoleOutput} />
          </div>
        </div>
      </div>
    </div>
  );
}