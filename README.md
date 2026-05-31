# AI-Powered Smart Policing & Incident Intelligence Platform

Full-stack Next.js + Prisma + Python FastAPI project with:

- Citizen complaint reporting
- Upload images/videos
- YOLO vehicle detection
- Dataset-trained crash severity incident classifier
- Incident timestamp estimation using sliding-window video inference
- AI explanation text stored with incidents
- Delhi NCR crime map with live hotspots
- Police dashboard, alerts, complaints and analytics

## 1. Install frontend/backend dependencies

```powershell
npm install --legacy-peer-deps
copy .env.example .env
npx prisma db push
npm run db:seed
```

## 2. Prepare AI service

```powershell
cd ai-service
pip install -r requirements.txt
```

## 3. Add Kaggle crash dataset

Download the Kaggle dataset manually:

```text
https://www.kaggle.com/datasets/umitka/real-world-vehicle-crash-dataset-balanced
```

After extracting the Kaggle dataset, you can either place videos manually or run:

```powershell
cd ai-service
python prepare_kaggle_crash_dataset.py --source "C:\\path\\to\\extracted\\Balanced Accident Video" --output dataset
```

Then check these folders:

```text
ai-service/dataset/train/minor/
ai-service/dataset/train/moderate/
ai-service/dataset/train/major/
ai-service/dataset/val/minor/
ai-service/dataset/val/moderate/
ai-service/dataset/val/major/
```

Also add normal traffic videos here:

```text
ai-service/dataset/train/NORMAL/
ai-service/dataset/val/NORMAL/
```

Folder names must be exactly:

```text
NORMAL
minor
moderate
major
```

## 4. Train incident classifier

From `ai-service`:

```powershell
python train_incident_classifier.py --data dataset --epochs 8 --batch-size 2
```

This creates:

```text
ai-service/models/incident_classifier.pt
```

## 5. Run AI service

Terminal 1:

```powershell
cd ai-service
uvicorn main:app --reload --port 8001
```

## 6. Run Next.js app

Terminal 2:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## What AI returns

When a user uploads a video and submits a complaint, the AI service returns:

- vehicle detections using YOLO
- incident vs normal prediction
- crash severity: LOW / MEDIUM / HIGH / CRITICAL
- estimated timestamp where incident likely occurred
- AI explanation
- timeline events stored in database

## Delhi NCR Crime Map

Open:

```text
http://localhost:3000/map
```

The map shows:

- incident markers
- alert markers
- live hotspot circles
- severity-based colors
- hotspot updates every 10 seconds from `/api/map/hotspots`

New complaints automatically create incidents, and the hotspot API recalculates hotspot score from stored incident severity and location.
