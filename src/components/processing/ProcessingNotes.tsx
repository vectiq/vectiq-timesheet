import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/styles';
import { useNotes } from '@/lib/hooks/useNotes';
import { 
  Plus, 
  AlertCircle, 
  Info, 
  Clock, 
  CheckCircle,
  Edit,
  StickyNote,
  Pin
} from 'lucide-react';

interface ProcessingNotesProps {
  projectId: string | null;
  project?: {
    name: string;
    clientName: string;
  } | null;
  onClose: () => void;
}

export function ProcessingNotes({ projectId, project, onClose }: ProcessingNotesProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteType, setNoteType] = useState<'action' | 'info'>('info');
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
    isLoading,
    error,
    isCreating,
    isDeleting
  } = useNotes(projectId, new Date());

  // Log query state
  useEffect(() => {
    if (projectId) {
      console.log('Notes state:', { 
        projectId,
        isLoading,
        error,
        notesCount: notes?.length 
      });
    }
  }, [projectId, isLoading, error, notes]);
  
  const actionNotes = notes.filter(note => note.type === 'action');
  const infoNotes = notes.filter(note => note.type === 'info');
  const pendingActions = actionNotes.filter(note => note.status === 'pending');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSubmitting(true);

    try {
      await createNote({
        projectId: projectId!,
        month: format(new Date(), 'yyyy-MM'),
        type: noteType,
        text: noteText,
        ...(noteType === 'action' && { status: 'pending' }),
        ...(isPersistent && { isPersistent: true })
      });
    
      setNoteText('');
      setIsAddingNote(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = async (noteId: string, newText: string) => {
    if (!newText.trim()) return;
    
    try {
      await updateNote(noteId, { text: newText });
      setEditingNoteId(null);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const handleToggleStatus = async (noteId: string, currentStatus: 'pending' | 'completed') => {
    await updateNote(noteId, {
      status: currentStatus === 'pending' ? 'completed' : 'pending'
    });
  };

  // Reset form when project changes
  useEffect(() => {
    setNoteText('');
    setIsAddingNote(false);
  }, [projectId]);

  return (
    <SlidePanel
      open={!!projectId}
      onClose={onClose}
      title={project?.name || 'Project Notes'}
      subtitle={project?.clientName}
      icon={<StickyNote className="h-5 w-5 text-gray-600" />}
      headerAction={
        <Button onClick={() => setIsAddingNote(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      }
      stats={[
        { value: pendingActions.length, label: 'Pending', color: 'text-yellow-600' },
        { value: actionNotes.filter(n => n.status === 'completed').length, label: 'Completed', color: 'text-green-600' },
        { value: infoNotes.length, label: 'Info Notes', color: 'text-blue-600' }
      ]}
    >
      {/* Notes List */}
      <div className="flex-1">
        {/* Add Note Form */}
        {isAddingNote && (
          <div className="p-4 border-b bg-gray-50">
            <form onSubmit={handleAddNote} className="flex items-start gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={noteType === 'action' ? 'What needs to be done?' : 'Add a note...'}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none py-2 pr-10 min-h-[80px]"
                  required
                />
                <div className="absolute right-2 top-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPersistent(!isPersistent);
                      console.log('Toggled persistent:', !isPersistent);
                    }}
                    className={cn(
                      "p-1.5 rounded-md hover:bg-gray-100",
                      isPersistent && "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    )}
                    title={isPersistent ? "Persistent note (shows in all months)" : "Month-specific note"}
                  >
                    <Pin className={cn(
                      "h-4 w-4 transition-colors",
                      isPersistent ? "text-indigo-600" : "text-gray-400"
                    )} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteType(noteType === 'info' ? 'action' : 'info')}
                    className="p-1.5 rounded-md hover:bg-gray-100"
                  >
                    {noteType === 'info' ? (
                      <Info className="h-4 w-4 text-blue-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNoteText('');
                  }} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                >
                  <span className="text-sm">Cancel</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {notes.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notes.map(note => (
              <div
                key={note.id} 
                className={cn(
                  "p-4 relative group transition-all duration-200",
                  note.isPersistent && "bg-indigo-50/30 border border-indigo-100",
                  note.type === 'action' && note.status === 'completed' && "bg-green-50/50",
                  "hover:bg-gray-50 hover:shadow-sm rounded-lg my-2 mx-2"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors shrink-0",
                    note.type === 'action' 
                      ? note.status === 'completed'
                        ? 'bg-green-100'
                        : 'bg-yellow-100'
                      : 'bg-blue-100'
                  )}>
                    {note.type === 'action' ? (
                      <AlertCircle className={`h-4 w-4 ${
                        note.status === 'completed' 
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`} />
                    ) : (
                      <Info className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      {editingNoteId === note.id ? (
                        <textarea
                          defaultValue={note.text}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none py-2"
                          onBlur={(e) => handleEditNote(note.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleEditNote(note.id, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              setEditingNoteId(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-start gap-2">
                          <p className="text-gray-900 whitespace-pre-wrap break-words">{note.text}</p>
                          {note.isPersistent && (
                            <Badge variant="secondary" className="shrink-0">
                              <Pin className="h-3 w-3 mr-1" />
                              Persistent
                            </Badge>
                          )}
                        </div>
                      )}
                      {note.type === 'action' && (
                        <Badge 
                          variant={note.status === 'completed' ? 'success' : 'warning'}
                          className="shrink-0 ml-2"
                        >
                          {note.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {note.createdAt ? format(new Date(note.createdAt), 'MMM d, yyyy') : ''}
                      </span>
                      </div>
                      
                      {/* Action Buttons - Inline with date */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingNoteId(note.id)}
                          className="bg-white hover:bg-gray-50"
                        >
                          <Edit className="h-3.5 w-3.5 text-blue-600" />
                        </Button>
                        {note.type === 'action' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleStatus(note.id, note.status || 'pending')}
                            className="bg-white hover:bg-gray-50"
                          >
                            {note.status === 'completed' ? (
                              <Clock className="h-3.5 w-3.5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            )}
                          </Button>
                        )}
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="bg-white hover:bg-gray-50"
                        >
                          <span className="text-xs text-red-500">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="p-3 bg-gray-100 rounded-full mb-4">
              <StickyNote className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No notes yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a note or action item
            </p>
            <Button 
              onClick={() => setIsAddingNote(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Note
            </Button>
          </div>
        )}
      </div>
    </SlidePanel>
  );
}