// src/components/FilterModal/FilterModal.tsx
"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

export interface FilterData {
  filterSubstring: string[];
  filterRepeatedTitle: boolean;
  ignoreDesigner: string[];
  ignoreSeller: string[];
  deleteLowCountDesignersThreshold: number | null;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (filterData: FilterData) => void;
}

export function FilterModal({ isOpen, onClose, onFilter }: FilterModalProps) {
  const [filterSubstring, setFilterSubstring] = useState<string[]>([]);
  const [filterRepeatedTitle, setFilterRepeatedTitle] = useState(false);
  const [ignoreDesigner, setIgnoreDesigner] = useState<string[]>([]);
  const [ignoreSeller, setIgnoreSeller] = useState<string[]>([]);
  const [
    deleteLowCountDesignersThreshold,
    setDeleteLowCountDesignersThreshold,
  ] = useState<number | null>(null);
  const [currentInput, setCurrentInput] = useState({
    filterSubstring: "",
    ignoreDesigner: "",
    ignoreSeller: "",
  });

  const handleSubmit = (
    field: "filterSubstring" | "ignoreDesigner" | "ignoreSeller"
  ) => {
    if (currentInput[field].trim()) {
      switch (field) {
        case "filterSubstring":
          setFilterSubstring([
            ...filterSubstring,
            currentInput.filterSubstring.trim(),
          ]);
          break;
        case "ignoreDesigner":
          setIgnoreDesigner([
            ...ignoreDesigner,
            currentInput.ignoreDesigner.trim(),
          ]);
          break;
        case "ignoreSeller":
          setIgnoreSeller([...ignoreSeller, currentInput.ignoreSeller.trim()]);
          break;
      }
      setCurrentInput({ ...currentInput, [field]: "" });
    }
  };

  const handleRemoveTag = (
    field: "filterSubstring" | "ignoreDesigner" | "ignoreSeller",
    index: number
  ) => {
    switch (field) {
      case "filterSubstring":
        setFilterSubstring(filterSubstring.filter((_, i) => i !== index));
        break;
      case "ignoreDesigner":
        setIgnoreDesigner(ignoreDesigner.filter((_, i) => i !== index));
        break;
      case "ignoreSeller":
        setIgnoreSeller(ignoreSeller.filter((_, i) => i !== index));
        break;
    }
  };

  const handleFilter = () => {
    onFilter({
      filterSubstring,
      filterRepeatedTitle,
      ignoreDesigner,
      ignoreSeller,
      deleteLowCountDesignersThreshold,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Filter Scraping</h2>
        <form
          className={styles.filterForm}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.formRow}>
            <label htmlFor="filterSubstring">Filter Substring</label>
            <div className={styles.inputWithButton}>
              <input
                id="filterSubstring"
                type="text"
                value={currentInput.filterSubstring}
                onChange={(e) =>
                  setCurrentInput({
                    ...currentInput,
                    filterSubstring: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => handleSubmit("filterSubstring")}
              >
                +
              </button>
            </div>
          </div>
          <div className={styles.tagContainer}>
            {filterSubstring.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <button
                  onClick={() => handleRemoveTag("filterSubstring", index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className={styles.formRow}>
            <label htmlFor="filterRepeatedTitle">
              Filter Item W/ Repeated Title
            </label>
            <button
              type="button"
              className={`${styles.toggleButton} ${
                filterRepeatedTitle ? styles.active : ""
              }`}
              onClick={() => setFilterRepeatedTitle(!filterRepeatedTitle)}
            >
              {filterRepeatedTitle ? "On" : "Off"}
            </button>
          </div>

          <div className={styles.formRow}>
            <label htmlFor="deleteLowCountDesigners">
              Delete low count designers
            </label>
            <input
              type="number"
              id="deleteLowCountDesigners"
              value={deleteLowCountDesignersThreshold || ""}
              onChange={(e) =>
                setDeleteLowCountDesignersThreshold(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className={styles.numberInput}
            />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="ignoreDesigner">Ignore Designer</label>
            <div className={styles.inputWithButton}>
              <input
                id="ignoreDesigner"
                type="text"
                value={currentInput.ignoreDesigner}
                onChange={(e) =>
                  setCurrentInput({
                    ...currentInput,
                    ignoreDesigner: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => handleSubmit("ignoreDesigner")}
              >
                +
              </button>
            </div>
          </div>
          <div className={styles.tagContainer}>
            {ignoreDesigner.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <button
                  onClick={() => handleRemoveTag("ignoreDesigner", index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className={styles.formRow}>
            <label htmlFor="ignoreSeller">Ignore Seller</label>
            <div className={styles.inputWithButton}>
              <input
                id="ignoreSeller"
                type="text"
                value={currentInput.ignoreSeller}
                onChange={(e) =>
                  setCurrentInput({
                    ...currentInput,
                    ignoreSeller: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => handleSubmit("ignoreSeller")}
              >
                +
              </button>
            </div>
          </div>
          <div className={styles.tagContainer}>
            {ignoreSeller.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <button onClick={() => handleRemoveTag("ignoreSeller", index)}>
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className={styles.modalButtons}>
            <button className={styles.filterButton} onClick={handleFilter}>
              Filter
            </button>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
