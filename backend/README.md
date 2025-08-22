# Backend (FastAPI)

## Setup

1. Create virtualenv and install deps:
```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Copy env and edit values:
```
cp .env.example .env
```

3. Run dev server:
```
make dev
```

4. Alembic migrations:
```
make migrate
```