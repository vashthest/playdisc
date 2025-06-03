import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Play } from '../types';
import {
  FieldEditor,
  Timeline,
  CommentsSidebar,
  PlaybackControls
} from '../components';
import { FIELD_CONFIGS } from '../types/field';
import './PlayViewerPage.css';

const PlayViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [play, setPlay] = useState<Play | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextFrame, setNextFrame] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlay = async () => {
      if (!id) {
        navigate('/');
        return;
      }
      
      try {
        const playDoc = await getDoc(doc(db, 'plays', id));
        if (playDoc.exists()) {
          const data = playDoc.data();
          const playData = {
            ...data,
            id: playDoc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            fieldConfigId: data.fieldConfigId || 'USAU_VERTICAL'
          } as Play;
          setPlay(playData);
          document.title = `View Play: ${playData.name} - Ultimate Frisbee`;
        } else {
          setError('Play not found');
          navigate('/');
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

  // Update title when play name changes
  useEffect(() => {
    if (play) {
      document.title = `View Play: ${play.name} - Ultimate Frisbee`;
    }
  }, [play?.name]);

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
    return <div className="viewer-loading">Loading...</div>;
  }

  if (error) {
    return <div className="viewer-error">{error}</div>;
  }

  if (!play) {
    return null;
  }

  return (
    <div className="viewer-container">
      {/* Header */}
      <header className="viewer-header">
        <div className="viewer-header-info">
          <Link
            to="/"
            className="back-link"
          >
            ← Back to List
          </Link>
          <h1 className="viewer-title">{play.name}</h1>
          <p className="viewer-author">By {play.author}</p>
        </div>
        <Link
          to={`/play/${id}/edit`}
          className="edit-play-button"
        >
          Edit Play
        </Link>
      </header>

      {/* Main Content */}
      <div className="viewer-content">
        {/* Main Field Area */}
        <div className="viewer-main">
          <div className="viewer-field">
            <FieldEditor
              play={play}
              fieldConfig={FIELD_CONFIGS[play.fieldConfigId]}
              currentFrame={currentFrame}
              isReadOnly={true}
              isAnimating={isAnimating}
              nextFrame={nextFrame ?? undefined}
            />
          </div>
          <div className="viewer-timeline">
            <Timeline
              frames={play.frames}
              currentFrame={currentFrame}
              onFrameSelect={handleFrameChange}
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
        />
      </div>
    </div>
  );
};

export default PlayViewerPage; 