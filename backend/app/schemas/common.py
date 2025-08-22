from typing import Optional
from pydantic import BaseModel

class IDModel(BaseModel):
	id: str

class Message(BaseModel):
	message: str