# Aegis (AEG) 專案開發文檔

## 專案概述
Aegis (AEG) 是一個在 Base 主網 (Layer 2) 上發行的 ERC-20 代幣。

## 技術架構
- **智能合約**: Solidity 0.8.20 (使用 OpenZeppelin 指令集)
- **前端**: HTML5 / CSS3 / JavaScript (Ethers.js)
- **開發工具**: Hardhat

## 核心功能
1. **鑄造 (Minting)**: 僅限合約擁有者。
2. **銷毀 (Burning)**: 持有者可自由銷毀代幣。
3. **緊急暫停 (Pausable)**: 發生突發事件時可由擁有者停止交易。

## 目錄說明
- `/contracts`: 存放 ERC-20 智能合約。
- `/frontend`: 網站前端互動原始碼。
- `/scripts`: 部署與自動化腳本。
- `/docs`: 技術文檔與資源。
