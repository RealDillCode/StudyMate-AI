import structlog

structlog.configure(
	processors=[
		structlog.contextvars.merge_contextvars,
		structlog.processors.TimeStamper(fmt="iso"),
		structlog.processors.add_log_level,
		structlog.processors.JSONRenderer(),
	],
)