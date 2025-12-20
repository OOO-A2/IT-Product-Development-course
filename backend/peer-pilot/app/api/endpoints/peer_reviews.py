import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import json
import zipfile
import io
from datetime import datetime

from app.core.db import get_db
from app.core.security import get_current_user, require_instructor, require_student
from app.models.student import Student
from app.models.user import User, UserRole
from app.models.peer_review import PeerReview, PeerReviewStatus
from app.models.team import Team
from app.schemas.peer_review import (
    PeerReviewRead,
    PeerReviewCreate,
    PeerReviewUpdate,
    ApiPeerReviewRead,
    ReportLinkUpdate,
)

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter()

logger = logging.getLogger(__name__)

@router.put("/report-link", status_code=204)
def update_report_link(
    data: ReportLinkUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_instructor),
):
    pr = (
        db.query(PeerReview)
        .filter(
            PeerReview.sprint == data.sprint,
            PeerReview.reviewing_team_id == data.reviewingTeamId,
            PeerReview.reviewed_team_id == data.reviewedTeamId,
        )
        .first()
    )

    if not pr:
        raise HTTPException(status_code=404, detail="Peer review not found")

    pr.reviewed_team_report_link = data.reportLink
    db.commit()
    return



@router.get("/", response_model=List[ApiPeerReviewRead])
def list_peer_reviews(
    sprint: Optional[int] = None,
    reviewing_team_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(PeerReview)

    if current_user.role == UserRole.STUDENT:
        # 1. Находим студента, привязанного к этому пользователю
        student = (
            db.query(Student)
            .filter(Student.id == current_user.student_id)
            .first()
        )

        # 2. Проверяем, есть ли у студента команда
        if not student or student.team_id is None:
            raise HTTPException(status_code=400, detail="Student has no team")

        # 3. Фильтруем ревью по команде студента
        query = query.filter(PeerReview.reviewing_team_id == student.team_id)

        # 4. Доп. фильтр по спринту, если передан
        if sprint is not None:
            query = query.filter(PeerReview.sprint == sprint)

    else:  # instructor
        if sprint is not None:
            query = query.filter(PeerReview.sprint == sprint)
        if reviewing_team_id is not None:
            query = query.filter(PeerReview.reviewing_team_id == reviewing_team_id)

    reviews = query.all()

    if current_user.role == UserRole.STUDENT:
        for pr in reviews:
            mirror = (
                db.query(PeerReview)
                .filter(
                    PeerReview.sprint == pr.sprint,
                    PeerReview.reviewing_team_id == pr.reviewed_team_id,  # команда напротив — reviewer
                )
                .first()
            )

            if mirror and mirror.reviewed_team_report_link:
                # подменяем ТОЛЬКО в ответе (commit не делаем)
                pr.reviewed_team_report_link = mirror.reviewed_team_report_link
    return reviews


@router.post("/", response_model=PeerReviewRead)
def create_peer_review(
    data: PeerReviewCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_instructor),
):
    reviewing_team = db.query(Team).get(data.reviewingTeamId)
    reviewed_team = db.query(Team).get(data.reviewedTeamId)
    if not reviewing_team or not reviewed_team:
        raise HTTPException(400, "Invalid team ids")

    pr = PeerReview(
        sprint=data.sprint,
        reviewing_team_id=data.reviewingTeamId,
        reviewed_team_id=data.reviewedTeamId,
        reviewed_team_report_link=data.reviewedTeamReportLink,
        summary_pdf_link=data.summaryPDFLink,
        comments_pdf_link=data.commentsPDFLink,
        status=data.status,
        submitted_at=data.submittedAt,
        due_date=data.dueDate,
        assigned_work=data.assignedWork,
        suggested_grades=data.suggestedGrades,
        review_grade=data.reviewGrade,
    )
    db.add(pr)
    db.commit()
    db.refresh(pr)
    return pr


@router.put("/{review_id}", response_model=PeerReviewRead)
def update_peer_review(
    review_id: int,
    data: PeerReviewUpdate,
    db: Session = Depends(get_db),
):
    pr = db.query(PeerReview).get(review_id)
    if not pr:
        raise HTTPException(404, "Peer review not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "status":
            continue
        attr = {
            "reviewingTeamId": "reviewing_team_id",
            "reviewedTeamId": "reviewed_team_id",
            "reviewedTeamReportLink": "reviewed_team_report_link",
            "submittedAt": "submitted_at",
            "dueDate": "due_date",
            "assignedWork": "assigned_work",
            "suggestedGrades": "suggested_grades",
            "reviewGrade": "review_grade",
        }.get(field, field)
        setattr(pr, attr, value)

    db.commit()
    db.refresh(pr)
    return pr


@router.delete("/{review_id}/file/{file_type}", status_code=204)
def delete_review_file(
    review_id: int,
    file_type: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    pr = db.query(PeerReview).get(review_id)
    if not pr:
        raise HTTPException(404, "Peer review not found")

    if file_type not in ("comments", "summary"):
        raise HTTPException(400, "Invalid file_type")

    if file_type == "comments":
        path_str = pr.comments_pdf_link
        pr.comments_pdf_link = None
    else:
        path_str = pr.summary_pdf_link
        pr.summary_pdf_link = None
        pr.suggested_grades = None
    pr.status = PeerReviewStatus.PENDING

    # если ссылку вообще не хранили — просто 204
    if path_str:
        path = Path(path_str)
        if path.exists():
            try:
                path.unlink()
            except OSError:
                # не критично — просто логируем/игнорим
                pass

    # если оба файла отсутствуют — откатываем статус
    if not pr.comments_pdf_link and not pr.summary_pdf_link:
        pr.status = PeerReviewStatus.PENDING
        pr.submitted_at = None

    db.commit()
    return


def _recompute_status(pr: PeerReview):
    has_summary = bool(pr.summary_pdf_link)
    has_comments = bool(pr.comments_pdf_link)

    if has_summary and has_comments:
        pr.status = PeerReviewStatus.SUBMITTED
        if not pr.submitted_at:
            pr.submitted_at = datetime.utcnow()
    else:
        pr.status = PeerReviewStatus.PENDING
        pr.submitted_at = None

# ---------- FILE UPLOAD ----------

@router.post("/upload")
async def upload_review_file(
    reviewId: int = Form(...),
    fileType: str = Form(...),  # 'comments' | 'summary'
    file: UploadFile = File(...),
    suggestedGrades: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /reviews/upload со стороны студента / инструктора.
    Фронт шлёт form-data: reviewId, fileType, file, suggestedGrades (json).
    """
    pr = db.query(PeerReview).get(reviewId)
    if not pr:
        raise HTTPException(404, "Peer review not found")

    # сохраняем файл
    suffix = "comments" if fileType == "comments" else "summary"
    filename = f"review_{reviewId}_{suffix}_{int(datetime.utcnow().timestamp())}.pdf"
    dest = UPLOAD_DIR / filename

    with dest.open("wb") as f:
        content = await file.read()
        f.write(content)

    url_path = f"/peer-reviews/{reviewId}/download/{suffix}"

    if fileType == "comments":
        pr.comments_pdf_link = str(dest)
    else:
        pr.summary_pdf_link = str(dest)
        if suggestedGrades:
            try:
                pr.suggested_grades = json.loads(suggestedGrades)
            except json.JSONDecodeError:
                pass
    
    _recompute_status(pr)
    db.commit()
    db.refresh(pr)

    return {"fileUrl": url_path}


# ---------- FILE DOWNLOAD ----------

@router.get("/{review_id}/download/{file_type}")
def download_review_pdf(
    review_id: int,
    file_type: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    pr = db.query(PeerReview).get(review_id)
    if not pr:
        raise HTTPException(404, "Peer review not found")

    path_str = None
    if file_type == "summary":
        path_str = pr.summary_pdf_link
    else:  # 'detailed' в фронте -> comments
        path_str = pr.comments_pdf_link

    if not path_str:
        raise HTTPException(404, "File not found for this type")

    path = Path(path_str)
    if not path.exists():
        raise HTTPException(404, "File missing on server")

    return FileResponse(path, media_type="application/pdf", filename=path.name)


@router.get("/{sprint}/download-all")
def download_all_files_for_sprint(
    sprint: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_instructor),
):
    """
    GET /sprints/{sprint}/download-all — zip всех файлов по спринту.
    """
    reviews = db.query(PeerReview).filter(PeerReview.sprint == sprint).all()
    memfile = io.BytesIO()

    with zipfile.ZipFile(memfile, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for pr in reviews:
            for label, path_str in [("summary", pr.summary_pdf_link), ("comments", pr.comments_pdf_link)]:
                if not path_str:
                    continue
                path = Path(path_str)
                if not path.exists():
                    continue
                arcname = f"sprint_{sprint}/review_{pr.id}_{label}.pdf"
                zf.write(path, arcname=arcname)

    memfile.seek(0)
    return FileResponse(
        memfile,
        media_type="application/zip",
        filename=f"sprint-{sprint}-peer-reviews.zip",
    )
