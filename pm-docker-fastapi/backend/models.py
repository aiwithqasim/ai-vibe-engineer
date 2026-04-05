from typing import Self

from pydantic import BaseModel, model_validator


class CardModel(BaseModel):
    id: str
    title: str
    details: str


class ColumnModel(BaseModel):
    id: str
    title: str
    cardIds: list[str]


class BoardPayload(BaseModel):
    columns: list[ColumnModel]
    cards: dict[str, CardModel]


class ColumnTitleUpdate(BaseModel):
    title: str


class CreateCardBody(BaseModel):
    column_id: str
    title: str
    details: str = ""


class PatchCardBody(BaseModel):
    title: str | None = None
    details: str | None = None
    column_id: str | None = None
    index: int | None = None

    @model_validator(mode="after")
    def at_least_one_field(self) -> Self:
        if (
            self.title is None
            and self.details is None
            and self.column_id is None
            and self.index is None
        ):
            raise ValueError("At least one of title, details, column_id, index is required")
        return self
