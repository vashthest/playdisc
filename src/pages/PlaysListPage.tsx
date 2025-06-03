import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase';
import type { Play } from '../types';
import './PlaysListPage.css';

const PlaysListPage = () => {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set page title
  useEffect(() => {
    document.title = 'PlayDisc';
  }, []);

  const fetchPlays = async () => {
    try {
      const playsQuery = query(
        collection(db, 'plays'),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(playsQuery);
      const playsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure dates are properly converted to local timezone
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
        return {
          ...data,
          id: doc.id,
          createdAt,
          updatedAt,
        };
      }) as Play[];
      console.log(playsData);
      setPlays(playsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching plays:', error);
      setError('Error loading plays');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPlays();
  }, []);

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPlays();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return <div className="plays-loading">Loading...</div>;
  }

  if (error) {
    return <div className="plays-error">{error}</div>;
  }

  return (
    <div className="plays-container">
      <div className="plays-header">
        <h1 className="plays-title">PlayDisc</h1>
        <Link
          to="/play/new/edit"
          className="create-play-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </Link>
      </div>

      <div className="plays-grid">
        {plays.map((play) => (
          <div
            key={play.id}
            className="play-card"
          >
            <h2 className="play-title">{play.name}</h2>
            <p className="play-author">By {play.author}</p>
            <p className="play-updated">
              Updated {play.updatedAt.toLocaleString()}
            </p>
            <div className="play-actions">
              <Link
                to={`/play/${play.id}`}
                className="play-action-link"
              >
                View
              </Link>
              <Link
                to={`/play/${play.id}/edit`}
                className="play-action-link"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaysListPage; 