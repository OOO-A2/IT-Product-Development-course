from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.peer_review import PeerReview
from app.schemas.peer_review import PeerReviewRead, PeerReviewCreate, PeerReviewUpdate

router = APIRouter()


@router.get("/", response_model=List[PeerReviewRead])
def list_peer_reviews(
    sprint: Optional[int] = None,
    reviewing_team_id: Optional[int] = None,
    reviewed_team_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(PeerReview)
    if sprint is not None:
        query = query.filter(PeerReview.sprint == sprint)
    if reviewing_team_id is not None:
        query = query.filter(PeerReview.reviewing_team_id == reviewing_team_id)
    if reviewed_team_id is not None:
        query = query.filter(PeerReview.reviewed_team_id == reviewed_team_id)
    return query.all()


@router.post("/", response_model=PeerReviewRead)
def create_peer_review(peer_review_in: PeerReviewCreate, db: Session = Depends(get_db)):
    peer_review = PeerReview(
        sprint=peer_review_in.sprint,
        reviewing_team_id=peer_review_in.reviewing_team_id,
        reviewed_team_id=peer_review_in.reviewed_team_id,
        review_link=peer_review_in.review_link,
        status=peer_review_in.status,
        submitted_at=peer_review_in.submitted_at,
        due_date=peer_review_in.due_date,
    )
    db.add(peer_review)
    db.commit()
    db.refresh(peer_review)
    return peer_review


@router.put("/{peer_review_id}", response_model=PeerReviewRead)
def update_peer_review(peer_review_id: int, peer_review_in: PeerReviewUpdate, db: Session = Depends(get_db)):
    peer_review = db.query(PeerReview).filter(PeerReview.id == peer_review_id).first()
    if not peer_review:
        return None

    if peer_review_in.review_link is not None:
        peer_review.review_link = peer_review_in.review_link
    if peer_review_in.status is not None:
        peer_review.status = peer_review_in.status
    if peer_review_in.submitted_at is not None:
        peer_review.submitted_at = peer_review_in.submitted_at
    if peer_review_in.due_date is not None:
        peer_review.due_date = peer_review_in.due_date

    db.commit()
    db.refresh(peer_review)
    return peer_review


@router.delete("/{peer_review_id}")
def delete_peer_review(peer_review_id: int, db: Session = Depends(get_db)):
    peer_review = db.query(PeerReview).filter(PeerReview.id == peer_review_id).first()
    if not peer_review:
        return {"deleted": False}
    db.delete(peer_review)
    db.commit()
    return {"deleted": True}
