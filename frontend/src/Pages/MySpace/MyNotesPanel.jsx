import { useEffect, useMemo, useRef, useState } from "react";
import { PencilIcon, SaveIcon, SparklesIcon, Trash2Icon, XIcon } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { cn } from "../../lib/utils";

const createNoteId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const readStoredNotes = (storageKey) => {
  try {
    const savedNotes = localStorage.getItem(storageKey);

    if (!savedNotes) {
      return [];
    }

    const parsedNotes = JSON.parse(savedNotes);

    if (!Array.isArray(parsedNotes)) {
      return [];
    }

    const fallbackTimestamp = new Date().toISOString();

    return parsedNotes
      .filter((note) => note && typeof note === "object")
      .map((note) => ({
        id: String(note.id || createNoteId()),
        title: String(note.title || "").trim(),
        content: String(note.content || "").trim(),
        createdAt: note.createdAt || note.updatedAt || fallbackTimestamp,
        updatedAt: note.updatedAt || note.createdAt || fallbackTimestamp,
      }))
      .filter((note) => Boolean(note.content));
  } catch {
    return [];
  }
};

const sortNotes = (notes = []) =>
  [...notes].sort(
    (left, right) =>
      new Date(right.updatedAt || right.createdAt || 0).getTime() -
      new Date(left.updatedAt || left.createdAt || 0).getTime()
  );

const formatNoteDate = (value) => {
  if (!value) {
    return "Just now";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
};

function MyNotesPanel({ storageKey, ownerName = "you" }) {
  const [notes, setNotes] = useState(() => sortNotes(readStoredNotes(storageKey)));
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const previousStorageKeyRef = useRef(storageKey);

  useEffect(() => {
    setNotes(sortNotes(readStoredNotes(storageKey)));
    setDraftTitle("");
    setDraftContent("");
    setEditingNoteId(null);
  }, [storageKey]);

  useEffect(() => {
    if (previousStorageKeyRef.current !== storageKey) {
      previousStorageKeyRef.current = storageKey;
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const latestUpdateLabel = useMemo(() => {
    if (notes.length === 0) {
      return "Nothing saved yet";
    }

    const latestNote = notes[0];
    return `Last updated ${formatNoteDate(latestNote.updatedAt || latestNote.createdAt)}`;
  }, [notes]);

  const resetDraft = () => {
    setDraftTitle("");
    setDraftContent("");
    setEditingNoteId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTitle = draftTitle.trim();
    const trimmedContent = draftContent.trim();

    if (!trimmedContent) {
      return;
    }

    const timestamp = new Date().toISOString();

    setNotes((currentNotes) => {
      if (editingNoteId) {
        return sortNotes(
          currentNotes.map((note) =>
            note.id === editingNoteId
              ? {
                  ...note,
                  title: trimmedTitle,
                  content: trimmedContent,
                  updatedAt: timestamp,
                }
              : note
          )
        );
      }

      return sortNotes([
        {
          id: createNoteId(),
          title: trimmedTitle,
          content: trimmedContent,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        ...currentNotes,
      ]);
    });

    resetDraft();
  };

  const handleEdit = (note) => {
    setEditingNoteId(note.id);
    setDraftTitle(note.title || "");
    setDraftContent(note.content || "");
  };

  const handleDelete = (noteId) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));

    if (editingNoteId === noteId) {
      resetDraft();
    }
  };

  const handleClearAll = () => {
    if (notes.length === 0) {
      return;
    }

    const confirmed = window.confirm("Clear all saved notes?");

    if (!confirmed) {
      return;
    }

    setNotes([]);
    resetDraft();
  };

  return (
    <aside className="space-y-4">
      <div className="rounded-[32px] border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <SparklesIcon size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">My Notes</h3>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary/5 px-4 py-3 text-xs font-semibold text-muted-foreground">
          <span>{notes.length} saved {notes.length === 1 ? "note" : "notes"}</span>
          <span>{latestUpdateLabel}</span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Input
            label="Note title"
            name="noteTitle"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Optional title"
            hint="Optional"
          />

          <Input
            label="Note"
            name="noteContent"
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            placeholder="Write a reminder, idea, blocker, or follow-up..."
            hint="Required"
            multiline
            rows={6}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={!draftContent.trim()}
              className="min-w-[132px]"
            >
              {editingNoteId ? (
                <>
                  <SaveIcon size={16} />
                  Update note
                </>
              ) : (
                <>
                  <SaveIcon size={16} />
                  Save note
                </>
              )}
            </Button>

            {editingNoteId && (
              <Button
                type="button"
                variant="secondary"
                onClick={resetDraft}
              >
                <XIcon size={16} />
                Cancel
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={handleClearAll}
              disabled={notes.length === 0}
            >
              Clear all
            </Button>
          </div>
        </form>
<br />

        <div>
                    <h2 className="text-lg font-semibold">My Notes List</h2>
                    
                  </div>
        <div className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {notes.length > 0 ? (
            notes.map((note) => {
              const isEditing = note.id === editingNoteId;

              return (
                <article
                  key={note.id}
                  className={cn(
                    "rounded-2xl border p-4 transition",
                    isEditing
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-background/80 hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {note.title || "Untitled note"}
                      </p>
                      <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(note)}
                        className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="Edit note"
                      >
                        <PencilIcon size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        className="rounded-xl p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete note"
                      >
                        <Trash2Icon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    <span>{formatNoteDate(note.updatedAt || note.createdAt)}</span>
                    {isEditing && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                        Editing
                      </span>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">No notes yet.</p>
              <p className="mt-1 leading-6">
                Add a quick note above and it will stay saved on this device for {ownerName}.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default MyNotesPanel;
