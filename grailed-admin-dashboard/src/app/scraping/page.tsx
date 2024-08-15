"use client";

import { FilterModal, FilterData } from "@/app/filter-scraping/page";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Console } from "@/components/Console/Console";
import Link from "next/link";
import { parseISO, format } from "date-fns";

interface LogMessage {
  level: string;
  message: string;
  timestamp: string;
}

export default function ScrapingPage() {
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<LogMessage[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState({
    total_items: 0,
    last_brand_scrapped: "-",
    last_scroll_count: 0,
    last_scrape_time: "-",
    remaining_designer: 0,
    mongodb_storage: "-",
  });

  const apiBaseUrl = "http://127.0.0.1:8000/api/";

  useEffect(() => {
    fetchScrapingStatus();
    const eventSource = new EventSource(apiBaseUrl + "scraping_logs");

    eventSource.onmessage = (event) => {
      if (event.data.trim() !== "") {
        try {
          const logData = JSON.parse(event.data) as LogMessage;
          addConsoleOutput(logData);
          if (logData.level === "ERROR" && isScrapingActive) {
            handleStopScraping();
          }

          if (logData.message.includes("Checkpoint updated:")) {
            if (logData.message.includes("Checkpoint updated:")) {
              const checkpointString = logData.message
                .split("Checkpoint updated:")[1]
                .trim();
              const checkpointData = parseCheckpoint(checkpointString);
              updateScrapingStatus(checkpointData);
            }
          }
        } catch (error) {
          console.error("Failed to parse log message:", error);
          addConsoleOutput({
            level: "ERROR",
            message: "Failed to parse log message",
            timestamp: new Date().toISOString(),
          });

          if (isScrapingActive) {
            handleStopScraping();
          }
        }
      }
    };

    return () => {
      eventSource.close();
    };
  }, [isScrapingActive]);

  const fetchScrapingStatus = async () => {
    try {
      const response = await fetch(apiBaseUrl + "get_scraping_status");
      const data = await response.json();
      addConsoleOutput({
        level: "INFO",
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to fetch scraping status:", error);
      addConsoleOutput({
        level: "ERROR",
        message: "Failed to fetch scraping status",
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

    return {
      designer_slug: checkpointObject.designer_slug.replace(/['"]+/g, ""),
      last_scroll_count: parseInt(checkpointObject.last_scroll_count),
      total_items_scraped: parseInt(checkpointObject.total_items_scraped),
      // Note: timestamp is not present in the given format, so we'll use the current time
      timestamp: checkpointObject.timestamp,
    };
  };

  const updateScrapingStatus = (checkpointData: any) => {
    setScrapingStatus((prevStatus) => ({
      ...prevStatus,
      last_brand_scrapped: checkpointData.designer_slug,
      last_scroll_count: checkpointData.last_scroll_count,
      last_scrape_time:
        checkpointData.timestamp !== "None" ? checkpointData.timestamp : "-",
      total_items: checkpointData.total_items_scraped,
    }));
  };

  const addConsoleOutput = (message: LogMessage) => {
    setConsoleOutput((prev) => [...prev, message]);
  };

  const clearConsoleOutput = () => {
    setConsoleOutput([]);
  };

  const handleStartScraping = async () => {
    try {
      const response = await fetch(apiBaseUrl + "start_scraping", {
        method: "POST",
      });
      const data = await response.json();
      setIsScrapingActive(true);
      addConsoleOutput({
        level: "INFO",
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to start scraping:", error);
      addConsoleOutput({
        level: "ERROR",
        message: "Failed to start scraping",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleStopScraping = async () => {
    try {
      const response = await fetch(apiBaseUrl + "stop_scraping", {
        method: "POST",
      });
      const data = await response.json();
      setIsScrapingActive(false);
      addConsoleOutput({
        level: "INFO",
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to stop scraping:", error);
      addConsoleOutput({
        level: "ERROR",
        message: "Failed to stop scraping",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleFilter = async (filterData: FilterData) => {
    addConsoleOutput({
      level: "INFO",
      message: "Starting filter process...",
      timestamp: new Date().toISOString(),
    });

    if (filterData.filterSubstring.length > 0) {
      try {
        const response = await fetch(apiBaseUrl + "delete_items_by_substring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ substrings: filterData.filterSubstring }),
        });
        const data = await response.json();
        addConsoleOutput({
          level: "INFO",
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        addConsoleOutput({
          level: "ERROR",
          message: `Error deleting items by substring: ${error}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (filterData.ignoreDesigner.length > 0) {
      try {
        const response = await fetch(apiBaseUrl + "delete_items_by_designers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designers: filterData.ignoreDesigner }),
        });
        const data = await response.json();
        console.log(data);
        addConsoleOutput({
          level: "INFO",
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        addConsoleOutput({
          level: "ERROR",
          message: `Error deleting items by designers: ${error}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (filterData.deleteLowCountDesignersThreshold !== null) {
      try {
        const response = await fetch(
          apiBaseUrl + "delete_low_count_designers",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              threshold: filterData.deleteLowCountDesignersThreshold,
            }),
          }
        );
        const data = await response.json();
        addConsoleOutput({
          level: "INFO",
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        addConsoleOutput({
          level: "ERROR",
          message: `Error deleting low count designers: ${error}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    addConsoleOutput({
      level: "INFO",
      message: `Filter process completed`,
      timestamp: new Date().toISOString(),
    });
    setIsFilterModalOpen(false);
  };

  return (
    <div className={styles.scrapingPage}>
      <h2 className={styles.title}>Last Scraping Status</h2>
      <div className={styles.statusGrid}>
        <div className={styles.statusCard}>
          <div className={styles.statusKey}>Total items</div>
          <div className={styles.statusValue}>{scrapingStatus.total_items}</div>
        </div>
        <div className={styles.statusCard}>
          <div className={styles.statusKey}>Last Brand Scrapped</div>
          <div className={styles.statusValue}>
            {scrapingStatus.last_brand_scrapped}
          </div>
        </div>
        <div className={styles.statusCard}>
          <div className={styles.statusKey}>Last Scroll Count</div>
          <div className={styles.statusValue}>
            {scrapingStatus.last_scroll_count}
          </div>
        </div>
        <div className={styles.statusCard}>
          <div className={styles.statusKey}>Last Scrape Time</div>
          <div className={styles.statusValue}>
            {scrapingStatus.last_scrape_time}
          </div>
        </div>
        <div className={styles.statusCard}>
          <div className={styles.statusKey}>Remaining Designer</div>
          <div className={styles.statusValue}>
            {scrapingStatus.remaining_designer}
          </div>
        </div>
        <div className={styles.statusCard}>
          <div className={styles.statusKey}>MongoDB Storage</div>
          <div className={styles.statusValue}>
            {scrapingStatus.mongodb_storage}
          </div>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${
            isScrapingActive ? styles.buttonStop : styles.buttonStart
          }`}
          onClick={isScrapingActive ? handleStopScraping : handleStartScraping}
        >
          {isScrapingActive ? "Stop Scraping" : "Start Scraping"}
        </button>
        <button
          className={`${styles.button} ${styles.buttonFilter}`}
          onClick={handleOpenFilterModal}
        >
          Filter Scraping
        </button>
      </div>
      <div
        style={{
          alignSelf: "center",
          width: "95%",
          position: "fixed",
          bottom: "0",
        }}
      >
        <div className={styles.consoleGroup}>
          <h3 className={styles.title}>CONSOLE</h3>
          <button
            className={`${styles.clearConsoleButton} ${styles.button}`}
            onClick={clearConsoleOutput}
          >
            Clear
          </button>
        </div>
        <Console output={consoleOutput} />
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        onFilter={handleFilter}
      />
    </div>
  );
}
