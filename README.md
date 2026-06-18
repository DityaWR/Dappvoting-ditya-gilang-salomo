<img width="485" height="747" alt="WhatsApp Image 2026-06-18 at 23 49 37" src="https://github.com/user-attachments/assets/c93311ae-cad3-4068-9f85-3e7916a555a6" /># 🗳️ VoteChain — Voting dApp (Project 3)

<div align="center">

![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![ethers.js](https://img.shields.io/badge/ethers.js-v6-2535A0?style=for-the-badge)
![MetaMask](https://img.shields.io/badge/MetaMask-Integrated-F6851B?style=for-the-badge&logo=metamask&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-v2.22-FFF100?style=for-the-badge)

**Decentralized Voting Application — on-chain, transparent, anti-kecurangan.**

</div>

---

## 📖 Deskripsi

**VoteChain** adalah Decentralized Application (dApp) yang mengintegrasikan **Smart Contract SimpleVoting** dengan **frontend React** menggunakan **ethers.js** dan **MetaMask**. Setiap suara dicatat permanen di blockchain Ethereum — tidak bisa dimanipulasi, tidak bisa dihapus, transparan untuk semua.

---

## 👥 Anggota Kelompok

| Nama | NRP | Kontribusi |
|------|-----|------------|
| 🧑‍💻 **Gilang Raya Kurniawan** | 5027220145 | Smart Contract (Solidity, Testing, Deploy) |
| 🧑‍💻 **Ditya Wahyu Ramadhan** | 5027221051 | Frontend UI/UX (React, Components, Styling) |
| 🧑‍💻 **Salomo** | 5027221063 | Integrasi Web3 (ethers.js, Wallet, Read/Write) |

---

## ✨ Fitur

### Fitur Wajib
- [x] **Connect Wallet** — Deteksi MetaMask & hubungkan akun
- [x] **Tampilkan Kandidat** — Daftar kandidat dengan nama & ID
- [x] **Vote On-Chain** — Kirim transaksi vote via MetaMask
- [x] **Hasil Voting Real-time** — Progress bar persentase suara tiap kandidat
- [x] **Cegah Double Voting** — UI disable + pesan jika sudah vote
- [x] **Loading State** — Spinner saat transaksi pending di blockchain
- [x] **Error Handling** — Pesan error user-friendly (bukan raw error)
- [x] **Network Detection** — Warning banner jika MetaMask di network salah

### Fitur Bonus 🌟
- [x] **Countdown Deadline** — Timer real-time sampai sesi voting berakhir
- [x] **Admin Panel** — Tambah kandidat, mulai/akhiri voting (khusus owner)
- [x] **Recent Activity** — Riwayat vote terbaru via event listener
- [x] **Transaction Toast** — Notifikasi status transaksi (pending/success/error)
- [x] **Dark Mode** — UI gelap dengan glassmorphism design
- [x] **Responsive Design** — Mobile-friendly layout

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Smart Contract | Solidity 0.8.28 + Hardhat v2 |
| Web3 Library | ethers.js v6 |
| Wallet | MetaMask |
| Styling | Vanilla CSS (Glassmorphism) |
| Testing | Hardhat + Chai (32 test cases) |

---

## 📁 Struktur Project

```
project-smart-contract-fix/
├── contracts/
│   └── SimpleVoting.sol          # Smart Contract utama
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConnectWallet.jsx  # Wallet connect/disconnect
│   │   │   ├── NetworkWarning.jsx # Deteksi network salah
│   │   │   ├── VotingStatus.jsx   # Status sesi voting
│   │   │   ├── DeadlineCountdown.jsx # Countdown timer
│   │   │   ├── CandidateList.jsx  # Daftar kandidat + progress bar
│   │   │   ├── VotePanel.jsx      # Panel cast vote
│   │   │   ├── WinnerDisplay.jsx  # Pengumuman pemenang
│   │   │   ├── AdminPanel.jsx     # Admin controls (owner only)
│   │   │   └── TransactionToast.jsx # Notifikasi transaksi
│   │   ├── hooks/
│   │   │   ├── useWallet.js       # MetaMask state management
│   │   │   └── useContract.js     # Blockchain read/write operations
│   │   ├── utils/
│   │   │   ├── contract.js        # ABI + contract address
│   │   │   └── helpers.js         # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── test/
│   └── SimpleVoting.test.js       # 32 unit tests
├── scripts/
│   ├── deploy.js
│   └── interact.js
├── hardhat.config.js
└── README.md
```

---

## 🚀 Cara Menjalankan

### Prerequisites

- ✅ Node.js `v22.13.0` atau di atasnya
- ✅ npm `v10.5.2` atau di atasnya
- ✅ MetaMask browser extension ([download](https://metamask.io/download/))
- ✅ Git

---

### 1. Clone Repository

```bash
git clone https://github.com/DityaWR/blockchain-project2-ditya-gilang.git
cd blockchain-project2-ditya-gilang
```

---

### 2. Install Dependencies

```bash
# Root folder (smart contract)
npm install

# Frontend folder
cd frontend
npm install
cd ..
```

---

### 3. Compile & Test Smart Contract

```bash
npx hardhat compile
npx hardhat test
```

Output yang diharapkan:
```
Compiled 1 Solidity file successfully
32 passing
```

<img width="802" height="875" alt="image" src="https://github.com/user-attachments/assets/fecc55d4-96ce-4084-af12-62065e0350e5" />

---

### 4. Jalankan Local Blockchain Node

> ⚠️ Buka **Terminal 1** — biarkan tetap berjalan

```bash
npx hardhat node
```

Node akan berjalan di `http://127.0.0.1:8545` (Chain ID: 31337).

<img width="523" height="41" alt="image" src="https://github.com/user-attachments/assets/1a15e98c-1e1c-45d3-bfe9-816fcb9f28eb" />

---

### 5. Deploy Smart Contract

> ⚠️ Buka **Terminal 2**

```bash
npm run deploy
```

Output:
```
✅ SimpleVoting deployed successfully!
Contract address : 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Voting session started (deadline: 3600s, quorum: 2)
```

<img width="606" height="655" alt="image" src="https://github.com/user-attachments/assets/8e5e6e17-234c-482a-ad05-c9750dd557bb" />

---

### 6. Update Contract Address di Frontend

Buka [`frontend/src/utils/contract.js`](./frontend/src/utils/contract.js) dan update:

```js
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Ganti dengan address dari deploy
```

---

### 7. Setup MetaMask

1. Buka MetaMask → **Add Network** → **Add Network Manually**

   | Field | Value |
   |-------|-------|
   | Network Name | Hardhat Local |
   | RPC URL | `http://127.0.0.1:8545` |
   | Chain ID | `31337` |
   | Currency Symbol | `ETH` |

<img width="770" height="588" alt="image" src="https://github.com/user-attachments/assets/b1dabda6-fb5e-4e9d-9541-66466c387310" />

3. Import akun: copy **Private Key** dari Terminal 1 → MetaMask → **Import Account**

<img width="1920" height="1080" alt="Screenshot (809)" src="https://github.com/user-attachments/assets/8adcde7f-ea18-4d04-89d0-1a66859b1983" />

---

### 8. Jalankan Frontend

```bash
cd frontend
npm run dev
```

Buka browser: **http://localhost:5173**

<img width="1919" height="945" alt="Screenshot 2026-06-18 224845" src="https://github.com/user-attachments/assets/92cd4bc0-4fc3-48fa-91f9-1dbae47e1315" />

---

### 9. Gunakan Aplikasi

1. Klik **Connect Wallet** → setujui di MetaMask
2. Lihat daftar kandidat dan hasil voting live
3. Klik kandidat → klik **Vote** → konfirmasi di MetaMask
4. Lihat hasil update secara real-time

<img width="1600" height="811" alt="WhatsApp Image 2026-06-18 at 23 48 26" src="https://github.com/user-attachments/assets/8a5e8b4f-91f2-4540-ae21-ce4a1c5c3dcb" />

<img width="686" height="495" alt="WhatsApp Image 2026-06-18 at 23 48 35" src="https://github.com/user-attachments/assets/1fd27aea-23ae-40f0-91f7-1fc0399644b4" />

<img width="485" height="747" alt="WhatsApp Image 2026-06-18 at 23 49 37" src="https://github.com/user-attachments/assets/329ee0ff-8571-4e14-a07c-e953aacf7694" />

<img width="1600" height="753" alt="WhatsApp Image 2026-06-19 at 00 18 45" src="https://github.com/user-attachments/assets/f1af79b7-7ec2-4175-90c1-b651b939d557" />

<img width="1600" height="822" alt="WhatsApp Image 2026-06-19 at 00 23 22" src="https://github.com/user-attachments/assets/b8c67068-da40-4243-84b6-4b7ec62faef9" />


---

## 📜 Contract Address

| Network | Address |
|---------|---------|
| Local (Hardhat) | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| Testnet Sepolia | *(opsional)* |

---

## 🧪 Test Coverage

```
32 test cases — 100% Statements, 87% Branch Coverage
```

| Kategori | Test Cases |
|----------|-----------|
| Deployment | TC-01, TC-02 |
| Main Functions (Positive) | TC-03 s/d TC-07 |
| Main Functions (Negative) | TC-08 s/d TC-12 |
| Access Control | TC-13 s/d TC-18 |
| Events | TC-19 s/d TC-22 |
| Reset Election | TC-23 s/d TC-26 |
| Deadline Branches | TC-27 s/d TC-31 |
| isCallerOwner | TC-32 |

---

## 🔌 Operasi Read & Write

### Read Operations (tanpa gas)
- `getCandidateCount()` — jumlah kandidat
- `getResults()` — semua kandidat + vote count
- `getWinner()` — pemenang saat ini
- `votingActive()` — status sesi
- `votingDeadline()` — timestamp deadline
- `hasVoted(address)` — apakah sudah vote
- `isCallerOwner()` — apakah caller adalah admin
- `isDeadlinePassed()` — apakah deadline sudah lewat

### Write Operations (butuh gas + MetaMask)
- `vote(candidateId)` — cast suara
- `addCandidate(name)` — tambah kandidat *(admin)*
- `startVoting(duration, quorum)` — mulai sesi *(admin)*
- `endVoting()` — akhiri sesi *(admin)*
- `resetElection()` — reset data *(admin)*

---

## 🔒 Security Notes

- Owner address di-**private** di smart contract — tidak bisa di-query via ABI
- Private key **tidak pernah** di-commit (gunakan akun Hardhat untuk testing)
- Input validation di frontend dan smart contract
- Error MetaMask ditangani dengan pesan user-friendly

---

## 📄 Lisensi

MIT License

---

<div align="center">

Made with ❤️ by **Gilang Raya Kurniawan**, **Ditya Wahyu Ramadhan**, & **Salomo**

*Teknik Informatika — Institut Teknologi Sepuluh Nopember (ITS)*

**Project 3 — Decentralized Application (dApp)**

</div>
