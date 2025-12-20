from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any
from datetime import datetime

from app.models.peer_review import PeerReviewStatus
from app.schemas.team import TeamRead


class PeerReviewBase(BaseModel):
    sprint: int

    # ВАЖНО: имена полей совпадают с ORM (snake_case),
    # а наружу отдаём camelCase через serialization_alias
    reviewing_team_id: int = Field(serialization_alias="reviewingTeamId")
    reviewed_team_id: int = Field(serialization_alias="reviewedTeamId")

    reviewed_team_report_link: str | None = Field(
        default=None,
        serialization_alias="reviewedTeamReportLink",
    )
    summary_pdf_link: str | None = Field(
        default=None,
        serialization_alias="summaryPDFLink",
    )
    comments_pdf_link: str | None = Field(
        default=None,
        serialization_alias="commentsPDFLink",
    )

    status: PeerReviewStatus
    submitted_at: datetime | None = Field(
        default=None,
        serialization_alias="submittedAt",
    )
    due_date: datetime | None = Field(
        default=None,
        serialization_alias="dueDate",
    )

    assigned_work: str | None = Field(
        default=None,
        serialization_alias="assignedWork",
    )
    # тут тип подгони под фронт: dict или конкретный Typed объект
    suggested_grades: dict | None = Field(
        default=None,
        serialization_alias="suggestedGrades",
    )
    review_grade: int | None = Field(
        default=None,
        serialization_alias="reviewGrade",
    )

    # связи с командами — имена как в ORM, alias как ждёт фронт
    reviewing_team: TeamRead = Field(serialization_alias="reviewingTeam")
    reviewed_team: TeamRead = Field(serialization_alias="reviewedTeam")

    model_config = ConfigDict(
        from_attributes=True,   # брать данные из ORM-атрибутов
        populate_by_name=True,  # позволять использовать имена полей, а не alias
    )


class PeerReviewCreate(PeerReviewBase):
    pass


class PeerReviewUpdate(BaseModel):
    sprint: Optional[int] = None
    reviewingTeamId: Optional[int] = None
    reviewedTeamId: Optional[int] = None
    reviewedTeamReportLink: Optional[str] = None
    summaryPDFLink: Optional[str] = None
    commentsPDFLink: Optional[str] = None
    status: Optional[PeerReviewStatus] = None
    submittedAt: Optional[datetime] = None
    dueDate: Optional[datetime] = None
    assignedWork: Optional[str] = None
    suggestedGrades: Optional[dict[str, Any]] = None
    reviewGrade: Optional[int] = None


class PeerReviewRead(PeerReviewBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ApiPeerReviewRead(PeerReviewRead):
    model_config = ConfigDict(from_attributes=True)


class ReportLinkUpdate(BaseModel):
    reviewingTeamId: int
    reviewedTeamId: int
    sprint: int
    reportLink: str
