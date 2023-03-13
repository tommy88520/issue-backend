## **Using 📦**


1. Clone Template

```
git clone https://github.com/tommy88520/issue-backend
```

2. Install Packages

```
npm install
```

3. Start Project

3.1 

請先到雲端連結，下載env檔，並將檔名更改為 .env.dev 否則功能會有問題

3.2

```
npm run dev
```

## **專案架構**

主要分為兩個部分：

1. auth: 包含jwt與github登入strategy與拿到會員資料的地方。
2. user: 管理所有前端所需api，controller管理路由、service管理與github api溝通邏輯、整理資料結構、撰寫cache的地方。


