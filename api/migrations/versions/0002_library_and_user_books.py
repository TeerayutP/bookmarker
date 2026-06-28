"""library_books and user_books

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-28
"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'library_books',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('author', sa.String(255), nullable=False),
        sa.Column('total_chapters', sa.Integer(), nullable=True),
        sa.Column('cover_url', sa.String(1024), nullable=True),
        sa.Column('synopsis', sa.Text(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('added_by_user_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['added_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'user_books',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('book_id', sa.Integer(), nullable=False),
        sa.Column('current_chapter', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('reading', 'completed', 'on_hold', 'dropped', name='userbookstatus'), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('added_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['book_id'], ['library_books.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'book_id', name='uq_user_books'),
    )

    # Migrate books → library_books (preserve IDs)
    op.execute("""
        INSERT INTO library_books (id, title, author, total_chapters, cover_url, synopsis, category_id, added_by_user_id, created_at, updated_at)
        SELECT id, title, author, total_chapters, cover_url, synopsis, category_id, NULL, created_at, updated_at
        FROM books
    """)

    # Migrate books → user_books (assign all to first user if any exist)
    op.execute("""
        INSERT INTO user_books (user_id, book_id, current_chapter, status, notes, added_at, updated_at)
        SELECT
            (SELECT MIN(id) FROM users) as user_id,
            b.id as book_id,
            b.current_chapter,
            b.status,
            b.notes,
            b.created_at,
            b.updated_at
        FROM books b
        WHERE (SELECT COUNT(*) FROM users) > 0
    """)

    # Re-point reviews FK from books → library_books
    conn = op.get_bind()
    insp = sa.inspect(conn)
    fks = insp.get_foreign_keys('reviews')
    old_fk = next((fk['name'] for fk in fks if fk['referred_table'] == 'books'), None)
    if old_fk:
        op.drop_constraint(old_fk, 'reviews', type_='foreignkey')
    op.create_foreign_key(
        'fk_reviews_library_books', 'reviews', 'library_books',
        ['book_id'], ['id'], ondelete='CASCADE',
    )

    op.drop_table('books')


def downgrade() -> None:
    op.create_table(
        'books',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('author', sa.String(255), nullable=False),
        sa.Column('total_chapters', sa.Integer(), nullable=True),
        sa.Column('current_chapter', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('reading', 'completed', 'on_hold', 'dropped', name='bookstatus'), nullable=False),
        sa.Column('cover_url', sa.String(1024), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('synopsis', sa.Text(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )

    conn = op.get_bind()
    insp = sa.inspect(conn)
    fks = insp.get_foreign_keys('reviews')
    old_fk = next((fk['name'] for fk in fks if fk['referred_table'] == 'library_books'), None)
    if old_fk:
        op.drop_constraint(old_fk, 'reviews', type_='foreignkey')
    op.create_foreign_key(None, 'reviews', 'books', ['book_id'], ['id'], ondelete='CASCADE')

    op.drop_table('user_books')
    op.drop_table('library_books')
