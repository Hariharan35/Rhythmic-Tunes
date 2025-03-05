import{ useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';
import {FaPauseCircle, FaPlayCircle } from 'react-icons/fa';

function Playlist() {
  const [playlist, setPlaylist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:3000/playlist')
      .then((response) => {
        const playlistData = response.data;
        setPlaylist(playlistData);
      })
      .catch((error) => {
        console.error('Error fetching playlist items: ', error);
      });

    const handleAudioPlay = (itemId, audioElement) => {
      if (currentlyPlaying && currentlyPlaying !== audioElement) {
        currentlyPlaying.pause();
      }
      setCurrentlyPlaying(audioElement); 
    };

   
    const handlePlay = (itemId, audioElement) => {
      audioElement.addEventListener('play', () => {
        handleAudioPlay(itemId, audioElement);
      });
    };

  
    playlist.forEach((item) => {
      const audioElement = document.getElementById(`audio-${item.id}`);
      if (audioElement) {
        handlePlay(item.id, audioElement);
      }
    });

  
    return () => {
      playlist.forEach((item) => {
        const audioElement = document.getElementById(`audio-${item.id}`);
        if (audioElement) {
          audioElement.removeEventListener('play', () => handleAudioPlay(item.id, audioElement));
        }
      });
    };
  }, [playlist, currentlyPlaying]);

  const removeFromPlaylist = async (itemId) => {
    try {
      
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in playlist');
      }
    await axios.delete(`http://localhost:3000/playlist/${selectedItem.id}`);
     
      const response = await axios.get('http://localhost:3000/playlist');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error removing item from playlist: ', error);
    }
  };

  const playAllSongs = () => {
    const currentSongAudio = document.getElementById(`audio-${playlist[0].id}`);

    if (currentSongAudio.paused) {
      
      currentSongAudio.play();

      
      currentSongAudio.addEventListener('ended', () => {
        const nextIndex = (playlist.indexOf(playlist[0]) + 1) % playlist.length;
        const nextSongAudio = document.getElementById(`audio-${playlist[nextIndex].id}`);

        if (nextSongAudio) {
        
          nextSongAudio.play();
        }
      });
      setIsPlaying(true);
    } else {
      
      currentSongAudio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <div style={{ marginLeft: '230px' }}>
        <div className="container mx-auto p-8">
          <h2 className="text-3xl font-semibold mb-4 text-center">Playlist</h2>

          <Table responsive style={{ width: '1150px' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Actions</th>
                <th>
                  <Button
                    style={{ backgroundColor: 'blue', border: 'none', width: '50px', display: 'flex', justifyContent: 'center' }}
                    onClick={playAllSongs}
                  >
                    {isPlaying ? <FaPauseCircle style={{ width: '40px', height: '25px', display: 'flex', justifyContent: 'center' }} /> : <FaPlayCircle style={{ width: '40px', height: '25px', display: 'flex', justifyContent: 'center' }} />}
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {playlist.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex' }}>
                      <img
                        src={item.imgUrl}
                        alt="Item Image"
                        className="rounded"
                        style={{ height: '50px', width: '50px' }}
                      />
                      <div style={{ paddingLeft: '20px' }}>
                        <strong>{item.title}</strong>
                        <p>
                          <td>{item.singer}</td>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{item.genre}</td>
                  <td>
                    <audio controls id={`audio-${item.id}`} style={{ width: '280px' }}>
                      <source src={item.songUrl} />
                    </audio>
                  </td>
                  <td>
                    <Button
                      style={{ backgroundColor: 'red', border: 'none' }}
                      onClick={() => removeFromPlaylist(item.itemId)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Playlist;
