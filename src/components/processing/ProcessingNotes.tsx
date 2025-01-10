import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNotes } from '@/lib/hooks/useNotes';
import { 
  Plus, 
  AlertCircle, 
  Info, 
  Clock, 
  CheckCircle,
  X,
  StickyNote
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
  const [noteType, setNoteType] = useState<'action' | 'info'>('info');
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        ...(noteType === 'action' && { status: 'pending' })
      });
    
      setNoteText('');
      setIsAddingNote(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsSubmitting(false);
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
    <Sheet open={!!projectId} onOpenChange={() => onClose()}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <StickyNote className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {project?.name || 'Project Notes'}
                </h2>
                {project && (
                  <p className="text-sm text-gray-500">{project.clientName}</p>
                )}
                <p className="text-sm text-gray-500">
                  {actionNotes.length} actions • {infoNotes.length} notes
                </p>
              </div>
            </div>
            <Button onClick={() => setIsAddingNote(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-b">
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">
                {pendingActions.length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {actionNotes.filter(n => n.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {infoNotes.length}
              </div>
              <div className="text-sm text-gray-600">Info Notes</div>
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
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
                    <button
                      type="button"
                      onClick={() => setNoteType(noteType === 'info' ? 'action' : 'info')}
                      className="absolute right-2 top-2 p-1.5 rounded-md hover:bg-gray-100"
                    >
                      {noteType === 'info' ? (
                        <Info className="h-4 w-4 text-blue-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                    </button>
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
                      className="p-2 text-gray-400 hover:bg-gray-50 rounded-md"
                    >
                      <X className="h-5 w-5" />
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
                    className="p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1.5 rounded-lg ${
                          note.type === 'action' 
                            ? 'bg-yellow-100' 
                            : 'bg-blue-100'
                        }`}>
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
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-gray-900">{note.text}</p>
                            {note.type === 'action' && (
                              <Badge 
                                variant={note.status === 'completed' ? 'success' : 'warning'}
                                className="text-xs"
                              >
                                {note.status === 'completed' ? 'Completed' : 'Pending'}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {note.createdAt ? format(new Date(note.createdAt), 'MMM d, yyyy') : ''}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {note.type === 'action' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleToggleStatus(note.id, note.status || 'pending')}
                              >
                                {note.status === 'completed' ? (
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                            )}
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <X className="h-4 w-4" />
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
        </div>
      </SheetContent>
    </Sheet>
  );
}