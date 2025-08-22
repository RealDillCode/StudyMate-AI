dev:
	uvicorn app.main:app --reload

db.up:
	docker compose up -d db

migrate:
	alembic revision --autogenerate -m "init" && alembic upgrade head

test:
	pytest -q