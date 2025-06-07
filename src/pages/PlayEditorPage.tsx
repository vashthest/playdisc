import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Play, Frame, ObjectToken } from '../types';
import { FIELD_CONFIGS } from '../types/field';
import {
  FieldEditor,
  Timeline,
  CommentsSidebar,
  PlaybackControls,
  LeftToolbar,
  UndoRedoControls,
  FieldConfigSelector,
  ConfirmDialog
} from '../components';
import { v4 as uuidv4 } from 'uuid';
import './PlayEditorPage.css';

const PlayEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [play, setPlay] = useState<Play | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Play[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const lastSavedPlayRef = useRef<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextFrame, setNextFrame] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlay = async () => {
      try {
        if (id === 'new') {
          const newPlay: Play = {
            id: uuidv4(),
            name: 'New Play',
            author: 'Anonymous', // TODO: Add auth
            createdAt: new Date(),
            updatedAt: new Date(),
            fieldConfigId: 'USAU_VERTICAL', // Default to vertical field
            objects: {},
            frames: [{
              id: uuidv4(),
              objects: {}
            }],
            comments: []
          };
          setPlay(newPlay);
          setHistory([newPlay]);
          setHistoryIndex(0);
          document.title = 'PlayDisc - New Play';
        } else if (id) {
          const playDoc = await getDoc(doc(db, 'plays', id));
          if (playDoc.exists()) {
            const data = playDoc.data();
            const playData = {
              ...data,
              id: playDoc.id,
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
              // Ensure existing plays have a field configuration
              fieldConfigId: data.fieldConfigId || 'USAU_VERTICAL'
            } as Play;
            setPlay(playData);
            setHistory([playData]);
            setHistoryIndex(0);
            document.title = `PlayDisc - ${playData.name}`;
          } else {
            setError('Play not found');
            navigate('/'); // Redirect to plays list
          }
        }
      } catch (error) {
        console.error('Error fetching play:', error);
        setError('Error loading play');
      } finally {
        setLoading(false);
      }
    };

    fetchPlay();
  }, [id, navigate]);

  const savePlay = useCallback(async (playToSave: Play) => {
    if (!playToSave.id) return;
    
    // Convert play to string for comparison
    const playString = JSON.stringify({
      ...playToSave,
      updatedAt: undefined // Exclude updatedAt from comparison
    });

    // Only save if the play has actually changed
    if (playString === lastSavedPlayRef.current) {
      return;
    }
    
    setSaving(true);
    try {
      // Skip existence check for newly created plays
      const isNewPlay = id === 'new';
      
      if (!isNewPlay) {
        // Check if the play still exists (only for existing plays)
        const playDoc = await getDoc(doc(db, 'plays', playToSave.id));
        if (!playDoc.exists()) {
          // Play has been deleted, navigate away
          setError('This play has been deleted');
          navigate('/', { replace: true });
          return;
        }
      }

      const updatedPlay = {
        ...playToSave,
        updatedAt: new Date()
      };
      await setDoc(doc(db, 'plays', playToSave.id), updatedPlay);
      
      // Only update lastSavedPlayRef after successful save
      lastSavedPlayRef.current = playString;
      
      // After successful save of a new play, update the URL
      if (isNewPlay) {
        navigate(`/play/${playToSave.id}/edit`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving play:', error);
    } finally {
      setSaving(false);
    }
  }, [navigate, id]);

  // Initialize lastSavedPlay when play is first loaded
  useEffect(() => {
    if (play) {
      lastSavedPlayRef.current = JSON.stringify({
        ...play,
        updatedAt: undefined
      });
    }
  }, [id]); // Only run when id changes (i.e., when loading a new play)

  // Debounced auto-save with change detection
  useEffect(() => {
    if (!play) return;
    
    const playString = JSON.stringify({
      ...play,
      updatedAt: undefined
    });

    // Only schedule save if the play has changed
    if (playString !== lastSavedPlayRef.current) {
      const timeoutId = setTimeout(() => {
        savePlay(play);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [play, savePlay]);

  const addObject = (type: ObjectToken['type']) => {
    if (!play) return;

    // Find the next available number for this type
    const existingNumbers = Object.values(play.objects)
      .filter(obj => obj.type === type)
      .map(obj => {
        const num = parseInt(obj.label.slice(1));
        return isNaN(num) ? 0 : num;
      });
    
    const nextNumber = existingNumbers.length > 0
      ? Math.max(...existingNumbers) + 1
      : 1;

    const newObject: ObjectToken = {
      id: uuidv4(),
      type,
      label: `${type}${nextNumber}`,
      position: { x: 0.5, y: 0.5 }
    };

    // Add object to all frames
    const updatedFrames = play.frames.map(frame => ({
      ...frame,
      objects: {
        ...frame.objects,
        [newObject.id]: newObject.position
      },
      controlPoints: {
        ...frame.controlPoints
      }
    }));

    const updatedPlay = {
      ...play,
      objects: {
        ...play.objects,
        [newObject.id]: newObject
      },
      frames: updatedFrames
    };

    setPlay(updatedPlay);
    addToHistory(updatedPlay);
  };

  const addFrame = () => {
    if (!play) return;

    const newFrame: Frame = {
      id: uuidv4(),
      objects: { ...play.frames[currentFrame].objects },
      controlPoints: { ...play.frames[currentFrame].controlPoints }  // Copy control points from current frame
    };

    const updatedPlay = {
      ...play,
      frames: [
        ...play.frames.slice(0, currentFrame + 1),
        newFrame,
        ...play.frames.slice(currentFrame + 1)
      ]
    };

    setPlay(updatedPlay);
    setCurrentFrame(currentFrame + 1);
    addToHistory(updatedPlay);
  };

  const addToHistory = (updatedPlay: Play) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), updatedPlay]);
    setHistoryIndex(prev => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setPlay(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setPlay(history[historyIndex + 1]);
    }
  };

  const handleDelete = async () => {
    if (!play) return;
    
    try {
      await deleteDoc(doc(db, 'plays', play.id));
      // Verify the play was deleted
      const playDoc = await getDoc(doc(db, 'plays', play.id));
      if (!playDoc.exists()) {
        navigate('/', { replace: true }); // Use replace to prevent back navigation
      } else {
        setError('Failed to delete play');
      }
    } catch (error) {
      console.error('Error deleting play:', error);
      setError('Error deleting play');
    }
  };

  const handleFrameChange = (frame: number) => {
    setCurrentFrame(frame);
  };

  const handleAnimationStart = (fromFrame: number, toFrame: number) => {
    setIsAnimating(true);
    setNextFrame(toFrame);
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
    setNextFrame(null);
  };

  if (loading) {
    return <div className="editor-loading">Loading...</div>;
  }

  if (error) {
    return <div className="editor-error">{error}</div>;
  }

  if (!play) {
    return null;
  }

  return (
    <div className="editor-container">
      {/* Header */}
      <header className="editor-header">
        <div className="editor-header-left">
          <Link
            to="/"
            className="back-link"
          >
            ← Back to List
          </Link>
          <input
            type="text"
            value={play.name}
            onChange={(e) => {
              const updatedPlay = { ...play, name: e.target.value };
              setPlay(updatedPlay);
              addToHistory(updatedPlay);
            }}
            className="editor-title-input"
          />
          <FieldConfigSelector
            currentConfig={FIELD_CONFIGS[play.fieldConfigId]}
            onConfigChange={(newConfig) => {
              const updatedPlay = { ...play, fieldConfigId: newConfig.id };
              setPlay(updatedPlay);
              addToHistory(updatedPlay);
            }}
          />
          <span className="editor-status">
            {saving ? 'Saving...' : 'Saved'}
          </span>
        </div>
        <div className="editor-header-right">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="delete-button"
          >
            Delete Play
          </button>
          <UndoRedoControls
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={undo}
            onRedo={redo}
          />
        </div>
      </header>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Play"
        message={`Are you sure you want to delete "${play.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDangerous
      />

      {/* Main Content */}
      <div className="editor-content">
        {/* Left Toolbar */}
        <LeftToolbar onAddObject={addObject} />

        {/* Main Field Area */}
        <div className="editor-main">
          <div className="editor-field">
            <FieldEditor
              play={play}
              fieldConfig={FIELD_CONFIGS[play.fieldConfigId]}
              currentFrame={currentFrame}
              isAnimating={isAnimating}
              nextFrame={nextFrame ?? undefined}
              onPlayUpdate={(updatedPlay: Play) => {
                setPlay(updatedPlay);
                addToHistory(updatedPlay);
              }}
            />
          </div>
          <div className="editor-timeline">
            <Timeline
              frames={play.frames}
              currentFrame={currentFrame}
              onFrameSelect={handleFrameChange}
              onAddFrame={addFrame}
            />
            <PlaybackControls
              currentFrame={currentFrame}
              totalFrames={play.frames.length}
              onFrameChange={handleFrameChange}
              onAnimationStart={handleAnimationStart}
              onAnimationEnd={handleAnimationEnd}
            />
          </div>
        </div>

        {/* Comments Sidebar */}
        <CommentsSidebar
          play={play}
          currentFrame={currentFrame}
          onFrameSelect={handleFrameChange}
          onPlayUpdate={(updatedPlay: Play) => {
            setPlay(updatedPlay);
            addToHistory(updatedPlay);
          }}
        />
      </div>
    </div>
  );
};

export default PlayEditorPage; 