# Vehicle Posting Automation Backend

This is a backend application built with **NestJS** that automates the posting of vehicle announcements to a third-party platform using **Puppeteer**. It exposes a single POST endpoint where users can send vehicle data along with a set of images. The backend then handles form submission on the target platform, and returns a screenshot image of the final post.

---

## Stack

- **NestJS** - Backend framework
- **Puppeteer** - Browser automation
- **Multer** - File upload middleware
- **Express** - Underlying HTTP layer

---

### 🔧 Installation

```bash
git clone https://github.com/CesarQuint/vehicle-sell-backend.git
cd vehicle-sell-backend
npm install
```

### Running the App

Add env variables

```bash
npm run start:dev
```

---

## API

### POST `/vehicle`

This endpoint accepts vehicle information and images, processes them using Puppeteer, and returns a screenshot of the final post.

#### Request

- **Content-Type**: `multipart/form-data`

##### Fields

| Name          | Type   | Description                |
| ------------- | ------ | -------------------------- |
| `price`       | string | Price in local currency    |
| `description` | string | Description of the vehicle |

---
