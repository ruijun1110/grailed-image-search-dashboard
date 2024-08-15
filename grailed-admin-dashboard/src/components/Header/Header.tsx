import React from "react";
import Link from "next/link";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.title}>
        GRAILED IMAGE SEARCH
      </Link>
    </header>
  );
};

export default Header;
